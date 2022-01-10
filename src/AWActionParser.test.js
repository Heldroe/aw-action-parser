import { AWActionParser } from './AWActionParser';

const parser = new AWActionParser();

test('empty string', () => {
    expect(parser.parse('')).toStrictEqual({});
});

test('invalid string', () => {
    expect(parser.parse('foobar')).toStrictEqual({});
});

test('invalid string has debug information', () => {
    expect(parser.debug('foobar').length).toBeGreaterThan(0);
});

test('good string has empty debug information', () => {
    expect(parser.debug('create color green;').length).toBe(0);
});

test('create color green', () => {
    expect(parser.parse('create color green')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 255, b: 0},
            }
        ]
    });
});

test('whitespace and semicolons do not matter', () => {
    expect(parser.parse('create   color        abcdef;;;;;;')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 171, g: 205, b: 239},
            }
        ]
    });
});

test('multiple color applies last only', () => {
    expect(parser.parse('create color green, color red, color blue')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 0, b: 255},
            }
        ]
    });
});

test('multiple names applies last only', () => {
    expect(parser.parse('create name foo, name bar, name baz')).toStrictEqual({
        create: [
            {
                commandType: "name",
                targetName: "baz",
            }
        ]
    });
});

test('multiple create applies first only', () => {
    expect(parser.parse('create color green; create color red')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 255, b: 0},
            }
        ]
    });
});

test('rotate with 1 number is about Y', () => {
    expect(parser.parse('create rotate 1')).toStrictEqual({
        create: [
            {
                commandType: "rotate",
                speed: {
                    x: 0,
                    y: 1,
                    z: 0,
                },
            }
        ]
    });
});

test('rotate with 2 numbers is about X and Y', () => {
    expect(parser.parse('create rotate 1 2')).toStrictEqual({
        create: [
            {
                commandType: "rotate",
                speed: {
                    x: 1,
                    y: 2,
                    z: 0,
                },
            }
        ]
    });
});

test('rotate with 3 numbers is about X, Y and Z', () => {
    expect(parser.parse('create rotate 1 2 3')).toStrictEqual({
        create: [
            {
                commandType: "rotate",
                speed: {
                    x: 1,
                    y: 2,
                    z: 3,
                },
            }
        ]
    });
});

test('rotate can handle funny floats', () => {
    expect(parser.parse('create rotate -.234 234.903 -12.093')).toStrictEqual({
        create: [
            {
                commandType: "rotate",
                speed: {
                    x: -0.234,
                    y: 234.903,
                    z: -12.093,
                },
            }
        ]
    });
});

test('move with 1 number is about Y', () => {
    expect(parser.parse('create move 1')).toStrictEqual({
        create: [
            {
                commandType: "move",
                distance: {
                    x: 0,
                    y: 1,
                    z: 0,
                },
            }
        ]
    });
});

test('move with 2 numbers is about X and Y', () => {
    expect(parser.parse('create move 1 2')).toStrictEqual({
        create: [
            {
                commandType: "move",
                distance: {
                    x: 1,
                    y: 2,
                    z: 0,
                },
            }
        ]
    });
});

test('move with 3 numbers is about X, Y and Z', () => {
    expect(parser.parse('create move 1 2 3')).toStrictEqual({
        create: [
            {
                commandType: "move",
                distance: {
                    x: 1,
                    y: 2,
                    z: 3,
                },
            }
        ]
    });
});

test('empty command does not return anything', () => {
    expect(parser.parse('create rotate')).toStrictEqual({});
});

test('examine command returns properly', () => {
    expect(parser.parse('create examine')).toStrictEqual({
        create: [
            {
                commandType: "examine",
            }
        ]
    });
});

test('multiple color with different names applies all', () => {
    expect(parser.parse('create color green, color red name=foo, color blue name=bar')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 255, b: 0},
            },
            {
                commandType: "color",
                color: {r: 255, g: 0, b: 0},
                targetName: "foo",
            },
            {
                commandType: "color",
                color: {r: 0, g: 0, b: 255},
                targetName: "bar",
            }
        ]
    });
});

// Solid booleans
test('create solid off', () => {
    expect(parser.parse('create solid off')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: false,
            }
        ]
    });
});

test('create solid false', () => {
    expect(parser.parse('create solid false')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: false,
            }
        ]
    });
});

test('create solid no', () => {
    expect(parser.parse('create solid no')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: false,
            }
        ]
    });
});

test('create solid on', () => {
    expect(parser.parse('create solid on')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: true,
            }
        ]
    });
});

test('create solid true', () => {
    expect(parser.parse('create solid true')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: true,
            }
        ]
    });
});

test('create solid yes', () => {
    expect(parser.parse('create solid yes')).toStrictEqual({
        create: [
            {
                commandType: "solid",
                value: true,
            }
        ]
    });
});

// Visible booleans
test('create visible off', () => {
    expect(parser.parse('create visible off')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: false,
            }
        ]
    });
});

test('create visible false', () => {
    expect(parser.parse('create visible false')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: false,
            }
        ]
    });
});

test('create visible no', () => {
    expect(parser.parse('create visible no')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: false,
            }
        ]
    });
});

test('create visible on', () => {
    expect(parser.parse('create visible on')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: true,
            }
        ]
    });
});

test('create visible true', () => {
    expect(parser.parse('create visible true')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: true,
            }
        ]
    });
});

test('create visible yes', () => {
    expect(parser.parse('create visible yes')).toStrictEqual({
        create: [
            {
                commandType: "visible",
                value: true,
            }
        ]
    });
});

// Colors
test('empty create color', () => {
    expect(parser.parse('create color')).toStrictEqual({});
});

test('create color f', () => {
    expect(parser.parse('create color f')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 0, b: 15},
            }
        ]
    });
});

test('create color ff', () => {
    expect(parser.parse('create color ff')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 0, b: 255},
            }
        ]
    });
});

test('create color fff', () => {
    expect(parser.parse('create color fff')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 15, b: 255},
            }
        ]
    });
});

test('create long color', () => {
    expect(parser.parse('create color foobarbazaaaaaaaaaaaaaaaaaa')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: {r: 0, g: 0, b: 15},
            }
        ]
    });
});

test('invalid color results in no action', () => {
    expect(parser.parse('create color poorchoice')).toStrictEqual({});
});

test('no color results in no action', () => {
    expect(parser.parse('create color')).toStrictEqual({});
});

test('create texture with mask', () => {
    expect(parser.parse('create texture fleurs19 mask=fleurs19m')).toStrictEqual({
        create: [
            {
                commandType: "texture",
                texture: "fleurs19",
                mask: "fleurs19m",
            }
        ]
    });
});

test('create texture with mask and tag', () => {
    expect(parser.parse('create texture fleurs19 mask=fleurs19m tag=abcd')).toStrictEqual({
        create: [
            {
                commandType: "texture",
                texture: "fleurs19",
                mask: "fleurs19m",
                tag: "abcd",
            }
        ]
    });
});

test('create rotate & move with reset', () => {
    expect(parser.parse('create rotate 0 0 0 reset, move 0 0 2 loop reset time=5 wait=1')).toStrictEqual({
        create: [
            {
                commandType: "rotate",
                speed: {x: 0, y: 0, z: 0},
                reset: true,
            },
            {
                commandType: "move",
                distance: {x: 0, y: 0, z: 2},
                loop: true,
                reset: true,
                time: 5,
                wait: 1,
            },
        ]
    });
});

test('empty create sign returns properly', () => {
    expect(parser.parse('create sign')).toStrictEqual({
        create: [
            {
                commandType: "sign",
            }
        ]
    });
});
