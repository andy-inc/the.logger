/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var util = require('util');

var LoggerFactoryError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);

    this.message = msg || 'Error';
};

util.inherits(LoggerFactoryError, Error);

LoggerFactoryError.prototype.name = 'Logger Factory Error';

module.exports = exports = LoggerFactoryError;