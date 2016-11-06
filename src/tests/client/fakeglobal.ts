import * as jsdom from "jsdom"

class FakeLocalStorage {
    getItem(key: string): string | null {
        throw new Error("Not mocked")
    }
    setItem(key: string, data: string): void {
        throw new Error("Not mocked")
    }
}

export const addFakeGlobal = () => {
    global.FileReader = () => {
        throw new Error("Not mocked")
    }

    global.fetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        throw new Error("Not mocked")
    }
    global.localStorage = new FakeLocalStorage()

    const document = jsdom.jsdom("<!doctype html><html><body></body></html>")
    global.document = document
    global.window = document.defaultView
}

export const clearFakeGlobal = () => {
    delete global.FileReader
    delete global.fetch
    delete global.localStorage
    delete global.document
    delete global.window
}
