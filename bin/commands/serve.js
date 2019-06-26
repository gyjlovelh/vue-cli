let fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');
const ske = require('../skeleton');
const conf = require('../util/conf');
const func = require('../util/func');
const logger = require('../util/logger');

const identifier = '[serve]';

let handler = {

    serve: function () {
        let appConf = conf.getAppConf();
        let pluginType = conf.getPluginType(appConf.selectedPlugin);

        try {



            // 1.拷贝资源文件

            // 2.生成index.html
            install();
            // genRootFile(appConf.selectedPlugin);
            genMain(appConf.selectedPlugin, pluginType);
            // 3.引入全局文件样式

            // 4.运行runtime工程

            let args = ['run', 'serve'];
            let serv = cp.spawn('npm', args, {cwd: `/Users/guanyj/workspace/rt/${appConf.selectedPlugin}`});
            serv.stdout.on('data', data => logger.info(identifier, data.toString()));
            serv.stderr.on('data', data => logger.error(identifier, data.toString()));
            serv.on('error', err => {
                throw new Error(err)
            });

            // 5.开启sourceCodePath文件监听



        } catch (err) {
            logger.error(identifier, err);
        }

        function install() {
            cp.execSync(`npm config set registry http://106.14.154.205:4873`);
            cp.execSync(`npm install @waf-${pluginType}/${appConf.selectedPlugin}@latest --save`, {cwd: `/Users/guanyj/workspace/rt/${appConf.selectedPlugin}`})
            cp.execSync(`npm config set registry=https://registry.npm.taobao.org`);
            cp.execSync(`npm i`, {cwd: `/Users/guanyj/workspace/rt/${appConf.selectedPlugin}`})
        }

        function genMain(name) {
            ske.resolveMain({module: {
                    componentName: func.anyToCamel(`${name}-${pluginType}`),
                    pkg: `@waf-${pluginType}/${name}`
            }}, `${appConf.runtimeDir}/${name}/src`);
        }


    }
};

module.exports = handler;
