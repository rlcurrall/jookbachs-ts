const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const jbFormat = printf(info => {
    return `${info.timestamp} [${info.label}]\t${info.level}: ${info.message}`
});

var options = {
    file: {
        level: 'info',
        filename: 'test.log',
        handleExceptions: true,
        format: format.label,
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: format.label,
        colorize: true,
    },
};



const Logger = createLogger({
    format: combine(
        timestamp(),
        jbFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: `info.log`}),
        new transports.File({filename: `error.log`, level: 'error'})
    ],
    exitOnError: false
})

module.exports = Logger;