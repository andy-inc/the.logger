/**
 * Powered by Andy <andy@away.name>.
 * Date: 03.09.13
 */

var $util = require('util');

var DefaultProcessor = function(value){
    return function(args){
        var str = value;
        str = str.replace(/\\n/g, '\n');
        str = str.replace('%date', new Date());
        str = str.replace('%hostname', args.hostname);
        str = str.replace('%level', args.level);
        str = str.replace('%module', args.name);
        if (args.info.length > 0){
            var message = args.info.filter(function(el){ return (typeof el === 'string' || typeof el === 'number' || el instanceof Date)});
            str = str.replace('%message', message.join(' '));
        } else {
            str = str.replace('%message', '');
        }
        str = str.replace('%label', args.label || '');

        var trace = [];
        if (args.info.length > 0){
            trace = args.info.filter(function(el){ return el instanceof Error; }).map(function(arg){
                return arg.stack;
            });
        }

        str = str.replace('%trace', trace.join('\n'));

        var stIndex = -1;
        while ((stIndex = str.indexOf('%args')) > -1){
            var arg = str.substr(stIndex);
            arg = arg.substring(0, (arg.indexOf(' ') > -1 ? arg.indexOf(' ') : undefined)).trim();
            var argIndex = -1, depth = 5;
            if (arg.indexOf('[') > -1){
                var s = arg.substr(arg.indexOf('[') +1);
                s = s.substring(0, s.indexOf(']'));
                argIndex = parseInt(s);
            }
            if (arg.indexOf('(') > -1){
                var s = arg.substr(arg.indexOf('(') +1);
                s = s.substring(0, s.indexOf(')'));
                depth = parseInt(s);
            }
            var result = [];

            if (argIndex > -1) {
                result.push($util.inspect(args.info[argIndex], {depth: depth}));
            } else {
                for(var i = 0, len = args.info.length; i < len; i++){
                    result.push($util.inspect(args.info[i], {depth: depth}));
                }
            }

            str = str.replace(arg, result.join('\n'));
        }

        var errors = [];
        if (args.info.length > 0){
            errors = args.info.filter(function(el){ return el instanceof Error; }).map(function(arg){
                return arg.message;
            });
        }

        str = str.replace('%errors', errors.join('\n'));

        str = str.replace('%code', args.code);

        return str;
    };
};

module.exports = exports = DefaultProcessor;