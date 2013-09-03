/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $uuid = require('uuid');

/**
 * Logger Console Adapter
 * @param params
 * @constructor
 */
var ConsoleAdapter = function(params){
    this.id = $uuid.v4();
    this.params = params;
};

/**
 * Log data
 * @param {Object} params Log Record Params
 * @param {Function} callback
 */
ConsoleAdapter.prototype.log = function(params, callback){
    console.log(params.message);
    callback();
};

module.exports = exports = ConsoleAdapter;