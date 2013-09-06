/**
 * Powered by Andy <andy@away.name>.
 * Date: 03.09.13
 */

var $async = require('async');

/**
 * Logger
 * @param {Object} adapters Logger Adapter Configs
 * @param {String} name Logger name
 * @param {String} hostname Current host name
 * @param {Logger} sysLogger Logger for logger errors
 * @param {String} [label] Logger label
 * @constructor
 */
var Logger = function(adapters, name, hostname, sysLogger, label){
    this.adapters = adapters;
    this.name = name;
    this.sysLogger = sysLogger;
    this.label = label || null;
    this.hostname = hostname;
};

/**
 * Get labeled logger
 * @param {String} name Label name
 * @returns {Logger}
 */
Logger.prototype.getLabel = function(name){
    return new Logger(this.adapters, this.name, this.hostname, this.sysLogger, name);
};

/**
 * Log with custom level
 * @param {String} level Log level
 * @param {Array} args Log Arguments
 * @private
 */
Logger.prototype._log = function(level, args){

    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack.trim().split("\n").map(function(el) { return el.trim(); }); stack.shift(); stack.shift();
    var code = stack[0].split("(").pop().trim().replace(')','');

    var logIntoLogger = function(adapterObject, callback){
        if (callback == null) callback = function(){};
        var keys = Object.keys(adapterObject),
            completed = 0,
            errors = [];
        for(var i = 0, len = keys.length; i < len; i++){
            var adapter = adapterObject[keys[i]];
            var params = {
                level: level.toUpperCase(),
                hostname: this.hostname,
                name: this.name,
                label: this.label,
                stack: stack,
                code: code,
                info: args,
                message: ''
            };
            params.message = adapter.format.instance(params);
            adapter.instance.log(params, function(err){
                completed++;
                if (err) errors.push(err);
                if (completed === keys.length){
                    callback((errors.length > 0 ? errors : null));
                }
            }.bind(this));
        }
    }.bind(this);
    var adapters = this.adapters[level] || {};
    if (Array.isArray(adapters)){
        if (adapters.length === 0) adapters = this.adapters.all;
    } else {
        if (Object.keys(adapters).length === 0) adapters = this.adapters.all;
    }
    if (Array.isArray(adapters)){
        $async.eachSeries(adapters, function(adapters, next){

            logIntoLogger(adapters, function(err){
                if (err) {
                    if (this.sysLogger != null && this.name !== 'the.logger') this.sysLogger.error(err);
                    next();
                } else {
                    next('stop');
                }
            }.bind(this));

        }.bind(this), function(){});
    } else {
        logIntoLogger(adapters);
    }
};

/**
 * Log INFO Level
 */
Logger.prototype.info = function(){
    var args = Array.prototype.slice.call(arguments);
    this._log('info', args);
};

/**
 * Log DEBUG Level
 */
Logger.prototype.debug = function(){
    var args = Array.prototype.slice.call(arguments);
    this._log('debug', args);
};

/**
 * Log WARN Level
 */
Logger.prototype.warn = function(){
    var args = Array.prototype.slice.call(arguments);
    this._log('warn', args);
};

/**
 * Log ERROR Level
 */
Logger.prototype.error = function(){
    var args = Array.prototype.slice.call(arguments);
    this._log('error', args);
};

/**
 * Log FATAL Level
 */
Logger.prototype.fatal = function(){
    var args = Array.prototype.slice.call(arguments);
    this._log('fatal', args);
};

module.exports = exports = Logger;