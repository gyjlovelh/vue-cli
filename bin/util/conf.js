const fs = require('fs-extra');
const path = require('path');
const func = require('./func');

let handler = {

    getAppConf() {
        return fs.readJSONSync(path.join(__dirname, '../config/application.json'));
    },

    getCurrentPlugin() {
        let appConf = this.getAppConf();

        return appConf.selectedPlugin;
    },

    getCurrentPluginType() {
        return this.getPluginType(this.getCurrentPlugin());
    },

    getCurrentPluginPkgName() {
        let plugin = this.getCurrentPlugin();

        return `${this.getPluginPkgPrefix(plugin)}/${plugin}`;
    },

    getCurrentPluginDependency() {
        let appConf = this.getAppConf();

        let pkgPath = `${appConf.sourceCodePath}/${this.getPluginType(this.getCurrentPlugin())}/${this.getCurrentPlugin()}/package.json`;
        let pkg = fs.readJSONSync(pkgPath);
        let dependencies = [];

        dependencies.push({
            name: func.anyToCamel(`${this.getCurrentPlugin()}_${this.getCurrentPluginType()}`),
            pkg: this.getCurrentPluginPkgName()
        });

        Object.keys(pkg.dependencies).forEach(item => {
            // 添加自己

            // 添加 element-ui 默认没有
            if (item === 'element-ui') {
                dependencies.push({
                    name: 'ElementUI',
                    pkg: item
                })
            }
            // 添加 dependencies 中的依赖
            if ([appConf.componentPkgName, appConf.modulePkgName, appConf.servicePkgName].find(el => item.includes(el))) {
                let name = item.split('/')[1];
                let pluginType = this.getPluginType(name);
                dependencies.push({
                    name: func.anyToCamel(`${name}-${pluginType}`),
                    pkg: item
                })
            }
        });

        return dependencies;
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
    },

    getPluginPkgPrefix(name) {
        let appConf = this.getAppConf();
        let pluginType = this.getPluginType(name);
        if (pluginType === 'component') {
            return appConf.componentPkgName;
        } else if (pluginType === 'module') {
            return appConf.modulePkgName;
        } else if (pluginType === 'service') {
            return appConf.servicePkgName;
        } else {
            throw new Error('不存在此插件：' + name);
        }
    }
}

module.exports = handler;
