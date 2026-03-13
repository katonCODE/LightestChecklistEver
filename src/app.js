const taskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const opacitySlider = document.getElementById('opacitySlider');
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const checklistView = document.getElementById('checklistView');
const settingsView = document.getElementById('settingsView');
const accentColorInput = document.getElementById('accentColorInput');
const bgColorInput = document.getElementById('bgColorInput');
const storagePathInput = document.getElementById('storagePathInput');
const changePathBtn = document.getElementById('changePathBtn');
const tickToBottomToggle = document.getElementById('tickToBottomToggle');
const tickDividerToggle = document.getElementById('tickDividerToggle');
const hotkeyBtn = document.getElementById('hotkeyBtn');
const hotkeyClearBtn = document.getElementById('hotkeyClearBtn');
const fullscreenWidgetToggle = document.getElementById('fullscreenWidgetToggle');

let tasks = [];
let settings = {};
let dragState = null;
let rafId = null;

// Load tasks and settings on startup
async function init() {
  settings = await window.electronAPI.getSettings();
  applySettings();
  tasks = await window.electronAPI.loadData();
  renderTasks();
}

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

function applySettings() {
  document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  accentColorInput.value = settings.accentColor;

  const hex = settings.backgroundColor;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  document.documentElement.style.setProperty('--bg-color', `rgba(${r}, ${g}, ${b}, 0.85)`);
  document.documentElement.style.setProperty('--text-color', getContrastColor(hex));
  bgColorInput.value = hex;

  storagePathInput.value = settings.dataPath;
  tickToBottomToggle.checked = !!settings.tickToBottom;
  tickDividerToggle.checked = !!settings.tickDivider;
  if (fullscreenWidgetToggle) {
    fullscreenWidgetToggle.checked = !!settings.fullscreenWidget;
  }
  updateHotkeyDisplay();
}

function buildTaskItem(task, index, skipAnimation) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}${skipAnimation ? ' no-animate' : ''}`;
  li.dataset.index = index;

  li.addEventListener('pointerdown', (e) => onDragPointerDown(e, li, parseInt(li.dataset.index)));

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'task-checkbox';
  cb.checked = task.completed;
  cb.addEventListener('change', () => toggleTask(parseInt(li.dataset.index)));

  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `;
  delBtn.addEventListener('click', () => deleteTask(parseInt(li.dataset.index)));

  li.appendChild(cb);
  li.appendChild(span);
  li.appendChild(delBtn);
  return li;
}

function getDisplayOrder() {
  if (!settings.tickToBottom) return tasks.map((_, i) => i);
  const active = [], done = [];
  tasks.forEach((t, i) => (t.completed ? done : active).push(i));
  return [...active, ...done];
}

function insertDivider() {
  if (!settings.tickDivider) return;
  const items = [...taskList.querySelectorAll('.task-item')];
  if (!items.length) return;
  const hasCompleted = items.some(item => tasks[parseInt(item.dataset.index)]?.completed);
  if (!hasCompleted) return;
  let boundaryEl = items[0];
  for (let i = items.length - 1; i >= 0; i--) {
    if (!tasks[parseInt(items[i].dataset.index)]?.completed) {
      boundaryEl = i + 1 < items.length ? items[i + 1] : null;
      break;
    }
  }
  if (boundaryEl) taskList.insertBefore(DIVIDER, boundaryEl);
}


function renderTasks(skipAnimation) {
  taskList.innerHTML = '';
  const order = getDisplayOrder();
  order.forEach(index => {
    taskList.appendChild(buildTaskItem(tasks[index], index, skipAnimation));
  });
  insertDivider();
}

const DROP_INDICATOR = document.createElement('div');
DROP_INDICATOR.className = 'drop-indicator';

const DIVIDER = document.createElement('li');
DIVIDER.className = 'tick-divider';
DIVIDER.textContent = 'completed';

let ghost = null;

function createGhost(li, startX, startY) {
  const rect = li.getBoundingClientRect();
  ghost = li.cloneNode(true);
  ghost.className = 'task-item drag-ghost';
  ghost.style.width = rect.width + 'px';
  ghost.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
  ghost.dataset.originX = rect.left;
  ghost.dataset.originY = rect.top - startY;
  document.body.appendChild(ghost);
}

function moveGhost(clientX, clientY) {
  if (!ghost) return;
  const ox = parseFloat(ghost.dataset.originX);
  const oy = parseFloat(ghost.dataset.originY);
  ghost.style.transform = `translate3d(${ox}px, ${clientY + oy}px, 0)`;
}

function destroyGhost() {
  if (ghost) { ghost.remove(); ghost = null; }
}

