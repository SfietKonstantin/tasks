import * as jsdom from "jsdom"

interface MockGlobal extends NodeJS.Global {
    document: jsdom.DocumentWithParentWindow
    window: Window
}

export const addMockWindow = () => {
    let mockGlobal = global as MockGlobal
    mockGlobal.document = jsdom.jsdom("<!doctype html><html><body></body></html>")
    mockGlobal.window = (global as MockGlobal).document.defaultView
    mockGlobal.window.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
        throw new Error("FakeGlobal: fetch is not mocked")
    }
}

export const removeMockWindow = () => {
    let mockGlobal = global as MockGlobal
    delete mockGlobal.document
    delete mockGlobal.window
}
