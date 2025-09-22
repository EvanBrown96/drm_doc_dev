import { useReducer, createContext, useContext, useEffect } from 'react';
import { useDb } from './data_access/db';
import { useCubelib } from './cubelib_loader';
import type { Case } from './types/types';
import { gen_setup } from "./cube_functions"
import { AppState, AppStateAction, StandardTrainingParameters, StandardTrainer, setupState, updateTrainingParams, StandardTrainerState, SetupState } from './app_state';

let AppStateContext = createContext(null);
let AppDispatchContext = createContext(null);

function AppContextProvider({ children }) {

    let {getCases} = useDb();
    let {loaded: cubeLibLoaded} = useCubelib();

    useEffect(() => {
        if(!cubeLibLoaded) return;
        dispatch({type: 'finished_init'});
        return () => dispatch({type: 'reset'})
    }, [cubeLibLoaded]);

    const [state, dispatch] = useReducer(stateReducer, setupState());

    useEffect(() => {
        if(state.state == 'training') {
            if(state.substate == 'loading_data') {
                (async () => {
                    const training_data = await getCases(
                        state.training_parameters.drm, 
                        state.training_parameters.min_trigger, 
                        state.training_parameters.max_length, 
                        state.training_parameters.min_trigger, 
                        state.training_parameters.max_trigger
                    );
                    if(training_data.length < 1) dispatch({type: "invalid_settings"});
                    else dispatch({type: "data_loaded", data: training_data});
                })();
            }
        }
    });

    return (
        <AppStateContext value={state}>
            <AppDispatchContext value={dispatch}>
                {children}
            </AppDispatchContext>
        </AppStateContext>
    );
}


const DEFAULT_TRAINING: StandardTrainingParameters =
{
    drm: "4c4e",
    max_length: 5,
    max_trigger: 4,
    min_trigger: 1
};

function stateReducer(app_state: AppState, action: AppStateAction): AppState {
    switch(app_state.state) {
        case 'setup':
            return setupStateReducer(app_state, action);
        case 'training':
            return standardStateReducer(app_state, action);
    }
}

function setupStateReducer(app_state: AppState, action: AppStateAction): AppState {
    switch(action.type) {
        case 'finished_init':
            return StandardTrainer.IdleState(app_state, DEFAULT_TRAINING)
        case 'reset':
            return setupState();
    }
    throw Error("invalid app state");
}

function standardStateReducer(app_state: StandardTrainerState, action: AppStateAction): StandardTrainerState {
    switch(action.type) {
        case 'set_training_params':
            return StandardTrainer.IdleState(app_state, updateTrainingParams(app_state.training_parameters, action.settings));
        case 'data_loaded':
            return assignRandomCase({...app_state, training_cases: action.data});
        case 'new_case':
            if(app_state.substate == 'idle') return StandardTrainer.LoadingState(app_state);
            else
                if(app_state.queue) {
                    let time_since_queue = app_state.queue.time_since_queue;
                    if(Math.random() * 64 < Math.pow(2, time_since_queue)) {
                        let new_queue = {time_since_queue: 0, queued: [...app_state.queue.queued]}
                        let case_to_train = new_queue.queued.splice(Math.floor(Math.random()*new_queue.queued.length), 1)[0];
                        new_queue.time_since_queue = 0;
                        if(new_queue.queued.length < 1) new_queue = undefined;
                        return StandardTrainer.TrainingState(app_state, case_to_train, new_queue);
                    }
                    time_since_queue += 1;
                    app_state = {...app_state, queue: {...app_state.queue, time_since_queue}};
                }
                return assignRandomCase(app_state);
        case 'queue_case':
            let last_case = app_state.current_training.case;
            let assigned_random_case = assignRandomCase(app_state);

            let new_queue: {queued: Case[], time_since_queue: number};
            if(assigned_random_case.queue) new_queue = {...assigned_random_case.queue, queued: [...assigned_random_case.queue.queued]};
            else new_queue = {queued: [], time_since_queue: 0};
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


function assignRandomCase(app_state): StandardTrainerState {
    let rand_case = app_state.training_cases[Math.floor(Math.random()*app_state.training_cases.length)];
    return StandardTrainer.TrainingState(app_state, rand_case)
}

function useAppState(): AppState {
    return useContext(AppStateContext);
}

function useAppDispatch () {
    return useContext(AppDispatchContext);
}


function useDispatchNewCase(): () => undefined {
    let dispatch = useAppDispatch();
    return () => {
        dispatch({type: 'new_case'})
    }
}

function useDispatchQueueCase(): () => undefined {
    let dispatch = useAppDispatch();
    return () => {
        dispatch({type: 'queue_case'})
    }
}

export { AppContextProvider, useAppState, useAppDispatch, useDispatchNewCase, useDispatchQueueCase };
