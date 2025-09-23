function setItem(k: string, v: any) {
    localStorage.setItem(k, JSON.stringify(v));
}

function getItem(k: string, default_ret: any = null): any {
    const as_string = localStorage.getItem(k);
    if(as_string === null) return default_ret;
    return JSON.parse(as_string);
}

export { setItem, getItem };