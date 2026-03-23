import { describe, it, expect } from 'vitest';
import { getContrastColor, acceleratorFromEvent } from './utils.js';

describe('getContrastColor', () => {
  it('returns dark text for extremely light backgrounds', () => {
    expect(getContrastColor('#ffffff')).toBe('#1a1a1a');
    expect(getContrastColor('#ffff00')).toBe('#1a1a1a'); // Yellow
    expect(getContrastColor('#00ff00')).toBe('#1a1a1a'); // Lime green
  });

  it('returns white text for extremely dark backgrounds', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff');
    expect(getContrastColor('#1a1a1a')).toBe('#ffffff'); 
    expect(getContrastColor('#000033')).toBe('#ffffff');
  });

  it('handles borderline colors appropriately', () => {
    // Mid gray might go either way depending on strict math, just ensuring it resolves
    const gray = getContrastColor('#808080');
    expect(['#1a1a1a', '#ffffff']).toContain(gray);
  });
});

describe('acceleratorFromEvent', () => {
  it('ignores isolated modifier keys preventing accidental bindings', () => {
    expect(acceleratorFromEvent({ key: 'Control' })).toBeNull();
    expect(acceleratorFromEvent({ key: 'Shift' })).toBeNull();
    expect(acceleratorFromEvent({ key: 'Alt' })).toBeNull();
    expect(acceleratorFromEvent({ key: 'Meta' })).toBeNull();
  });

  it('requires a modifier to return an accelerator string', () => {
    expect(acceleratorFromEvent({ key: 'a' })).toBeNull();
    expect(acceleratorFromEvent({ key: 'Space' })).toBeNull();
  });

  it('maps single modifiers with basic alphabetical characters', () => {
    expect(acceleratorFromEvent({ ctrlKey: true, key: 'a' })).toBe('CommandOrControl+A');
    expect(acceleratorFromEvent({ metaKey: true, key: 'k' })).toBe('CommandOrControl+K');
    expect(acceleratorFromEvent({ altKey: true, key: 'L' })).toBe('Alt+L');
    expect(acceleratorFromEvent({ shiftKey: true, key: 'T' })).toBe('Shift+T');
  });

  it('correctly maps unique aliases like Space and Arrows', () => {
    expect(acceleratorFromEvent({ ctrlKey: true, key: ' ' })).toBe('CommandOrControl+Space');
    expect(acceleratorFromEvent({ altKey: true, key: 'ArrowUp' })).toBe('Alt+Up');
    expect(acceleratorFromEvent({ shiftKey: true, key: 'ArrowDown' })).toBe('Shift+Down');
    expect(acceleratorFromEvent({ ctrlKey: true, key: 'ArrowLeft' })).toBe('CommandOrControl+Left');
    expect(acceleratorFromEvent({ metaKey: true, key: 'ArrowRight' })).toBe('CommandOrControl+Right');
  });

  it('handles combined multi-key modifiers effectively', () => {
    expect(acceleratorFromEvent({ ctrlKey: true, shiftKey: true, key: 'z' })).toBe('CommandOrControl+Shift+Z');
    expect(acceleratorFromEvent({ altKey: true, shiftKey: true, ctrlKey: true, key: 'b' })).toBe('CommandOrControl+Alt+Shift+B');
  });
});
