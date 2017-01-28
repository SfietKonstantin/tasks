import {NotFoundError} from "../errors/notfound"

export const get = <K, V>(map: Map<K, V>, key: K): V => {
    const returned = map.get(key)
    if (returned == undefined) {
        throw new NotFoundError(`Key ${key} not found`)
    }
    return returned
}

export class MapOfList {
    static add<K, V>(map: Map<K, Array<V>>, key: K, value: V) {
        if (!map.has(key)) {
            map.set(key, [])
        }
        (map.get(key) as Array<V>).push(value)
    }

    static length<K, V>(map: Map<K, Array<V>>): number {
        return Array.from(map.values(), (values: Array<V>) => {
            return values.length
        }).reduce((first: number, second: number) => {
            return first + second
        }, 0)
    }
}
