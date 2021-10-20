import { ValueOf } from 'type-fest';
import { assign, Machine } from 'xstate';
import { Demo, DemoOption } from '../types/demo';

export const ModeEvents = {
  showWelcome: 'SHOW_WELCOME',
  showResources: 'SHOW_RESOURCES',
  showSchedule: 'SHOW_SCHEDULE',
  showInstaller: 'SHOW_INSTALLER',
  showTest: 'SHOW_TEST',
  showDemos: 'SHOW_DEMOS',
  showChat: 'SHOW_CHAT',
  exitChat: 'EXIT_CHAT',
  exitInstaller: 'EXIT_INSTALLER',
  exit: 'EXIT',
  toggleInput: 'TOGGLE_INPUT',
  enableInput: 'ENABLE_INPUT',
  toggleSideBar: 'TOGGLE_SIDEBAR',
  finished: 'FINISHED',
};

type ModeEventTypes = ValueOf<typeof ModeEvents>;

const modeTransitions = {
  [ModeEvents.showWelcome]: '#mode.mainPane.welcome',
  [ModeEvents.showResources]: '#mode.mainPane.resources',
  [ModeEvents.showSchedule]: '#mode.mainPane.schedule',
  [ModeEvents.showInstaller]: {
    target: ['#mode.mainPane.installer', '#mode.captureInput.off'],
  },
  [ModeEvents.showTest]: '#mode.mainPane.test',
  [ModeEvents.showDemos]: '#mode.mainPane.demos',
  [ModeEvents.showChat]: {
    target: ['#mode.mainPane.chat', '#mode.captureInput.off'],
  },
  [ModeEvents.exit]: '#mode.mainPane.exit',
  [ModeEvents.enableInput]: '#mode.captureInput.on',
};

export interface ModeMachineContext {
  selectedDemo?: Demo & DemoOption;
}

export interface ModeMachineSchema {
  states: {
    captureInput: {
      states: {
        on: {};
        off: {};
      };
    };
    sideBar: {
      states: {
        visible: {};
        hidden: {};
      };
    };
    mainPane: {
      states: {
        welcome: {};
        resources: {};
        exit: {};
        schedule: {};
        chat: {};
        demos: {};
        installer: {};
        test: {};
      };
    };
  };
}

export type ShowInstallerEvent = { type: 'SHOW_INSTALLER'; data: Demo };

export type ModeMachineEvent =
  | {
      type: ModeEventTypes;
    }
  | ShowInstallerEvent;

// eslint-disable-next-line new-cap
export const modeMachine = Machine<
  ModeMachineContext,
  ModeMachineSchema,
  ModeMachineEvent
>({
  id: 'mode',
  type: 'parallel',
  context: {
    selectedDemo: undefined,
  },
  on: modeTransitions,
  states: {
    captureInput: {
      initial: 'on',
      states: {
        on: {
          [ModeEvents.toggleInput]: 'off',
        },
        off: {
          [ModeEvents.toggleInput]: 'on',
        },
      },
    },
    sideBar: {
      initial: 'visible',
      states: {
        visible: {
          on: {
            [ModeEvents.toggleSideBar]: 'hidden',
          },
        },
        hidden: {
          on: {
            [ModeEvents.toggleSideBar]: 'visible',
          },
        },
      },
    },
    mainPane: {
      initial: 'welcome',
      states: {
        welcome: {},
        resources: {},
        exit: {
          type: 'final',
        },
        schedule: {},
        demos: {},
        chat: {
          on: {
            [ModeEvents.exitChat]: {
              target: ['#mode.mainPane.welcome', '#mode.captureInput.on'],
            },
          },
        },
        installer: {
          entry: [
            assign({
              selectedDemo: (context, event: any) =>
                event?.data || context.selectedDemo,
            }),
          ],
          on: {
            [ModeEvents.finished]: {
              target: [
                '#mode.mainPane.installer',
                '#mode.captureInput.on',
                '#mode.sideBar.visible',
              ],
            },
            [ModeEvents.exitInstaller]: {
              target: ['#mode.mainPane.demos', '#mode.captureInput.on'],
            },
          },
        },
        test: {},
      },
    },
  },
});
