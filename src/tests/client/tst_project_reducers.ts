import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/project/reducers/main"
import { requestProject, receiveProject, receiveFailureProject } from "../../client/project/actions/project"
import {
    State, ProjectState, TasksFilter, TasksState
} from "../../client/project/types"
import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"

describe("Project reducers", () => {
    let initialState: State
    let dispatch: Sinon.SinonSpy

    beforeEach(() => {
        dispatch = sinon.spy()
        initialState = {
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
    })
    describe("Project reducers", () => {
        it("Should reduce PROJECT_REQUEST", () => {
            const state = main.mainReducer(initialState, requestProject("identifier"))
            chai.expect(state.project.isFetching).to.true
            chai.expect(state.project.project).to.null
        })
        it("Should reduce PROJECT_RECEIVE", () => {
            const project: Project = {
                identifier: "identifier",
                name: "Name",
                description: "Description"
            }
            const state = main.mainReducer(initialState, receiveProject("identifier", project))
            chai.expect(state.project.isFetching).to.false
            chai.expect(state.project.project).to.deep.equal(project)
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", () => {
            const state = main.mainReducer(initialState, receiveFailureProject())
            chai.expect(state.project.isFetching).to.false
            chai.expect(state.project.project).to.null
        })
    })
})
