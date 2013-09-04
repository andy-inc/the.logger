/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

var $config = require('a.config'),
    $os = require('os'),
    $path = require('path');

var utils = require('./utils'),
    LoggerFactoryError = require('./errors/LoggerFactoryError'),
    Logger = require('./logger');

var LEVELS = ['fatal', 'debug','info','warn','error', 'all'];

/**
 * Logger Factory
 * @constructor
 */
var LoggerFactory = function(){
    this._config = {};
    this._fileName = null;
    this._adapters = [];
    this._hostname = $os.hostname;
    this._formatProcessors = [];
    this._originalConsole = null;
};

/**
 * Configure logger factory
 * @param {String} fileName Config file name
 * @param {Object} [options] Options
 * @returns {LoggerFactory}
 */
LoggerFactory.prototype.configure = function(fileName, options) {
    this._classes = {};
    this._config = $config.newInstance();
    this._fileName = fileName;
    this._config.load(this._fileName);
    this._options = options || {};
    this._options.rootDir = this._options.rootDir || __dirname;
    this._options.modules = this._options.modules || {};
    this._exOptions = this._config['$config']|| {};
    this._exOptions['default.format.processor'] = this._exOptions['default.format.processor'] || 'default';
    this._exOptions['default.format.value'] = this._exOptions['default.format.value'] || '%date %message';
    this._exAdapters = {};
    this._exFormatProcessors = {};
    if (this._options.modules.adapters){
        var paths = this._options.modules.adapters;
        if (!Array.isArray(paths)) paths = [paths];
        for(var i = 0, len = paths.length; i < len; i++){
            utils.modules.load($path.join(this._options.rootDir, paths[i]), this._exAdapters);
        }
    }
    if (this._options.modules.formatProcessors){
        var paths = this._options.modules.formatProcessors;
        if (!Array.isArray(paths)) paths = [paths];
        for(var i = 0, len = paths.length; i < len; i++){
            utils.modules.load($path.join(this._options.rootDir, paths[i]), this._exFormatProcessors);
        }
    }
    return this;
};

/**
 * Enable config environment
 * @param {String} [env] Current environment
 * @returns {LoggerFactory}
 */
LoggerFactory.prototype.env = function(env){
    if (env == null) env = process.env.NODE_ENV || 'production';
    this._config = this._config[env] || this._config['default'] || this._config;
    return this;
};

/**
 * Register external adapter
 * @param {String} name Adapter name
 * @param {LoggerAdapter} adapter Adapter
 */
LoggerFactory.prototype.registerAdapter = function(name, adapter){
    this._exAdapters[name] = adapter;
};

/**
 * Register external Format Processor
 * @param {String} name Format Processor name
 * @param {FormatProcessor} formatProcessor Format Processor
 */
LoggerFactory.prototype.registerFormatProcessor = function(name, formatProcessor){
    this._exFormatProcessors[name] = formatProcessor;
};

/**
 * Return format processor
 * @param {String} name Processor name
 * @param {String} value Format
 * @returns {Function}
 */
LoggerFactory.prototype.getFormatProcessor = function(name, value){
    for(var i = 0, len = this._formatProcessors.length; i < len; i++){
        var processor = this._formatProcessors[i];
        if (processor.name === name && processor.value === value){
            return processor.instance;
        }
    }
    var processor = {
        name: name,
        value: value,
        instance: null
    };
    var Processor = this._exFormatProcessors[name] || null;
    if (Processor == null){
        try{
            Processor = require('./format.processors/' + name);
        } catch (e){
            try{
                Processor = require('the.logger.format.processors.' + name);
            } catch (e){
                throw new LoggerFactoryError('Format Processor "' + name + '" not found');
            }
        }
    }
    processor.instance = Processor(value);
    this._adapters.push(processor);
    return processor;
};

/**
 * Get logger adapter
 * @param {String} name Adapter name
 * @param {String|Object} format Format
 * @param {Object} [params] Adapter params
 * @returns {LoggerAdapter}
 */
LoggerFactory.prototype.getAdapter = function(name, format, params){
    var processor = null;
    if (typeof format === 'object'){
        processor = this.getFormatProcessor(format.name, format.value);
    } else {
        processor = this.getFormatProcessor(this._exOptions['default.format.processor'], format);
    }
    if (typeof params != 'object') params = {};
    params.rootDir = this._options.rootDir;
    var adapter = null;
    for(var i = 0, len = this._adapters.length; i < len; i++){
        adapter = this._adapters[i];
        if (adapter.name === name && utils.object.isSame(adapter.params, params)){
            if (utils.object.isSame(adapter.format, processor)){
                return adapter;
            } else {
                var newAdapter = {
                    name: adapter.name,
                    params: adapter.params,
                    format: processor,
                    instance: adapter.instance
                };
                this._adapters.push(newAdapter);
                return newAdapter;
            }
        }
    }
    adapter = {
        name: name,
        params: params,
        format: processor,
        instance: null
    };
    var Adapter = this._exAdapters[name] || null;
    if (Adapter == null){
        try{
            Adapter = require('./adapters/' + name);
        } catch (e){
            try{
                Adapter = require('the.logger.adapters.' + name);
            } catch (e){
                throw new LoggerFactoryError('Adapter "' + name + '" not found');
            }
        }
    }
    adapter.instance = new Adapter(adapter.params, this);
    this._adapters.push(adapter);
    return adapter;
};

/**
 * Init Logger Factory
 * @returns {LoggerFactory}
 */
