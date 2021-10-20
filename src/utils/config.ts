export const signalWebsite =
  process.env?.SIGNAL_WEBSITE_URL || 'https://signal.twilio.com';
export const signalApi =
  process.env?.SIGNAL_API_URL ||
  'https://ckgg7zwj64.execute-api.us-west-2.amazonaws.com/production/graphql';

export const signalAuthPageUrl =
  process.env?.SIGNAL_AUTH_URL || 'https://signal.twilio.com/auth/dev-mode';

export const developerModeApi =
  process.env?.SIGNAL_DEVELOPER_MODE_API ||
  'https://signal-developer-mode-9311.twil.io';

export const signalTvSchedule =
  process.env?.SIGNAL_TV_SCHEDULE ||
  'https://wq6d88kzgk.execute-api.us-east-1.amazonaws.com/dev/';

export const config = {
  signalWebsite,
  signalAuthPageUrl,
  signalApi,
  developerModeApi,
  signalTvSchedule,
};

export default config;
