const fs = require('fs');
const ohm = require('ohm-js');
const contents = fs.readFileSync('grammar.ohm');

// Some unwanted unicode characters can appear in propdumps
const UNWANTED_CHARS = /\x80|\x7F/g
function cleanActionString(actionString) {
    return actionString.replace(UNWANTED_CHARS, "");
}

function resolveCommand(commandName, commandArguments) {
    let command = {
        commandType: commandName,
    };
    for (argument of commandArguments.parse()) {
        command[argument[0]] = argument[1];
    }
    return command;
}

function resolveRotateCoordinates(coordinates) {
    if (coordinates.length == 1) {
        return {x: 0, y: coordinates[0], z: 0};
    } else if (coordinates.length == 2) {
        return {x: coordinates[0], y: coordinates[1], z: 0};
    } else if (coordinates.length == 3) {
        return {x: coordinates[0], y: coordinates[1], z: coordinates[2]};
    } else {
        return {x: 0, y: 0, z: 0};
    }
}

function toSignedFloat(sign, float) {
    if (sign.parse() == '-') {
        return -1 * float.parse();
    } else {
        return float.parse();
    }
}

function mergeActions(actions) {
    simplifiedData = {};
    for (action of actions) {
        if (!(action.trigger in simplifiedData)) {
            // Only the first action should be kept
            simplifiedData[action.trigger] = mergeCommands(action.commands);
        }
    }
    return simplifiedData;
}

function mergeCommands(commands) {
    mergedCommands = new Map();
    for (command of commands) {
        if (command.commandType == 'name') {
            // Keep last name command only
            mergedCommands.set(command.commandType, command);
        } else {
            // Only keep 1 per targetName (including no targetName)
            const commandKey = command.commandType + ('targetName' in command ? command.targetName : '');
            mergedCommands.set(commandKey, command);
        }
    }
    return Array.from(mergedCommands.values());
}

class AWActionParser {

    constructor() {
        // TODO: don't read from file...
        this.grammar = ohm.grammar(contents);

        this.semantics = this.grammar.createSemantics();
        this.semantics.addOperation('parse', {
            Actions(actions, _) {
                return actions.asIteration().parse();
            },
            Action(trigger, commands, _) {
                return {
                    trigger: trigger.parse(),
                    commands: commands.asIteration().parse()
                }
            },
            MultiArgumentCommand(commandName, commandArguments) {
                return resolveCommand(commandName.parse(), commandArguments);
            },
            positiveInteger(input) {
                return parseInt(input.parse().join(''));
            },
            float_fract(integral, _, fractional) {
                return parseFloat([].concat(integral.parse(), ['.'], fractional.parse()).join(''));
            },
            float_whole(number) {
                return parseFloat(number.parse().join(''))
            },
            float(floatType) {
                return floatType.parse();
            },
            textureName(input) {
                return ['texture', input.parse().join('')];
            },
            resourceTarget(input) {
                return ['resource', input.parse().join('')]
            },
            objectName(name) {
                return name.parse().join('');
            },
            nameArgument(name) {
                return ['targetName', name.parse()];
            },
            namedParameter(parameterName, _, value) {
                return [parameterName.parse(), value.parse()]
            },
            nameParameter(name) {
                return ['targetName', name.parse()[1]];
            },
            boolean(boolean) {
                const bool = boolean.parse();
                if (bool == "on" || bool == "true" || bool == "yes") {
                    return true;
                } else if (bool == "off" || bool == "false" || bool == "no") {
                    return false;
                } else {
                    return undefined;
                }
            },
            booleanArgument(boolean) {
                return ['value', boolean.parse()];
            },
            colorName(color) {
                return color.parse().join('');
            },
            colorArgument(color) {
                return ['color', color.parse()];
            },
            ExamineCommand(_) {
                return {commandType: 'examine'}
            },
            RotateDistances(coordinates) {
                return ['rotateDistances', resolveRotateCoordinates(coordinates.parse())];
            },
            MoveDistances(coordinates) {
                return ['moveDistances', resolveRotateCoordinates(coordinates.parse())];
            },
            WarpCommand(commandName, coordinates) {
                const wCoords = coordinates.parse();
                return {
                    commandType: 'warp',
                    coordinates: wCoords.coordinates,
                    altitude: wCoords.altitude,
                    direction: wCoords.direction,
                };
            },
            WorldCoordinates(coordinates, altitude, direction) {
                return {
                    coordinates: coordinates.parse(),
                    altitude: altitude.parse()[0],
                    direction: direction ? direction.parse()[0] : null,
                }
            },
            RelativeCoordinates(x, y) {
                return {
                    coordinateType: 'relative',
                    x: x.parse(),
                    y: y.parse(),
                }
            },
            AbsoluteCoordinates(x, y) {
                return {
                    coordinateType: 'absolute',
                    NS: x.parse(),
                    EW: y.parse(),
                }
            },
            nsCoordinate(float, axis) {
                const axisLetter = axis.parse();
                if (axisLetter == 'N') {
                    return float.parse();
                } else {
                    return -1 * float.parse();
                }
            },
            ewCoordinate(float, axis) {
                const axisLetter = axis.parse();
                if (axisLetter == 'E') {
                    return float.parse();
                } else {
                    return -1 * float.parse();
                }
            },
            TeleportCommand(commandName, worldName, worldCoordinates) {
                const world = worldName.parse();
                return {
                    commandType: 'teleport',
                    worldName: world.length > 0 ? world : undefined,
                    coordinates: worldCoordinates.parse(),
                }
            },
            worldName(worldString) {
                return worldString.parse();
            },
            worldString(firstPart, secondPart) {
                return firstPart.parse().join('') + secondPart.parse().join('');
            },
            signedFloat(sign, float) {
                return toSignedFloat(sign, float);
            },
            forceSignedFloat(sign, float) {
                return toSignedFloat(sign, float);
            },
            altitude(sign, float, _) {
                if (sign.parse().length > 0) {
                    return {
                        altitudeType: 'relative',
                        value: toSignedFloat(sign, float),
                    }
                } else {
                    return {
                        altitudeType: 'absolute',
                        value: toSignedFloat(sign, float),
                    }
                }
            },
            syncStatus(status) {
                if (status.parse() == 'sync') {
                    return ['sync', true];
                } else {
                    return ['sync', false];
                }
            },
            loopStatus(status) {
                if (status.parse() == 'loop') {
                    return ['loop', true];
                } else {
                    return ['loop', false];
                }
            },
            signText(_, text, __) {
                return text.parse();
            },
            invalidCommand(command) {
                return {commandType: 'invalid', commandText: command.parse().join('')};
            },
            _terminal() { return this.primitiveValue; }
        });
    }

    #getMatch(actionString) {
        return this.grammar.match(cleanActionString(actionString));
    }

    // Return parsed action string
    parse(actionString) {
        const match = this.#getMatch(actionString);
        if (match.succeeded()) {
            return mergeActions(this.semantics(match).parse());
        }
        return {};
    }

    // Return a message explaining the possible parsing failure
    debug(actionString) {
        const match = this.#getMatch(actionString);
        if (match.failed()) {
            return match.message;
        }
        return '';
    }

}

module.exports = { AWActionParser };
