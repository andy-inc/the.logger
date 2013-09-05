/**
 * Какой сам ⚝
 * Author: Pavlenov Semen
 * Date: 04.09.13
 * Time: 12:05
 *
 * E = mc^2
 */

var $mongodb = require('mongodb');

var  TTL_FIELD = 'date';
var  TTL_INDEX = TTL_FIELD + '_1';

/**
 * Logger Mongo Adapter
 * @param {Object} params
 * @param {LoggerFactory} loggerFactory
 * @constructor
 */
var MongoAdapter = function(params, loggerFactory){
    this.params = params;
    this.loggerFactory = loggerFactory;
    this.db = null;
    this.collection = null;
    this.error = null;
};

MongoAdapter.prototype._connect = function(callback){

    var self = this;
    callback = callback || function() {};
    $mongodb.connect(this.params.uri, {}, function(err, db) {

        if (err) { self.error = err; callback(err); return; }

        self.db = db;
        var collection = db.collection(self.params.collection || 'the.logger');
        self.collection = collection;

        callback(null, db);

        var ttl = parseInt(self.params['ttl'] || 0);
        var hasIndex = false;
        var currTTL = null;

        // Запрашиваем существующие индексы
        collection.indexes(function(err, result) {

            if (err) return;

            if (result && result.length) {
                result.forEach(function(el) {
                    if (el.name === TTL_INDEX && el.expireAfterSeconds) {
                        hasIndex = true;
                        currTTL = el.expireAfterSeconds;
                    }
                });
            }

            // Если задано время жизни записи
            if (ttl) {
                // Индекс не существует, или время жизни поменялось
                if (!hasIndex || (hasIndex && currTTL != ttl)) {
                    collection.dropIndex(TTL_INDEX, function(err, result) {
                        // Создаём новый индекс TTL
                        collection.ensureIndex({ "date": 1 }, { expireAfterSeconds: ttl }, function(err, result) {});
                    });
                }
            }
            // Если не задано время жизни записи или равно 0
            else {
                // Индекс существует
                if (hasIndex) {
                    // Удаляем его
                    collection.dropIndex(TTL_INDEX, function(err, result) {});
                }
            }

        });

    });

};

/**
 * Log data
 * @param {Object} params Log Record Params
 * @param {Function} callback
 */
MongoAdapter.prototype.log = function(params, callback){

    var self = this;

    if (this.error) { callback(this.error); return; }
    if (!this.db) {
        this._connect(function(err, db) {
            if (err) { callback(err); return; }
            insert()
        });
    }
    else {
        insert();
    }

    function insert() {
        var data = {};
        if (typeof params.message !== 'object') {
            data['message'] = params.message + '';
        }
        else {
            data = params.message;
        }
        if (self.params.ttl) { data[TTL_FIELD] = new Date(); }
        self.collection.insert(data, callback);
    }

};

module.exports = exports = MongoAdapter;