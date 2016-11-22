export class FakeResponse implements Response {
    type: ResponseType
    url: string
    redirected: boolean
    status: number
    ok: boolean
    statusText: string
    headers: Headers
    body: ReadableStream // | null
    trailer: Promise<Headers>
    bodyUsed: boolean
    private fakeBody: any
    private shouldThrow: boolean
    constructor(ok: boolean, body: any, shouldThrow: boolean = false) {
        this.ok = ok
        this.bodyUsed = true
        this.fakeBody = body
        this.shouldThrow = shouldThrow
    }
    clone(): Response {
        throw new Error("FakeResponse: clone is not mocked")
    }
    arrayBuffer(): Promise<ArrayBuffer> {
        throw new Error("FakeResponse: arrayBuffer is not mocked")
    }
    blob(): Promise<Blob> {
        throw new Error("FakeResponse: blob is not mocked")
    }
    formData(): Promise<FormData> {
        throw new Error("FakeResponse: formData is not mocked")
    }
    json(): Promise<any> {
        if (this.shouldThrow) {
            return Promise.reject(new Error("Some error"))
        } else {
            return Promise.resolve(this.fakeBody)
        }
    }
    text(): Promise<string> {
        throw new Error("FakeResponse: text is not mocked")
    }
}
