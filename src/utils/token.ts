import { PluginConfig } from '@twilio/cli-core/src/services/config';
import { getCommandPlugin } from '@twilio/cli-core/src/services/require-install';
import express from 'express';
import { config } from './config';
import { openBrowserUrl } from './openLink';

export async function getPluginConfig(command) {
  const plugin = getCommandPlugin(command);
  return new PluginConfig(command.config.configDir, plugin.name);
}

export async function getTokenFromPluginConfig(command) {
  const pluginConfig = await getPluginConfig(command);
  const configData = await pluginConfig.getConfig();

  if (configData.swoogoToken) {
    return configData.swoogoToken;
  } else {
    return null;
  }
}

export async function setTokenInPluginConfig(command, swoogoToken) {
  const pluginConfig = await getPluginConfig(command);
  await pluginConfig.setConfig({ swoogoToken });
}

export function openSignalWebsiteAndStartServer(command) {
  openBrowserUrl(config.signalAuthPageUrl);
  return startServer(command);
}

export function startServer(command) {
  const app = express();

  app.get('/auth', async function (req, res) {
    const token = req.query.accessToken;
    await setTokenInPluginConfig(command, token);

    res.send('You may now close this tab.');
  });

  const port = 21476;

  return app.listen(port);
}
