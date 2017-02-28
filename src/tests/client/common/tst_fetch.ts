import * as chai from "chai"
import "isomorphic-fetch"
import {processFetch} from "../../../client/common/fetch"

describe("Fetch helper", () => {
    interface TestObject {
        id: number,
        text: string
    }
    it("Should return the content if status is OK", () => {
        const value: TestObject = {id: 123, text: "hello"}
        const results = new Response(JSON.stringify(value), {status: 200})
        return processFetch<TestObject>(results).then((json: TestObject) => {
            chai.expect(json).to.deep.equal(value)
        })
    })
    it("Should return an error if the status is not OK", () => {
        const results = new Response(undefined, {status: 404, statusText: "Something not found"})
        return processFetch<TestObject>(results).catch((error: Error) => {
            chai.expect(error.message).to.equal("404: Something not found")
        })
    })
})
