import { Action } from "redux"
import { processFile } from "../../client/common/actions/files"
import { ErrorAction } from "../../client/common/actions/errors"
import { FakeFile, FakeFileReader } from "./fakefile"
import * as chai from "chai"
import * as sinon from "sinon"

describe("File utilities", () => {
    describe("processCsvFile", () => {
        it("Should not process non-CSV files", (done) => {
            const fakeFileReader = new FakeFileReader("Input")
            global.FileReader = sinon.mock().once().withExactArgs().returns(fakeFileReader)
            const dispatch = sinon.spy()
            const file = new FakeFile("text/csv", fakeFileReader)
            const parser = sinon.mock().once().withExactArgs("Input").returns("Output")
            const beginAction = sinon.mock().once().returns({ type: "BEGIN" })
            const endAction = sinon.mock().once().withArgs("Output").returns({ type: "SUCCESS" })
            const errorAction = sinon.mock().never()
            sinon.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
                 .yieldsToOn("onload", file, null)
            processFile<string, string>(file, "text/csv", parser, beginAction, endAction, errorAction)(dispatch).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
