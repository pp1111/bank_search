'use strict';

const request = require('request');
const ascii = require('./ascii');

const getContent = function(url, utf8) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
          let body = '';
          response.on('data', (chunk) => body += utf8? ascii.toUTF8(chunk) : chunk);
          response.on('end', () => resolve(body));
      });
      request.on('error', (err) => reject(err))
    })
};

module.exports = getContent;