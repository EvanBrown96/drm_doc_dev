import { useRef, useEffect } from 'react';
import FetchWorker from './fetch_worker.ts?worker';
import { RZPs } from '../constants';
import { DrmLoader } from './data_fetch';

import type {Solution, Case} from '../types/types';

function useDb(){

    const loaded: React.RefObject<string[]> = useRef([]);
    const drm_loader: React.RefObject<DrmLoader> = useRef(null);
    
    useEffect(() => {
        drm_loader.current = new DrmLoader();
        let worker = new FetchWorker();
        worker.postMessage({"drms": RZPs})
        worker.onmessage = (event) => {
            loaded.current.push(event.data.drm);
        }
        return () => {
            worker.terminate();
            loaded.current = [];
        }
    }, []);

    async function getCases(rzp: string, min_length: number, max_length: number, min_trigger: number, max_trigger: number, eo_breaking: boolean): Promise<Case[]> {
        if(rzp == "all") {
            let cases: Case[] = [];
            for(let r of RZPs){
                cases = cases.concat(await getCases(r, min_length, max_length, min_trigger, max_trigger, eo_breaking));
            }
            return cases;
        }
        if(!loaded.current.includes(rzp)) {

            let worker = new FetchWorker();
            worker.postMessage({"drms": [rzp]});
            await new Promise((resolve, reject) => {
                worker.onmessage = event => {
                    if(event.data.status == "success") resolve(event.data.drm);
                    else reject(event.data.error);
                }
            })
            loaded.current.push(rzp);
            worker.terminate()
        }

        let data = await drm_loader.current.getDrmData(rzp);

        let matching_solns: Solution[] = data.solutions.filter(s => {
            if(s["length"] > max_length) return false;
            if(s["eo_breaking"] && !eo_breaking) return false;
            if(!s["eo_breaking"]) {
                if(s["trigger"] > max_trigger) return false;
                if(s["trigger"] < min_trigger) return false;
            }
            if(s["length"] < min_length) return false;
            return true;
        })

        return [...new Set(matching_solns.map(s => data["cases"][s["caseId"]]))]
    }

    return {getCases};

}

export { useDb };