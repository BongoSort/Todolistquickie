let handlers = [];

function get(key) {
    return JSON.parse(localStorage.getItem(key));
}

function addChangeHandler(handler) {
    handlers.push(handler);
}

function set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    for (let handler of handlers) {
        handler();
    }
}

function remove(key) {
    localStorage.removeItem(JSON.stringify(key));
    for (let handler of handlers) {
        handler();
    }
}

window.ministore = {addChangeHandler, get, set, remove};