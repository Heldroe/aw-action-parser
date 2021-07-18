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
