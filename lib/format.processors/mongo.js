/**
 * Какой сам ⚝
 * Author: Pavlenov Semen
 * Date: 04.09.13
 * Time: 12:06
 *
 * E = mc^2
 */

var $util = require('util');

var MongoProcessor = function(value){
    return function(args){
        var result = {};
        var trace = [];
        var errors = [];
        if (args.info.length > 0) {
            for (var i = 0, len = args.info.length; i < len; i++) {
                if (args.info[i] instanceof Error) {
                    trace.push(args.info[i].stack.trim().split("\n").map(function(el) { return el.trim(); }));
                    errors.push(args.info[i].name + ': ' + args.info[i].message);
                    args.info[i] = args.info[i].name + ': ' + args.info[i].message;
                }
            }
        }

        var fields = value.split(',');
        fields.map(function(el) { return el.trim(); }).forEach(function(el) {
            if (el === '%date') result['date'] = new Date();
            if (el === '%hostname') result['hostname'] = args.hostname;
            if (el === '%level') result['level'] = args.level;
            if (el === '%label') result['label'] = args.label;
            if (el === '%module') result['module'] = args.name;
            if (el === '%args') result['args'] = args.info;
            if (el === '%code') result['code'] = args.code;
            if (el === '%stack') result['stack'] = args.stack;
            if (el === '%trace') result['trace'] = trace;
            if (el === '%errors') result['errors'] = errors;
        });
        return result;
    };

};

module.exports = exports = MongoProcessor;