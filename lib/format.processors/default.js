/**
 * Powered by Andy <andy@away.name>.
 * Date: 03.09.13
 */

var DefaultProcessor = function(value){
    return function(args){
        var str = value;
        str = str.replace('%d', new Date());
        str = str.replace('%h', args.hostname);
        str = str.replace('%l', args.level);
        str = str.replace('%c', args.name);
        if (args.info.length > 0 && typeof args.info[0] === 'string'){
            str = str.replace('%m', args.info[0]);
        }
        return str;
    };
};

module.exports = exports = DefaultProcessor;