export class NotFoundError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export const get = <K, V>(map: Map<K, V>, key: K): V => {
    const returned = map.get(key)
    if (returned == undefined) {
        throw new NotFoundError("Key " + key + " not found")
    }
    return returned
}
