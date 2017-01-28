import * as chai from "chai"
import {TaskLocation} from "../../../../../common/tasklocation"
import {TaskLocationBuilder} from "../../../../../server/dao/redis/utils/tasklocation"

describe("Redis DAO TaskLocation utils", () => {
    it("Should create a TaskLocation from correct input", () => {
        chai.expect(TaskLocationBuilder.fromString("Beginning")).to.equal(TaskLocation.Beginning)
        chai.expect(TaskLocationBuilder.fromString("End")).to.equal(TaskLocation.End)
    })
    it("Should not create a TaskLocation from incorrect input ", () => {
        chai.expect(TaskLocationBuilder.fromString("test")).to.null
    })
    it("Should create correct strings from TaskLocation", () => {
        chai.expect(TaskLocationBuilder.toString(TaskLocation.Beginning)).to.equal("Beginning")
        chai.expect(TaskLocationBuilder.toString(TaskLocation.End)).to.equal("End")
    })
    it("Should create an empty string for an invalid TaskLocation", () => {
        chai.expect(TaskLocationBuilder.toString(-1 as TaskLocation)).to.equal("")
    })
})

