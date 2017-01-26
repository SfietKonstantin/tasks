export class InternalError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
