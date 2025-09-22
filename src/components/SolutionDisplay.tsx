import type { Solution } from "../types/types";
import { InputSlider } from "./InputSlider";
import { useState } from "react"

const DEFAULT_DISPLAY = 5;

function SolutionDisplay({solutions}: {solutions: Solution[]}) {

    let [max_display, setMaxDisplay] = useState(DEFAULT_DISPLAY);

    return <>
        <div className="flex flex-col items-center space-y-4">
            <InputSlider label="Max Display" start={1} end={7} defaultValue={max_display} onChange={event => setMaxDisplay(Number(event.target.value))}></InputSlider>
            <div className="overflow-auto">
                {solutions.filter(s => s.length <= max_display).map(s => <p>{s.solution}</p>)}
            </div>
        </div>
    </>
}

export { SolutionDisplay };