/**
 * Created by Andy<andy@away.name> on 04.09.13.
 */
var $vows = require('vows'),
    $assert = require('assert');

var LoggerFactory = new (require('../lib/logger.factory'));

$vows.describe('the.logger/factory/configure').addBatch({
    "Only all": function(){
        LoggerFactory.configure(__dirname + '/configs/simple.yaml', {rootDir: __dirname}).init();
        $assert.isObject(LoggerFactory._classes);
        $assert.isObject(LoggerFactory._classes.all);
        $assert.isObject(LoggerFactory._classes.all.all);
        $assert.isObject(LoggerFactory._classes.all.all.console);
    },
    "Only all with levels": function(){
        LoggerFactory.configure(__dirname + '/configs/simple.levels.yaml', {rootDir: __dirname}).init();
        $assert.isObject(LoggerFactory._classes);
        $assert.isObject(LoggerFactory._classes.all);
        $assert.isObject(LoggerFactory._classes.all.info);
        $assert.isObject(LoggerFactory._classes.all.info.console);
        $assert.isObject(LoggerFactory._classes.all.error);
        $assert.isObject(LoggerFactory._classes.all.error.console);
        $assert.isObject(LoggerFactory._classes.all.debug);
        $assert.isObject(LoggerFactory._classes.all.debug.console);
        $assert.isObject(LoggerFactory._classes.all.fatal);
        $assert.isObject(LoggerFactory._classes.all.fatal.console);
        $assert.isObject(LoggerFactory._classes.all.warn);
        $assert.isObject(LoggerFactory._classes.all.warn.console);
        $assert.equal(LoggerFactory._classes.all.info.console._id, LoggerFactory._classes.all.error.console._id);
        $assert.equal(LoggerFactory._classes.all.info.console._id, LoggerFactory._classes.all.debug.console._id);
        $assert.equal(LoggerFactory._classes.all.info.console._id, LoggerFactory._classes.all.fatal.console._id);
        $assert.equal(LoggerFactory._classes.all.info.console._id, LoggerFactory._classes.all.warn.console._id);
    },
    "Only all with levels and packages and parent assign": function(){
        LoggerFactory.configure(__dirname + '/configs/simple.levels.multi.yaml', {rootDir: __dirname}).init();
        $assert.isObject(LoggerFactory._classes);
        $assert.isObject(LoggerFactory._classes.all);
        $assert.isArray(LoggerFactory._classes.all.error);
        $assert.isObject(LoggerFactory._classes.all.error[0]);
        $assert.isObject(LoggerFactory._classes.all.error[0].console);
        $assert.isObject(LoggerFactory._classes.all.error[0].file);
        $assert.isObject(LoggerFactory._classes.all.error[1]);
        $assert.isObject(LoggerFactory._classes.all.error[1].console);
        $assert.equal(LoggerFactory._classes.all.error[0].console._id, LoggerFactory._classes.all.error[1].console._id);

        $assert.isObject(LoggerFactory._classes.test);
        $assert.isArray(LoggerFactory._classes.test.all);
        $assert.isArray(LoggerFactory._classes.test.error);
        $assert.isObject(LoggerFactory._classes.test.error[0]);
        $assert.isObject(LoggerFactory._classes.test.error[0].console);
        $assert.isObject(LoggerFactory._classes.test.error[0].file);
        $assert.isObject(LoggerFactory._classes.test.error[1]);
        $assert.isObject(LoggerFactory._classes.test.error[1].console);
        $assert.equal(LoggerFactory._classes.all.error[0].console._id, LoggerFactory._classes.test.error[1].console._id);
    },
    "Parent assign": function(){
        LoggerFactory.configure(__dirname + '/configs/simple.levels.parent.yaml', {rootDir: __dirname}).init();

        $assert.isObject(LoggerFactory._classes.test);
        $assert.isObject(LoggerFactory._classes.test.all);
        $assert.isObject(LoggerFactory._classes.test.all.console);

        $assert.isObject(LoggerFactory._classes["test.subtest"]);
        $assert.equal(LoggerFactory._classes["test.subtest"].all.console._id, LoggerFactory._classes.test.all.console._id);
        $assert.equal(LoggerFactory._classes["test.subtest"].error.console._id, LoggerFactory._classes.all.error.console._id);

    },
    "Environment": function(){

        LoggerFactory.configure(__dirname + '/configs/simple.env.yaml', {rootDir: __dirname}).env('produnction').init();

        $assert.isObject(LoggerFactory._classes.all);
        $assert.isObject(LoggerFactory._classes.all.all);
        $assert.isObject(LoggerFactory._classes.all.all.console);

        LoggerFactory.configure(__dirname + '/configs/simple.env.yaml', {rootDir: __dirname}).env('development').init();

        $assert.isObject(LoggerFactory._classes.all);
        $assert.isObject(LoggerFactory._classes.all.all);
        $assert.isObject(LoggerFactory._classes.all.all.console);

        LoggerFactory.configure(__dirname + '/configs/simple.env.yaml', {rootDir: __dirname}).env('user').init();

        $assert.isObject(LoggerFactory._classes.all);
        $assert.isObject(LoggerFactory._classes.all.error);
        $assert.isObject(LoggerFactory._classes.all.error.console);

        $assert.isUndefined(LoggerFactory._classes.all.error.file);

    }
}).export(module);
