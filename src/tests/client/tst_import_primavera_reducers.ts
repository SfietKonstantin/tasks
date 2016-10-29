import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/imports/primavera/reducers/main"
import { defineProject, addProject } from "../../client/imports/primavera/actions/project"
import {
    State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation
} from "../../client/imports/primavera/types"
import { FakeResponse } from "./fakeresponse"

describe("Primavera reducers", () => {
    const initialState: State = {
        project: {
            project: {
                identifier: "",
                name: "",
                description: ""
            },
            error: null
        },
        tasks: {
            tasks: new Map<string, PrimaveraTask>(),
            delays: new Map<string, PrimaveraDelay>(),
            warnings: new Array<string>(),
            isImporting: false,
            invalidFormat: false,
        },
        relations: {
            relations: new Array<PrimaveraTaskRelation>(),
            isImporting: false,
            invalidFormat: false
        }
    }
    describe("Project reducers", () => {
        it("Should reduce PROJECT_DEFINE", () => {
            const state = main.mainReducer(initialState, defineProject("identifier", "Name", "Description"))
            chai.expect(state.project.project).to.deep.equal({
                identifier: "identifier",
                name: "Name",
                description: "Description"
            })
            chai.expect(state.project.error).to.null
        })
        it("Should reduce PROJECT_REQUEST_ADD", () => {
            // Mock
            global.fetch = sinon.mock().once().returns(new Promise<Response>(() => {}))
            const dispatch = sinon.spy()

            addProject({
                identifier: "identifier",
                name: "Name",
                description: "Description"
            })(dispatch)

            const action = dispatch.args[0][0]
            const state = main.mainReducer(initialState, action)
            chai.expect(state).to.deep.equal(initialState)
        })
        it("Should reduce PROJECT_RECEIVE_ADD", (done) => {
            // Mock
            const response = new FakeResponse(true, {})
            global.fetch = sinon.mock().once().returns(Promise.resolve(response))
            const dispatch = sinon.spy()

            addProject({
                identifier: "identifier",
                name: "Name",
                description: "Description"
            })(dispatch).then(() => {
                const action = dispatch.args[1][0]
                const state = main.mainReducer(initialState, action)
                chai.expect(state).to.deep.equal(initialState)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", (done) => {
            // Mock
            const response = new FakeResponse(false, {error: "Error message"})
            const fetch = sinon.mock().once().returns(Promise.resolve(response))
            global.fetch = fetch
            const dispatch = sinon.spy()

            addProject({
                identifier: "identifier",
                name: "Name",
                description: "Description"
            })(dispatch).then(() => {
                const action = dispatch.args[1][0]
                const state = main.mainReducer(initialState, action)
                chai.expect(state.project.project).to.deep.equal(initialState.project.project)
                chai.expect(state.project.error).to.equal("Error message")
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
