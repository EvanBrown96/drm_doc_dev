import { StandardTrainerAction, StandardTrainerState } from './standard/app_state';
import { DiscardTrainerState, DiscardTrainerAction } from './discard/app_state';

export type AppState = SetupState | StandardTrainerState | DiscardTrainerState;

export type GlobalSettings = {
    timer_enabled: boolean
};

export interface GenericState {
    state: string,
    substate: string,
    global_settings: GlobalSettings
}

export interface SetupState extends GenericState {
    state: 'setup',
    substate: 'initializing'
}

export type AppStateAction =
  { type: 'finished_init' }
| { type: 'reset' }
| { type: 'switch_trainer', trainer: string}
| StandardTrainerAction | DiscardTrainerAction;

function setupState(settings: GlobalSettings): SetupState {
    return {state: 'setup', substate: 'initializing', global_settings: settings};
}

export { setupState };