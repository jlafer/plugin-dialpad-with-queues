/*
  This function dials an external party and adds them to an existing conference,
  named by the taskSid parameter.
  Event:
    conferenceSid - the SID of the conference for the dialing agent
    JLAFER - renamed taskSid to conferenceSid, reflecting what the caller is actually passing
    to - the number to be dialed
      NOTE: can also be a SIP endpoint or client id; parameters can be appended
    from - the callerid to show the external party
*/
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
    const {
      conferenceSid,
      to,
      from
    } = event;
    console.log(`Adding ${to} to conference ${conferenceSid}`);
    const client = context.getTwilioClient();
    const participantsResponse = await client
      .conferences(conferenceSid)
      .participants
      .create({
        to,
        from,
        earlyMedia: true,
        endConferenceOnExit: false
      });
    console.log('Participant response properties:');
    Object.keys(participantsResponse).forEach(key => {
        console.log(`${key}: ${participantsResponse[key]}`);
    });
    callback(null, assets.response("json", participantsResponse));
});