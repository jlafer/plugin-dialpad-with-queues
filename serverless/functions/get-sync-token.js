exports.handler = function(context, event, callback) {
  // make sure you enable ACCOUNT_SID and AUTH_TOKEN in Functions/Configuration
  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept");
  response.appendHeader("Content-Type", "application/json");
  console.log('created response');

  try {
    const ACCOUNT_SID = context.ACCOUNT_SID;
    console.log(`ACCOUNT_SID=${ACCOUNT_SID}`);
    const TWILIO_SYNC_SERVICE = process.env.TWILIO_SYNC_SERVICE;
    if (! TWILIO_SYNC_SERVICE)
      callback('TWILIO_SYNC_SERVICE env variable not set');
    console.log(`TWILIO_SYNC_SERVICE=${TWILIO_SYNC_SERVICE}`);
    const API_KEY = process.env.API_KEY;
    console.log(`API_KEY=${API_KEY}`);
    const API_SECRET = process.env.API_SECRET;

    const IDENTITY = event.Identity;

    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    const syncGrant = new SyncGrant({
      serviceSid: TWILIO_SYNC_SERVICE
    });

    const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);
    console.log('got access token');

    accessToken.addGrant(syncGrant);
    accessToken.identity = IDENTITY;
  
    response.setBody({ token: accessToken.toJwt() });
    callback(null, response);
  }
  catch(err) {
    console.log('ERROR caught: ', err);
    callback(null, response);
  }
};
