var path = require('path'),
    fs = require('fs'),
    util = require('./utils.js');

(function() {
   module.exports.mkdirs = function() {

      fs.mkdir(util.config.storagePath, function() {
         fs.mkdir(path.join(util.config.storagePath, 'videos'), function() {});
      });

   }

   module.exports.pushbullet = function() {
      var stream = util.pusher.stream();

      util.pusher.devices({}, function(error, response) {
         var botDevice;
         response.devices.forEach(function(device) {
            if (device.nickname === util.config.deviceName) {
               botDevice = device;
               util.deviceIden = device.iden;
            }
         });

         if (botDevice == null) {
            util.pusher.createDevice(util.config.deviceName, function(err, response) {
               if (err) throw err;
               util.deviceIden = response.iden;
            });
         }

         stream.connect();
      });

      return stream;
   }

   module.exports.timestamp = function() {
      var timestampFile = getTimestampFile(util.config);

      if (fs.existsSync(timestampFile)) {
         return fs.readFileSync(timestampFile, 'utf8');
      }

      fs.writeFile(timestampFile, 0, function (err) {
         if (err) return console.log(err);
      });
      return 0;
   }

   module.exports.save = function() {
      var timestamp = util.timestamp;
      if (timestamp != util.lastTimestamp) {
         fs.writeFile(getTimestampFile(util.config), timestamp, function (err) {
          if (err) return console.log(err);
          util.lastTimestamp = timestamp;
         });
      }

   }

}());

function getTimestampFile(config) {
   return path.join(config.storagePath, 'timestamp');
}