function onDragPointerDown(e, li, index) {
  if (e.button !== 0) return;
  if (e.target.closest('.task-checkbox, .delete-btn')) return;

  const startY = e.clientY;
  dragState = { el: li, index, startY, active: false, targetIndex: index, curX: e.clientX, curY: e.clientY };
  li.setPointerCapture(e.pointerId);

  const onMove = (ev) => {
    if (!dragState) return;
    if (ev.buttons === 0) {
      onUp(ev);
      return;
    }
    if (!dragState.active) {
      if (Math.abs(ev.clientY - dragState.startY) < 5) return;
      dragState.active = true;
      dragState.el.classList.add('dragging');
      taskList.classList.add('is-dragging');
      taskList.appendChild(DROP_INDICATOR);
      createGhost(li, ev.clientX, ev.clientY);
    }
    moveGhost(ev.clientX, ev.clientY);
    dragState.curY = ev.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (!dragState || !dragState.active) return;
      updateDropTarget(dragState.curY);
    });
  };

  const onUp = (ev) => {
    li.removeEventListener('pointermove', onMove);
    li.removeEventListener('pointerup', onUp);
    li.removeEventListener('pointercancel', onUp);
    try { li.releasePointerCapture(ev.pointerId); } catch(e) {}
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (!dragState) return;

    if (dragState.active) {
      const from = dragState.index;
      const to = dragState.targetIndex;
      dragState.el.classList.remove('dragging');
      taskList.classList.remove('is-dragging');
      DROP_INDICATOR.classList.remove('visible');
      if (DROP_INDICATOR.parentNode) DROP_INDICATOR.parentNode.removeChild(DROP_INDICATOR);
      destroyGhost();

      if (from !== to) {
        const [moved] = tasks.splice(from, 1);
        tasks.splice(to > from ? to - 1 : to, 0, moved);
        saveTasks();
      }
      renderTasks(true);
    }
    dragState = null;
  };

  li.addEventListener('pointermove', onMove);
  li.addEventListener('pointerup', onUp);
  li.addEventListener('pointercancel', onUp);
}

let lastUpdateY = 0;

function updateDropTarget(clientY) {
  if (Math.abs(clientY - lastUpdateY) < 5) return;
  lastUpdateY = clientY;

  const items = taskList.querySelectorAll('.task-item:not(.dragging)');
  let targetIndex = tasks.length;
  let refNode = null;

  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    if (clientY <= rect.top + rect.height / 2) {
      targetIndex = parseInt(items[i].dataset.index);
      refNode = items[i];
      break;
    }
  }

  dragState.targetIndex = targetIndex;
  DROP_INDICATOR.classList.add('visible');
  taskList.insertBefore(DROP_INDICATOR, refNode);
}

async function saveTasks() {
  await window.electronAPI.saveData(tasks);
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;
  const index = tasks.length;
  tasks.push({ text, completed: false });
  taskInput.value = '';
  saveTasks();
  const newItem = buildTaskItem(tasks[index], index, false);
  if (settings.tickToBottom || settings.tickDivider) {
    const dividerInDom = DIVIDER.parentNode === taskList;
    if (dividerInDom) {
      taskList.insertBefore(newItem, DIVIDER);
    } else {
      const firstDone = [...taskList.querySelectorAll('.task-item')]
        .find(el => tasks[parseInt(el.dataset.index)]?.completed);
      firstDone ? taskList.insertBefore(newItem, firstDone) : taskList.appendChild(newItem);
    }
    insertDivider();
  } else {
    taskList.appendChild(newItem);
  }
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  if (settings.tickToBottom || settings.tickDivider) {
    renderTasks(true);
  } else {
    const items = taskList.querySelectorAll('.task-item');
    const li = items[index];
    if (!li) return;
    li.classList.toggle('completed', tasks[index].completed);
    li.querySelector('.task-checkbox').checked = tasks[index].completed;
  }
}

function deleteTask(index) {
  const items = taskList.querySelectorAll('.task-item');
  const li = items[index];
  if (!li) return;
  li.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
  li.style.transform = 'scale(0.9)';
  li.style.opacity = '0';
  setTimeout(() => {
    li.remove();
    tasks.splice(index, 1);
    saveTasks();
    taskList.querySelectorAll('.task-item').forEach((el, i) => {
      el.dataset.index = i;
    });
  }, 200);
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

opacitySlider.addEventListener('input', (e) => {
  window.electronAPI.setOpacity(parseFloat(e.target.value));
});

closeBtn.addEventListener('click', () => window.electronAPI.closeApp());
minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeApp());

settingsBtn.addEventListener('click', () => {
  if (settingsView.style.display === 'none') {
    checklistView.style.display = 'none';
    settingsView.style.display = 'flex';
    if (window.electronAPI.setAlwaysOnTop) window.electronAPI.setAlwaysOnTop('floating');
  } else {
    settingsView.style.display = 'none';
    checklistView.style.display = 'block';
    if (window.electronAPI.setAlwaysOnTop) window.electronAPI.setAlwaysOnTop('screen-saver');
  }
});

backBtn.addEventListener('click', async () => {
  settingsView.style.display = 'none';
  checklistView.style.display = 'block';
  if (window.electronAPI.setAlwaysOnTop) window.electronAPI.setAlwaysOnTop('screen-saver');
  // Reload data in case path changed
  tasks = await window.electronAPI.loadData();
  renderTasks();
});

