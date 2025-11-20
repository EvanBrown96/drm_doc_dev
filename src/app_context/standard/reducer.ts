import type { Case } from '../../types/types';
import { StandardTrainer, updateTrainingParams, StandardTrainerState } from './app_state';
import { AppState, AppStateAction } from '../common_app_state'
import { setItem } from '../../persist';



function standardStateReducer(app_state: StandardTrainerState, action: AppStateAction): AppState {
    switch(action.type) {
        case 'set_training_params':
            const new_state = StandardTrainer.IdleState(app_state, updateTrainingParams(app_state.training_parameters, action.settings));
            setItem("standard_params", new_state.training_parameters);
            return new_state;
        case 'data_loaded':
            return assignRandomCase({...app_state, training_cases: action.data});
        case 'new_case':
            if(app_state.substate == 'idle') return StandardTrainer.LoadingState(app_state);
            else
                if(app_state.queue.queued.length > 0) {
                    let time_since_queue = app_state.queue.time_since_queue;
                    if(Math.random() * 64 < Math.pow(2, time_since_queue)) {
                        let new_queue = {time_since_queue: 0, queued: [...app_state.queue.queued]}
                        let case_to_train = new_queue.queued.splice(Math.floor(Math.random()*new_queue.queued.length), 1)[0];
                        new_queue.time_since_queue = 0;
                        return StandardTrainer.TrainingState(app_state, case_to_train, new_queue);
                    }
                    time_since_queue += 1;
                    app_state = {...app_state, queue: {...app_state.queue, time_since_queue}};
                }
                return assignRandomCase(app_state);
        case 'queue_case':
            let last_case = app_state.current_training.case;
            let assigned_random_case = assignRandomCase(app_state);

            let new_queue = {...assigned_random_case.queue, queued: [...assigned_random_case.queue.queued]};
            new_queue.queued.push(last_case);
            return { 
                ...assigned_random_case,
                queue: new_queue
            }
        case 'see_solutions':
            return StandardTrainer.SolutionsState(app_state);
        case 'invalid_settings':
            return StandardTrainer.InvalidSettingsState(app_state);
    };
    throw Error("invalid app state")
}


function assignRandomCase(app_state: StandardTrainerState): StandardTrainerState {
    let rand_case = app_state.training_cases[Math.floor(Math.random()*app_state.training_cases.length)];
    return StandardTrainer.TrainingState(app_state, rand_case)
}

export { standardStateReducer };
