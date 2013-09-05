/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var util = require('util');

global.dump = function() {
    var args = Array.prototype.slice.call(arguments);
    console.log(util.inspect(args, false, 2, true));
};

var LoggerFactory = require('../index');

LoggerFactory.configure(__dirname + '/' + 'config.yaml', {wrapConsole: true, wrapUncaught: true, rootDir: __dirname, modules: {adapters: '../lib/adapters', formatProcessors: '../lib/format.processors'}}).env().init();

var logger = LoggerFactory.getLogger('ssss');

throw new Error('Uncaught');

console.info('info', new Error('some error'), new Error('some error2'), {data: {attr1: true}});