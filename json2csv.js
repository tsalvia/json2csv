'use strict';

const jQueryCSV = require('jquery-csv');
const fs = require('fs');
const path = require('path');

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function parse_object(obj, path) {
    if (path == undefined)
        path = '';

    const type = getType(obj);
    const scalar = (type == 'Number' || type == 'String' || type == 'Boolean' || type == 'Null');

    if (type == 'Array' || type == 'Object') {
        const d = {};
        for (let i in obj) {
            const newD = parse_object(obj[i], path + i + '/');
            Object.assign(d, newD);
        }
        return d;
    }
    
    if (scalar) {
        const d = {};
        const endPath = path.substr(0, path.length - 1);
        d[endPath] = obj;
        return d;
    }

    return {};
}

function json2csv(json) {
    const outArray = [];
    for (let row in json)
        outArray[outArray.length] = parse_object(json[row]);
    return jQueryCSV.fromObjects(outArray);
}

function getFileNameWithoutExt(pathstr) {
    return path.basename(pathstr, path.extname(pathstr));
}

if (process.argv.length == 3) {
    const inputFile = process.argv[2];
    const outputFile = getFileNameWithoutExt(inputFile) + '.csv';

    const json = require(inputFile);
    const csv = json2csv(json);
    const charset = 'utf8';
    fs.writeFileSync(outputFile, csv, charset);
} else {
    console.log('Usage: node json2csv.js <file>');
}