const request = require('request');
const express = require('express');

const app = express();

app.post('/', (req, res) => {
  req.on('data', handleInbound);
  res.status(200).end();
});

function handleInbound(data) {
  const inbound = JSON.parse(data.toString());
  if (inbound.text.substring(0,8).toLowerCase() === '/bitcoin') {

    makeCoindeskRequest(inbound.room, (err, outboundPayload) => {
      postToGitTalk(outboundPayload, err => {
        if (err) console.log(err);
      });
    });
  }
}

function makeCoindeskRequest(room, cb) {
  request(`http://api.coindesk.com/v1/bpi/currentprice.json`, (err, respose, body) => {
    if (err) return cb(err, null);
    const data = JSON.parse(body);
    const date = data.time.updated;
    const price = data.bpi.USD.rate;
    const outbound = {
      apiKey: '688b32f2675d0e03d2e0696a74237702',
      method: 'message',
      room: room,
      action: {
        text: `Current Bitcoin price in USD: $__${price}__`,
        avatar: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/bitcoin-icon.png'
      }
    };

    cb(null, outbound);
  });
}

function postToGitTalk(outbound, cb) {
  request.post({ url: 'http://localhost:8000/apps', json: outbound }, (err, response, body) => {
    if (err) return cb(err);
    cb(null);
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.listen(8003, () => console.log('server listening on port 8003'));
