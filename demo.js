// this file is only used by contributors to test things without the Twilio CLI
/* eslint @typescript-eslint/no-var-requires: "off" */
const { setAuthToken } = require('./dist/utils/graphqlClient');
const { render } = require('./dist/components/App');

async function run() {
  setAuthToken(process.env.SIGNAL_API_TEST_AUTH_TOKEN);
  await render(
    {
      name: 'Operator',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioUsername: process.env.TWILIO_ACCOUNT_SID,
      twilioPassword: process.env.TWILIO_AUTH_TOKEN,
    },
    Boolean(process.env.DEBUG_SIGNAL)
  );
}

run().catch(console.error);
