import { Key, useApp, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { ValueOf } from 'type-fest';
import { useMode } from '../context/mode';
import { ModeEvents } from '../machines/modeMachine';

const hotKeyMap: { [key: string]: ValueOf<typeof ModeEvents> } = {
  s: ModeEvents.showSchedule,
  q: ModeEvents.exit,
  r: ModeEvents.showResources,
  d: ModeEvents.showDemos,
  c: ModeEvents.showChat,
  // t: ModeEvents.showTest,
  w: ModeEvents.showWelcome,
  b: ModeEvents.toggleSideBar,
  ['?']: ModeEvents.toggleSideBar,
};

export function ModeSwitcher() {
  const { exit } = useApp();
  const { state, dispatch } = useMode();
  const [currentCodeInput, setCurrentCodeInput] = useState('');

  useInput((input, key) => {
    if (state.matches('captureInput.on')) {
      if (hotKeyMap[input]) {
        dispatch({ type: hotKeyMap[input] });
      }
    }
  });

  useEffect(() => {
    if (state.matches('mainPane.exit')) {
      exit();
    }
  }, [state.value]);

  return null;
}
