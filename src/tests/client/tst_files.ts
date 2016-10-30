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
        const file = new FakeFile(fakeFileReader)
        const parser = sandbox.mock().once().withExactArgs("Input").returns("Output")
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().once().withArgs("Output").returns({type: "SUCCESS"})
        const errorAction = sandbox.mock().never()
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
               .yieldsToOn("onload", file, null)
        processFile<string, string>(file, parser, beginAction, endAction,
                                    errorAction)(dispatch).then(() => {
            chai.expect(dispatch.calledTwice).to.true
            chai.expect(dispatch.calledWithExactly({type: "SUCCESS"})).to.true
            done()
        }).catch((error) => {
            done(error)
        })

        chai.expect(dispatch.calledOnce).to.true
        chai.expect(dispatch.calledWithExactly({type: "BEGIN"})).to.true
    })
    it("Should catch errors", (done) => {
        const file = new FakeFile(fakeFileReader)
        const error = new InvalidFormatError("Some error")
        const parser = sandbox.mock().once().withExactArgs("Input").throws(error)
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().once().withExactArgs(error).returns({type: "ERROR", message: "Some error"})
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
               .yieldsToOn("onload", file, null)
        processFile<string, string>(file, parser, beginAction, endAction,
                                    errorAction)(dispatch).then(() => {
            chai.expect(dispatch.calledTwice).to.true
            chai.expect(dispatch.calledWithExactly({type: "ERROR", message: "Some error"})).to.true
            done()
        }).catch((error) => {
            done(error)
        })

        chai.expect(dispatch.calledOnce).to.true
        chai.expect(dispatch.calledWithExactly({type: "BEGIN"})).to.true
    })
    it("Should catch other errors", (done) => {
        const file = new FakeFile(fakeFileReader)
        const error = new FakeError("Some error")
        const parser = sandbox.mock().once().withExactArgs("Input").throws(error)
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().once().withExactArgs(error).returns({type: "ERROR", message: "Some error"})
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
               .yieldsToOn("onload", file, null)
        processFile<string, string>(file, parser, beginAction, endAction,
                                    errorAction)(dispatch).then(() => {
            chai.expect(dispatch.calledTwice).to.true
            chai.expect(dispatch.calledWithExactly({type: "ERROR", message: "Some error"})).to.true
            done()
        }).catch((error) => {
            done(error)
        })

        chai.expect(dispatch.calledOnce).to.true
        chai.expect(dispatch.calledWithExactly({type: "BEGIN"})).to.true
    })
    it("Should not catch non-errors", (done) => {
        const file = new FakeFile(fakeFileReader)
        const parser = sandbox.mock().once().withExactArgs("Input").throws(123)
        const beginAction = sandbox.mock().once().returns({type: "BEGIN"})
        const endAction = sandbox.mock().never()
        const errorAction = sandbox.mock().never()
        sandbox.mock(fakeFileReader).expects("readAsText").once().withExactArgs(file)
               .yieldsToOn("onload", file, null)
        processFile<string, string>(file, parser, beginAction, endAction,
                                    errorAction)(dispatch).then(() => {
            done(new Error("processFile should not be a success"))
        }).catch((error) => {
            done()
        }).catch((error) => {
            done(error)
        })

        chai.expect(dispatch.calledOnce).to.true
        chai.expect(dispatch.calledWithExactly({type: "BEGIN"})).to.true
    })
})
