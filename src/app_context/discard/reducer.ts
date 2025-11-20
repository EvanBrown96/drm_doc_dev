import type { Case } from '../../types/types';
import { AppState, AppStateAction } from '../common_app_state';
import { DiscardTrainer, DiscardTrainerState, DiscardMetadataCase, updateDiscardTrainingParams, ZERO_STATS } from './app_state'
import { getItem, setItem } from '../../persist';


function discardStateReducer(app_state: DiscardTrainerState, action: AppStateAction): AppState {
    console.log(action.type);
    switch(action.type) {
        case 'set_training_params':
            const new_state = DiscardTrainer.IdleState(app_state, updateDiscardTrainingParams(app_state.training_parameters, action.settings));
            setItem("discard_params", new_state.training_parameters);
            return new_state;
        case 'discard_data_loaded':
            return assignRandomCase({...app_state, good_cases: action.good_cases, bad_cases: action.bad_cases});
        case 'new_case':
            if(app_state.substate == 'idle') return DiscardTrainer.LoadingState(app_state);
            else
                if(app_state.queue.queued.length > 0) {
                    let time_since_queue = app_state.queue.time_since_queue;
                    if(Math.random() * 64 < Math.pow(2, time_since_queue)) {
                        let new_queue = {time_since_queue: 0, queued: [...app_state.queue.queued]}
                        let case_to_train = new_queue.queued.splice(Math.floor(Math.random()*new_queue.queued.length), 1)[0];
                        new_queue.time_since_queue = 0;
                        return DiscardTrainer.TrainingState(app_state, case_to_train, new_queue);
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
        case 'guess_yes': {
            if(app_state.current_training.case.solutions[0].length <= app_state.training_parameters.max_length) {
                let statistics = { ...app_state.statistics, total_good: app_state.statistics.total_good + 1 };
                setItem('discard_stats', statistics);
                return DiscardTrainer.CorrectChoiceState(app_state, statistics);
            }

            let statistics = { ...app_state.statistics, total_bad: app_state.statistics.total_bad + 1, false_positive: app_state.statistics.false_positive + 1}
            setItem('discard_stats', statistics);
            return DiscardTrainer.IncorrectChoiceState(app_state, statistics);
        }
        case 'guess_no': {
            if(app_state.current_training.case.solutions[0].length > app_state.training_parameters.max_length) {
                let statistics = { ...app_state.statistics, total_bad: app_state.statistics.total_bad + 1 };
                setItem('discard_stats', statistics);
                return DiscardTrainer.CorrectChoiceState(app_state, statistics);
            }

            let statistics = { ...app_state.statistics, total_good: app_state.statistics.total_good + 1, false_negative: app_state.statistics.false_negative + 1}
            setItem('discard_stats', statistics);
            return DiscardTrainer.IncorrectChoiceState(app_state, statistics);
        }
        case 'reset_stats': {
            setItem('discard_stats', ZERO_STATS);
            return {...app_state, statistics: ZERO_STATS};
        }
        case 'invalid_settings':
            return DiscardTrainer.InvalidSettingsState(app_state);
    };
    throw Error("invalid app state")
}


function assignRandomCase(app_state: DiscardTrainerState): DiscardTrainerState {
    let choose_good_case = (Math.random() * 100 < app_state.training_parameters.good_case_ratio);
    let case_data: Case[];
    if(choose_good_case) case_data = app_state.good_cases;
    else                 case_data = app_state.bad_cases;
    let rand_case = case_data[Math.floor(Math.random()*case_data.length)];
    return DiscardTrainer.TrainingState(app_state, {...rand_case, is_good: choose_good_case})
}


export { discardStateReducer };
