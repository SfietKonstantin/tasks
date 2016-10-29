export class FakeError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

