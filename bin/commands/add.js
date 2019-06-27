const fs = require('fs-extra');
const logger = require('../util/logger');
const func = require('../util/func');
const ske = require('../skeleton');
const path = require('path');
const conf = require('../util/conf');
const cp = require('child_process');

const identifier = '[add]';

let handler = {

    /**
     * 新增模块
     * @desc 在源码目录中追加骨架目录
     * 同时在运行环境新增
     * @param args
     */
    add: function (args) {
        let appConf = conf.getAppConf();
        // 插件名称
        let name;
        let plugins = [...appConf.component, ...appConf.module, ...appConf.service];
        if (args.component) {
            name = args.component;
            logger.info(identifier, '新增组件:' + name);
            // 插件集合

            if (plugins.includes(name)) {
                logger.error(identifier, `该插件:${name} 已经存在于插件库中`);
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
            name = args.service;
            logger.info(identifier, '新增服务:' + name);
            if (plugins.includes(name)) {
                logger.error(identifier, `该插件:${name} 已经存在于插件库中`);
                return;
            }
            ske.resolveFramework(
                path.join(__dirname, '../skeleton/service'),
                path.join(`${appConf.sourceCodePath}/service`, name),
                conf.getServiceDefaultConf(name)
            );
            appConf.service.push(name);
            let app = fs.readJSONSync(path.join(appConf.sourceCodePath, 'application.json'));
            app.service.push(name);
            fs.outputJSONSync(path.join(appConf.sourceCodePath, 'application.json'), app, {spaces: 4});
            conf.saveAppConf(appConf);
        } else {
            logger.error(identifier, '请指定新增插件类型');
            return;
        }

        fs.ensureDirSync(`${appConf.runtimeDir}`);
        // 不会覆盖已存在工程
        let serv = cp.spawn(`vue`, ['create', '--default', '--registry', 'https://registry.npm.taobao.org', '--no-git', name], {cwd: `${appConf.runtimeDir}`});
        serv.stdout.on('data', data => logger.info(identifier, data));
        serv.stderr.on('data', data => logger.error(identifier, data));
        serv.on('error', err => {
            throw new Error(err)
        });
        serv.on('close', () => {
            cp.execSync('npm install node-sass sass-loader --save-dev', {cwd: `${appConf.runtimeDir}/${name}`})
            logger.info(identifier, '安装node-sass sass-loader')
        });
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
