let art = require('art-template');
let path = require('path');
let fs = require('fs-extra');
let logger = require('../util/logger');

const identifier = '[render]';

let handler = {

    resolve(conf, dest) {
        if (conf.table) {
            let html = art(path.join(__dirname, './page/table/table.html.art'), conf.table);
            fs.outputFileSync(`${dest}/table.vue`, html);
        }
    },

    /**
     * 遍历模板目录生成模板文件
     *
     * @param dir 模板路径
     * @param dest 目标路径
     * @param module 模板参数
     * @param options 配置
     */
    resolveFramework(dir, dest, module, options = {}) {
        const files = fs.readdirSync(dir);

        files.forEach(filename => {
            let fileRealpath = path.join(dir, filename);
            let stat = fs.statSync(fileRealpath);

            if (stat.isFile()) {
                let template = art.render(fs.readFileSync(fileRealpath).toString(), {
                    module
                });

                let targetName = filename.replace(/frame/g, module.name).replace(/\.art$/g, '');
                let targetPath = `${dest}/${targetName}`;
                if (!fs.existsSync(targetPath) || options.overwrite) {
                    fs.outputFileSync(targetPath, template);
                    let str = options.overwrite ? '覆盖文件' : '创建文件';
                    logger.info(identifier, str + targetPath);
                }
            } else {
                fs.ensureDirSync(dest);
                this.resolveFramework(fileRealpath, `${dest}/${filename}`, module);
            }
        })
    },

    resolveApp(conf, dest) {
        let app = art(path.join(__dirname, './vm/App.vue.art'), conf);
        fs.outputFileSync(`${dest}/App.vue`, app);
    },

    resolveMain(conf, dest) {
        let main = art(path.join(__dirname, './vm/main.js.art'), conf);
        fs.outputFileSync(`${dest}/main.js`, main);
        logger.info(identifier, '复制文件')
    }
}

module.exports = handler;
