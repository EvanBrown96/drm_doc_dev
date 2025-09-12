import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Cube from 'cubejs'
import { RzpSelect } from './RzpSelect'
import { useAppState, useAppDispatch, useTrainingParams, useDispatchRandomCase, useDispatchQueueCase, useCurrentTraining } from './AppContext'
import { InputSlider } from './InputSlider'
import { ScrambleDisplayFrame } from './ScrambleDisplayFrame'
import { SolutionDisplay } from './SolutionDisplay'

function App() {

  const state = useAppState();
  const dispatch = useAppDispatch();
  const training_params = useTrainingParams();
  const dispatchRandomCase = useDispatchRandomCase();
  const dispatchQueueCase = useDispatchQueueCase();
  const currentTraining = useCurrentTraining();
  
  let training_display, training_controls, training_text;
  let bottom_panes = <SolutionDisplay solutions={[]}></SolutionDisplay>;

  if(state[0] == 'setup') {
    training_display = <></>
    training_text = "Loading..."
    training_controls = <>
        <button className="btn disabled">New Case</button>
    </>
  } else {
    let training_setup = "";
    if(state[1] == "idle") {
      training_text = "Click to start training..."
      training_controls = <button className="btn" onClick={dispatchRandomCase}>New Case</button>
    }
    else if(state[1] == "loading_data") {
      training_text = "Loading cases..."
      training_controls = <button className="btn disabled">See Solutions</button>
    }
    else if(state[1] == "awaiting_case") {
      training_text = "...";
      training_controls = <button className="btn disabled">See Solutions</button>
    }
    else if(state[1] == "training") {
      training_setup = currentTraining.setup;
      training_text = training_setup;
      training_controls = <button className="btn" onClick={() => dispatch({type: 'see_solutions'})}>See Solutions</button>
    }
    else if(state[1] == "showing_solution") {
      training_setup = currentTraining.setup;
      training_text = training_setup;
      training_controls = <div className="flex flex-row space-x-4">
        <button className="btn" onClick={dispatchRandomCase}>New Case</button>
        <button className="btn" onClick={dispatchQueueCase}>Queue</button>
      </div>;
      bottom_panes = <SolutionDisplay solutions={currentTraining.case.solutions}></SolutionDisplay>;
    }

    training_display = <ScrambleDisplayFrame scramble={training_setup}></ScrambleDisplayFrame>
  }

  //   else if(state[1] == "showing_solution") {
  //     training_controls = <>
  //       <button className="text-zinc-800 bg-zinc-100" onClick={dispatchRandomCase}>New Case</button>
  //       <div className="h-60 overflow-auto w-1/2">
  //         {currentTraining.case.solutions.filter(s => s.length <= training_params.max_display).map(s => <p>{s.solution}</p>)}
  //       </div>
  //     </>
  //   }

  return (
    <>
      <div className="flex flex-col justify-between h-screen">
      <div className="drawer drawer-end">
        <input id="settings-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="navbar w-screen bg-base-100 shadow-sm">
            <div className="navbar-start">
              {/* <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                  <li><a>DRM Trainer</a></li>
                  <li><a>Soon?</a></li>
                </ul>
              </div> */}
            </div>
            <div className="navbar-center">
              <a className="btn btn-ghost text-xl">drm doc</a>
            </div>
            <div className="navbar-end">
              
              <label htmlFor="settings-drawer" className="btn btn-ghost btn-circle drawer-button">
                <div className="indicator">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 -960 960 960" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5-2-31.5-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266zm42-180q58 0 99-41t41-99-41-99-99-41q-59 0-99.5 41T342-480t40.5 99 99.5 41m-2-140"/></svg>
                  {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg> */}

                </div>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            {training_display}
            {training_text}
            {training_controls}
            <div className="divider"></div>
            {bottom_panes}
          </div>

        </div>
        <div className="drawer-side">
          <label htmlFor="settings-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
            <div className="flex flex-col items-center w-full space-y-4">
              <RzpSelect defaultValue={training_params.drm}></RzpSelect>
              <InputSlider label="Max Optimal" start={1} end={7} defaultValue={training_params.max_length} onChange={(event) => dispatch({type: 'set_training_params',
                    settings: {
                        max_length: event.target.value
                    }})}></InputSlider>
              <InputSlider label="Max Trigger" start={1} end={6} defaultValue={training_params.max_trigger} onChange={(event) => dispatch({type: 'set_training_params',
                    settings: {
                        max_trigger: event.target.value
                    }})}></InputSlider>
              <InputSlider label="Min Trigger" start={1} end={6} defaultValue={training_params.min_trigger} onChange={(event) => dispatch({type: 'set_training_params',
                    settings: {
                        min_trigger: event.target.value
                    }})}></InputSlider>
            </div>
          </ul>
        </div>
      </div>
      <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
          <p>v0.2</p>
        </aside>
      </footer>
      </div>
    </>
  )
  
}

export { App };
