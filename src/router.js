const Router = require('express').Router;
const router = new Router();
const {tokenGenerator, voiceResponse, makeACall} = require('./handler');

router.get('/token', (req, res) => {
  res.send(tokenGenerator());
});

router.post('/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(voiceResponse(req.body));
});

router.get('/makeCall', (req, res) => {
  makeACall();
  res.set('Content-Type', 'text/text');
  res.send('sent');
});

module.exports = router;
