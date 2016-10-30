import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/imports/primavera/reducers/main"
import { defineProject, requestAddProject, receiveAddProject, receiveAddFailureProject } from "../../client/imports/primavera/actions/project"
import { beginTasksImport, endTasksImport, tasksImportInvalidFormat, dismissInvalidTasksFormat } from "../../client/imports/primavera/actions/tasks"
import * as imports from "../../client/imports/primavera/imports"
import {
    State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation
} from "../../client/imports/primavera/types"
import { TaskParseResults } from "../../client/imports/primavera/imports"
import { Project } from "../../common/types"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeResponse } from "./fakeresponse"

const project: Project = {
    identifier: "identifier",
    name: "Name",
    description: "Description"
}

let tasks: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
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

describe("Primavera reducers", () => {
    let dispatch: Sinon.SinonSpy
    let initialState1: State
    let initialState2: State

    beforeEach(() => {
        dispatch = sinon.spy()
        initialState1 = {
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
                warnings: [],
                isImporting: false,
                invalidFormat: false,
            },
            relations: {
                relations:[],
                isImporting: false,
                invalidFormat: false
            }
        }
        initialState2 = {
            project: {
                project: Object.assign({}, project),
                error: "Error message"
            },
            tasks: {
                tasks: new Map<string, PrimaveraTask>(tasks),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: warnings.slice(0),
                isImporting: true,
                invalidFormat: true,
            },
            relations: {
                relations:[],
                isImporting: true,
                invalidFormat: true
            }
        }
    })
    describe("Project reducers", () => {
        it("Should reduce PROJECT_DEFINE", () => {
            const state1 = main.mainReducer(initialState1, defineProject("identifier", "Name", "Description"))
            chai.expect(state1.project.project).to.deep.equal(project)
            chai.expect(state1.project.error).to.null
            const state2 = main.mainReducer(initialState1, defineProject("identifier", "Name", "Description"))
            chai.expect(state2.project.project).to.deep.equal(project)
            chai.expect(state2.project.error).to.null
        })
        it("Should reduce PROJECT_REQUEST_ADD", () => {
            const state1 = main.mainReducer(initialState1, requestAddProject())
            chai.expect(state1).to.deep.equal(initialState1)
            const state2 = main.mainReducer(initialState2, requestAddProject())
            chai.expect(state2).to.deep.equal(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE_ADD", () => {
            const state1 = main.mainReducer(initialState1, receiveAddProject())
            chai.expect(state1).to.deep.equal(initialState1)
            const state2 = main.mainReducer(initialState2, receiveAddProject())
            chai.expect(state2).to.deep.equal(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", () => {
            const state1 = main.mainReducer(initialState1, receiveAddFailureProject("Error message"))
            chai.expect(state1.project.project).to.deep.equal(initialState1.project.project)
            chai.expect(state1.project.error).to.equal("Error message")
            const state2 = main.mainReducer(initialState2, receiveAddFailureProject("Error message"))
            chai.expect(state2.project.project).to.deep.equal(initialState2.project.project)
            chai.expect(state2.project.error).to.equal("Error message")

        })
    })
    describe("Task reducers", () => {
        it("Should reduce TASKS_IMPORT_BEGIN", () => {
            const state1 = main.mainReducer(initialState1, beginTasksImport())
            chai.expect(state1.tasks.isImporting).to.true
            chai.expect(state1.tasks.invalidFormat).to.false
            const state2 = main.mainReducer(initialState2, beginTasksImport())
            chai.expect(state2.tasks.isImporting).to.true
            chai.expect(state2.tasks.invalidFormat).to.false
        })
        it("Should reduce TASKS_IMPORT_END", () => {
            const results: TaskParseResults = {
                tasks: new Map<string, PrimaveraTask>(tasks),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: warnings.slice(0)
            }
            const state1 = main.mainReducer(initialState1, endTasksImport(results))
            chai.expect(state1.tasks.isImporting).to.false
            chai.expect(state1.tasks.invalidFormat).to.false
            chai.expect(state1.tasks.tasks).to.deep.equal(tasks)
            chai.expect(state1.tasks.delays).to.empty
            chai.expect(state1.tasks.warnings).to.deep.equal(warnings)
            const state2 = main.mainReducer(initialState2, endTasksImport(results))
            chai.expect(state2.tasks.isImporting).to.false
            chai.expect(state2.tasks.invalidFormat).to.false
            chai.expect(state2.tasks.tasks).to.deep.equal(tasks)
            chai.expect(state2.tasks.delays).to.empty
            chai.expect(state2.tasks.warnings).to.deep.equal(warnings)
        })
        it("Should reduce TASKS_IMPORT_INVALID_FORMAT", () => {
            const state1 = main.mainReducer(initialState1, tasksImportInvalidFormat())
            chai.expect(state1.tasks.isImporting).to.false
            chai.expect(state1.tasks.invalidFormat).to.true
            chai.expect(state1.tasks.tasks).to.empty
            chai.expect(state1.tasks.delays).to.empty
            chai.expect(state1.tasks.warnings).to.empty
            const state2 = main.mainReducer(initialState2, tasksImportInvalidFormat())
            chai.expect(state2.tasks.isImporting).to.false
            chai.expect(state2.tasks.invalidFormat).to.true
            chai.expect(state2.tasks.tasks).to.empty
            chai.expect(state2.tasks.delays).to.empty
            chai.expect(state2.tasks.warnings).to.empty
        })
        it("Should reduce TASKS_DISMISS_INVALID_FORMAT", () => {
            const state1 = main.mainReducer(initialState1, dismissInvalidTasksFormat())
            chai.expect(state1.tasks.invalidFormat).to.false
            const state2 = main.mainReducer(initialState2, dismissInvalidTasksFormat())
            chai.expect(state1.tasks.invalidFormat).to.false
        })
    })
})
