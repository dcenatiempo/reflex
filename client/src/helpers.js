export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const isEmpty = (obj) => {
    // undefined
    if (obj === undefined) return true;

    // strings
    if (typeof obj === 'string') {
        if (obj.length === 0) return true;
        else return false;
    }
    
    if (typeof obj === 'object') {
        // arrays
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        // objects
        return Object.keys(obj).length === 0;
    }
    
    // anything else
    // TODO: handle other cases?
    return undefined;
}

export const setVal = (obj, string, val) => {
    const path = string.split(".");
    while(path.length > 1){
        obj = obj[path.shift()];
     }
     obj[path.shift()] = val;
}