/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var LoggerFactory = require('../index');

LoggerFactory.configure(__dirname + '/' + 'config.yaml').env().init();

console.log(JSON.stringify(LoggerFactory._classes, null, '\t'));