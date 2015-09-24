#!/usr/bin/env node
'use strict';

// Dependencies
var program = require('commander');
var checker = require('license-checker');
var json2csv = require('json2csv');
var fs = require('fs');

var Tools = require('./lib/tools.js');
var tools = new Tools();

var dependencies = [];
var pkg = {};

program
  .version('0.0.1')
  .usage('<path to explore> <path to export csv>')
  .parse(process.argv);

if(program.args[0]) {
  checker.init({
    start: program.args[0]
  }, function(json) {
    Object.keys(json).forEach(function(items) {
      var item = items.split('@');

      pkg = {
        module: item[0],
        version: item[1],
        license: json[items].licenses,
        repository: json[items].repository
      };
      dependencies.push(pkg);
    });

    json2csv({data: dependencies, fields: ['module', 'version', 'license', 'repository']}, function(err, csv) {
      if (err) {
        tools.setError(err);
      }

      var exportFile = program.args[1];
      if(program.args[1] === undefined) {
        var pathProject = program.args[0];
        if(pathProject.lastIndexOf('/') === pathProject.length - 1) {
          exportFile = pathProject + 'licenseDependencies.csv';
        } else {
          exportFile = pathProject + '/licenseDependencies.csv';
        }
      }

      fs.writeFile(exportFile, csv, function(err) {
        if (err) {
          tools.setError(err);
        } else {
          tools.setResponse('License dependencies export with success to ' + exportFile);
        }
      });
    });

  });
} else {
  tools.setError('Path to explore is require');
}