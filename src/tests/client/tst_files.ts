import { Action } from "redux"
import { processFile, InvalidFormatError } from "../../client/common/actions/files"
import { ErrorAction } from "../../client/common/actions/errors"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeError } from "./fakeerror"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import * as chai from "chai"
import * as sinon from "sinon"

describe("File utilities", () => {
    let sandbox: Sinon.SinonSandbox
    let dispatch: Sinon.SinonSpy
    let fakeFileReader: FakeFileReader

    beforeEach(() => {
        addFakeGlobal()
        sandbox = sinon.sandbox.create()
        dispatch = sinon.spy()
        fakeFileReader = new FakeFileReader("Input")
        sandbox.mock(global).expects("FileReader").once().returns(fakeFileReader)
    })
    afterEach(() => {
        sandbox.restore()
        clearFakeGlobal()
    })
    it("Should process correct file", (done) => {
        const file = new FakeFile("text/csv", fakeFileReader)
        const parser = sandbox.mock().once().withExactArgs("Input").returns("Output")
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().once().withArgs("Output").returns({type: "SUCCESS"})
        const errorAction = sandbox.mock().never()
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
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
        const file = new FakeFile("text/txt")
        const parser = sandbox.mock().once().withExactArgs("Input").returns("Output")
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().once().returns({type: "ERROR", message: "Some error"})
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
        const file = new FakeFile("text/csv", fakeFileReader)
        const error = new InvalidFormatError("Some error")
        const parser = sandbox.mock().once().withExactArgs("Input").throws(error)
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().once().withExactArgs(error).returns({type: "ERROR", message: "Some error"})
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
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
        const file = new FakeFile("text/csv", fakeFileReader)
        const parser = sandbox.mock().once().withExactArgs("Input").throws(new FakeError("Some error"))
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().never()
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
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
