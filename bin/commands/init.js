'use strict';
const fs = require('fs-extra');
const cp = require('child_process');
const path = require('path');
const inquirer = require('inquirer');
const logger = require('../util/logger');
const os = require('os');
const ske = require('../skeleton');
const func = require('../util/func');
const conf = require('../util/conf');

const identifier = '[init] ';

let handler = {
    init: function() {
        try {
            let defaultSourceCodePath = '', defaultRuntimePath = '';
            logger.info(identifier, '当前操作为' + os.type());
            if (os.type() === 'Windows_NT') {
                // windows
                defaultSourceCodePath = 'd:/workspace/application';
                defaultRuntimePath = 'd:/workspace/tmp';
            } else {
                // MacOs
                let user = cp.execSync('whoami');
                user = user.toString();
                defaultSourceCodePath = `/Users/${user}/workspace/application`.replace(/\r|\n|\s/g, '');
                defaultRuntimePath = `/Users/${user}/workspace/tmp`.replace(/\r|\n|\s/g, '');
            }
            let steps = [{
                type: 'input',
                message: '请输入产品工作空间路径',
                name: 'sourceCodePath',
                default: defaultSourceCodePath
            }, {
                type: 'input',
                message: '请输入产品运行环境目录',
                name: 'runtimePath',
                default: defaultRuntimePath
            }];
            inquirer.prompt(steps).then(handleInit);
        } catch (err) {
            logger.error(identifier, err);
        }

        /**
         * 初始化
         * @param inputs
         */
        function handleInit(inputs) {
            if (!inputs.sourceCodePath) {
                throw new Error(identifier + '请输入正确的工作目录');
            }
            if (!inputs.runtimePath) {
                throw new Error(identifier + '请输入正确的运行环境目录');
            }
            if (!fs.existsSync(inputs.sourceCodePath + '/application.json')) {
                throw new Error(identifier + '工作目录下缺少application.json文件');
            }

            // 1.生成工作目录配置文件
            const appJson = fs.readJsonSync(path.join(inputs.sourceCodePath, './application.json'));
            appJson.sourceCodePath = inputs.sourceCodePath;
            appJson.runtimeDir = inputs.runtimePath;
            appJson.componentPkgName = `@${appJson.prefix}-component`;
            appJson.modulePkgName = `@${appJson.prefix}-module`;
            appJson.servicePkgName = `@${appJson.prefix}-service`;

            fs.outputJSONSync(path.join(__dirname, '../config/application.json'), appJson, {spaces: 4})
            logger.info(identifier, '同步application.json');

            // 2.生成工程骨架
            fs.ensureDirSync(path.join(appJson.sourceCodePath, 'component'));
            let components = appJson.component;
            components.forEach(item => {
                 ske.resolveFramework(
                     path.join(__dirname, '../skeleton/component'),
                     path.join(appJson.sourceCodePath, `./component/${item}`),
                     conf.getComponentDefaultConf(item)
                 )
            });
            fs.ensureDirSync(path.join(appJson.sourceCodePath, 'module'));

            fs.ensureDirSync(path.join(appJson.sourceCodePath, 'service'));
            let services = appJson.service;
            services.forEach(item => {
                ske.resolveFramework(
                    path.join(__dirname, '../skeleton/service'),
                    path.join(appJson.sourceCodePath, `./service/${item}`),
                    conf.getServiceDefaultConf(item)
                )
            });

            // 3.初始化运行环境
            [...components, ...services].forEach(item => {
                fs.ensureDirSync(`${appJson.runtimeDir}`);
                // 不会覆盖已存在工程
                let serv = cp.spawn(`vue`, ['create', '--default', '--bare', '--registry', 'https://registry.npm.taobao.org', '--no-git', item], {cwd: `${appJson.runtimeDir}`});
                serv.stdout.on('data', data => logger.info(identifier, data));
                serv.stderr.on('data', data => logger.info(identifier, data));
                serv.on('error', (error) => {
                    throw new Error('生成运行环境工程错误 ' + error);
                });
                serv.on('close', () => {
                    cp.execSync('npm install node-sass sass-loader --save-dev', {cwd: `${appJson.runtimeDir}/${item}`})
                    logger.info(identifier, '安装node-sass sass-loader')
                });

            });
        }
    }
};

module.exports = handler;

