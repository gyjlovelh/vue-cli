const fs = require('fs-extra');
const path = require('path');
const func = require('./func');

let handler = {

    getAppConf() {
        return fs.readJSONSync(path.join(__dirname, '../config/application.json'));
    },

    getComponentDefaultConf(name) {
        let appConf = this.getAppConf();
        return {
            name: name,
            componentName: func.anyToCamel(`${name}_component`),
            version: '1.0.0',
            author: 'guanyj',
            prefix: appConf.prefix,
            componentPkgName: appConf.componentPkgName
        }
    },

    saveAppConf(conf) {
        fs.outputJSONSync(path.join(__dirname, '../config/application.json'), conf, {spaces: 4});
    },

    getPluginType(name) {
        let appConf = this.getAppConf();

        if (appConf.component.includes(name)) {
            return 'component';
        } else if (appConf.module.includes(name)) {
            return 'module';
        } else if (appConf.service.includes(name)) {
            return 'service';
        } else {
            throw new Error('不存在此插件：' + name);
        }
    }
}

module.exports = handler;
