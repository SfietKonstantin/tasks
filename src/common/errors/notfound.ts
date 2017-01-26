export class NotFoundError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
