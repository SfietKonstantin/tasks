import * as chai from "chai"
import {BooleanBuilder} from "../../../../../server/dao/redis/utils/boolean"

describe("Redis DAO boolean utils", () => {
    it("Should create a boolean from correct input", () => {
        chai.expect(BooleanBuilder.fromString("true")).to.equal(true)
        chai.expect(BooleanBuilder.fromString("false")).to.equal(false)
    })
    it("Should not create a boolean from incorrect input ", () => {
        chai.expect(BooleanBuilder.fromString("test")).to.null
        chai.expect(BooleanBuilder.fromString("TRUE")).to.null
        chai.expect(BooleanBuilder.fromString("FALSE")).to.null
        chai.expect(BooleanBuilder.fromString("1")).to.null
        chai.expect(BooleanBuilder.fromString("0")).to.null
    })
    it("Should create correct strings from boolean", () => {
        chai.expect(BooleanBuilder.toString(true)).to.equal("true")
        chai.expect(BooleanBuilder.toString(false)).to.equal("false")
    })
})

