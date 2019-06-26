const fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');
const conf = require('../util/conf');
const logger = require('../util/logger');

const identifier = '[publish]';

let handler = {

    publish: function () {
        let appConf = conf.getAppConf();
        let current = conf.getCurrentPluginPkgName();
        let sourceDir = `${appConf.sourceCodePath}/${conf.getCurrentPluginType()}/${conf.getCurrentPlugin()}`;
        let pkg = fs.readJSONSync(`${sourceDir}/package.json`);

        try {
            let version = cp.execSync(`npm view ${current} version`);


            version = version.toString();
            let versions = version.split('.');
            versions[2] = Number(versions[2]) + 1;
            pkg.version = versions.join('.');

            fs.outputJSONSync(`${sourceDir}/package.json`, pkg, {spaces: 4});

            version = cp.execSync(`npm view ${current} version`);
            cp.execSync(`npm publish --access=public`, {cwd: sourceDir});
            logger.info(identifier, `发布${current}@${pkg.version} 成功`);

        } catch (err) {
            cp.execSync(`npm publish --access=public`, {cwd: sourceDir});
            logger.warn(identifier, `首次发布${current}@1.0.0`);
        }
    }
};

module.exports = handler;
