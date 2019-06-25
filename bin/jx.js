#!/usr/bin/env node

const commander = require('commander');

let actions = require('./commands');

commander.version('v1.0.0', '-v --version').allowUnknownOption(false);

commander.command('init')
    .description('chushihua')
    .action(actions.doInit);

commander.command('add')
    .option('--component [component]', '组件')
    .option('--module [module]', '模块')
    .option('--service [service]', '服务')
    .description('add')
    .action(actions.doAdd);

commander.command('remove <name>')
    .description('remove')
    .action(actions.doRemove);

commander.command('install <name>').description('安装依赖').action(actions.doInstall);

commander.command('ls')
    .description('ls')
    .action(actions.doLs);

commander.command('use <name>')
    .description('use')
    .action(actions.doUse);

commander.command('publish')
    .description('use')
    .action(actions.doPublish);

commander.command('serve')
    .description('serve')
    .action(actions.doServe);

commander.command('render')
    .description('')
    .action(actions.doRender);

commander.parse( process.argv );
