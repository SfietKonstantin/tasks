import * as chai from "chai"
import * as maputils from "../../common/maputils"
import { NotFoundError } from "../../common/errors"

describe("Map utils", () => {
    it("Should get an entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(maputils.get(map, 123)).to.equal("abc")
    })
    it("Should get an exception for non existing entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(() => {maputils.get(map, 234)}).to.throw(NotFoundError)
    })
    it("Should an entry a map of list", () => {
        let map = new Map<number, Array<string>>()
        maputils.addToMapOfList(map, 123, "abc")
        chai.expect(maputils.get(map, 123)).to.deep.equal(["abc"])
        maputils.addToMapOfList(map, 123, "def")
        chai.expect(maputils.get(map, 123)).to.deep.equal(["abc", "def"])
    })
    it("Should get the length of a map of list", () => {
        let map = new Map<number, Array<string>>()
        maputils.addToMapOfList(map, 123, "abc")
        maputils.addToMapOfList(map, 123, "def")
        maputils.addToMapOfList(map, 123, "ghi")
        maputils.addToMapOfList(map, 234, "jkl")
        maputils.addToMapOfList(map, 345, "mno")
        chai.expect(maputils.lengthOfMapOfList(map)).to.equal(5)
    })
})
