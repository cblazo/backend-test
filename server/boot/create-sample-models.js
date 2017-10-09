/* UNCOMMENT IF YOU WANT TO AUTOMIGRATE
    module.exports = function(app) {
      app.dataSources.backendDB.automigrate('Machine', function(err) {
        if (err) throw err;
*/

/* UNCOMMENT IF YOU WANT TO INITIALIZE SOME INSTANCES AT STARTUP
        app.models.Machine.create([{
          "id": 1,
          "position": 5,
          "Closing time": 130.07446,
          "active": 1
        }, {
          "id": 22,
          "position": 50,
          "Closing time": 10.11111,
          "active": 1
        }, {
          "id": 3,
          "position": 22,
          "Closing time": 8.04343,
          "active": 1
        }, {
          "id": 245,
          "position": 2,
          "Closing time": 0.003,
          "active": 0
        }, ], function(err, machines) {
          if (err) throw err;

          console.log('Models created: \n', machines);
        });
*/
      });
    };
