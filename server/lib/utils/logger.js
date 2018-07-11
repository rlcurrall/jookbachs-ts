// ================================================================================================
// IMPORT MODULES
// ================================================================================================
const {
    createLogger,
    format,
    transports,
    addColors
} = require('winston');
const {
    combine,
    timestamp,
    printf,
    colorize,
    align
} = format;

// ================================================================================================
// DEFINE LOGGER
// ================================================================================================

/**
 * Define custom Levels and Colors
 */
const jbLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        request: 3,
        socket: 3
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        socket: 'cyan',
        request: 'green'
    }
}
addColors(jbLevels.colors);

/**
 * Define custom format
 */
const jbFormat = printf(info => {
    let label = String(info.label + "              ").slice(0, 14);
    return `${info.timestamp} [${label}]  ${info.level}:\t${info.message}`
});

/**
 * Instantiate Logger
 */
const Logger = createLogger({
    levels: jbLevels.levels,
    format: combine(
        timestamp(),
        jbFormat
    ),
    transports: [
        new transports.Console({
            level: 'request',
            format: combine(colorize(), timestamp(), jbFormat)
        }),
        new transports.File({
            filename: `server/logs/info.log`
        }),
        new transports.File({
            filename: `server/logs/error.log`,
            level: 'error'
        }),
        new transports.File({
            filename: `server/logs/robust.log`,
            level: 'request'
        })
    ],
    exceptionHandlers: [
        new transports.Console(),
        new transports.File({
            filename: 'server/logs/exceptions.log'
        })
    ],
    exitOnError: true
})

module.exports = Logger;