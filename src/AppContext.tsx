import { useReducer, createContext, useContext, useEffect } from 'react';
import { useDb } from './db';
import { useCubelib } from './cubelib_loader';
import type { Case } from './types';
import { gen_setup } from "./cube_functions"

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

    const [state, dispatch] = useReducer(stateReducer, initialAppState());

    useEffect(() => {
        if(state.state[0] == 'training') {
            if(state.state[1] == 'loading_data') {
                (async () => {
                    const training_data = await getCases(
                        state.training_parameters.drm, 
                        state.training_parameters.min_trigger, 
                        state.training_parameters.max_length, 
                        state.training_parameters.min_trigger, 
                        state.training_parameters.max_trigger
                    );
                    dispatch({type: "data_loaded", data: training_data});
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


function initialAppState(): AppState {
    return {
        training_parameters: {
            drm: "4c4e",
            max_length: 5,
            max_trigger: 4,
            min_trigger: 1,
            max_display: 6
        },
        state: ['setup', 'initializing']
    }
}

type AppStateValue = ['setup', 'initializing'] | ['training', 'idle' | 'loading_data' | 'awaiting_case' | 'training' | 'showing_solution']

type AppState = { 
    training_parameters: TrainingParameters,
    state: AppStateValue,
    current_training?: {case: Case, setup: string},
    training_cases?: Case[],
    queue?: {
        time_since_queue: number,
        queued: Case[]
    }
};

export type TrainingParameters = {
    drm: string,
    max_length: number,
    max_trigger: number,
    min_trigger: number,
    max_display: number
};

type AppStateAction =
  { type: 'finished_init' }
| { type: 'set_training_params', settings: Partial<TrainingParameters> }
| { type: 'reset' }
| { type: 'data_loaded', data: Case[] }
| { type: 'set_training_case', case: Case, setup: string }
| { type: 'see_solutions' }
| { type: 'set_random_case' }
| { type: 'queue_case' };

function stateReducer(app_state: AppState, action: AppStateAction): AppState {
    switch(app_state.state[0]) {
        case 'setup':
            switch(action.type) {
                case 'finished_init':
                    return {
                        ...app_state,  
                        state: ['training', 'idle']
                    }
                case 'reset':
                    return initialAppState();
            }
            throw Error("invalid app state");
        case 'training':
            switch(action.type) {
                case 'set_training_params':
                    return {
                        ...app_state,
                        state: ['training', 'idle'],
                        training_parameters: {
                            ...app_state.training_parameters,
                            ...action.settings
                        },
                        queue: undefined
                    }
                case 'data_loaded':
                    return assignRandomCase({...app_state, training_cases: action.data});
                case 'set_random_case':
                    console.log(app_state.queue);
                    if(app_state.state[1] == 'idle')
                        return {
                            ...app_state,
                            state: ['training', 'loading_data']
                        }
                    else
                        if(app_state.queue) {
                            let time_since_queue = app_state.queue.time_since_queue;
                            if(Math.random() * 64 < Math.pow(2, time_since_queue)) {
                                let new_queue = {time_since_queue: 0, queued: [...app_state.queue.queued]}
                                let case_to_train = new_queue.queued.splice(Math.floor(Math.random()*new_queue.queued.length), 1)[0];
                                new_queue.time_since_queue = 0;
                                if(new_queue.queued.length < 1) new_queue = undefined;
                                return {
                                    ...app_state,
                                    state: ['training', 'training'],
                                    current_training: {case: case_to_train, setup: gen_setup(case_to_train)},
                                    queue: new_queue
                                };
                            }
                            time_since_queue += 1;
                            app_state = {...app_state, queue: {...app_state.queue, time_since_queue}};
                        }
                        return assignRandomCase(app_state);
                case 'queue_case':
                    let last_case = app_state.current_training.case;
                    let assigned_random_case = stateReducer(app_state, {type: 'set_random_case'});

                    let new_queue: {queued: Case[], time_since_queue: number};
                    if(assigned_random_case.queue) new_queue = {...assigned_random_case.queue, queued: [...assigned_random_case.queue.queued]};
                    else new_queue = {queued: [], time_since_queue: 0};
                    new_queue.queued.push(last_case);
                    return {
                        ...assigned_random_case,
                        queue: new_queue
                    }
                case 'set_training_case':
                    return {
                        ...app_state,
                        state: ['training', 'training'],
                        current_training: {case: action.case, setup: action.setup}
                    }
                case 'see_solutions':
                    return {
                        ...app_state,
                        state: ['training', 'showing_solution']
                    }
            };
            throw Error("invalid app state")
    }
}

function assignRandomCase(app_state): AppState {
    let rand_case = app_state.training_cases[Math.floor(Math.random()*app_state.training_cases.length)];
    let setup = gen_setup(rand_case);
    return {
        ...app_state,
        state: ['training', 'training'],
        current_training: {case: rand_case, setup: setup}
    };
}

function useAppStateFull(): AppState {
    return useContext(AppStateContext);
}

function useTrainingParams(): TrainingParameters {
    return useAppStateFull().training_parameters;
}

function useAppState(): AppStateValue {
    return useAppStateFull().state;
}

function useAppDispatch () {
    return useContext(AppDispatchContext);
}


function useDispatchRandomCase(): () => undefined {
    let dispatch = useAppDispatch();
    return () => {
        dispatch({type: 'set_random_case'})
    }
}

function useDispatchQueueCase(): () => undefined {
    let dispatch = useAppDispatch();
    return () => {
        dispatch({type: 'queue_case'})
    }
}

function useCurrentTraining(): null | {case: Case, setup: string} {
    let app_state = useAppStateFull();
    if(app_state.state[0] != "training" || app_state.state[1] == "idle") return null;
    return app_state.current_training;
}

export { AppContextProvider, useAppStateFull, useTrainingParams, useAppState, useAppDispatch, useDispatchRandomCase, useDispatchQueueCase, useCurrentTraining };
