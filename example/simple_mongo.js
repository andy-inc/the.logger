/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var util = require('util');
var LoggerFactoryError = require('../lib/errors/LoggerFactoryError');

global.dump = function() {
    var args = Array.prototype.slice.call(arguments);
    console.log(util.inspect(args, false, 1, true));
};

var LoggerFactory = require('../index').configure(__dirname + '/' + 'config.yaml', {wrapConsole: false}).env().init();

var logger = LoggerFactory.getLogger('test.mongo');

//function test(err) {
//    logger.info('test-logger', new Error('Test Error Message1'), err, { k: [0, '123', { d:9, l: [1,2,3] }], a:4, b: { c:9, f: { d:6, g: [1,2,3,4,5,6], p: { q:3, u: { z: [2,5,9] } } } } });
//}
//
//function test2() {
//    test(new LoggerFactoryError('Test Error Message2', this));
//}
//
//test2();


setInterval(function() {
    logger.info('234');
}, 1000);
