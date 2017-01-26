export class ExistsError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

