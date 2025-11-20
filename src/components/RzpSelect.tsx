import { RZPs } from '../constants.js';
import { useAppDispatch } from '../app_context/AppContext.jsx';

function RzpSelect({ defaultValue, includeAll = false }) {
    const app_dispatch = useAppDispatch();

    function updateStateWithDrm(new_drm) {
        app_dispatch({
            type: 'set_training_params',
            settings: {
                drm: new_drm
            }
        })
    }
    
    let selection = RZPs.map(r =>r);
    if(includeAll) selection.push("all")
    return <select defaultValue={defaultValue} onChange={(event) => updateStateWithDrm(event.target.value)}>
        {selection.map(r => <option className="text-zinc-800" key={r}>{r}</option>)}
    </select>
}

export { RzpSelect };