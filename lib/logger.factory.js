/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $config = require('a.config');

var utils = require('./utils'),
    LoggerFactoryError = require('./errors/LoggerFactoryError');

var LoggerFactory = function(){
    this._config = $config;
    this._fileName = null;
    this._classes = {};
    this._adapters = [];
};

LoggerFactory.prototype.configure = function(fileName) {
    this._fileName = fileName;
    this._config.load(this._fileName);
    return this;
};

LoggerFactory.prototype.env = function(env){
    if (env == null) env = process.env.NODE_ENV || 'production';
    this._config = this._config[env] || this._config['default'] || this._config;
    return this;
};

LoggerFactory.prototype.getAdapter = function(name, params){
    if (typeof params != 'object') params = {};
    var adapter = null;
    for(var i = 0, len = this._adapters.length; i < len; i++){
        adapter = this._adapters[i];
        if (adapter.name = name && utils.object.isSame(adapter.params, params)){
            return adapter;
        }
    }
    adapter = {
        name: name,
        params: params,
        instance: null
    };
    var Adapter = null;
    try{
        Adapter = require('./adapters/' + name);
    } catch (e){
        try{
            Adapter = require('the.logger.adapters.' + name);
        } catch (e){
            throw new LoggerFactoryError('Adapter "' + name + '" not found');
        }
    }
    adapter.instance = new Adapter(adapter.params);
    this._adapters.push(adapter);
    return adapter;
};

LoggerFactory.prototype.init = function(){
    for(var key in this._config) if (this._config.hasOwnProperty(key) && typeof this._config[key] != 'function'){
        this._classes[key] = this._config[key];
    }
    var extendClasses = function(){
        for(var key in this._classes) if (this._classes.hasOwnProperty(key) && key !== 'all'){
            var value = this._classes[key],
                names = key.split('.');
            for(var i = 0, len = names.length; i < len; i++){
                var prevClass = utils.array.copy(names, 0, names.length - i - 2);
                if (prevClass.length == 0) prevClass.push('all');
                var prevObj = this._classes[prevClass.join('.')] || {};
                var needExtend = utils.object.needExtend(value, prevObj);
                if (needExtend){
                    value = utils.object.extend(value, prevObj);
                    extendClasses();
                    return;
                }
            }
        }
    }.bind(this);
    extendClasses();

    for(var key in this._classes) if (this._classes.hasOwnProperty(key)){
        var cl = this._classes[key];
        if (Array.isArray(cl)){
            for(var i = 0, len  = cl.length; i < len; i++){
                var subCl = cl[i];
                if (typeof subCl !== 'object') throw new LoggerFactoryError('Wrong class "' + key + '" configuration');
                for(var name in subCl) if (cl.hasOwnProperty(name)){
                    var adapter = this.getAdapter(name, subCl[name]);
                    subCl[name] = adapter;
                }
            }
        } else if (typeof cl === 'object'){
            for(var name in cl) if (cl.hasOwnProperty(name)){
                var adapter = this.getAdapter(name, cl[name]);
                cl[name] = adapter;
            }
        } else {
            throw new LoggerFactoryError('Wrong class "' + key + '" configuration');
        }
    }

    return this;
};

module.exports = exports = LoggerFactory;