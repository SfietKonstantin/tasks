import * as chai from "chai"
import {get, MapOfList} from "../../../common/utils/map"
import {NotFoundError} from "../../../common/errors/notfound"

describe("Map utils", () => {
    it("Should get an entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(get(map, 123)).to.equal("abc")
    })
    it("Should get an exception for non existing entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(() => {
            get(map, 234)
        }).to.throw(NotFoundError)
    })
    it("Should an entry in a map of list", () => {
        let map = new Map<number, Array<string>>()
        MapOfList.add(map, 123, "abc")
        chai.expect(get(map, 123)).to.deep.equal(["abc"])
        MapOfList.add(map, 123, "def")
        chai.expect(get(map, 123)).to.deep.equal(["abc", "def"])
    })
    it("Should get the length of a map of list", () => {
        let map = new Map<number, Array<string>>()
        MapOfList.add(map, 123, "abc")
        MapOfList.add(map, 123, "def")
        MapOfList.add(map, 123, "ghi")
        MapOfList.add(map, 234, "jkl")
        MapOfList.add(map, 345, "mno")
        chai.expect(MapOfList.length(map)).to.equal(5)
    })
})
