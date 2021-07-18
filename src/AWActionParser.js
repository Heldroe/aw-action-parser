import ohm from 'ohm-js';

const GRAMMAR_DEFINITION = `
ActionString {
  // Base syntax
  Actions   = ListOf<Action, ";"+> ";"?
  Action = Trigger ListOf<Command, ","+> ","?

  // Trigger index
  Trigger   = create
            | activate
            | bump
            | adone
            | end
  create    = caseInsensitive<"create">
  activate  = caseInsensitive<"activate">
  bump      = caseInsensitive<"bump">
  adone     = caseInsensitive<"adone">

  // Command index
  Command   = TextureCommand
            | SoundCommand
            | CoronaCommand
            | ColorCommand
            | ExamineCommand
            | SolidCommand
            | NameCommand
            | VisibleCommand
            | MoveCommand
            | RotateCommand
            | LightCommand
            | NoiseCommand
            | PictureCommand
            | MediaCommand
            | SignCommand
            | TeleportCommand
            | WarpCommand
            | URLCommand
            | invalidCommand

  // Enabled / disabled string values
  enabled  = "on" | "true" | "yes"
  disabled = "off" | "false" | "no"
  booleanArgument = boolean
  boolean  = enabled | disabled

  // Loop status
  loopStatus = loop | noloop
  loop       = "loop"
  noloop     = "noloop"

  // Sync status
  syncStatus = sync | nosync
  sync       = "sync"
  nosync     = "nosync"

  // Reset status
  resetStatus = reset | noreset
  reset       = "reset"
  noreset     = "noreset"

  // Resource target
  resourceTarget = (alnum | "." | "/" | ":" | "_" | "-" | "+" | "%" | "?" | "=" | "[" | "]" | "&" | "~" | "!" | "@" | "*" | "(" | ")")+

  // Command parameter (e.g. name=foo, tag=bar)
  namedParameter<paramName, paramSyntax> = paramName "=" paramSyntax

  // Name parameter
  nameParameter = namedParameter<"name", objectName>
  nameArgument = objectName
  objectName = (alnum | "_" | "-")+

  // Invalid command (e.g. unsupported)
  invalidCommand = (~";" ~"," any)*

  // Generic command
  MultiArgumentCommand<commandName, CommandArgument> = commandName CommandArgument*

  // Name command
  NameCommand = MultiArgumentCommand<caseInsensitive<"name">, nameArgument>

  // Solid command
  SolidCommand = MultiArgumentCommand<caseInsensitive<"solid">, SolidArgument>
  SolidArgument = booleanArgument | nameArgument

  // Texture command
  TextureCommand = MultiArgumentCommand<caseInsensitive<"texture">, TextureArgument>
  TextureArgument = maskParameter | tagParameter | nameParameter | textureName
  textureName = (alnum | "." | "_" | "-")+

  maskParameter = namedParameter<"mask", maskName>
  maskName = alnum+

  tagParameter = namedParameter<"tag", tagName>
  tagName = alnum+

  // Color command
  ColorCommand  = MultiArgumentCommand<caseInsensitive<"color">, ColorArgument>
  ColorArgument = nameParameter | colorArgument
  colorArgument = colorName
  colorName     = colorcode
  colorcode     = alnum+

  // Sound command
  SoundCommand    = MultiArgumentCommand<caseInsensitive<"sound">, SoundArgument>
  SoundArgument   = nameParameter | loopStatus | soundName
  soundName       = resourceTarget

  // Visible command
  VisibleCommand = MultiArgumentCommand<caseInsensitive<"visible">, VisibleArgument>
  VisibleArgument = booleanArgument | nameArgument

  // Move command
  MoveCommand = MultiArgumentCommand<caseInsensitive<"move">, MoveArgument>
  MoveArgument = MoveDistances
               | loopStatus
               | syncStatus
               | resetStatus
               | nameParameter
               | timeParameter
               | waitParameter
  MoveDistances = signedFloat+
  timeParameter = namedParameter<"time", float>
  waitParameter = namedParameter<"wait", float>
  sign = "+" | "-"
  float = digit* "." digit+ -- fract
        | digit+            -- whole
  signedFloat = sign? float
  forceSignedFloat = sign float

  // Rotate command
  RotateCommand = MultiArgumentCommand<caseInsensitive<"rotate">, RotateArgument>
  RotateArgument = RotateDistances
                 | syncStatus
                 | timeParameter
                 | loopStatus
                 | resetStatus
                 | waitParameter
                 | nameParameter
  RotateDistances = signedFloat+

  // Corona command
  CoronaCommand = MultiArgumentCommand<caseInsensitive<"corona">, CoronaArgument>
  CoronaArgument = maskParameter | sizeParameter | nameParameter | resourceTarget
  sizeParameter = namedParameter<"size", float>

  // Examine command
  ExamineCommand = caseInsensitive<"examine">

  // Light command
  LightCommand = MultiArgumentCommand<caseInsensitive<"light">, LightArgument>
  LightArgument = lightTypeParameter
                | colorParameter
                | brightnessParameter
                | radiusParameter
                | nameParameter
                | fxParameter
                | timeParameter
                | angleParameter
                | pitchParameter
  colorParameter      = namedParameter<"color", colorName>
  lightTypeParameter  = namedParameter<"type", lightType>
  lightType           = "point" | "spot"
  brightnessParameter = namedParameter<"brightness", float>
  radiusParameter     = namedParameter<"radius", float>
  fxParameter         = namedParameter<"fx", fxType>
  fxType              = "blink" | "fadein" | "fadeout" | "fire" | "flicker" | "flash" | "pulse"
  angleParameter      = namedParameter<"angle", float>
  pitchParameter      = namedParameter<"pitch", float>

  // Noise command
  NoiseCommand  = MultiArgumentCommand<caseInsensitive<"noise">, NoiseArgument>
  NoiseArgument = overlapStatus | resourceTarget
  overlapStatus = "overlap"

  // Picture command
  PictureCommand  = MultiArgumentCommand<caseInsensitive<"picture">, PictureArgument>
  PictureArgument = updateParameter | nameParameter | resourceTarget
  updateParameter = namedParameter<"update", positiveInteger>
  positiveInteger = digit+

  // Media command
  MediaCommand  = MultiArgumentCommand<caseInsensitive<"media">, MediaArgument>
  MediaArgument = resourceTarget

  // Sign command
  SignCommand = MultiArgumentCommand<caseInsensitive<"sign">, SignArgument>
  SignArgument = colorParameter | bcolorParameter | nameParameter | signText
  bcolorParameter = namedParameter<"bcolor", colorName>
  signStringDelimiter = "\\""
  signText = signStringDelimiter (~signStringDelimiter any)* signStringDelimiter

  // Teleport command (TODO: check relative/absolute altitude behavior on AW)
  TeleportCommand  = caseInsensitive<"teleport"> worldName? WorldCoordinates?
  worldName        = worldString
  worldString      = letter+ (letter | digit)*
  WorldCoordinates = (AbsoluteCoordinates | RelativeCoordinates) altitude? direction?
  RelativeCoordinates = forceSignedFloat forceSignedFloat
  AbsoluteCoordinates = nsCoordinate ewCoordinate

  nsCoordinate = float (northSign | southSign)
  ewCoordinate = float (eastSign | westSign)
  northSign = caseInsensitive<"N">
  southSign = caseInsensitive<"S">
  eastSign  = caseInsensitive<"E">
  westSign  = caseInsensitive<"W">
  altitude = sign? float caseInsensitive<"a">
  direction = positiveInteger

  // URL command
  URLCommand = MultiArgumentCommand<caseInsensitive<"url">, URLArgument>
  URLArgument = urlTargetParameter | resourceTarget
  urlTargetParameter = namedParameter<"target", "aw_3d">

  // Warp command
  WarpCommand = caseInsensitive<"warp"> WorldCoordinates
}
`

