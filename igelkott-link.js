var http = require("follow-redirects").http,
https = require('follow-redirects').https,
url = require('url');

var Link = function Link() {
  this.listeners = {'PRIVMSG': this.talk, 'link:200': this._200};

  this.name = 'talk';
  this.help = {
    "default": "",
  };
};


Link.prototype._200 = function _200(message, response) {
  var obj = {
    command: 'PRIVMSG',
    parameters: [message.parameters[0], 'title: '+response]
  };
  this.igelkott.push(obj);
};


Link.prototype.talk = function talk(message) {
  var urlMatch = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var matches = message.parameters[1].match(urlMatch);
  if (matches)
  {
    var parts= url.parse(matches[0]);
    var transport = (parts.protocol === 'http:') ? http : https;
    transport.get({ hostname: parts.hostname, path: parts.path }, this.parseRequest.bind(this, message));
  }
};


Link.prototype.parseRequest = function parseRequest(message, response) {

  if (response.statusCode !== 200)
  {
    this.igelkott.emit('link:404', message);
  }

  var titleMatch = /<title>(.+)?<\/title>/ig;
  response.body = "";

  response.on("data", function(chunk) {
    response.body = response.body + chunk;
  });

  response.on("end", function() {
    var title = titleMatch.exec(response.body);
    if (title)
    {
      this.igelkott.emit('link:200', message, title[1]);
    }
    else
    {
      return false;
    }
  }.bind(this));
};

exports.Plugin = Link;
