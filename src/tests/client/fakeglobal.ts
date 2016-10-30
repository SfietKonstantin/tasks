import * as jsdom from "jsdom"

export const addFakeGlobal = () => {
    global.FileReader = () => {
        throw new Error("Not mocked")
    }

    global.fetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        throw new Error("Not mocked")
    }

    const document = jsdom.jsdom("<!doctype html><html><body></body></html>")
    global.document = document
    global.window = document.defaultView
}

export const clearFakeGlobal = () => {
    delete global.FileReader
    delete global.fetch
    delete global.document
    delete global.window
}
