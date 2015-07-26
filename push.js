var util = require('./utils.js');

module.exports.sendMessage = function(iden, title, body, cb) {

   util.pusher.note(iden, title, body, function(error, response) {
      if (cb) cb(error, response);
   });

}

module.exports.sendLink = function(iden, title, link, cb) {

   util.pusher.link(iden, title, link, function(error, response) {
      if (cb) cb(error, response);
   });

}
