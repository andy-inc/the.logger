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
    this._id = $uuid.v4();
    this.loggerFactory = loggerFactory;
    this._levels = {
        'FATAL': 'error',
        'DEBUG': 'log',
        'INFO': 'info',
        'WARN': 'warn',
        'ERROR': 'error',
        'ALL': 'info'
    }
};

/**
 * Log data
 * @param {Object} params Log Record Params
 * @param {Function} callback
 */
ConsoleAdapter.prototype.log = function(params, callback){
    var fnName = this._levels[params.level];
    var fn = console[fnName].bind(console);
    if (this.loggerFactory._originalConsole != null) fn = this.loggerFactory._originalConsole[fnName];
    var message = params.message;
    if (typeof message === 'object'){
        message = JSON.stringify(message);
    }
    fn(message);
    callback();
};

module.exports = exports = ConsoleAdapter;