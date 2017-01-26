export class CorruptedError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
