import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Minimal browser fakes so the emulator can run under node.
let nextId = 1;
const frames = new Map();
globalThis.requestAnimationFrame = (fn) => { const id = nextId++; frames.set(id, fn); return id; };
globalThis.cancelAnimationFrame = (id) => { frames.delete(id); };

const contexts = [];
globalThis.AudioContext = class {
  constructor() { this.sampleRate = 44100; this.destination = {}; this.closed = false; contexts.push(this); }
  createScriptProcessor() { return {onaudioprocess: () => {}, connect() {}, disconnect() { this.disconnected = true; }}; }
  close() { this.closed = true; }
};

const {default: NesJs} = await import('../index.js');

const canvas = {width: 0, height: 0, getContext: () => ({createImageData: (w, h) => ({data: new Uint8ClampedArray(w * h * 4)}), putImageData() {}})};
const romBytes = readFileSync(new URL('../roms/pong1k.nes', import.meta.url));
const rom = () => new NesJs.Rom(romBytes.buffer.slice(romBytes.byteOffset, romBytes.byteOffset + romBytes.byteLength));

function boot() {
  const nes = new NesJs.Nes();
  nes.setRom(rom());
  nes.setDisplay(new NesJs.Display(canvas));
  nes.setAudio(new NesJs.Audio());
  nes.bootup();
  nes.run();
  return nes;
}

test('run schedules exactly one frame and stop cancels it', () => {
  frames.clear();
  const nes = boot();
  assert.equal(frames.size, 1);
  nes.stop();
  assert.equal(frames.size, 0);
});

test('resume does not leave two frame loops alive', () => {
  frames.clear();
  const nes = boot();
  nes.stop();
  nes.resume();
  nes.resume();
  assert.equal(frames.size, 1);
  nes.destroy();
});

test('destroy releases audio and is idempotent', () => {
  frames.clear();
  contexts.length = 0;
  const nes = boot();
  nes.destroy();
  nes.destroy();
  assert.equal(frames.size, 0);
  assert.equal(contexts.length, 1);
  assert.equal(contexts[0].closed, true);
});

test('mount, destroy, mount again works (StrictMode)', () => {
  frames.clear();
  boot().destroy();
  const second = boot();
  assert.equal(frames.size, 1);
  second.destroy();
  assert.equal(frames.size, 0);
});

test('only mapped keys are consumed', () => {
  const nes = new NesJs.Nes();
  let prevented = 0;
  const key = (keyCode) => ({keyCode, preventDefault: () => { prevented++; }});
  nes.handleKeyDown(key(116)); // F5
  nes.handleKeyUp(key(116));
  assert.equal(prevented, 0);
  nes.handleKeyDown(key(90)); // z -> B
  assert.equal(prevented, 1);
  assert.equal(nes.pad1.buttons[NesJs.Joypad.BUTTONS.B], true);
  nes.handleKeyUp(key(90));
  assert.equal(nes.pad1.buttons[NesJs.Joypad.BUTTONS.B], false);
  nes.handleKeyDown(key(16)); // shift -> Select
  assert.equal(nes.pad1.buttons[NesJs.Joypad.BUTTONS.SELECT], true);
});
