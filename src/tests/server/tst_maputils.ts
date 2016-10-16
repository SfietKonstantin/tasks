import * as chai from "chai"
import * as maputils from "../../common/maputils"

describe("Map utils", () => {
    it("Should get an entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(maputils.get(map, 123)).to.equal("abc")
    })
    it("Should get an exception for non existing entry in the map", () => {
        let map = new Map<number, string>()
        map.set(123, "abc")
        chai.expect(() => {maputils.get(map, 234)}).to.throw(maputils.NotFoundError)
    })
})
