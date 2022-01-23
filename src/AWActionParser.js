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
            | ScaleCommand
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
  // Basic resource target for textures, masks etc
  basicResourceTarget = (alnum | "." | "_" | "-")+

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
  textureName = basicResourceTarget

  maskParameter = namedParameter<"mask", maskName>
  maskName = basicResourceTarget

  tagParameter = namedParameter<"tag", tagName>
  tagName = basicResourceTarget

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

  // Scale command
  ScaleCommand = MultiArgumentCommand<caseInsensitive<"scale">, ScaleArgument>
  ScaleArgument = ScaleFactor
                 | syncStatus
                 | timeParameter
                 | loopStatus
                 | resetStatus
                 | waitParameter
                 | nameParameter
  ScaleFactor = signedFloat+

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
  MediaArgument = nameParameter | radiusParameter | resourceTarget

  // Sign command
  SignCommand = MultiArgumentCommand<caseInsensitive<"sign">, SignArgument>
  SignArgument = colorParameter | bcolorParameter | nameParameter | signText
  bcolorParameter = namedParameter<"bcolor", colorName>
  signText = signQuotedText | signUnquotedText
  signStringQuote = "\\""
  signUnquotedText = (~";" ~"," ~" " any)+
  signQuotedText = signStringQuote (~signStringQuote any)* signStringQuote?

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

// Scale command properties, see http://wiki.activeworlds.com/index.php?title=Scale
const SCALE_MIN = 0.2;
const SCALE_MAX = 5;
function clampScale(value) {
    if (value > 0) {
        return Math.max(Math.min(value, SCALE_MAX), SCALE_MIN);
    } else {
        return 1;
    }
}

function resolveCommand(commandName, commandArguments) {
    let command = {
        commandType: commandName,
    };
    for (const argument of commandArguments.children.map(c => c.parse())) {
        if (argument && argument.length == 2) {
            if (command[argument[0]] !== undefined) {
                // Can't set the same parameter multiple times
                return null;
            } else {
                command[argument[0]] = argument[1];
            }
        }
    }
    return command;
}

function resolveIncompleteCoordinates(coordinates) {
    let [x, y, z] = [coordinates[0], coordinates[1], coordinates[2]];

    if (coordinates.length === 1) {
      return {x: 0, y: x, z: 0};
    } else if (coordinates.length === 2) {
      return {x, y, z: 0};
    } else if (coordinates.length === 3) {
      return {x, y, z};
    } else {
      return {x: 0, y: 0, z: 0};
    }
}

function resolveIncompleteScaleCoordinates(coordinates) {
    let [x, y, z] = coordinates.map(clampScale, coordinates);

    if (coordinates.length === 1) {
      return {x: x, y: x, z: x};
    } else if (coordinates.length === 2) {
      return {x, y, z: 1};
    } else if (coordinates.length === 3) {
      return {x, y, z};
    } else {
      return {x, y, z};
    }
}

function toSignedFloat(sign, float) {
    if (sign.children.map(c => c.parse()) == '-') {
        return -1 * float.parse();
    } else {
        return float.parse();
    }
}

const ULLONG_MAX = 18446744073709551615;

function rgb(red, green, blue) {
    // Clamp values just in case
    return {
        r: Math.max(0, Math.min(red,   255)),
        g: Math.max(0, Math.min(green, 255)),
        b: Math.max(0, Math.min(blue,  255)),
    }
}

const PRESET_COLORS = {
    aquamarine:  rgb(112, 219, 147),
    black:       rgb(  0,   0,   0),
    blue:        rgb(  0,   0, 255),
    brass:       rgb(181, 166,  66),
    bronze:      rgb(140, 120,  83),
    brown:       rgb(166,  42,  42),
    copper:      rgb(184, 115,  51),
    cyan:        rgb(  0, 255, 255),
    darkgrey:    rgb( 48,  48,  48),
    forestgreen: rgb( 35, 142,  35),
    gold:        rgb(205, 127,  50),
    green:       rgb(  0, 255,   0),
    grey:        rgb(112, 112, 112),
    lightgrey:   rgb(192, 192, 192),
    magenta:     rgb(255,   0, 255),
    maroon:      rgb(142,  35, 107),
    navyblue:    rgb( 35,  35, 142),
    orange:      rgb(255, 127,   0),
    orangered:   rgb(255,  36,   0),
    orchid:      rgb(219, 112, 219),
    pink:        rgb(255, 110, 199),
    red:         rgb(255,   0,   0),
    salmon:      rgb(111,  66,  66),
    scarlet:     rgb(140,  23,  23),
    silver:      rgb(230, 232, 250),
    skyblue:     rgb( 50, 153, 204),
    tan:         rgb(219, 147, 112),
    teal:        rgb(  0, 112, 112),
    turquoise:   rgb(173, 234, 234),
    violet:      rgb( 79,  47,  79),
    white:       rgb(255, 255, 255),
    yellow:      rgb(255, 255,   0),
};

