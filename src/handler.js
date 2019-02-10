const config = require('../config');
const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const client = require('twilio')(config.accountSid, config.authToken);

const identity = "RobPorter";

exports.tokenGenerator = function tokenGenerator() {
  const capability = new ClientCapability({
    accountSid: config.accountSid,
    authToken: config.authToken,
  });

  capability.addScope(new ClientCapability.IncomingClientScope(identity));
  capability.addScope(new ClientCapability.OutgoingClientScope({
    applicationSid: config.twimlAppSid,
    clientName: identity,
  }));

  // Include identity and token in a JSON response
  return {
    identity: identity,
    token: capability.toJwt(),
  };
};

exports.makeACall = () => {
  client.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: '+441483765972',
      from: config.callerId
    })
    .then(call => console.log(JSON.stringify(call, null, 2)))
    .catch(e => console.error(e))
    .done();
};

exports.voiceResponse = function voiceResponse(body) {
  const response = new VoiceResponse();
  const toNumber = body.To;

  console.log(JSON.stringify(body, null, 2));

  if (toNumber === 'queue') {
    // Get next call from the queue
    const dial = response.dial({callerId: config.callerId});
    dial.queue({}, 'support');
  } else if (body.From.startsWith('client')) {
    // Outbound Call
    const dial = response.dial({callerId: config.callerId});
    dial.number({}, toNumber);
  } else {
    // Inbound Call
    response.say('Hi, this is Switchcraft, we will be with you in a moment...');
    response.enqueue({}, 'support');
    // const dial = response.dial({callerId: config.callerId});
    // dial.client({}, identity);
  }


  console.log(response.toString());

  return response.toString();
};

function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
