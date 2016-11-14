import * as chai from "chai"

export const expectMapEqual = <K, V>(map1: Map<K, V>, map2: Map<K, V>): void => {
    const map1Keys = Array.from(map1.keys())
    const map2Keys = Array.from(map2.keys())
    chai.expect(map1Keys).to.deep.members(map2Keys)
    chai.expect(map2Keys).to.deep.members(map1Keys)
    map1Keys.forEach((key: K) => {
        chai.expect(map1.get(key)).to.deep.equal(map2.get(key))
    })
}

export const expectSetEqual = <V>(set: Set<V>, expected: Array<V>): void => {
    const setArray = Array.from(set)
    chai.expect(setArray).to.deep.members(expected)
    chai.expect(expected).to.deep.members(setArray)
}
