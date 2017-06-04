export class GraphError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}
