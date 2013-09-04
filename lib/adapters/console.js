/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $uuid = require('uuid');

/**
 * Logger Console Adapter
 * @param {Object} params
 * @param {LoggerFactory} loggerFactory
 * @constructor
 */
var ConsoleAdapter = function(params, loggerFactory){
    this.id = $uuid.v4();
    this.params = params;
    this.loggerFactory = loggerFactory;
};

/**
 * Log data
 * @param {Object} params Log Record Params
 * @param {Function} callback
 */
ConsoleAdapter.prototype.log = function(params, callback){
    var fn = console.log.bind(console);
    if (this.loggerFactory._originalConsole != null) fn = this.loggerFactory._originalConsole.log;
    fn(params.message);
    callback();
};

module.exports = exports = ConsoleAdapter;