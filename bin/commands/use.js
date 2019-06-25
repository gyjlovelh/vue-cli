let fs = require('fs-extra');
let path = require('path');

let handler = {

    use: function (name) {
        console.log('name', name);
        let conf = fs.readJsonSync(path.join(__dirname, 'conf.json'));
        conf.selectedPlugin = name;

        fs.outputJSONSync(path.join(__dirname, 'conf.json'), conf, {spaces: 4});
    }
};

module.exports = handler;
