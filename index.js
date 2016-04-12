/**
 * WebCache hook
 */

const crypto    = require('crypto');
const fs        = require('fs');
const mkdirp    = require('mkdirp');
const request   = require('request');
const urlParser = require('url');
const zlib      = require('zlib');

module.exports = function (sails) {
  return {

    defaults: {
      __configKey__: {
        cacheRoot: '.tmp/webcache'
      },
    },

    initialize: function (next) {
      return next();
    },

    request: function (params, callback) {
      // Extract and validate parameters.
      var url = params.url;
      var reset = !!params.reset;
      var followRedirect = !!params.followRedirect;
      if (typeof url !== 'string') return callback(new Error("Parameter 'url' must be a string."));

      // Determine cache file name from hostname and url's md5 hash.
      var hostname = urlParser.parse(url).hostname;
      var urlHash = crypto.createHash('md5').update(url, 'utf8').digest('hex');
      var cacheFileName = sails.config.webcache.cacheRoot + '/' + hostname + '/' + urlHash + '.gz';

      // Make sure directory exists.
      mkdirp(sails.config.webcache.cacheRoot + '/' + hostname, function (err) {
        if (err) return callback(err);
        // Check for existing cache entry.
        fs.access(cacheFileName, fs.R_OK, function (err) {
          if (err || reset) {
            // Perform actual request.
            request({
              url: url,
              followRedirect: followRedirect
            }, function (err, response, body) {
              if (err) return callback(err);
              if (!body) return callback(new Error('Empty response body'));
              // Compress response body.
              zlib.gzip(body, function (err, compressed) {
                if (err) return callback(err);
                // Write new cache entry.
                fs.writeFile(cacheFileName, compressed, function (err) {
                  if (err) return callback(err);
                  // Return uncompressed response body.
                  return callback(null, body);
                });
              });
            });
          }
          else {
            // Read existing cache entry.
            fs.readFile(cacheFileName, function (err, compressed) {
              if (err) return callback(err);
              // Uncompress response body.
              zlib.gunzip(compressed, function (err, body) {
                if (err) return callback(err);
                // Return uncompressed response body.
                return callback(null, body);
              });
            });
          }
        });
      });
    }

  };
};
