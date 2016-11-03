import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/imports/primavera/reducers/main"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import { defineProject } from "../../client/imports/primavera/actions/project"
import {
    beginTasksImport, endTasksImport, tasksImportInvalidFormat,
    dismissInvalidTasksFormat
} from "../../client/imports/primavera/actions/tasks"
import {
    beginRelationsImport, endRelationsImport, relationsImportInvalidFormat,
    dismissInvalidRelationsFormat
} from "../../client/imports/primavera/actions/relations"
import {
    filterForOverview, requestSubmit, receiveSubmit,
    receiveSubmitFailure
} from "../../client/imports/primavera/actions/overview"
import * as imports from "../../client/imports/primavera/imports"
import {
    State, Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation, SubmitState
} from "../../client/imports/primavera/types"
import * as projectEditor from "../../client/imports/primavera/components/projecteditor"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import * as overview from "../../client/imports/primavera/components/overview"
import { TasksParseResults, RelationsParseResults } from "../../client/imports/primavera/imports"
import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { ApiInputTask } from "../../common/apitypes"
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

const filteredTasks: Array<ApiInputTask> = [
    {
        identifier: "task1",
        name: "Task 1",
        description: "",
        estimatedStartDate: new Date(2016, 9, 1).toISOString(),
        estimatedDuration: 31
    },
    {
        identifier: "milestone1",
        name: "Milestone 1",
        description: "",
        estimatedStartDate: new Date(2016, 10, 1).toISOString(),
        estimatedDuration: 0
    },
]

const relations: Array<PrimaveraTaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        type: "FS",
        lag: 3
    }
]

const filteredRelations: Array<TaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        previousLocation: TaskLocation.End,
        lag: 3
    }
]

const warnings = new Map<string, Array<string>>()
warnings.set("task1", ["Warning 1", "Warning 2"])
warnings.set("task2", ["Warning 3"])

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
                identifier: "",
                name: "",
                description: ""
            },
            tasks: {
                length: 0,
                tasks: new Map<string, PrimaveraTask>(),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: false,
            },
            relations: {
                length: 0,
                relations: [],
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: false
            },
            overview: {
                tasks: [],
                relations: [],
                warnings: new Map<string, Array<string>>(),
                submitState: SubmitState.Idle
            }
        }
        initialState2 = {
            stage: {
                current: Stage.Overview,
                max: Stage.Overview
            },
            project: Object.assign({}, project),
            tasks: {
                length: 123,
                tasks: new Map<string, PrimaveraTask>(tasks),
                delays: new Map<string, PrimaveraDelay>(),
                warnings: new Map<string, Array<string>>(warnings),
                isImporting: true,
                isInvalidFormat: true,
            },
            relations: {
                length: 123,
                relations: relations.slice(0),
                warnings: new Map<string, Array<string>>(warnings),
                isImporting: true,
                isInvalidFormat: true
            },
            overview: {
                tasks: filteredTasks.slice(0),
                relations: filteredRelations.slice(0),
                warnings: new Map<string, Array<string>>(warnings),
                submitState: SubmitState.Submitted
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
                chai.expect(state.project).to.deep.equal(project)
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
                chai.expect(state.tasks.isInvalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_IMPORT_END", () => {
            const checkState = (initialState: State) => {
                const results: TasksParseResults = {
                    length: 123,
                    tasks: new Map<string, PrimaveraTask>(tasks),
                    delays: new Map<string, PrimaveraDelay>(),
                    warnings: new Map<string, Array<string>>(warnings)
                }
                const state = main.mainReducer(initialState, endTasksImport(results))
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.isInvalidFormat).to.false
                chai.expect(state.tasks.length).to.equal(123)
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
                chai.expect(state.tasks.isInvalidFormat).to.true
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
                chai.expect(state.tasks.isInvalidFormat).to.false
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
                chai.expect(state.relations.isInvalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_IMPORT_END", () => {
            const checkState = (initialState: State) => {
                const results: RelationsParseResults = {
                    length: 123,
                    relations: relations.slice(0),
                    warnings: new Map<string, Array<string>>(warnings)
                }
                const state = main.mainReducer(initialState, endRelationsImport(results))
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.isInvalidFormat).to.false
                chai.expect(state.relations.length).to.equal(123)
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
                chai.expect(state.relations.isInvalidFormat).to.true
                chai.expect(state.relations.relations).to.empty
                chai.expect(state.relations.warnings).to.empty
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_DISMISS_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, dismissInvalidRelationsFormat())
                chai.expect(state.relations.isInvalidFormat).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Overview reducers", () => {
        it("Should reduce OVERVIEW_FILTER", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, filterForOverview(tasks, relations))
                chai.expect(state.overview.tasks).to.deep.equal(filteredTasks)
                chai.expect(state.overview.relations).to.deep.equal(filteredRelations)
                chai.expect(state.overview.warnings.size).to.empty
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce OVERVIEW_SUBMIT_REQUEST", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestSubmit())
                chai.expect(state.overview.submitState).to.equal(SubmitState.Submitting)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce OVERVIEW_SUBMIT_RECEIVE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveSubmit())
                chai.expect(state.overview.submitState).to.equal(SubmitState.Submitted)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce OVERVIEW_SUBMIT_RECEIVE_FAILURE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveSubmitFailure("Some error"))
                chai.expect(state.overview.submitState).to.equal(SubmitState.SubmitError)
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
                    chai.expect(mapped.project).to.deep.equal(initialState.project)
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
        describe("Overview", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = overview.mapStateToProps(initialState)
                    chai.expect(mapped.stage).to.equal(initialState.stage.current)
                    chai.expect(mapped.maxStage).to.equal(initialState.stage.max)
                    chai.expect(mapped.project).to.deep.equal(initialState.project)
                    chai.expect(mapped.totalTasks).to.deep.equal(initialState.tasks.length)
                    chai.expect(mapped.tasks).to.deep.equal(initialState.overview.tasks)
                    chai.expect(mapped.totalRelations).to.deep.equal(initialState.relations.length)
                    chai.expect(mapped.relations).to.deep.equal(initialState.overview.relations)
                    chai.expect(mapped.warnings).to.deep.equal(initialState.overview.warnings)
                    chai.expect(mapped.submitState).to.deep.equal(initialState.overview.submitState)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
    })
})
