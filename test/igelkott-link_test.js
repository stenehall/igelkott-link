var assert = require('chai').assert,
Stream = require('stream'),
nock = require('nock'),

Igelkott = require('igelkott'),
Link = require('../igelkott-link.js').Plugin;


describe('Link', function() {

  var igelkott,
  config,
  s,
  server;

  beforeEach(function () {
    s = new Stream.PassThrough({objectMode: true});

    config = {
      "server": {
        "nick": "igelkott",
      },
      plugins:['privmsg'],
      'adapter': s, 'connect': function() { this.server.emit('connect'); }
    };

    igelkott = new Igelkott(config);
  });


  it('Should respond with googles title, i.e. Google', function(done) {
    this.timeout(5000); // DB queries are slow

    igelkott.plugin.load('link', Link);

    s.on('data', function(data) {
      if(data == "PRIVMSG ##botbotbot :title: Google\r\n")
      {
        done();
      }
    });

    igelkott.connect();
    s.write(":dsmith!~dsmith@unaffiliated/dsmith PRIVMSG ##botbotbot :lorem ipsum https://google.com/\r\n");
  });

  it('Should not respond with a title on 404', function(done) {

    this.timeout(5000);
    igelkott.plugin.load('link', Link);

    igelkott.on('link:404', function() {
      done();
    });

    igelkott.connect();
    s.write(":dsmith!~dsmith@unaffiliated/dsmith PRIVMSG ##botbotbot :lorem ipsum https://google.com/foobar\r\n");
  });

});
