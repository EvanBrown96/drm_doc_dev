import { useState } from 'react';

function InputSlider({label, start, end, defaultValue, step=1, onChange}) {

    const [internal_value, set_internal] = useState(defaultValue);

    let onChange2 = (event) => {
        onChange(event);
        set_internal(event.target.value)
    }

    return (
        <div className="w-full flex flex-row justify-between space-x-4">
            <div>{label}</div>
            <input type="range" step={step} min={start} max={end} defaultValue={defaultValue} onChange={onChange2} />
            <div>{internal_value}</div>
        </div>)

}

export { InputSlider };
