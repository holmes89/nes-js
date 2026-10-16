# nes-js

This is JavaScript NES(Famicom) emulator which runs on browser.

## Demo

[Demo](http://takahirox.github.io/nes-js/index.html)

[Demo with Three.js](http://takahirox.github.io/nes-js/index2.html) (It has a performance issue!)

[WebVR Demo with Three.js](http://takahirox.github.io/nes-js/index3.html) (It has a serious performance issue!)

[AR Demo with Three.js and jsartoolkit5](https://takahirox.github.io/nes-js/index4.html) (It has a performance issue!)

## Screenshot

![Screen shot](https://github.com/takahirox/assets/blob/master/nes-js/screenshot.png)

![Screen shot with Three.js](https://github.com/takahirox/takahirox.github.io/blob/master/images/nesemu.png)

## Features

- iNES format rom image support
- Renders with Canvas
- Audio support with WebAudio
- Runs on browser

## Embedding (React, bundlers)

The package is an ES module (`import NesJs from 'nes-js'`). The host owns input and lifecycle:

```js
const nes = new NesJs.Nes();
nes.setRom(new NesJs.Rom(arrayBuffer));
nes.setDisplay(new NesJs.Display(canvas));
nes.setAudio(new NesJs.Audio());
const down = (e) => nes.handleKeyDown(e);
const up = (e) => nes.handleKeyUp(e);
window.addEventListener('keydown', down);
window.addEventListener('keyup', up);
nes.bootup();
nes.run();

// on unmount
window.removeEventListener('keydown', down);
window.removeEventListener('keyup', up);
nes.destroy(); // cancels the frame loop and closes the AudioContext; safe to call twice
```

Keys: arrows = D-pad, Z = B, X = A, Enter = Start, Shift or Space = Select. Only mapped keys are `preventDefault`-ed.
`npm test` runs the lifecycle tests with node's built-in test runner.

## Browser

### How to use

```html
<head>
  <script type="text/javascript" src="https://cdn.rawgit.com/takahirox/nes-js/v0.0.1/build/nes.min.js"></script>
  <script type="text/javascript" >
    function init() {
      var url = 'url to rom image';
      var request = new XMLHttpRequest();
      request.responseType = 'arraybuffer';

      request.onload = function() {
        var buffer = request.response;
        var nes = new NesJs.Nes();

        nes.setRom(new NesJs.Rom(buffer));
        nes.setDisplay(new NesJs.Display(document.getElementById('gameCanvas')));
        nes.setAudio(new NesJs.Audio());

        window.onkeydown = function(e) { nes.handleKeyDown(e); };
        window.onkeyup = function(e) { nes.handleKeyUp(e); };

        nes.bootup();
        nes.run();
      };

      request.open('GET', url, true);
      request.send(null);
    }
  </script>
</head>

<body onload="init()">
  <p>
    <canvas id="gameCanvas" width="256" height="240"></canvas>
  </p>
</body>
```

## NPM

### How to install

```
$ npm install nes-js
```

### How to build

```
$ npm install
$ npm run all
```

## Default key configuration

This table shows the key - joypad configuration set by

```html
  window.onkeydown = function(e) { nes.handleKeyDown(e); };
  window.onkeyup = function(e) { nes.handleKeyUp(e); };
```

| key          | joypad |
|--------------|--------|
| enter        | start  |
| space        | select |
| cursor-left  | left   |
| cursor-up    | up     |
| cursor-right | right  |
| cursor-down  | down   |
| x            | A      |
| z            | B      |

## APIs

T.B.D.

- NesJs
  - Nes
    - setRom()
    - setDisplay()
    - setAudio()
    - bootup()
    - run()
    - handleKeyDown()
    - handleKeyUp()
  - Rom
  - Display
  - Audio

## TODO

- Performance optimization
- Support more many mappers
- Support unofficial CPU instructions
- Gamepad API support


## Links
- Nes Dev
  - [Nes Dev Wiki](http://wiki.nesdev.com/w/index.php/Nesdev_Wiki)
- VR/AR
  - [Three.js](https://github.com/mrdoob/three.js)
  - [jsartoolkit5](https://github.com/artoolkit/jsartoolkit5)
