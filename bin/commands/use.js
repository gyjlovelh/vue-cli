let fs = require('fs-extra');
let path = require('path');
const logger = require('../util/logger');

const identifier = '[use]';

let handler = {

    use: function (name) {
        logger.warn(identifier, '该功能尚未开放');
        // console.log('name', name);
        // let conf = fs.readJsonSync(path.join(__dirname, 'conf.json'));
        // conf.selectedPlugin = name;
        //
        // fs.outputJSONSync(path.join(__dirname, 'conf.json'), conf, {spaces: 4});
    }
};

module.exports = handler;
