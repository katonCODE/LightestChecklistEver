// src/utils.js

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getContrastColor, acceleratorFromEvent };
}
