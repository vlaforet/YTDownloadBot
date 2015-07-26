var PushBullet = require('pushbullet'),
    fs = require('fs'),
    youtubedl = require('youtube-dl'),
    path = require('path');

var setup = require('./setup.js'),
    processors = require('./processors.js'),
    util = require('./utils.js');

util.config = require('./config.js');
util.pusher = new PushBullet(util.config.pushbulletKey);

setup.mkdirs();
var saver;
var stream = setup.pushbullet();

util.timestamp = setup.timestamp();
var lastTimestamp = util.timestamp;


stream.on('connect', function() {
   console.log("Successfully connected to pushbullet stream");
   processors.pushes();
});

stream.on('close', function() {
   console.log("Successfully disconnected from pushbullet stream (error?)");
});

stream.on('tickle', function(type) {
    if (type == "push") {
      processors.pushes();
    }
});

process.on('SIGINT', function() {
   console.log("Shutting down");
   clearInterval(saver);
   setup.save();
   stream.close();
});

saver = setInterval(setup.save, 5000);
