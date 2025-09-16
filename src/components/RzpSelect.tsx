import { RZPs } from '../constants.js';
import { useAppDispatch } from '../AppContext.jsx';

function RzpSelect({ defaultValue }) {
    const app_dispatch = useAppDispatch();

    function updateStateWithDrm(new_drm) {
        app_dispatch({
            type: 'set_training_params',
            settings: {
                drm: new_drm
            }
        })
    }

    return <select defaultValue={defaultValue} onChange={(event) => updateStateWithDrm(event.target.value)}>
        {RZPs.map(r => <option className="text-zinc-800" key={r}>{r}</option>)}
    </select>
}

export { RzpSelect };