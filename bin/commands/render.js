let fs = require('fs-extra');
let skeleton = require('../skeleton');
const logger = require('../util/logger');

const identifier = '[render]';

let handler = {

    render() {
        logger.warn(identifier, '该功能尚未开放');
        // let cwd = process.cwd();
        // console.log(cwd);
        // if (fs.existsSync(`${cwd}/conf.json`)) {
        //     let conf = fs.readJsonSync(`${cwd}/conf.json`);
        //     skeleton.resolve(conf, `${cwd}`);
        // } else {
        //     console.error('没有文件');
        // }
    }
}

module.exports = handler;
