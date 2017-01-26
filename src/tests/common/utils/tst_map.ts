import * as chai from "chai"
import * as utilsmap from "../../../common/utils/map"
import {NotFoundError} from "../../../common/errors/notfound"

describe("Map utils", () => {
    it("Should get an entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(utilsmap.get(map, 123)).to.equal("abc")
    })
    it("Should get an exception for non existing entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(() => {
            utilsmap.get(map, 234)
        }).to.throw(NotFoundError)
    })
    it("Should an entry in a map of list", () => {
        let map = new Map<number, Array<string>>()
        utilsmap.addToMapOfList(map, 123, "abc")
        chai.expect(utilsmap.get(map, 123)).to.deep.equal(["abc"])
        utilsmap.addToMapOfList(map, 123, "def")
        chai.expect(utilsmap.get(map, 123)).to.deep.equal(["abc", "def"])
    })
    it("Should get the length of a map of list", () => {
        let map = new Map<number, Array<string>>()
        utilsmap.addToMapOfList(map, 123, "abc")
        utilsmap.addToMapOfList(map, 123, "def")
        utilsmap.addToMapOfList(map, 123, "ghi")
        utilsmap.addToMapOfList(map, 234, "jkl")
        utilsmap.addToMapOfList(map, 345, "mno")
        chai.expect(utilsmap.lengthOfMapOfList(map)).to.equal(5)
    })
})