// Some unwanted unicode characters can appear in propdumps
const UNWANTED_CHARS = /\x80|\x7F/g
function cleanActionString(actionString) {
    return actionString.replace(UNWANTED_CHARS, "");
}

function resolveCommand(commandName, commandArguments) {
    let command = {
        commandType: commandName,
    };
    for (const argument of commandArguments.parse()) {
        command[argument[0]] = argument[1];
    }
    return command;
}

function resolveIncompleteCoordinates(coordinates) {
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
    let simplifiedData = {};
    for (const action of actions) {
        if (action.trigger && !(action.trigger in simplifiedData)) {
            // Only the first action should be kept
            const mergedCommands = mergeCommands(action.commands);
            if (mergedCommands.length > 0) {
                // Only add action if there are commands inside
                simplifiedData[action.trigger] = mergedCommands;
            }
        }
    }
    return simplifiedData;
}

function mergeCommands(commands) {
    let mergedCommands = new Map();
    for (const command of commands) {
        if (command.commandType !== 'examine' && Object.keys(command).length == 1) {
            // Remove commands without parameters
            continue;
        }
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

export default class AWActionParser {

    constructor() {
        this.grammar = ohm.grammar(GRAMMAR_DEFINITION);

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
                return ['speed', resolveIncompleteCoordinates(coordinates.parse())];
            },
            MoveDistances(coordinates) {
                return ['distance', resolveIncompleteCoordinates(coordinates.parse())];
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

    // Return parsed action string
    parse(actionString) {
        const match = this.grammar.match(cleanActionString(actionString));
        if (match.succeeded()) {
            return mergeActions(this.semantics(match).parse());
        }
        return {};
    }

    // Return a message explaining the possible parsing failure
    debug(actionString) {
        const match = this.grammar.match(cleanActionString(actionString));
        if (match.failed()) {
            return match.message;
        }
        return '';
    }

}
