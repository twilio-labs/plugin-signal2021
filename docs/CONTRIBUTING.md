# Contributing to this plugin development

## Setup up for development

To set up the project for the first time, clone the repo and install dependencies:

```bash
git@github.com:twilio-labs/plugin-signal2021.git
cd plugin-signal2021
npm install
```

To build the plugin distribution, run:

```bash
npm run build
```

To run plugin commands with your local build for testing, use:

```bash
./bin/run <command>
```

You can automatically re-build the plugin upon source code changes by running the `watch` script in the background while you develop:

```bash
npm run dev
```

## Use an alternate API endpoint for testing

For development purposes, you may wish to point the plugin at an alternate Signal API URL, by setting the `SIGNAL_API_URL` variable in the `.env` file.

## Skip authentication flow during testing

During testing you'll likely want to skip the interactive authentication prompts. You can provide a set of hardcoded credentials in the `.env` file and load them by using this demo script to run the app:

```
npm run demo
```

## Debug logging

Since the UI takes the entire screen it hides errors and `console.*` statements. If you need to see them run:

```
DEBUG_SIGNAL=* npm run demo
```

During the execution any logs are written to `$TMPDIR/twilio-signal-dev-mode.log`. **The file is overriden at every execution**.
Change the log level using the `-l debug` flag.

For a better readibility of the logs, use [pino-pretty](https://npm.im/pino-pretty):

```bash
tail -f $TMPDIR/twilio-signal-dev-mode.log | npx pino-pretty
```

You'll have to re-run the command between executions.

## Releasing for maintainers
```
git commit
npm version patch|minor|major
npm publish
git push origin main --tags
```
