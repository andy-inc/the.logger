/**
 * Created by G@mOBEP
 *
 * Email:   rusmiran@gmail.com
 * Company: RealWeb
 * Date:    04.09.13
 * Time:    12:03
 */

var $fs = require('fs'),
    $path = require('path'),

    $uuid = require('uuid'),

    existsSync = typeof $fs.existsSync === 'function' ? $fs.existsSync : $path.existsSync,

    FileAdapter,
    createDirReq;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FileAdapter = function (params)
{
    /**
     * Идентификатор адаптера
     *
     * @type {String}
     * @private
     */
    this._id = $uuid.v4();

    /**
     * Параметры адаптера
     *
     * @type {Object}
     * @private
     */
    this._params = params;

    /**
     * Путь к лог-файлу
     *
     * @type {String}
     * @private
     */
    this._fileName = null;

    /**
     * Кодировка
     *
     * @type {String}
     * @private
     */
    this._encoding = params.encoding || 'UTF-8';

    /**
     * Поток записи
     *
     * @type {null}
     * @private
     */
    this._wStream = null;

    ////////////////////////////////////////////////////

    var fileNameArr = params.fileName.split('/');
    //
    // задание имени файла
    //
    if (fileNameArr[0] === '.')
    {
        fileNameArr[0] = params.rootDir;
    }
    else if (fileNameArr[0] === '..')
    {
        fileNameArr[0] = params.rootDir + '/..';
    }
    else if (fileNameArr[0] !== '/')
    {
        fileNameArr.unshift(params.rootDir);
    }

    this._fileName = $path.normalize(fileNameArr.join('/'));
    //
    // создание потока записи
    //
    this._createWriteStream();
};

/**
 * Создание потока записи
 *
 * @returns {WriteStream}
 * @private
 */
FileAdapter.prototype._createWriteStream = function ()
{
    var pathToLogFileArr,
        pathToLogDir;

    pathToLogFileArr = this._fileName.split('/');
    pathToLogFileArr.pop();
    pathToLogDir = pathToLogFileArr.join('/');

    if (!existsSync(pathToLogDir))
    {
        createDirReq(pathToLogDir);
    }

    this._wStream = $fs.createWriteStream(this._fileName, {
        flags:    'a',
        encoding: this._encoding,
        mode:     '0666'
    });

    return this._wStream;
};

/**
 * Логирование
 *
 * @param {Object} params параметры
 * @param {Function} cb
 *
 * @returns {Object}
 */
FileAdapter.prototype.log = function (params, cb)
{
    var message = params.message;

    if (typeof message !== 'string')
    {
        message = message.toString();
    }

    if (!existsSync(this._fileName))
    {
        this._createWriteStream();
    }

    this._wStream.write(message + '\r\n', function (err)
    {
        if (err)
        {
            cb(err);
            return;
        }

        cb(null);
    });

    return this;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Рекурсивное создание директорий
 *
 * @param {String} path путь
 *
 * @returns {Boolean}
 */
createDirReq = function (path)
{
    var dirNameList,
        subpath = '';

    if (typeof path !== 'string' || !path.length)
    {
        return false;
    }

    path        = $path.normalize(path);
    dirNameList = path.split('/');

    for (var i = 0, n = dirNameList.length; i < n; i++)
    {
        subpath += '/' + dirNameList[i];

        if (!existsSync(subpath) || !$fs.statSync(subpath).isDirectory())
        {
            $fs.mkdirSync(subpath);
        }
    }

    return true;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = exports = FileAdapter;