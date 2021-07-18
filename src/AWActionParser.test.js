import AWActionParser from './AWActionParser';

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
                color: "green",
            }
        ]
    });
});

test('whitespace and semicolons do not matter', () => {
    expect(parser.parse('create   color        abcdef;;;;;;')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "abcdef",
            }
        ]
    });
});

test('multiple color applies last only', () => {
    expect(parser.parse('create color green, color red, color blue')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "blue",
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
                color: "green",
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
                color: "green",
            },
            {
                commandType: "color",
                color: "red",
                targetName: "foo",
            },
            {
                commandType: "color",
                color: "blue",
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
