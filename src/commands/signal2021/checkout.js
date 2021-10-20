const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { handler } = require('create-twilio-function/src/command');
const { computeDiagnostics } = require('../../utils/diagnostics');
import chalk from 'chalk';
import got from 'got';
import path from 'path';
import logSymbols from 'log-symbols';
import config from '../../utils/config';
import { download, getAndCreateDirectory } from '../../utils/installer';
import { openBrowserUrl } from '../../utils/openLink';

class Signal2021CheckoutCommand extends TwilioClientCommand {
  static args = [
    {
      name: 'sha',
      required: false,
      description: 'The hash of the item you wish to check out',
    },
  ];

  static flags = {
    log: {
      char: 'l',
      default: false,
      description: 'List information about all available hashes.'
    }
  }

  async catch(error) {
    console.error(error)
  }

  async run() {
    const { args, flags } = this.parse(Signal2021CheckoutCommand);

    await super.run();

    let checkoutData;
    try {
      const hashesUrl = `${config.developerModeApi}/hashes`;
      const { body } = await got.get(hashesUrl, {
        responseType: 'json',
      });
      checkoutData = body;
    } catch (err) {
      this.logger.error(`Failed to fetch hash data: ${err.message}`);
      process.exit(1);
    }

    if (flags.log) {
      console.log(renderAllHashes(checkoutData.hashes));
      process.exit(0);
    }

    if (args.sha in checkoutData.hashes) {
      const hashData = checkoutData.hashes[args.sha];
      this.logger.info(chalk`Checking out {blue.bold ${args.sha}} - ${hashData.name} {dim - ${hashData.description}}`);
      try {
        await handleGitHubItem(hashData.items, this);
        await handleFunctionsTemplateItem(hashData.items, this);
        await handleBrowserItems(hashData.items, this);
        this.logger.info(chalk`{green.bold ${logSymbols.success} Checkout complete!} Good luck; have fun.`);
      } catch (err) {
        this.logger.error(chalk`{red.bold ${logSymbols.error} Checkout failed:} ${err.message}`);
        process.exit(1);
      }
    } else {
      this.logger.error(
        // this is a joke about git, in case it isn't clear
        `error: pathspec '${args.sha}' did not match any file(s) known to twilio CLI`
      );
      process.exit(1);
    }
  }
}

async function handleBrowserItems(items, command) {
  const browserItems = items.filter((i) => {
    return i.type == 'browser';
  });

  if (browserItems.length) {
    const urlsToOpen = browserItems.map((i) => {
      return i.url;
    });

    let urlsPrompt = chalk`{bold.magenta The following URLs will be openened in your browser:}`;

    for (var url of urlsToOpen) {
      urlsPrompt += '\n  * ' + url;
    }

    console.log(urlsPrompt);

    const { userWantsToOpenUrls } = await command.inquirer.prompt([
      {
        type: 'confirm',
        name: 'userWantsToOpenUrls',
        message: `Do you want to proceed. Press 'n' to skip.`,
      },
    ]);

    if (userWantsToOpenUrls) {
      for (var url of urlsToOpen) {
        await openBrowserUrl(url);
      }
    }
  }
}

async function handleGitHubItem(items, command) {
  const gitHubItem = items.find((i) => {
    return i.type == 'github';
  });

  if (gitHubItem) {
    let openInBrowser = false;
    const diagnostics = computeDiagnostics(command);
    if (!diagnostics.hasGit) {
      const openInBrowserPrompt = chalk`{yellow ${logSymbols.warning} We could not find git on your system.} We can open the repository for editing on https://github.dev instead.`;
      openInBrowser = await command.inquirer.prompt([
        {
          type: 'confirm',
          name: 'openInBrowser',
          message: `Would you like to proceed? Press 'n' to skip.`,
        },
      ]);
    }

    if (openInBrowser) {
      const url = `https://github.dev/${gitHubItem.repo}`;
      await openBrowserUrl(url);
      return;
    }

    command.logger.info(chalk`Cloning GitHub repository {bold ${gitHubItem.repo}}`);

    const defaultDirectory = gitHubItem.repo.split('/')[1];

    const { downloadDirectory } = await command.inquirer.prompt([
      {
        type: 'input',
        name: 'downloadDirectory',
        message: 'Please enter a destination directory: ',
        default: defaultDirectory,
      },
    ]);

    const downloadPath = path.resolve(process.cwd(), downloadDirectory);
    const getDirectoryResults = await getAndCreateDirectory(downloadPath);
    for (var line of getDirectoryResults['output']) {
      command.logger.info(line);
    }

    const downloadResults = await download(gitHubItem.repo, downloadPath, {
      branch: gitHubItem.branch,
    });
    for (var line of downloadResults['output']) {
      command.logger.info(line);
    }
  }
}

async function handleFunctionsTemplateItem(items, command) {
  const functionsTemplateItem = items.find((i) => {
    return i.type == 'functions-template';
  });

  if (functionsTemplateItem) {
    await handler({
      name: functionsTemplateItem.repo,
      path: process.cwd(),
      template: functionsTemplateItem.repo,
    });
  }
}

function renderAllHashes(hashes) {
  let text = chalk.dim('Pick any of the following seven-character hashes below and run:\n    $ twilio signal:checkout <hash>\n\n');
  for (const [hash, entry] of Object.entries(hashes)) {
    text += chalk`* {bold.blue ${hash}} - ${entry.name} {dim - ${entry.description}}\n`
    text += chalk`{green |\\ }\n`
    for (const item of entry.items) {
      if (item.type === 'browser') {
        text += chalk`{green | }* Open ${item.url} {bold.yellow (Browser)}\n`
      } else if (item.type === 'github') {
        text += chalk`{green | }* Clone ${item.repo}#${item.branch} {bold.yellow (GitHub)}\n`
      } else if (item.type === 'functions-template') {
        text += chalk`{green | }* Set up local Functions template ${item.repo} {bold.yellow (Functions)}\n`
      }
    }
    text += chalk`{green |/ }\n`
  }
  return text;
}

Signal2021CheckoutCommand.aliases = ['signal:checkout'];

module.exports = Signal2021CheckoutCommand;
