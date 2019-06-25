let fs = require('fs-extra');
const path = require('path');
const cp = require('child_process');
const ske = require('../skeleton');

let handler = {

    serve: function () {
        let confPath = path.join(__dirname, 'conf.json');
        let conf = fs.readJsonSync(confPath);
        conf.selectedPlugin;

        try {
            let args = ['run', 'serve'];
            let serv = cp.spawn('npm', args, {cwd: `/Users/guanyj/workspace/rt/${conf.selectedPlugin}`});
            serv.stdout.on('data', data => console.log(data.toString()));
            serv.stderr.on('data', data => console.error(data.toString()));
            serv.on('error', err => {
                throw new Error(err)
            });
            // 1.拷贝资源文件

            // 2.生成index.html
            // install();
            genRootFile(conf.selectedPlugin);
            genMain(conf.selectedPlugin);
            // 3.引入全局文件样式

            // 4.运行runtime工程



        } catch (err) {

        }

        function install() {

            cp.execSync(`npm config set registry http://106.14.154.205:4873`);
            cp.execSync(`npm i @waf-component/${conf.selectedPlugin}@latest`, {cwd: `/Users/guanyj/workspace/rt/${conf.selectedPlugin}`})
            cp.execSync(`npm config set registry=`);
        }

        function genRootFile(name) {
            let dirs = fs.readdirSync(`${conf.root}/components/${conf.selectedPlugin}/demo`);
            console.log(dirs);
            ske.resolveApp({name}, `/Users/guanyj/workspace/rt/${name}/src`)
        }

        function genMain(name) {
            ske.resolveMain({name, module: 'GridModule'}, `/Users/guanyj/workspace/rt/${name}/src`);
        }


    }
};

module.exports = handler;
