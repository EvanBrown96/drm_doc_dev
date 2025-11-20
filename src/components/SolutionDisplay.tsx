import type { Solution } from "../types/types";
import { InputSlider } from "./InputSlider";
import { useCallback, useState } from "react"
import { getItem, setItem } from "../persist";

const DEFAULT_DISPLAY = 5;

function SolutionDisplay({solutions}: {solutions: Solution[]}) {

    let [max_display, setMaxDisplay] = useState(getItem("max_display", DEFAULT_DISPLAY));

    const setMaxDisplayCallback = useCallback(event => {
        setMaxDisplay(Number(event.target.value));
        setItem("max_display", Number(event.target.value));
    }, []);

    let solution_elements = solutions.filter(s => s.length <= max_display).map(s => <p>{s.solution}</p>)

    if(solution_elements.length < 1 && solutions.length > 0) {
        solution_elements = [<p className="text-red-500">{solutions[0].solution}</p>]
    }

    return <>
        <div className="flex flex-col items-center space-y-4">
            <InputSlider label="Max Display" start={1} end={7} defaultValue={max_display} onChange={setMaxDisplayCallback}></InputSlider>
            <div className="overflow-auto">
                {solution_elements}
            </div>
        </div>
    </>
}

export { SolutionDisplay };