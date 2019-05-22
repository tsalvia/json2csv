# json2csv

Convert JSON format files to CSV format.

## How to install

```
$ git clone https://github.com/tsalvia/json2csv.git
$ npm install
```

## Usage

```
$ node json2csv.js -i <json_file>
```

## Options

```
-i, --input string    This option is required.
                      Specifies the JSON file you want to convert to CSV format.
-o, --output string   Specifies the file name for the output. The default is "input file name".csv
-h, --help            Display specific types of command line options.
```

## Examples

1. Example of specifying input files only.
   ```
   $ node json2csv.js --input Sample.json
   ```

1. Example of specifying output destination.
   ```
   $ node json2csv.js --input Sample.json --output output/Sample.csv
   ```