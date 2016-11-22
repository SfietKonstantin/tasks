import * as jsdom from "jsdom"

class FakeLocalStorage {
    getItem(key: string): string | null {
        throw new Error("FakeLocalStorage: getItem is not mocked")
    }
    setItem(key: string, data: string): void {
        throw new Error("FakeLocalStorage: setItem is not mocked")
    }
}

export const addFakeGlobal = () => {
    global.FileReader = () => {
        throw new Error("FakeGlobal: FileReader is not mocked")
    }

    global.fetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        throw new Error("FakeGlobal: fetch is not mocked")
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
