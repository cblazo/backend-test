'use strict';

module.exports = function(Machine) {

  Machine.getAttributes = function(machineId, cb) {
    //Find the instance with the same ID
    Machine.findById(machineId , function (err, instance) {
      //Return the attributes in JSON formatting
      cb(null, instance);
    });
  }

  Machine.remoteMethod(
    'getAttributes', {
      description: 'Get all attributes, given a Machine ID.',
      http: {
        path: '/getAttributes',
        verb: 'get'
      },
      accepts: {
        arg: 'id',
        type: 'number',
        http: { source: 'query'}
      },
      returns: {
        arg: 'attributes',
        type: 'application/json'
      }
    }
  );

  Machine.importAsXlsx = function(url, cb) {
      // Require the XLSX package
      var XLSX = require('xlsx'), request = require('request');
      request(url, {encoding: null}, function(err, res, data) {
      	if(err || res.statusCode !== 200) return;

        //Parse the XLSX file into a javascript object
      	/* data is a node Buffer that can be passed to XLSX.read */
      	var workbook = XLSX.read(data, {type:'buffer'});
        var sheet_name_list = workbook.SheetNames;
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        //Create a boolean value that will be returned to the API
        var successful = true;
        console.log("Reading input...");

        // Asynchronously loop through all the readings in the xlData object
        var forEach = require('async-foreach').forEach;
        forEach(xlData, function(item, index, arr) {
          // Check if there already is an instance with the same id,
          // otherwise create one.
          Machine.findOrCreate({where: {"id": item.Machine}}, {"id" : item.Machine}, function(err, instance, created) {
            //Insert the new value for the read attribute
            var reading = item.reading;
            if (item.reading === undefined) reading = item[" Reading"];
            instance.updateAttribute(item.attribute, reading, function (err, model) {
              if (err) successful = false;
            });
          });
          var done = this.async();
          setTimeout(function(){
            done();
          } , 1);
        }, onFinished);

        cb(null, successful);
      });

        // The callback when the foreach-loop is finished.
        function onFinished(notAborted, arr) {
          Machine.find(function(err, instances){
            console.log("Done with importing!");
          });
        }

   }

   Machine.remoteMethod(
     'importAsXlsx', {
       description: 'Update the database from an XSLX file.',
       http: {
         path: '/importAsXlsx',
         verb: 'post'
       },
       accepts: {
         arg: 'url',
         type: 'string',
         http: { source: 'query'}
       },
       returns: {
         arg: 'isSuccessful',
         type: 'boolean'
       }
     }
   );

   Machine.exportAsXlsx = function(cb) {
    Machine.find( function(err, instances){
        // Require XLSX
        if(typeof require !== 'undefined') var XLSX = require('xlsx');

        // Initialize a workbook and sheet
        var workbook = {}
        workbook.Sheets = {};
        workbook.SheetNames = [];

        // Parse the instances into an argument that XLSX.utils.json_to_sheet can use
        var instancesParsed = [];
        instancesParsed = instances.map(function(ins) {
          return {
            id: ins.id,
            position: ins.position,
            "Closing time": ins["Closing time"],
            active: ins.active
          }
        })

        // Put the parsed instances in a worksheet and place it in the workbook.
        var worksheet = XLSX.utils.json_to_sheet(instancesParsed, {header:["id","position","Closing time", "active"]});
        var ws_name = "Sheet1";
        workbook.SheetNames.push(ws_name);
        workbook.Sheets[ws_name] = worksheet;

        // Write the workbook to a file.
        XLSX.writeFile(workbook, 'output.xlsx');
        cb(null, true);
        }
      );
    }

   Machine.remoteMethod('exportAsXlsx', {
       isStatic: true,
       description: 'Export the entire database as an XLSX file.',
       http: {
         path: '/exportAsXlsx',
         verb: 'get'
       },
       returns: {
         arg: 'isSuccessful',
         type: 'boolean'
       }
     }
   );

};