const ALLOWED_EMPTY_COMMANDS = ['examine', 'sign']

function colorStringToRGB(colorString) {
    if (colorString in PRESET_COLORS) {
        return PRESET_COLORS[colorString];
    }
    const extractedHex = colorString.toLowerCase().match(/(^[a-f0-9]+)/);
    if (extractedHex) {
        // Get first hexadecimal string match & convert to number
        const colorValue = parseInt(extractedHex[0], 16);
        if (colorValue > ULLONG_MAX) {
            // AW considers everything white at this point
            return rgb(255, 255, 255);
        } else {
            const red   = (colorValue >> 16) % 256;
            const green = (colorValue >>  8) % 256;
            const blue  = (colorValue >>  0) % 256;
            return rgb(
                red   < 0 ? red   + 256 : red,
                green < 0 ? green + 256 : green,
                blue  < 0 ? blue  + 256 : blue,
            );
        }
    }
    return null;
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
        if (command === null) {
            // Remove invalid commands (usually due to duplicated parameters)
            continue;
        }
        if (!ALLOWED_EMPTY_COMMANDS.includes(command.commandType) && Object.keys(command).length == 1) {
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

class AWActionParser {

    constructor() {
        this.grammar = ohm.grammar(GRAMMAR_DEFINITION);

        this.semantics = this.grammar.createSemantics();
        this.semantics.addOperation('parse', {
            Actions(actions, _) {
                return actions.asIteration().children.map(c => c.parse());
            },
            Action(trigger, commands, _) {
                return {
                    trigger: trigger.parse(),
                    commands: commands.asIteration().children.map(c => c.parse())
                }
            },
            MultiArgumentCommand(commandName, commandArguments) {
                return resolveCommand(commandName.children.map(c => c.parse())[0], commandArguments);
            },
            positiveInteger(input) {
                return parseInt(input.children.map(c => c.parse()).join(''));
            },
            float_fract(integral, _, fractional) {
                return parseFloat([].concat(integral.children.map(c => c.parse()), ['.'], fractional.children.map(c => c.parse())).join(''));
            },
            float_whole(number) {
                return parseFloat(number.children.map(c => c.parse()).join(''))
            },
            float(floatType) {
                return floatType.parse();
            },
            textureName(input) {
                return ['texture', input.parse()];
            },
            basicResourceTarget(input) {
                return input.children.map(c => c.parse()).join('');
            },
            resourceTarget(input) {
                return ['resource', input.children.map(c => c.parse()).join('')]
            },
            objectName(name) {
                return name.children.map(c => c.children.map(d => d.parse()).join('')).join('');
            },
            nameArgument(name) {
                return ['targetName', name.children.map(c => c.children.map(d => d.parse()).join('')).join('')];
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
                return colorStringToRGB(color.children.map(c => c.children.map(d => d.parse()).join('')).join(''));
            },
            colorArgument(color) {
                if (color.parse()) {
                    return ['color', color.parse()];
                }
            },
            ExamineCommand(_) {
                return {commandType: 'examine'}
            },
            RotateDistances(coordinates) {
                return ['speed', resolveIncompleteCoordinates(coordinates.children.map(c => c.parse()))];
            },
            MoveDistances(coordinates) {
                return ['distance', resolveIncompleteCoordinates(coordinates.children.map(c => c.parse()))];
            },
            ScaleFactor(coordinates) {
                return ['factor', resolveIncompleteScaleCoordinates(coordinates.children.map(c => c.parse()))];
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
                    altitude: altitude.children.map(c => c.parse())[0],
                    direction: direction ? direction.children.map(c => c.parse())[0] : null,
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
                const world = worldName.children.map(c => c.parse());
                return {
                    commandType: 'teleport',
                    worldName: world.length > 0 ? world : undefined,
                    coordinates: worldCoordinates.children.map(c => c.parse()),
                }
            },
            worldName(worldString) {
                return worldString.parse();
            },
            worldString(firstPart, secondPart) {
                return firstPart.children.map(c => c.parse()).join('') + secondPart.children.map(c => c.parse()).join('');
            },
            signedFloat(sign, float) {
                return toSignedFloat(sign, float);
            },
            forceSignedFloat(sign, float) {
                return toSignedFloat(sign, float);
            },
            altitude(sign, float, _) {
                if (sign.children.map(c => c.parse()).length > 0) {
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
            resetStatus(status) {
                if (status.parse() == 'reset') {
                    return ['reset', true];
                } else {
                    return ['reset', false];
                }
            },
            signText(text) {
                return ['text', text.parse()];
            },
            signQuotedText(_, text, __) {
                return text.children.map(c => c.parse()).join('');
            },
            signUnquotedText(text) {
                return text.children.map(c => c.parse()).join('');
            },
            invalidCommand(command) {
                return {commandType: 'invalid', commandText: command.children.map(c => c.parse()).join('')};
            },
            _terminal() { return this.sourceString; }
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

export { AWActionParser };
