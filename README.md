# aw-action-parser

This library parses [ActiveWorlds object action strings](http://wiki.activeworlds.com/index.php?title=Object_scripting) (also known as **object scripting**) into a machine-friendly data model.

## Installation

    npm install aw-action-parser

## Usage

```js
    import { AWActionParser } from 'aw-action-parser';

    const parser = new AWActionParser();

    parser.parse('create color blue, sign "hello!"; activate color salmon, rotate -.5 loop nosync');
```

The `parse()` function will then return an object looking like this:

```js
    {
      create: [ { commandType: 'color', color: { r: 0, g: 0, b: 255 } } ],
      activate: [
        { commandType: 'color', color: { r: 111, g: 66, b: 66 } },
        {
          commandType: 'rotate',
          speed: { x: 0, y: -0.5, z: 0 },
          loop: true,
          sync: false
        }
      ]
    }
```

## Features

* Color parsing into RGB values (0-255)
* Duplicate actions and commands squash (e.g. multiple `create` actions or multiple `color` commands)

## Missing features

* Impossible actions on AW (e.g. `create teleport ...`) are not currently filtered out
* Some commands like `media` support only a few parameters
* `teleport` / `warp`
    * Better output format for coordinates, altitudes and direction

## Testing

Unit tests are essential for this kind of project and you can run them with:

    npm test
