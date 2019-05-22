'use strict';

const jQueryCSV = require('jquery-csv');
const fs = require('fs');
const path = require('path');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

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

function isExistFile(file) {
    try {
        fs.accessSync(file);
    } catch (err) {
        if (err.code === 'ENOENT')
            return false;
    }
    return true;
}

function printError(msg) {
    console.error('Error:\t' + msg);
    console.error('\tFor more information, try to use the \'--help\' or \'-h\' option to show help.');
}

const optionDefinitions = [
    {
        name: 'input',
        alias: 'i',
        type: String,
        description:
            'This option is required.\n' +
            'Specifies the JSON file you want to convert to CSV format.'
    },
    {
        name: 'output',
        alias: 'o',
        type: String,
        description: 'Specifies the file name for the output. The default is "input file name".csv'
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display specific types of command line options.'
    }
];

const sections = [
    {
        header: 'json2csv',
        content: 'Convert JSON format files to CSV format.'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    },
    {
        header: 'Examples',
        content: [
            {
                desc: '1. Example of specifying input files only',
                example: '$ node json2csv.js --input Sample.json'
            },
            {
                desc: '2. Example of specifying output destination.',
                example: '$ node json2csv.js --input Sample.json --output output/Sample.csv'
            }
        ]
    },
];

let options;
try {
    options = commandLineArgs(optionDefinitions);
} catch (err) {
    switch (err.name) {
        case 'UNKNOWN_OPTION':
            printError('Unrecoginzed option \'' + err.optionName + '\'');
            break;
        case 'UNKNOWN_VALUE':
            printError('Unrecoginzed value \'' + err.value + '\'');
            break;
        default:
            printError('\'' + err.name + '\' is unknown error.');
            break;
    }
    process.exit();
}

if (options.help) {
    const usage = commandLineUsage(sections);
    console.log(usage);
    process.exit();
}

if (!options.input) {
    printError('No JSON file specified. Use the "-- input" or "-i" option.');
    process.exit();
}

const inputFile = options.input;
if (!isExistFile(inputFile)) {
    printError('\'' + inputFile + '\': No such file or directory.');
    process.exit();
}

let outputFile = options.output;
if (!outputFile)
    outputFile = getFileNameWithoutExt(inputFile) + '.csv';

const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir))
    fs.mkdirSync(outputDir, { recursive: true });

const json = require(inputFile);
const csv = json2csv(json);
const charset = 'utf8';
fs.writeFileSync(outputFile, csv, charset);