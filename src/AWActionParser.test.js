const AWActionParser = require('./AWActionParser');

test('empty string', () => {
    expect(new AWActionParser().parse('')).toStrictEqual({});
});

test('create color green', () => {
    expect(new AWActionParser().parse('create color green')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "green",
            }
        ]
    });
});

test('whitespace and semicolons do not matter', () => {
    expect(new AWActionParser().parse('create   color        abcdef;;;;;;')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "abcdef",
            }
        ]
    });
});

test('multiple color applies last only', () => {
    expect(new AWActionParser().parse('create color green, color red, color blue')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "blue",
            }
        ]
    });
});

test('multiple create applies first only', () => {
    expect(new AWActionParser().parse('create color green; create color red')).toStrictEqual({
        create: [
            {
                commandType: "color",
                color: "green",
            }
        ]
    });
});
