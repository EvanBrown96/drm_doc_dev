import type { Solution, Case } from '../types/types';

function parseCaseData(case_data: string): {cases: Case[], solutions: Solution[]} {
    
    let text = case_data.split("\n")
    let cases: Case[] = [];
    let solutions: Solution[] = [];
    for(let i = 0; i < text.length; i++) {
        let line_data = text[i].split(",")
        if(line_data[0] == "case"){
            cases[parseInt(line_data[1])] = {
                id: parseInt(line_data[1]),
                rzp: line_data[2],
                arm: line_data[3],
                pairs: parseInt(line_data[4]),
                tetrad: line_data[5] == '' ? null : line_data[5],
                corners: line_data[6] == '' ? null : line_data[6],
                solutions: []
            }
        }
        else if(line_data[0] == "solution"){
            let soln = {
                "caseId": parseInt(line_data[1]),
                "length": parseInt(line_data[2]),
                "eo_breaking": (line_data[3] == "1"),
                "trigger": parseInt(line_data[4]),
                "solution": line_data[5]
            }
            solutions.push(soln)
            cases[parseInt(line_data[1])].solutions.push(soln)
        }
    }
    return {"cases": cases, "solutions": solutions};
}

async function readRzpData(rzp: string): Promise<{cases: Case[], solutions: Solution[]}> {
    let response = await fetch("/drm_doc/" + rzp + "_db_input.csv");
    return parseCaseData(await response.text());
}

async function readVersionData() {
    let response = await fetch("/drm_doc/versions.csv");
    let text = (await response.text()).split("\n");

    let versions = {};

    for(let i = 0; i < text.length; i++) {
        let line_data = text[i].split(",")
        versions[line_data[0]] = Number(line_data[1])
    }
    return versions;
}

const DB_PARAMS = {
    name: "drm",
    version: 3
};

async function connectToDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_PARAMS.name, DB_PARAMS.version);

        request.onupgradeneeded = (event) => {
            console.log("upgrading db")
            const database = request.result;
            if(event.oldVersion < 1) {
                console.log("upgrading to version 1");
                database.createObjectStore("drm_data", {'keyPath': 'drm'})
            }
            if(event.oldVersion < 3) {
                console.log("upgrading to version 3");
                database.createObjectStore("metadata", {'keyPath': 'meta_key'})
            }
        }

        request.onsuccess = () => {
            console.log("successfully connected to db");
            resolve(request.result)
        }

        request.onerror = () => {
            console.error("error initialized indexedDB:", request.error)
            reject(request.error)
        }

        request.onblocked = () => {
            console.error("db upgrade blocked")
            reject(request.error)
        }
    })
}

class DrmLoader {
    db: Promise<IDBDatabase> | null = null;

    async getDb() {
        if(!this.db) this.db = connectToDb();
        return this.db;
    }

    async populateDrmData(drm: string) {
        const db = await this.getDb();

        console.log("fetching " + drm + " from file");
        let drm_data = await readRzpData(drm);
        let transaction = db.transaction(["drm_data"], "readwrite");
        let drm_data_store = transaction.objectStore("drm_data");
        drm_data_store.add({"drm": drm, "data": drm_data});
        transaction.commit();
        return drm_data;
    
    }

    async populateVersionData(): Promise<Record<string, number>> {
        const db = await this.getDb();

        console.log("fetching version information from file");
        let version_data = await readVersionData();
        let transaction = db.transaction(["metadata"], "readwrite");
        let drm_data_store = transaction.objectStore("metadata");
        drm_data_store.put({"meta_key": "versions", "data": version_data});
        transaction.commit();
        return version_data;
    }

    async getLoadedDrms(): Promise<IDBValidKey[]> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            let transaction = db.transaction(["drm_data"], "readonly");
            let drm_data_store = transaction.objectStore("drm_data");
            let request = drm_data_store.getAllKeys();
            request.onerror = reject;
            request.onsuccess = _ev => resolve(request.result);
        });
    }

    async getDrmData(drm: string): Promise<{cases: Case[], solutions: Solution[]}> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            let transaction = db.transaction(["drm_data"], "readonly");
            let drm_data_store = transaction.objectStore("drm_data");
            let request = drm_data_store.get(drm);
            request.onerror = reject;
            request.onsuccess = _ev => resolve(request.result.data);
        });
    }

    async getVersionData(): Promise<Record<string, number> | undefined> {
        const db = await this.getDb();

        return new Promise((resolve, reject) => {
            let transaction = db.transaction(["metadata"], "readonly");
            let drm_data_store = transaction.objectStore("metadata");
            let request = drm_data_store.get("versions");
            request.onerror = reject;
            request.onsuccess = _ev => {
                if(request.result) resolve(request.result.data);
                else resolve(undefined);
            }
        });
    }
}

export {DrmLoader};