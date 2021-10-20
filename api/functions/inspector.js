/* global Twilio */
/* eslint @typescript-eslint/no-var-requires: "off" */
const got = require('got');

exports.handler = async function (context, event, callback) {
  const url = new URL(`http://${context.DOMAIN_NAME}`);

  url.pathname = '/demos.json';
  const demosUrl = url.toString();

  try {
    const demosResult = await got(demosUrl).json();
    const resp = new Twilio.Response();
    resp.appendHeader('Content-Type', 'application/json');
    resp.setBody({ demos: demosResult });
    resp.appendHeader('Access-Control-Allow-Origin', '*');
    resp.appendHeader('Access-Control-Allow-Methods', 'GET');
    resp.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    callback(null, resp);
  } catch (err) {
    callback(err);
  }
};
