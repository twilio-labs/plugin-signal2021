import got from 'got';
import { useEffect, useState } from 'react';
import semverGt from 'semver/functions/gt';

/* eslint-disable @typescript-eslint/no-var-requires */
/// @ts-ignore
const pkgJson = require('../../package.json');

async function fetchLatestVersion(): Promise<string> {
  try {
    const resp = got(
      'https://unpkg.com/@twilio-labs/plugin-signal2021/package.json'
    );
    const { version } = await resp.json();
    return version;
  } catch (err) {
    return;
  }
}

export type VersionCheckResult = {
  current: string;
  latest?: string;
  updateAvailable: boolean | null;
};
export function useVersionCheck(): VersionCheckResult {
  const [latestVersion, setLatestVersion] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    fetchLatestVersion().then(setLatestVersion);
  }, []);

  const updateAvailable = latestVersion
    ? semverGt(latestVersion, pkgJson.version)
    : null;

  return {
    current: pkgJson.version,
    latest: latestVersion,
    updateAvailable: updateAvailable,
  };
}
