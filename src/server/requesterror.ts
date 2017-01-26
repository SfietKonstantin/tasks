interface ErrorJson {
    error: string
}

export class RequestError extends Error implements Error {
    status: number
    json: ErrorJson

    constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.json = {error: message}
    }
}
