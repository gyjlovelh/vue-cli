let fs = require('fs-extra');
let path = require('path');
let cp = require('child_process');

let handler = {

    publish: function () {
        let conf = fs.readJsonSync(path.join(__dirname, 'conf.json'));
        let name = conf.selectedPlugin;
        try {
            let version = cp.execSync(`npm view @waf-component/${name} version`);
            version = version.toString();
            cp.execSync(`npm version patch`, {cwd: path.join(conf.root, `./component/${conf.selectedPlugin}`)});
        } catch (err) {
            console.log('首次发布')
        }

        cp.execSync(`npm publish`, {cwd: path.join(conf.root, `./component/${conf.selectedPlugin}`)})
    }
};

module.exports = handler;