LoggerFactory.prototype.init = function(){
    for(var key in this._config) if (this._config.hasOwnProperty(key) && typeof this._config[key] != 'function'){
        this._classes[key] = this._config[key];
    }
    var prepareClasses = function(){
        for(var key in this._classes) if (this._classes.hasOwnProperty(key)){
            var value = this._classes[key];

            if (Array.isArray(value)){
                this._classes[key] = {all: value};
                continue;
            }

            var levelExists = true;
            for(var key in value) if (value.hasOwnProperty(key)){
                var els = key.split(',');
                for(var i = 0, len = els.length; i < len; i++){
                    if (LEVELS.indexOf(els[i]) === -1) {
                        levelExists = false;
                        break;
                    }
                }
            }
            if (!levelExists){
                if (Array.isArray(cl)){
                    var all = [].concat(value);
                    this._classes[key] = {all: all};
                    value = this._classes[key];
                }  else if (typeof value === 'object'){
                    var all = {};
                    for(var name in value) if (value.hasOwnProperty(name)){
                        all[name] = value[name];
                        delete value[name];
                    }
                    value.all = all;
                } else {
                    throw new LoggerFactoryError('Wrong class "' + key + '" configuration');
                }
            } else {
                for(var key in value) if (value.hasOwnProperty(key)){
                    var keys = key.split(',');
                    if (keys.length < 2) continue;
                    for(var i = 0, len = keys.length; i < len; i++){
                        value[keys[i]] = value[key];
                    }
                    delete value[key];
                }
            }
        }
    }.bind(this);
    var extendClasses = function(){
        for(var key in this._classes) if (this._classes.hasOwnProperty(key) && key !== 'all'){
            var value = this._classes[key],
                names = key.split('.');

            for(var i = 0, len = names.length; i < len; i++){
                var prevClass = utils.array.copy(names, 0, names.length - i - 2);
                if (prevClass.length == 0) prevClass.push('all');
                var prevObj = this._classes[prevClass.join('.')] || {};
                for(var j = 0, len1 = LEVELS.length; j < len1; j++){
                    var level = LEVELS[j];
                    if (value[level] == null) value[level] = {};
                    var needExtend = utils.object.needExtend(value[level], prevObj[level]);
                    if (needExtend){
                        value[level] = utils.object.extend(value[level], prevObj[level]);
                        extendClasses();
                        return;
                    }
                }
            }
        }
    }.bind(this);
    prepareClasses();
    extendClasses();

    var updateAdapters = function(obj, className){

        var adaptersSettings = function(obj){
            for(var name in obj) if (obj.hasOwnProperty(name)){
                if (obj[name].instance != null) continue;
                var format = this._exOptions['default.format.value'];
                if (typeof obj[name] === 'object'){
                    format = obj[name].format || format;
                    delete obj[name].format;
                }
                var adapter = this.getAdapter(name, format, obj[name]);
                obj[name] = adapter;
            }
            return obj;
        }.bind(this);

        if (Array.isArray(obj)){
            for(var i = 0, len  = obj.length; i < len; i++){
                var subCl = obj[i];
                if (typeof subCl !== 'object') throw new LoggerFactoryError('Wrong class "' + className + '" configuration');
                obj[i] = adaptersSettings(subCl);
            }
        } else if (typeof obj === 'object'){
            obj = adaptersSettings(obj);
        } else {
            throw new LoggerFactoryError('Wrong class "' + className + '" configuration');
        }

        return obj;

    }.bind(this);

    for(var key in this._classes) if (this._classes.hasOwnProperty(key)){
        var cl = this._classes[key];
        for(var name in cl) if (cl.hasOwnProperty(name)){
            if (LEVELS.indexOf(name) == -1 || (typeof cl[name] != 'object' && Array.isArray(cl[name]))) throw new LoggerFactoryError('Level "' + name + '" not supported in "' + key + '" class');
        }
        LEVELS.forEach(function(level){

            if (cl[level] == null) return;

            cl[level] = updateAdapters(cl[level], key);

        }.bind(this));
    }

    if (this._options.wrapConsole === true) {
        this._originalConsole = {};
        var consoleLogger = this.getLogger('console');
        ['log','info','warn','error','trace'].forEach(function (item) {
            var fn = consoleLogger[item] || consoleLogger['info'];
            if (item === 'trace'){
                fn = consoleLogger['error'];
            }
            this._originalConsole[item] = console[item];
            console[item] = fn.bind(consoleLogger);
        }.bind(this));
    }

    if (this._options.wrapUncaught === true) {
        var sysLogger = this.getLogger('sys');
        process.on('uncaughtException', function(err) {
            sysLogger.error(err);
        });

    }

    return this;
};

/**
 * Get logger
 * @param {String} [name]
 * @returns {Logger}
 */
LoggerFactory.prototype.getLogger = function(name){
    name = name || 'core';
    var adapters = null;

    var names = name.split('.');
    for(var i = 0, len = names.length; i <= len; i++){
        var prevClass = utils.array.copy(names, 0, names.length - i - 1);
        if (prevClass.length == 0) prevClass.push('all');
        adapters = this._classes[prevClass.join('.')];
        if (adapters != null) {
            break;
        }
    }
    if (adapters == null){
        throw new LoggerFactoryError('Not found adapter configurations for "' + name + '" logger');
    }
    return new Logger(adapters, name, this._hostname);
};

module.exports = exports = LoggerFactory;