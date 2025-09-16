
import { DrmLoader } from './data_fetch';

const loader = new DrmLoader();
    
onmessage = async (msg) => {
    let drms = msg.data.drms;
    const already_loaded = await loader.getLoadedDrms();
    console.log("loaded drms: " + already_loaded);

    const old_versions = await loader.getVersionData();
    if(!old_versions) console.log("no previous version information found");
    const versions = await loader.populateVersionData();

    for(let drm of drms) {
        try {
            if(!already_loaded.includes(drm) || !old_versions || versions[drm] > old_versions[drm]) 
                await loader.populateDrmData(drm);
            self.postMessage({"drm": drm, "status": "success"})
        }
        catch(e) {
            console.log("data fetch worker failed" + e)
            self.postMessage({"drm": drm, "status": "failure"})
        }
    }
}