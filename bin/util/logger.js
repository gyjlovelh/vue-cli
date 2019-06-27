
const chalk = require('chalk');

const prefix = chalk.magenta.bold;
const c_info = chalk.hex('#409eff');
const c_tip = chalk.hex('#67c23a');
const c_warn = chalk.hex('#e6a23c');
const c_error = chalk.hex('#f56c6c');

let handler = {
    info: function(identifer, msg) {
        handler.segLine(msg).forEach(line => {
            console.log(prefix(identifer) + c_info('[info] ' + line));
        });
    },
    tip: function(identifer, msg) {
        handler.segLine(msg).forEach(line => {
            console.log(prefix(identifer) + c_tip('[tips] ' + line));
        });
    },
    warn: function(identifer, msg) {
        handler.segLine(msg).forEach(line => {
            console.log(prefix(identifer) + c_warn('[warn] ' + line));
        });
    },
    error: function(identifer, msg) {
        handler.segLine(msg).forEach(line => {
            console.log(prefix(identifer) + c_error('[error] ' + line));
        });
    },

    segLine(msg) {
        return msg.toString().split(/\n/g).filter(line => !!line);
    }
};

module.exports = handler;