accentColorInput.addEventListener('change', async (e) => {
  const newColor = e.target.value;
  settings.accentColor = newColor;
  document.documentElement.style.setProperty('--accent-color', newColor);
  await window.electronAPI.saveSettings({ accentColor: newColor });
});

bgColorInput.addEventListener('change', async (e) => {
  const newColor = e.target.value;
  settings.backgroundColor = newColor;
  const r = parseInt(newColor.slice(1, 3), 16);
  const g = parseInt(newColor.slice(3, 5), 16);
  const b = parseInt(newColor.slice(5, 7), 16);
  document.documentElement.style.setProperty('--bg-color', `rgba(${r}, ${g}, ${b}, 0.85)`);
  document.documentElement.style.setProperty('--text-color', getContrastColor(newColor));
  await window.electronAPI.saveSettings({ backgroundColor: newColor });
});

changePathBtn.addEventListener('click', async () => {
  const newPath = await window.electronAPI.selectFile();
  if (newPath) {
    settings.dataPath = newPath;
    storagePathInput.value = newPath;
    await window.electronAPI.saveSettings({ dataPath: newPath });
  }
});

tickToBottomToggle.addEventListener('change', async () => {
  settings.tickToBottom = tickToBottomToggle.checked;
  await window.electronAPI.saveSettings({ tickToBottom: settings.tickToBottom });
  renderTasks(true);
});

tickDividerToggle.addEventListener('change', async () => {
  settings.tickDivider = tickDividerToggle.checked;
  await window.electronAPI.saveSettings({ tickDivider: settings.tickDivider });
  renderTasks(true);
});

if (fullscreenWidgetToggle) {
  fullscreenWidgetToggle.addEventListener('change', async () => {
    settings.fullscreenWidget = fullscreenWidgetToggle.checked;
    await window.electronAPI.saveSettings({ fullscreenWidget: settings.fullscreenWidget });
    if (window.electronAPI.setFullscreenWidget) {
      window.electronAPI.setFullscreenWidget(settings.fullscreenWidget);
    }
  });
}

const resizeEdges = document.querySelectorAll('.resize-edge');
let isResizing = false;
let resizeDir = '';
let startX, startY, startWidth, startHeight, startWinX, startWinY;

resizeEdges.forEach(edge => {
  edge.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeDir = edge.dataset.edge;
    startX = e.screenX; startY = e.screenY;
    startWidth = window.innerWidth; startHeight = window.innerHeight;
    startWinX = window.screenX; startWinY = window.screenY;
    e.preventDefault();
  });
});

window.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const dx = e.screenX - startX;
  const dy = e.screenY - startY;

  let newWidth = startWidth, newHeight = startHeight, newX = startWinX, newY = startWinY;

  if (resizeDir.includes('right')) newWidth += dx;
  if (resizeDir.includes('left')) { newWidth -= dx; newX += dx; }
  if (resizeDir.includes('bottom')) newHeight += dy;
  if (resizeDir.includes('top')) { newHeight -= dy; newY += dy; }

  const minWidth = 250, maxWidth = 600, minHeight = 300, maxHeight = 900;
  if (newWidth < minWidth) { if (resizeDir.includes('left')) newX -= (minWidth - newWidth); newWidth = minWidth; }
  else if (newWidth > maxWidth) { if (resizeDir.includes('left')) newX += (newWidth - maxWidth); newWidth = maxWidth; }
  if (newHeight < minHeight) { if (resizeDir.includes('top')) newY -= (minHeight - newHeight); newHeight = minHeight; }
  else if (newHeight > maxHeight) { if (resizeDir.includes('top')) newY += (newHeight - maxHeight); newHeight = maxHeight; }

  window.electronAPI.setBounds({
    x: Math.round(newX), y: Math.round(newY),
    width: Math.round(newWidth), height: Math.round(newHeight)
  });
});

window.addEventListener('mouseup', () => { isResizing = false; });

function updateHotkeyDisplay() {
  hotkeyBtn.textContent = settings.hotkey || 'Click to bind';
  hotkeyBtn.classList.toggle('has-hotkey', !!settings.hotkey);
}

function acceleratorFromEvent(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  const key = e.key;
  if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) return null;
  const keyMap = { ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down', 'ArrowLeft': 'Left', 'ArrowRight': 'Right' };
  parts.push(keyMap[key] || (key.length === 1 ? key.toUpperCase() : key));
  return parts.length > 1 ? parts.join('+') : null;
}

hotkeyBtn.addEventListener('click', () => {
  hotkeyBtn.textContent = 'Press keys...';
  hotkeyBtn.classList.add('listening');

  const onKey = async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const acc = acceleratorFromEvent(e);
    if (!acc) return;
    document.removeEventListener('keydown', onKey, true);
    hotkeyBtn.classList.remove('listening');
    settings.hotkey = acc;
    await window.electronAPI.setHotkey(acc);
    updateHotkeyDisplay();
  };

  document.addEventListener('keydown', onKey, true);
});

hotkeyClearBtn.addEventListener('click', async () => {
  settings.hotkey = null;
  await window.electronAPI.setHotkey(null);
  updateHotkeyDisplay();
});

init();
