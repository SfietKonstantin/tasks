export class FakeResponse {
    ok: boolean
    private body: any
    private shouldThrow: boolean
    constructor(ok: boolean, body: any, shouldThrow: boolean = false) {
        this.ok = ok
        this.body = body
        this.shouldThrow = shouldThrow
    }
    json(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this.shouldThrow) {
                resolve(this.body)
            } else {
                reject(new Error("Some error"))
            }
        })
    }
}
