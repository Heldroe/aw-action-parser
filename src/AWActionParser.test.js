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
