export class FakeResponse {
    ok: boolean
    private body: any
    private shouldThrow: boolean
    constructor(ok: boolean, body: any, shouldThrow: boolean = false) {
        this.ok = ok
        this.body = body
        this.shouldThrow = shouldThrow
    }
    json(): Promise<any> {
        if (this.shouldThrow) {
            return Promise.reject(new Error("Some error"))
        } else {
            return Promise.resolve(this.body)
        }
    }
}