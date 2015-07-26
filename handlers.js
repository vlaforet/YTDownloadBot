var util = require('./utils.js'),
    archiver = require('archiver'),
    path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    p = require('./push.js'),
    youtubedl = require('youtube-dl');

module.exports.handleLinkPush = function(push) {

   p.sendMessage(push.source_device_iden, util.config.deviceName + ': Downloading', push.title,
   function(err, response) {
      console.log('Downloading');
   });

   var video = youtubedl(push.url, []);

   var vid = util.videos.push({title: push.title, video: video, size: 0, pos: 0}) - 1;

   video.on('error', function(err) {
     console.log('error 2:', err);
   });

   video.on('info', function(info) {
      util.videos[vid].size = info.size;
      var output = path.join(util.config.storagePath, 'videos', info._filename);
      video.pipe(fs.createWriteStream(output));
   });

   video.on('data', function(data) {
     util.videos[vid].pos += data.length;
   });

   video.on('end', function() {
      p.sendMessage(push.source_device_iden, util.config.deviceName + ': Download finished', push.title,
      function(err, response) {
         console.log('Finished');
      });
   });

}

module.exports.handleCommandPush = function(push) {

   switch(push.body) {
      case util.config.compressCommand:

         var archive = archiver('zip', {});
         archive.directory(path.join(util.config.storagePath, 'videos'), false);

         var filename = Date.now() + '.zip';

         archive.pipe(fs.createWriteStream(path.join(util.config.WebServerPath, filename)));
         archive.finalize();

         var folder = path.join(util.config.storagePath, 'videos');
         rimraf(folder, function(err) {
            if (err) console.log(err);
            fs.mkdir(folder, function() {});
         });

         var link = path.join(util.config.baseURI, filename);
         p.sendLink(push.source_device_iden, util.config.deviceName + ': Download link',
            link, function(err, response) {
               console.log('Successfully compressed and notified client!');
         });

      break;

      case util.config.progressCommand:
         if (util.videos.length < 1) {
            p.sendMessage(push.source_device_iden, util.config.deviceName + ': No download ongoing',
            response, function(err, response) {
            });
         }

         var response = "";
         var total = 0;
         var percents = [];

         util.videos.forEach(function(video) {
            var index = percents.push(Math.round(video.pos / video.size * 100)) - 1;
            response += video.title + ': ' + percents[index] + '%\n';
         });

         percents.forEach(function(percent) {
            total = total + percent;
         });
         total = total/percents.length;

         p.sendMessage(push.source_device_iden, util.config.deviceName + ': Progress ' + total + '%',
         response, function(err, response) {
         });

      break;

      case util.config.cancelCommand:
      if (util.videos.length < 1) {
         return;
      }

      for (var i = 0; i<util.videos.length; i++) {
         delete util.videos[i].video;
      }

      break;

   }

}
