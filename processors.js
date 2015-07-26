var handlers = require('./handlers.js'),
    util = require('./utils.js');

module.exports.pushes = function() {
   util.pusher.history({limit: 10, modified_after: util.timestamp}, function(error, response) {

      if ((length = response.pushes.length) != 0) {
         util.timestamp = response.pushes[0].modified;
      }

      response.pushes.forEach(function(push) {
         if (push.target_device_iden != util.deviceIden) {
            return;
         }

         if (push.type == "link") {
            handlers.handleLinkPush(push);
         } else if (push.type == "note") {
            handlers.handleCommandPush(push);
         }

      });

   });
}
