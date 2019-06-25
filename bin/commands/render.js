let fs = require('fs-extra');
let skeleton = require('../skeleton');

let handler = {

    render() {
        let cwd = process.cwd();
        console.log(cwd);
        if (fs.existsSync(`${cwd}/conf.json`)) {
            let conf = fs.readJsonSync(`${cwd}/conf.json`);
            skeleton.resolve(conf, `${cwd}`);
        } else {
            console.error('没有文件');
        }
    }
}

module.exports = handler;