import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/imports/primavera/reducers/main"
import { defineProject, requestAddProject, receiveAddProject, receiveAddFailureProject } from "../../client/imports/primavera/actions/project"
import { beginTasksImport, endTasksImport, tasksImportInvalidFormat, dismissInvalidTasksFormat } from "../../client/imports/primavera/actions/tasks"
import * as imports from "../../client/imports/primavera/imports"
import {
    State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation
} from "../../client/imports/primavera/types"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeResponse } from "./fakeresponse"

describe("Primavera reducers", () => {
    let initialState: State
    let dispatch: Sinon.SinonSpy

    beforeEach(() => {
        dispatch = sinon.spy()
        initialState = {
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
    })
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
            const state = main.mainReducer(initialState, requestAddProject())
            chai.expect(state).to.deep.equal(initialState)
        })
        it("Should reduce PROJECT_RECEIVE_ADD", () => {
            const state = main.mainReducer(initialState, receiveAddProject())
            chai.expect(state).to.deep.equal(initialState)
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", () => {
            const state = main.mainReducer(initialState, receiveAddFailureProject("Error message"))
            chai.expect(state.project.project).to.deep.equal(initialState.project.project)
            chai.expect(state.project.error).to.equal("Error message")
        })
    })
    describe("Task reducers", () => {
        it("Should reduce TASKS_IMPORT_BEGIN", () => {
            const state = main.mainReducer(initialState, beginTasksImport())
            chai.expect(state.tasks.isImporting).to.true
            chai.expect(state.tasks.invalidFormat).to.false
            chai.expect(state.tasks.tasks).to.empty
            chai.expect(state.tasks.delays).to.empty
            chai.expect(state.tasks.warnings).to.empty
        })
        it("Should reduce TASKS_IMPORT_END", () => {
            const tasks: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 30,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 10, 1)
            }),
            tasks.set("milestone1", {
                identifier: "milestone1",
                name: "Milestone 1",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 10, 1)
            })
            const warnings = [ "Warning 1", "Warning 2" ]
            const state = main.mainReducer(initialState, endTasksImport({
                tasks,
                delays: new Map<string, PrimaveraDelay>(),
                warnings
            }))
            chai.expect(state.tasks.isImporting).to.false
            chai.expect(state.tasks.invalidFormat).to.false
            chai.expect(state.tasks.tasks).to.deep.equal(tasks)
            chai.expect(state.tasks.delays).to.empty
            chai.expect(state.tasks.warnings).to.deep.equal(warnings)
        })
        it("Should reduce TASKS_IMPORT_INVALID_FORMAT", () => {
            const state = main.mainReducer(initialState, tasksImportInvalidFormat())
            chai.expect(state.tasks.isImporting).to.false
            chai.expect(state.tasks.invalidFormat).to.true
            chai.expect(state.tasks.tasks).to.empty
            chai.expect(state.tasks.delays).to.empty
            chai.expect(state.tasks.warnings).to.empty
        })
        it("Should reduce TASKS_DISMISS_INVALID_FORMAT", () => {
            const state = main.mainReducer(initialState, dismissInvalidTasksFormat())
            chai.expect(state.tasks.invalidFormat).to.false
        })
    })
})
