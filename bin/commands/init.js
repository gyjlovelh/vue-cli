'use strict';
const fs = require('fs-extra');
const cp = require('child_process');
const path = require('path');
const inquirer = require('inquirer');
const logger = require('../util/logger');
const os = require('os');
const ske = require('../skeleton');
const func = require('../util/func');

const identifier = '[init] ';

let handler = {
    init: function() {
        try {
            let defaultSourceCodePath = '';
            logger.info(identifier, '当前操作为' + os.type());
            if (os.type() === 'Windows_NT') {
                // windows
                defaultSourceCodePath = 'd:/workspace/application';
            } else {
                // MacOs
                defaultSourceCodePath = '/Users/guanyj/workspace/application';
            }
            let steps = [{
                type: 'input',
                message: '请输入产品工作空间路径',
                name: 'sourceCodePath',
                default: defaultSourceCodePath
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

            if (!fs.existsSync(inputs.sourceCodePath + '/application.json')) {
                throw new Error(identifier + '工作目录下缺少application.json文件');
            }

            // 1.生成工作目录配置文件
            const appJson = fs.readJsonSync(path.join(inputs.sourceCodePath, './application.json'));
            appJson.sourceCodePath = inputs.sourceCodePath;
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
                     {
                         name: item,
                         componentName: func.anyToCamel(`${item}_component`),
                         version: '1.0.0',
                         author: 'gaunyj',
                         prefix: appJson.prefix,
                         componentPkgName: appJson.componentPkgName
                     }
                 )
            });
            fs.ensureDirSync(path.join(appJson.sourceCodePath, 'module'));
            fs.ensureDirSync(path.join(appJson.sourceCodePath, 'service'));

            // 3.初始化运行环境
            components.forEach(item => {
                fs.ensureDirSync(`${appJson.runtimeDir}`);
                let serv = cp.spawn(`vue`, ['create', '--default', '--force', '--registry', 'https://registry.npm.taobao.org', '--no-git', item], {cwd: `${appJson.runtimeDir}`});
                serv.stdout.on('data', data => logger.info(identifier, data));
                serv.stderr.on('data', data => logger.error(identifier, data));
                serv.on('error', err => {
                    throw new Error(err)
                });
                serv.on('close', () => {
                    cp.execSync('npm install node-sass sass-loader --save-dev', {cwd: `${appJson.runtimeDir}/${item}`})
                    logger.info(identifier, '安装node-sass sass-loader')
                });

            });


            function initApplicationConfig(params) {

            }
        }
    }
};

module.exports = handler;

