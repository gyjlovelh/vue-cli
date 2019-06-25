
const logger = require('../util/logger');

let handler = {
    install(name) {
        logger.info('name', name);
    }
};

module.exports = handler;
