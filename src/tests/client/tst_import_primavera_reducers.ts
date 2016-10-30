import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/imports/primavera/reducers/main"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import {
    defineProject, requestAddProject, receiveAddProject,
    receiveAddFailureProject
} from "../../client/imports/primavera/actions/project"
import {
    beginTasksImport, endTasksImport, tasksImportInvalidFormat,
    dismissInvalidTasksFormat
} from "../../client/imports/primavera/actions/tasks"
import {
    beginRelationsImport, endRelationsImport, relationsImportInvalidFormat,
    dismissInvalidRelationsFormat
} from "../../client/imports/primavera/actions/relations"
import * as imports from "../../client/imports/primavera/imports"
import {
    State, Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation
} from "../../client/imports/primavera/types"
import * as projectEditor from "../../client/imports/primavera/components/projecteditor"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import { TasksParseResults, RelationsParseResults } from "../../client/imports/primavera/imports"
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

const relations: Array<PrimaveraTaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        type: "FF",
        lag: 3
    }
]

const warnings = [ "Warning 1", "Warning 2" ]

describe("Primavera reducers", () => {
    let dispatch: Sinon.SinonSpy
    let initialState1: State
    let initialState2: State

    beforeEach(() => {
        dispatch = sinon.spy()
        initialState1 = {
            stage: {
                current: Stage.Project,
                max: Stage.Project
            },
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
                relations: [],
                warnings: [],
                isImporting: false,
                invalidFormat: false
            }
        }
        initialState2 = {
            stage: {
                current: Stage.Overview,
                max: Stage.Overview
            },
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
                relations: relations.slice(0),
                warnings: warnings.slice(0),
                isImporting: true,
                invalidFormat: true
            }
        }
    })
    describe("Stage reducers", () => {
        it("Should reduce STAGE_DEFINE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, defineStage(Stage.Relations))
                chai.expect(state.stage.current).to.equal(Stage.Relations)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce STAGE_DEFINE_MAX", () => {
            const state1 = main.mainReducer(initialState1, defineMaxStage(Stage.Relations))
            chai.expect(state1.stage.max).to.equal(Stage.Relations)
            const state2 = main.mainReducer(initialState2, defineMaxStage(Stage.Relations))
            chai.expect(state2.stage.max).to.equal(Stage.Overview)
        })
    })
    describe("Project reducers", () => {
        it("Should reduce PROJECT_DEFINE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, defineProject("identifier", "Name", "Description"))
                chai.expect(state.project.project).to.deep.equal(project)
                chai.expect(state.project.error).to.null
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce PROJECT_REQUEST_ADD", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestAddProject())
                chai.expect(state).to.deep.equal(initialState)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE_ADD", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveAddProject())
                chai.expect(state).to.deep.equal(initialState)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE_ADD_FAILURE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveAddFailureProject("Error message"))
                chai.expect(state.project.project).to.deep.equal(initialState.project.project)
                chai.expect(state.project.error).to.equal("Error message")
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Task reducers", () => {
        it("Should reduce TASKS_IMPORT_BEGIN", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, beginTasksImport())
                chai.expect(state.tasks.isImporting).to.true
                chai.expect(state.tasks.invalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_IMPORT_END", () => {
            const checkState = (initialState: State) => {
                const results: TasksParseResults = {
                    tasks: new Map<string, PrimaveraTask>(tasks),
                    delays: new Map<string, PrimaveraDelay>(),
                    warnings: warnings.slice(0)
                }
                const state = main.mainReducer(initialState, endTasksImport(results))
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.invalidFormat).to.false
                chai.expect(state.tasks.tasks).to.deep.equal(tasks)
                chai.expect(state.tasks.delays).to.empty
                chai.expect(state.tasks.warnings).to.deep.equal(warnings)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_IMPORT_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, tasksImportInvalidFormat())
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.invalidFormat).to.true
                chai.expect(state.tasks.tasks).to.empty
                chai.expect(state.tasks.delays).to.empty
                chai.expect(state.tasks.warnings).to.empty
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_DISMISS_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, dismissInvalidTasksFormat())
                chai.expect(state.tasks.invalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Relations reducers", () => {
        it("Should reduce RELATIONS_IMPORT_BEGIN", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, beginRelationsImport())
                chai.expect(state.relations.isImporting).to.true
                chai.expect(state.relations.invalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_IMPORT_END", () => {
            const checkState = (initialState: State) => {
                const results: RelationsParseResults = {
                    relations: relations.slice(0),
                    warnings: warnings.slice(0)
                }
                const state = main.mainReducer(initialState, endRelationsImport(results))
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.invalidFormat).to.false
                chai.expect(state.relations.relations).to.deep.equal(relations)
                chai.expect(state.relations.warnings).to.deep.equal(warnings)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_IMPORT_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, relationsImportInvalidFormat())
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.invalidFormat).to.true
                chai.expect(state.relations.relations).to.empty
                chai.expect(state.relations.warnings).to.empty
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_DISMISS_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, dismissInvalidRelationsFormat())
                chai.expect(state.relations.invalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Components", () => {
        describe("ProjectEditor", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = projectEditor.mapStateToProps(initialState)
                    chai.expect(mapped.project).to.deep.equal(initialState.project.project)
                    chai.expect(mapped.stage).to.equal(initialState.stage.current)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
        describe("TasksSelector", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = tasksSelector.mapStateToProps(initialState)
                    chai.expect(mapped.stage).to.equal(initialState.stage.current)
                    chai.expect(mapped.maxStage).to.equal(initialState.stage.max)
                    chai.expect(mapped.tasks).to.deep.equal(initialState.tasks.tasks)
                    chai.expect(mapped.warnings).to.deep.equal(initialState.tasks.warnings)
                    chai.expect(mapped.isImporting).to.equal(initialState.tasks.isImporting)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
        describe("TasksSelector", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = relationsSelector.mapStateToProps(initialState)
                    chai.expect(mapped.stage).to.equal(initialState.stage.current)
                    chai.expect(mapped.maxStage).to.equal(initialState.stage.max)
                    chai.expect(mapped.relations).to.deep.equal(initialState.relations.relations)
                    chai.expect(mapped.warnings).to.deep.equal(initialState.relations.warnings)
                    chai.expect(mapped.isImporting).to.equal(initialState.tasks.isImporting)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
    })
})
