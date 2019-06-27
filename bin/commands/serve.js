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

        try {
            let appConf = conf.getAppConf();
            let pluginType = conf.getPluginType(appConf.selectedPlugin);

            let sourceDir = `${appConf.sourceCodePath}/${pluginType}/${appConf.selectedPlugin}`;
            let rtDir = `${appConf.runtimeDir}/${conf.getCurrentPlugin()}/node_modules/${conf.getCurrentPluginPkgName()}`;

            // 1.拷贝最新文件至运行环境
            copyResource();
            // 2.在main.js中引入源文件
            genMain(appConf.selectedPlugin, pluginType);

            // 3.运行runtime工程
            let args = ['run', 'serve'];
            let serv = cp.spawn('npm', args, {cwd: `${appConf.runtimeDir}/${appConf.selectedPlugin}`});
            serv.stdout.on('data', data => logger.info(identifier, data.toString()));
            serv.stderr.on('data', data => logger.warn(identifier, data.toString()));
            serv.on('error', err => {
                throw new Error(err)
            });

            // 4.开启sourceCodePath文件监听
            fileChangeListener();


            function copyResource() {
                fs.ensureDirSync(rtDir);

                fs.copySync(
                    sourceDir,
                    rtDir,
                    {overwrite: true}
                )
            }

            function genMain(name) {
                let dependencies = conf.getCurrentPluginDependency();
                ske.resolveMain({
                    module: {
                        dependencies
                    }
                }, `${appConf.runtimeDir}/${name}/src`);
            }

            function fileChangeListener() {
                const chokidar = require('chokidar');

                let watch$ = chokidar.watch(`${appConf.sourceCodePath}/${conf.getCurrentPluginType()}/${appConf.selectedPlugin}`, {
                    ignored: /(^|[\/\\])\../,
                    persistent: true
                });

                watch$.on('change', path => {
                    path = path.replace(/\\/g, '/');
                    let dest = path.split(`/${appConf.selectedPlugin}/`)[1];
                    let dest_path = `${appConf.runtimeDir}/${appConf.selectedPlugin}/node_modules/${conf.getCurrentPluginPkgName()}/${dest}`;

                    fs.copySync(path, dest_path, {
                        overwrite: true
                    });
                    logger.info(identifier, `文件发生变化: ${path} -> ${dest_path}`);
                }).on('error', error => logger.error(error));
            }
        } catch (err) {
            logger.error(identifier, err);
        }

    }
};

module.exports = handler;
