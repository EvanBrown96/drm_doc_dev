import { useState } from 'react';

function CheckBox({label, defaultValue, onChange}) {

    let onChange2 = (event) => {
        onChange(event);
    }

    return (
        <div className="w-full flex flex-row justify-between space-x-4">
            <div>{label}</div>
            <input type="checkbox" defaultChecked={defaultValue} onChange={onChange2} />
        </div>)

}

export { CheckBox };
