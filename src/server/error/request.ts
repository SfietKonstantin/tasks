interface ErrorJson {
    readonly error: string
}

export class RequestError extends Error implements Error {
    readonly status: number
    readonly json: ErrorJson

    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.json = {error: message}
    }
}
