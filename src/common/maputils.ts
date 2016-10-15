import { NotFoundError } from "./errors"

export const get = <K, V>(map: Map<K, V>, key: K): V => {
    const returned = map.get(key)
    if (returned == undefined) {
        throw new NotFoundError("Key " + key + " not found")
    }
    return returned
}
