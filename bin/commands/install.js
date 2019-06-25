
const logger = require('../util/logger');
const cp = require('child_process');

const identifier = '[install]';

let handler = {
    install(name) {
        if (/@waf-(component|module|service)\/\w+/g.exec(name)) {
            try {
                let version = cp.execSync(`npm view ${name} version`);
            }

        } else {
            logger.error(identifier, '插件格式有误' + name);
        }
    }
};

module.exports = handler;
