export class InputError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class ExistsError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
