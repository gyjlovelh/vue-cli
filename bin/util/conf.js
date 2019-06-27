const fs = require('fs-extra');
const path = require('path');
const func = require('./func');

let handler = {
    /**
     * 查询app配置
     * @returns {any}
     */
    getAppConf() {
        return fs.readJSONSync(path.join(__dirname, '../config/application.json'));
    },

    /**
     * 查询当前插件名称
     * @returns {*}
     */
    getCurrentPlugin() {
        let appConf = this.getAppConf();

        return appConf.selectedPlugin;
    },

    /**
     * 查询当前插件类型
     * @returns {*|string}
     */
    getCurrentPluginType() {
        return this.getPluginType(this.getCurrentPlugin());
    },

    /**
     * 查询当前插件包名
     * @returns {string}
     */
    getCurrentPluginPkgName() {
        let plugin = this.getCurrentPlugin();

        return `${this.getPluginPkgPrefix(plugin)}/${plugin}`;
    },

    /**
     * 查询当前插件的内部依赖
     * @returns {Array}
     */
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

    /**
     * 生成组件缺省信息
     * @param name
     * @returns {{name: *, componentName: *, version: string, author: string, prefix: *|string, componentPkgName: *|string}}
     */
    getComponentDefaultConf(name) {
        let appConf = this.getAppConf();
        return {
            name: name,
            componentName: func.anyToCamel(`${name}_component`),
            version: '1.0.0',
            author: '',
            prefix: appConf.prefix,
            componentPkgName: appConf.componentPkgName
        }
    },

    getServiceDefaultConf(name) {
        let appConf = this.getAppConf();
        return {
            name: name,
            serviceName: func.anyToCamel(`${name}_service`),
            version: '1.0.0',
            author: '',
            prefix: appConf.prefix,
            callName: `$${appConf.prefix}${func.anyToCamel(name)}`,
            servicePkgName: appConf.servicePkgName
        }
    },

    /**
     * 更新app信息
     * @param conf
     */
    saveAppConf(conf) {
        fs.outputJSONSync(path.join(__dirname, '../config/application.json'), conf, {spaces: 4});
    },

    /**
     * 查询插件类型
     * @param name
     * @returns {string}
     */
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

    /**
     * 查询插件包名前缀
     * @param name
     * @returns {*}
     */
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
