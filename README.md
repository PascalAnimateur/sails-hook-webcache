# sails-hook-webcache

[Sails.sj](http://sailsjs.org) hook that provides web caching to compressed files on disk.

### Installation

`npm install --save sails-hook-webcache`

### Configuration

By default, the compressed files are stored inside `.tmp/webcache/` using the name `{hostname}/{urlHash}.gz`.

The cache root directory can be configured by changing the value of `sails.config.webcache.cacheRoot`.

#### Example

The `request` method performs the actual GET request and returns the response body like so:

```javascript
sails.hook.webcache.request({
  url: 'http://example.com',  // Fetch this URL
  followRedirect: false,      // Should we follow 3xx HTTP responses?
  reset: false                // Should we fetch a new copy?
}, function (err, body) {
  if (err) {
    sails.log.error('Request failed.');
  }
  else {
    // Do something with your body!
    sails.log.info('Response body is ' + body.length + ' bytes.');
  }
});

```
