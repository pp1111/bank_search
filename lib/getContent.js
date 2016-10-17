const request = require('request');
const ascii = require('./ascii');

const getContent = function(url) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? require('https') : require('http');
      const request = lib.get(url, (response) => {
          if (response.statusCode < 200 || response.statusCode > 299) {
            reject(new Error('Failed to load page, status code: ' + response.statusCode));
          }
          let body = '';
          response.on('data', (chunk) => body += ascii.toUTF8(chunk));
          response.on('end', () => resolve(body));
      });
      request.on('error', (err) => reject(err))
    })
};

module.exports = getContent;