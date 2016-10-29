import { Action } from "redux"
import { processFile, InvalidFormatError } from "../../client/common/actions/files"
import { ErrorAction } from "../../client/common/actions/errors"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeError } from "./fakeerror"
import * as chai from "chai"
import * as sinon from "sinon"

describe("File utilities", () => {
    describe("processCsvFile", () => {
        it("Should process correct file", (done) => {
            const fakeFileReader = new FakeFileReader("Input")
            global.FileReader = sinon.mock().once().withExactArgs().returns(fakeFileReader)
            const dispatch = sinon.spy()
            const file = new FakeFile("text/csv", fakeFileReader)
            const parser = sinon.mock().once().withExactArgs("Input").returns("Output")
            const beginAction = sinon.mock().once().returns({type: "BEGIN"})
            const endAction = sinon.mock().once().withArgs("Output").returns({type: "SUCCESS"})
            const errorAction = sinon.mock().never()
            sinon.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
                 .yieldsToOn("onload", file, null)
            processFile<string, string>(file, "text/csv", parser, beginAction, endAction,
                                        errorAction)(dispatch).then(() => {
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWith({type: "SUCCESS"})).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWith({type: "BEGIN"})).to.true
        })
        it("Should not process file with incorrect type", (done) => {
            const dispatch = sinon.spy()
            const file = new FakeFile("text/txt")
            const parser = sinon.mock().once().withExactArgs("Input").returns("Output")
            const beginAction = sinon.mock().once().returns({type: "BEGIN"})
            const endAction = sinon.mock().never()
            const errorAction = sinon.mock().once().returns({type: "ERROR", message: "Some error"})
            processFile<string, string>(file, "text/csv", parser, beginAction, endAction,
                                        errorAction)(dispatch).then(() => {
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWith({type: "ERROR", message: "Some error"})).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWith({type: "BEGIN"})).to.true
        })
        it("Should catch invalid format errors", (done) => {
            const fakeFileReader = new FakeFileReader("Input")
            global.FileReader = sinon.mock().once().withExactArgs().returns(fakeFileReader)
            const dispatch = sinon.spy()
            const file = new FakeFile("text/csv", fakeFileReader)
            const error = new InvalidFormatError("Some error")
            const parser = sinon.mock().once().withExactArgs("Input").throws(error)
            const beginAction = sinon.mock().once().returns({type: "BEGIN"})
            const endAction = sinon.mock().never()
            const errorAction = sinon.mock().once().withExactArgs(error).returns({type: "ERROR", message: "Some error"})
            sinon.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
                 .yieldsToOn("onload", file, null)
            processFile<string, string>(file, "text/csv", parser, beginAction, endAction,
                                        errorAction)(dispatch).then(() => {
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWith({type: "ERROR", message: "Some error"})).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWith({type: "BEGIN"})).to.true
        })
        it("Should not catch other errors", (done) => {
            const fakeFileReader = new FakeFileReader("Input")
            global.FileReader = sinon.mock().once().withExactArgs().returns(fakeFileReader)
            const dispatch = sinon.spy()
            const file = new FakeFile("text/csv", fakeFileReader)
            const parser = sinon.mock().once().withExactArgs("Input").throws(new FakeError("Some error"))
            const beginAction = sinon.mock().once().returns({type: "BEGIN"})
            const endAction = sinon.mock().never()
            const errorAction = sinon.mock().never()
            sinon.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
                 .yieldsToOn("onload", file, null)
            processFile<string, string>(file, "text/csv", parser, beginAction, endAction,
                                        errorAction)(dispatch).then(() => {
                done(new Error("processFile should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })

            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWith({type: "BEGIN"})).to.true
        })
    })
})
