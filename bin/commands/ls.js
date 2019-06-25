const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../util/logger');
const func = require('../util/func');
const conf = require('../util/conf');

const identifier = '[use] ';

function ls() {
    try {
        let appConf = conf.getAppConf();
        let plugins = [
            ...appConf.component,
            ...appConf.module,
            ...appConf.service,
        ];

        if (!appConf.selectedPlugin) {
            appConf.selectedPlugin = plugins[0];
        }

        inquirer.prompt([{
            type: 'list',
            message: '选择插件',
            name: 'subName',
            default: appConf.selectedPlugin,
            choices: plugins
        }]).then(({subName}) => {
            appConf.selectedPlugin = subName;
            fs.outputJSONSync(path.join(__dirname, '../config/application.json'), appConf, {spaces: 4});
            logger.info(identifier, '切换插件 ' + appConf.selectedPlugin);
        });
    } catch (err) {
        logger.error(identifier, err);
    }

}

module.exports = {
    ls
}
