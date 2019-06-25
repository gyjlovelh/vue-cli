let {init} = require('./init');
let {render} = require('./render');
let {add, remove} = require('./add');
let {use} = require('./use');
let {serve} = require('./serve');
let {publish} = require('./publish');
let {ls} = require('./ls');

module.exports = {
    doInit: init,
    doRender: render,
    doAdd: add,
    doUse: use,
    doServe: serve,
    doPublish: publish,
    doLs: ls,
    doRemove: remove
};
