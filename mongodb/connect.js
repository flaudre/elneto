var mongoose = require('mongoose');

exports.connect = function (config, env) {

  if (config.db.user && config.db.pass) {
    mongoose.connect('mongodb://' + config.DB_HOST + ":" + config.DB_PORT || 27017 + "/"
        + config.db.name,
        {
          user: config.db.user,
          pass: config.db.pass,
        });
  }
  else {
    mongoose.connect('mongodb://' + config.DB_HOST + ":" + config.DB_PORT || 27017 + "/"
        + config.db.name);
  }

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open on port ' + config.DB_PORT || 27017);
  });

  // If the connection throws an error
  mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  mongoose.Promise = global.Promise;

  exports.mongoose = mongoose;
};