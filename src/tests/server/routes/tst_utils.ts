import * as chai from "chai"
import {getFeatureIdentifier} from "../../../server/routes/utils"
import {RequestError} from "../../../server/error/request"

describe("Routes utils", () => {
    describe("getFeatureIdentifier", () => {
        it("Should get an exception for an invalid input", (done) => {
            try {
                getFeatureIdentifier({value: "test"})
                done(new Error("getFeatureIdentifier should not be a success"))
            } catch (error) {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }
        })
    })
})
