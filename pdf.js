'use strict';
var logger = require('./logger');


var session;
var renderPdf = function (session, options, cb) {
  var page = null;
  try {
    session.createPage(function (_page) {
      page = _page;

      var afterOpen = function (status) {
        logger.info('page %s status', options.url, status)
        var file = '/tmp/file.pdf';
        page.set('paperSize', {format: 'letter'}, function () {
          page.render(file, function () {
            page.close();
            page = null;
            return cb(null, file);
          });
        });
      };

      if (!options.content && options.url) {
        page.open(options.url, afterOpen)
      } else if (options.content && options.url) {
        page.setContent(options.content, options.url, afterOpen);
      } else
        cb(new Error('no content or url'));
    });
  } catch (e) {
    try {
      if (page != null) {
        page.close(); // try close the page in case it opened but never rendered a pdf due to other issues
      }
    } catch (e) {
      // ignore as page may not have been initialised
    }
    return cb('Exception rendering pdf:' + e.toString());
  }
};
var createPhantomSession = function (cb) {
  if (session) {
    return cb(null, session);
  } else {
    require('phantom').create({}, function (_session) {
      session = _session;
      return cb(null, session);
    });
  }
};
process.on('exit', function (code, signal) {
  session && session.exit();
});


module.exports = function (req, res, next) {
  /** see http://www.feedhenry.com/server-side-pdf-generation-node-js/ */
  createPhantomSession(function (err, session) {
    /*
     * note that baseUrl is used by phantom to fetch other assets (eg, images) referenced
     * in the content.  this is why it is set to localhost, even when deployed.
     */
    var url = req.query.url;
    logger.info('rendering pdf from content.  url=%s ', url);
    renderPdf(session, {
      url: url
      //content: htmlContent,
      //url: url
    }, function (err, pdf) {
      res.sendFile(pdf);
    });
  });
};

