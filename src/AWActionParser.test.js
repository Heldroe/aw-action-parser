const AWActionParser = require('./AWActionParser');

parser = new AWActionParser();

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
