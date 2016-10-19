import * as chai from "chai"
import * as sinon from "sinon"
import {
    ProjectAction, PROJECT_DEFINE, PROJECT_REQUEST_ADD, PROJECT_RECEIVE_ADD, PROJECT_RECEIVE_ADD_FAILURE,
    defineProject, addProject
} from "../../client/imports/primavera/actions/project"
import { Project } from "../../common/types"

describe("Primavera actions", () => {
    describe("Project", () => {
        describe("Synchronous", () => {
            it("Should create PROJECT_DEFINE", () => {
                chai.expect(defineProject("identifier", "Name", "Description")).to.deep.equal({
                    type: PROJECT_DEFINE,
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })
            })
        })
        describe("Asynchronous", () => {
            it("Should PUT a project", (done) => {
                // Mock
                let promiseResolve: ((response: Response) => void) | null = null
                const fetch = sinon.mock().once().returns(new Promise<Response>((resolve, reject) => {
                    promiseResolve = resolve
                }))
                global.fetch = fetch
                const dispatch = sinon.spy()

                // Test
                const project: Project = {
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                }
                addProject(project)(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({type: PROJECT_RECEIVE_ADD})).to.true
                    chai.expect(fetch.args).to.length(1)
                    chai.expect(fetch.args[0]).to.length(2)
                    chai.expect(fetch.args[0][0]).to.equals("/api/project")
                    const requestInit = fetch.args[0][1] as RequestInit
                    chai.expect(requestInit.method).to.equals("PUT")
                    const body = JSON.parse(requestInit.body as string)
                    chai.expect(body).to.haveOwnProperty("project")
                    chai.expect(body.project).to.deep.equal(project)
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true
                chai.expect(promiseResolve).to.not.null
                if (promiseResolve) { // Workaround typescript
                    promiseResolve()
                }
            })
            it("Should react to PUT failure", (done) => {
                // Mock
                let promiseReject: ((reason: any) => void) | null = null
                const fetch = sinon.mock().once().returns(new Promise<Response>((resolve, reject) => {
                    promiseReject = reject
                }))
                global.fetch = fetch
                const dispatch = sinon.spy()

                // Test
                addProject({
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({
                        type: PROJECT_RECEIVE_ADD_FAILURE,
                        message: "Error message"
                    })).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true
                chai.expect(promiseReject).to.not.null
                if (promiseReject) { // Workaround typescript
                    promiseReject(new Error("Error message"))
                }
            })
        })
    })
})
