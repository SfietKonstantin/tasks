import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/project/reducers/main"
import { fetchProject } from "../../client/project/actions/project"
import {
    State, ProjectState, TasksFilter, TasksState
} from "../../client/project/types"
import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"

describe("Project reducers", () => {
    const initialState: State = {
        projectIdentifier: "",
        project: {
            isFetching: false,
            project: null
        },
        tasks: {
            isFetching: false,
            tasks: new Array<ApiTask>(),
            filter: {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false
            },
            today: null,
            filteredTasks: new Array<ApiTask>()
        }
    }
    describe("Project reducers", () => {
        it("Should reduce PROJECT_REQUEST", () => {
            // Mock
            const fetch = sinon.mock().once().returns(new Promise<Response>((resolve, reject) => {}))
            global.fetch = fetch
            const dispatch = sinon.spy()

            fetchProject("identifier")(dispatch)

            const action = dispatch.args[0][0]
            const state = main.mainReducer(initialState, action)
            chai.expect(state.project.isFetching).to.true
            chai.expect(state.project.project).to.null
        })
        it("Should reduce PROJECT_RECEIVE", (done) => {
            // Mock
            let promiseResolve: ((response: any) => void) | null = null
            const fetch = sinon.mock().once().returns(new Promise<Response>((resolve, reject) => {
                promiseResolve = resolve
            }))
            global.fetch = fetch
            const dispatch = sinon.spy()

            const project: Project = {
                identifier: "identifier",
                name: "Name",
                description: "Description"
            }

            fetchProject("identifier")(dispatch).then(() => {
                const action = dispatch.args[1][0]
                const state = main.mainReducer(initialState, action)
                chai.expect(state.project.isFetching).to.false
                chai.expect(state.project.project).to.deep.equal(project)
                done()
            }).catch((error) => {
                done(error)
            })

            const response = new FakeResponse(true, project)
            if (promiseResolve) { // Workaround typescript
                promiseResolve(response)
            }
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", (done) => {
            // Mock
            let promiseResolve: ((response: any) => void) | null = null
            const fetch = sinon.mock().once().returns(new Promise<Response>((resolve, reject) => {
                promiseResolve = resolve
            }))
            global.fetch = fetch
            const dispatch = sinon.spy()

            fetchProject("identifier")(dispatch).then(() => {
                const action = dispatch.args[1][0]
                const state = main.mainReducer(initialState, action)
                chai.expect(state.project.isFetching).to.false
            chai.expect(state.project.project).to.null
                done()
            }).catch((error) => {
                done(error)
            })

            const response = new FakeResponse(false, {error: "Error message"})
            if (promiseResolve) { // Workaround typescript
                promiseResolve(response)
            }
        })
    })
})
