/**
 * Powered by Andy <andy@away.name>.
 * Date: 03.09.13
 */

var DefaultProcessor = function(value){
    return function(args){
        var str = value;
        str = str.replace('%date', new Date());
        str = str.replace('%hostname', args.hostname);
        str = str.replace('%level', args.level);
        str = str.replace('%module', args.name);
        if (args.info.length > 0 && typeof args.info[0] === 'string'){
            str = str.replace('%message', args.info[0]);
        }
        return str;
    };
};

module.exports = exports = DefaultProcessor;