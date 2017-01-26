export class InputError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
