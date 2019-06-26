
const logger = require('../util/logger');
const cp = require('child_process');
const conf = require('../util/conf');
const fs = require('fs-extra');

const identifier = '[install]';

let handler = {
    install(name) {
        try {
            let appConf = conf.getAppConf();
            let version = cp.execSync(`npm view ${name} version`);
            version = version.toString();

            // 运行环境安装依赖
            cp.execSync(`npm install ${name} --save`, {cwd: `${appConf.runtimeDir}/${appConf.selectedPlugin}`})
            // 更新源代码依赖
            let pkgDir = `${appConf.sourceCodePath}/${conf.getPluginType(appConf.selectedPlugin)}/${appConf.selectedPlugin}/package.json`;
            let pkg = fs.readJSONSync(pkgDir);
            pkg.dependencies[name] = `^${version}`.replace(/\n/g, '');
            fs.outputJSONSync(pkgDir, pkg, {spaces: 4});
            logger.info(identifier, `安装依赖${name}@${version}成功`)

        } catch (err) {

        }
    }
};

module.exports = handler;
