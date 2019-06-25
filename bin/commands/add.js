const fs = require('fs-extra');
const logger = require('../util/logger');
const func = require('../util/func');
const ske = require('../skeleton');
const path = require('path');
const conf = require('../util/conf');

const identifier = '[add]';

let handler = {

    add: function (args) {
        if (args.component) {
            logger.info(identifier, '新增组件:' + args.component);
            let appConf = conf.getAppConf();
            let name = args.component;

            let plugins = [...appConf.component, ...appConf.module, ...appConf.service];
            if (plugins.includes(name)) {
                logger.error(identifier, `该模块:${name} 已经存在于插件库中`);
                return;
            }

            ske.resolveFramework(
                path.join(__dirname, '../skeleton/component'),
                path.join(`${appConf.sourceCodePath}/component`, name),
                conf.getComponentDefaultConf(name)
            );
            appConf.component.push(name);
            let app = fs.readJSONSync(path.join(appConf.sourceCodePath, 'application.json'));
            app.component.push(name);
            fs.outputJSONSync(path.join(appConf.sourceCodePath, 'application.json'), app, {spaces: 4});
            conf.saveAppConf(appConf);
        } else if (args.module) {
            logger.info(identifier, '新增模块:' + args.module)

        } else if (args.service) {
            logger.info(identifier, '新增服务:' + args.service)
        } else {
            logger.error(identifier, '请指定新增插件类型');
        }
    },

    remove: function(name) {
        if (name) {
            let appConf = conf.getAppConf();
            let plugins = [...appConf.component, ...appConf.module, ...appConf.service];
            if (!plugins.includes(name)) {
                logger.error(identifier, `要删除的模块:${name} 不存在`);
                return;
            }

            if (appConf.component.includes(name)) {
                fs.removeSync(path.join(`${appConf.sourceCodePath}/component`, name));
                appConf.component = appConf.component.filter(item => item !== name);
                conf.saveAppConf(appConf);
                let app = fs.readJSONSync(path.join(appConf.sourceCodePath, 'application.json'));
                app.component = app.component.filter(item => item !== name);
                fs.outputJSONSync(path.join(appConf.sourceCodePath, 'application.json'), app, {spaces: 4});
                logger.info(identifier, `删除组件:${name} 成功`);
            }
        } else {
            logger.error(identifier, '请输入要删除的插件名称');
        }
    }
};

module.exports = handler;
