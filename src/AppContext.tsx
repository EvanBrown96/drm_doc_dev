import { useReducer, createContext, useContext, useEffect } from 'react';
import { useDb } from './db';
import { useCubelib } from './cubelib_loader';
import type { Case } from './types';
import Cube from 'cubejs';

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
            else if(state.state[1] == "awaiting_case") {
                let rand_case = state.training_cases[Math.floor(Math.random()*state.training_cases.length)];
                let scramble = rand_case.solutions[0].solution + " " + randomDrState();
                const cube = new Cube();
                cube.move(scramble)
                let solution = cube.solve()
                dispatch({type: 'set_training_case',
                    case: rand_case,
                    setup: solution
                })
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
    training_cases?: Case[]
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
| { type: 'set_random_case' };

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
                        }
                    }
                case 'data_loaded':
                    return {
                        ...app_state,
                        state: ['training', 'awaiting_case'],
                        training_cases: action.data,
                        current_training: undefined
                    }
                case 'set_random_case':
                    if(app_state.state[1] == 'idle')
                        return {
                            ...app_state,
                            state: ['training', 'loading_data'],
                        }
                    else
                        return {
                            ...app_state,
                            state: ['training', 'awaiting_case'],
                        }
                case 'set_training_case':
                    console.log("training case set")
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


function useAppStateFull(): AppState {
    return useContext(AppStateContext);
}

function useTrainingParams(): TrainingParameters {
    return useAppStateFull().training_parameters;
}

function useAppState(): AppStateValue {
    console.log(AppStateContext);
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

function randomDrState() {
    // too lazy to implement proper scrambler so random moves yay
    let qt = ["U", "U'", "D", "D'"]
    let ht = ["F2", "B2", "R2", "L2"]
    let moves = []
    for(let i = 0; i < 250; i++) {
        moves.push(qt[Math.floor(Math.random()*qt.length)]);
        moves.push(ht[Math.floor(Math.random()*ht.length)]);
    }
    return moves.join(" ")
}

function invert(scramble) {
    let moves = scramble.split(" ").reverse()
    let moves_out = []
    for(let m of moves) {
        if(m[-1] == "2") moves_out.push(m);
        else if(m[-1] == "'") moves_out.push(m[0]);
        else moves_out.push(m + "'")
    }
    return moves_out.join(" ")
}

function useCurrentTraining(): null | {case: Case, setup: string} {
    let app_state = useAppStateFull();
    if(app_state.state[0] != "training" || app_state.state[1] == "idle") return null;
    return app_state.current_training;
}

export { AppContextProvider, useAppStateFull, useTrainingParams, useAppState, useAppDispatch, useDispatchRandomCase, useCurrentTraining };
