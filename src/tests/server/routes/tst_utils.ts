import * as chai from "chai"
import {getProjectIdentifier, getTaskIdentifier} from "../../../server/routes/utils"
import {RequestError} from "../../../server/error/request"

describe("Routes utils", () => {
    describe("getProjectIdentifier", () => {
        it("Should get an exception for an invalid input", (done) => {
            try {
                getProjectIdentifier({value: "test"})
                done(new Error("getProjectIdentifier should not be a success"))
            } catch (error) {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }
        })
    })
    describe("getTaskIdentifier", () => {
        it("Should get an exception for an invalid input", (done) => {
            try {
                getTaskIdentifier({value: "test"})
                done(new Error("getTaskIdentifier should not be a success"))
            } catch (error) {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }
        })
    })
})
