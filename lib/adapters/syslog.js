/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $uuid = require('uuid');

var sev = {
        emerg:0
        , alert:1
        , crit:2
        , falal:2       // additional warn tag
        , error:3
        , warning:4
        , warn:4        // additional warn tag
        , notice:5
        , info:6
        , all:6         // additional warn tag
        , debug:7
        , trace:7       // additional debug tag
    },
    fac = {
        kern:0
        , user: 8
        , mail:16
        , daemon:24
        , auth:32
        , syslog:40
        , lpr:48
        , news:56
        , uucp:64
        , local0:128
        , local1:136
        , local2:144
        , local3:152
        , local4:160
        , local5:168
        , local6:176
        , local7:184
    };

/**
 * SysLog Adapter
 * @param {Object} params
 * @param {LoggerFactory} loggerFactory
 * @constructor
 */
var SysLogAdapter = function(params, loggerFactory){
    this._id = $uuid.v4();
    this._loggerFactory = loggerFactory;
    this._bindings = require('bindings')('syslog');
    this._connected =  this._bindings.open(process.argv.join(' '), fac['user'], sev['debug']);
    if (this._connected){
        process.on('exit', function(){
            this._bindings.exit();
        }.bind(this));
    }
};

/**
 * Log data
 * @param {Object} params Log Record Params
 * @param {Function} callback
 */
SysLogAdapter.prototype.log = function(params, callback){
    if (!this._connected){
        callback(new Error('Syslog not connected'));
        return;
    }
    var message = params.message;
    if (typeof message === 'object'){
        message = JSON.stringify(message);
    }
    this._bindings.log(sev[params.level.toLowerCase()], message);
};

module.exports = exports = SysLogAdapter;