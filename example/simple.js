/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var LoggerFactory = require('../index');

LoggerFactory.configure(__dirname + '/' + 'config.yaml', {wrapConsole: true, rootDir: __dirname, modules: {adapters: '../lib/adapters', formatProcessors: '../lib/format.processors'}}).env().init();

var logger = LoggerFactory.getLogger('ssss');

console.info('info');
console.log('log');
console.error('error');
console.warn('warn');
console.trace('trace');