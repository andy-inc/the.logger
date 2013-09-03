/**
 * Created by Andy<andy@away.name> on 03.09.13.
 */

exports.array = {
    /**
     * Copy array elements
     * @param {Array} arr Source array
     * @param {Number} from Index copy from
     * @param {Number} [to] Index copy to
     * @returns {Array}
     */
    copy: function(arr, from, to){
        if (to == null) to = arr.length -1;
        var result = [];
        for(var i = from; i <= to; i++){
            result.push(arr[i]);
        }
        return result;
    },

    /**
     * Is Same arrays
     * @param {Array} x
     * @param {Array} y
     * @returns {Boolean}
     */
    isSame: function(x, y){
        var y1 = [].concat(y);
        if (x.length != y.length){
            return false;
        }
        for(var i = 0, len = x.length; i < len; i++){
            var same = false;
            for(var j = 0, len1 = y1.length; j < len1; j++){
                if (exports.object.isSame(x[i], y1[j])){
                    same = true;
                    y1.splice(j, 1);
                    break;
                }
            }
            if (!same) return false;
        }
        return true;
    }
};

exports.object = {
    /**
     * Extend object with another object if do not have property
     * @param {Object} target
     * @param {Object} source
     * @returns {Object}
     */
    extend: function(target, source){
        if (!Array.isArray(target) && Array.isArray(source)){
            target = [].concat(source);
        } else {
            for(var key in source) if (source.hasOwnProperty(key)){
                if (target[key] == null){
                    target[key] = source[key]
                }
            }
        }
        return target;
    },

    /**
     * Need extend object with another object if do not have property
     * @param {Object} target
     * @param {Object} source
     * @returns {Boolean}
     */
    needExtend: function(target, source){
        if (!Array.isArray(target) && Array.isArray(source)) return true;
        for(var key in source) if (source.hasOwnProperty(key)){
            if (target[key] == null){
                return true;
            }
        }
        return false;
    },

    /**
     * Is object same
     * @param {Object} x
     * @param {Object} y
     * @returns {Boolean}
     */
    isSame: function(x, y){
        var _same = function(x, y){
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true;
            }
            if (x === y) {
                return true;
            }
            if ((typeof x === 'function' && typeof y === 'function') ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }
            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false;
            }

            if (x.constructor !== y.constructor) {
                return false;
            }

            if (x.prototype !== y.prototype) {
                return false;
            }

            if (Array.isArray(x) && !Array.isArray(y)){
                return false;
            }

            if (Array.isArray(x) && Array.isArray(y)){
                return exports.array.isSame(x, y);
            }

            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }
            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }

                switch (typeof (x[p])) {
                    case 'object':
                    case 'function':

                        if (!_same (x[p], y[p])) {
                            return false;
                        }
                        break;

                    default:
                        if (x[p] !== y[p]) {
                            return false;
                        }
                        break;
                }
            }

            return true;
        };
        return _same(x, y);
    }
};