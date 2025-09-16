
import { DrmLoader } from './data_access/data_fetch';

const loader = new DrmLoader();
    
onmessage = async (msg) => {
    let drms = msg.data.drms;
    const already_loaded = await loader.getLoadedDrms();
    console.log("loaded drms: " + already_loaded);
    for(let drm of drms) {
        try {
            if(!already_loaded.includes(drm)) await loader.populateDrmData(drm);
            self.postMessage({"drm": drm, "status": "success"})
        }
        catch(e) {
            console.log("data fetch worker failed" + e)
            self.postMessage({"drm": drm, "status": "failure"})
        }
    }
}