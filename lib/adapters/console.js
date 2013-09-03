/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $uuid = require('uuid');

var ConsoleAdapter = function(params){
    this.id = $uuid.v4();
    this.params = params;
};

module.exports = exports = ConsoleAdapter;