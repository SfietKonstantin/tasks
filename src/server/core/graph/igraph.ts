export class CyclicDependencyError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
