const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const config = require('../config');
let identity;

exports.tokenGenerator = function tokenGenerator() {
  identity = "RobPorter";
  console.log('identity:' + identity);
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

exports.recordedResponse = function() {
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'alice' }, 'Switchraft helpdesk will be with you shortly');
  twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');
  // twiml.enqueue();
  return twiml.toString();
};

exports.putInQueue = function() {
  const twiml = new VoiceResponse();
  twiml.enqueue('my_queue');
};

exports.voiceResponse = function voiceResponse(body) {

  const toNumber = body.To;
  console.log('/voice to:' + JSON.stringify(body, null, 2));

  // Create a TwiML voice response
  const twiml = new VoiceResponse();

  // if(toNumber) {
    // Wrap the phone number or client name in the appropriate TwiML verb
    // if is a valid phone number
    // const attr = isAValidPhoneNumber(toNumber) ? 'number' : 'client';
    // console.log('attr:' + attr);

    const dial = twiml.dial({
      callerId: config.callerId,
    });

    dial['client']({
      someparam: 'dvdvfb'
    }, identity);
  // } else {
  //   twiml.say('No to number supplied')
  // }

  // console.log(twiml.toString());

  return twiml.toString();
};

/**
* Checks if the given value is valid as phone number
* @param {Number|String} number
* @return {Boolean}
*/
function isAValidPhoneNumber(number) {
  return /^[\d\+\-\(\) ]+$/.test(number);
}
