/*
  This is the call status callback for conferences[CFxxx].participants.create.
  It updates keys in a syncmap that communicates events to the Flex client.

  Event:
    CallSid - the sid of the call being added to the conference
    CallStatus - the new status string of the call being dialed
*/

const MAPNAME = 'DialingEventsMap';

exports.handler = async (context, event, callback) => {
  const { CallSid, CallStatus} = event;
  //console.log(`conference-call-status-callback: received event:`, event);
  const client = context.getTwilioClient();
  const response = new Twilio.Response();
  const data = {status: CallStatus, callSid: CallSid};
  let p, op;
  if (CallStatus === 'initiated') {
    op = 'created';
    p = client.sync.services(process.env.TWILIO_SYNC_SERVICE)
      .syncMaps(MAPNAME).syncMapItems
      .create({
        key: CallSid,
        data,
        ttl: 3600
      });
  }
  else {
    op = 'updated';
    p = client.sync.services(process.env.TWILIO_SYNC_SERVICE)
      .syncMaps(MAPNAME).syncMapItems(CallSid)
      .update({data});
  }
  p.then(item => {
    console.log(`conference-call-status-callback: ${op} item in syncmap:`, item.data);
    response.setStatusCode(204);
    callback(null, response);
  })
  .catch(err => {
    console.log(`conference-call-status-callback: ${CallStatus} NOT ${op} in syncmap:`, err);
    callback(err, response);
  });
};
