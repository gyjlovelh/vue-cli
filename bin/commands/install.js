
const logger = require('../util/logger');
const cp = require('child_process');
const conf = require('../util/conf');
const fs = require('fs-extra');

const identifier = '[install]';

let handler = {
    install(name) {
        if (/@waf-(component|module|service)\/\w+/g.exec(name)) {
            try {
                let appConf = conf.getAppConf();
                let version = cp.execSync(`npm view ${name} version`);
                version = version.toString();
                let target = '';
                if (name.includes('component')) {
                    target = 'component';
                } else if (name.includes('module')) {
                    target = 'module';
                } else if (name.includes('service')) {
                    target = 'service';
                }

                // 运行环境安装依赖
                cp.execSync(`npm install ${name} --save`, {cwd: `${appConf.runtimeDir}/${appConf.selectedPlugin}`})
                // 更新源代码依赖
                let pkgDir = `${appConf.sourceCodePath}/${target}/${appConf.selectedPlugin}/package.json`;
                let pkg = fs.readJSONSync(pkgDir);
                pkg.dependencies[name] = `^${version}`.replace(/\n/g, '');
                fs.outputJSONSync(pkgDir, pkg, {spaces: 4});
                logger.info(identifier, `安装依赖${name}@${version}成功`)

            } catch (err) {

            }
        } else {
            logger.error(identifier, '插件格式有误' + name);
        }
    }
};

module.exports = handler;
