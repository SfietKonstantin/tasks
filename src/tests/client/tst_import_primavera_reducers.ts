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
    defineDelayFilters, defineDelaySelection
} from "../../client/imports/primavera/actions/delays"
import {
    filterForOverview, requestSubmit, receiveSubmit,
    receiveSubmitFailure
} from "../../client/imports/primavera/actions/overview"
import * as imports from "../../client/imports/primavera/imports"
import {
    State, Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation, SubmitState
} from "../../client/imports/primavera/types"
import { RelationGraph, RelationGraphNode, GraphDiff } from "../../client/imports/primavera/graph"
import * as projectEditor from "../../client/imports/primavera/components/projecteditor"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import * as delaysSelector from "../../client/imports/primavera/components/delaysselector"
import * as overview from "../../client/imports/primavera/components/overview"
import { TasksParseResults, RelationsParseResults } from "../../client/imports/primavera/imports"
import { TaskListFilters, MilestoneFilterMode } from "../../client/common/tasklistfilter"
import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { ApiInputTask, ApiInputDelay } from "../../common/apitypes"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeResponse } from "./fakeresponse"
import { makeRelations } from "./primaverahelper"
import { expectMapEqual, expectSetEqual } from "./expectutils"

const project: Project = {
    identifier: "identifier",
    name: "Name",
    description: "Description"
}

let tasks: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
tasks.set("task1", {
    identifier: "task1",
    name: "Task 1",
    duration: 15,
    startDate: new Date(2016, 8, 1),
    endDate: new Date(2016, 8, 16)
})
tasks.set("task2", {
    identifier: "task2",
    name: "Task 2",
    duration: 30,
    startDate: new Date(2016, 8, 15),
    endDate: new Date(2016, 9, 15)
})
tasks.set("task3", {
    identifier: "task3",
    name: "Task 3",
    duration: 31,
    startDate: new Date(2016, 9, 15),
    endDate: new Date(2016, 10, 15)
})
tasks.set("milestone1", {
    identifier: "milestone1",
    name: "Milestone 1",
    duration: 0,
    startDate: null,
    endDate: new Date(2016, 8, 14)
})
tasks.set("milestone2", {
    identifier: "milestone2",
    name: "Milestone 2",
    duration: 0,
    startDate: null,
    endDate: new Date(2016, 9, 14)
})

let selected = new Set<string>()
selected.add("task1")
selected.add("milestone1")

const filteredTasks: Array<ApiInputTask> = [
    {
        identifier: "task2",
        name: "Task 2",
        description: "",
        estimatedStartDate: new Date(2016, 8, 15).toISOString(),
        estimatedDuration: 30
    },
    {
        identifier: "task3",
        name: "Task 3",
        description: "",
        estimatedStartDate: new Date(2016, 9, 15).toISOString(),
        estimatedDuration: 31
    },
    {
        identifier: "milestone2",
        name: "Milestone 2",
        description: "",
        estimatedStartDate: new Date(2016, 9, 14).toISOString(),
        estimatedDuration: 0
    }
]

const filteredDelays: Array<ApiInputDelay> = [
    {
        identifier: "task1",
        name: "Task 1",
        description: "",
        date: new Date(2016, 8, 1).toISOString()
    },
    {
        identifier: "milestone1",
        name: "Milestone 1",
        description: "",
        date: new Date(2016, 8, 14).toISOString()
    }
]

let graph = new RelationGraph()
graph.addRelation({
    previous: "task1",
    next: "milestone1",
    type: "FS",
    lag: 3
})
const relations = graph.nodes

const filteredRelations: Array<TaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        previousLocation: TaskLocation.End,
        lag: 3
    }
]

const graphDiff: Array<GraphDiff> = [
    {
        added: [],
        removed: []
    },
    {
        added: [],
        removed: []
    }
]

const warnings = new Map<string, Array<string>>()
warnings.set("task1", ["Warning 1", "Warning 2"])
warnings.set("task2", ["Warning 3"])

const errors = new Map<string, Array<string>>()
warnings.set("task1", ["Error 1", "Error 2"])
warnings.set("task2", ["Error 3"])

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
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: false,
            },
            relations: {
                length: 0,
                relations: new Map<string, RelationGraphNode>(),
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: false
            },
            delays: {
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                },
                tasks: [],
                selection: new Set<string>(),
                diffs: [],
                warnings: new Map<string, Array<string>>()
            },
            overview: {
                tasks: [],
                delays: [],
                relations: [],
                warnings: new Map<string, Array<string>>(),
                errors: new Map<string, Array<string>>(),
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
                warnings: new Map<string, Array<string>>(warnings),
                isImporting: true,
                isInvalidFormat: true,
            },
            relations: {
                length: 123,
                relations: new Map<string, RelationGraphNode>(relations),
                warnings: new Map<string, Array<string>>(warnings),
                isImporting: true,
                isInvalidFormat: true
            },
            delays: {
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                    text: "test"
                },
                tasks: Array.from(tasks.values()),
                selection: new Set<string>(selected),
                diffs: graphDiff.slice(0),
                warnings: new Map<string, Array<string>>(warnings)
            },
            overview: {
                tasks: filteredTasks.slice(0),
                delays: filteredDelays.slice(0),
                relations: filteredRelations.slice(0),
                warnings: new Map<string, Array<string>>(warnings),
                errors: new Map<string, Array<string>>(errors),
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
                    warnings: new Map<string, Array<string>>(warnings)
                }
                const state = main.mainReducer(initialState, endTasksImport(results))
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.isInvalidFormat).to.false
                chai.expect(state.tasks.length).to.equal(123)
                expectMapEqual(state.tasks.tasks, tasks)
                expectMapEqual(state.tasks.warnings, warnings)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_IMPORT_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, tasksImportInvalidFormat())
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.isInvalidFormat).to.true
                chai.expect(state.tasks.tasks.size).to.equal(0)
                chai.expect(state.tasks.warnings.size).to.equal(0)
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
                    relations: new Map<string, RelationGraphNode>(relations),
                    warnings: new Map<string, Array<string>>(warnings)
                }
                const state = main.mainReducer(initialState, endRelationsImport(results))
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.isInvalidFormat).to.false
                chai.expect(state.relations.length).to.equal(123)
                expectMapEqual(state.relations.relations, relations)
                expectMapEqual(state.relations.warnings, warnings)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce RELATIONS_IMPORT_INVALID_FORMAT", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, relationsImportInvalidFormat())
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.isInvalidFormat).to.true
                chai.expect(state.relations.relations.size).to.equal(0)
                chai.expect(state.relations.warnings.size).to.equal(0)
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
    describe("Delay reducers", () => {
        it("Should reduce DELAY_FILTERS_DEFINE 1", () => {
            const checkState = (initialState: State) => {
                const filters: TaskListFilters = {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
                const state = main.mainReducer(initialState, defineDelayFilters(tasks, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    tasks.get("milestone1"),
                    tasks.get("milestone2"),
                    tasks.get("task1"),
                    tasks.get("task2"),
                    tasks.get("task3"),
                ])
                chai.expect(state.delays.filters).to.deep.equal(filters)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce DELAY_FILTERS_DEFINE 2", () => {
            const checkState = (initialState: State) => {
                const filters: TaskListFilters = {
                    milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                    text: ""
                }
                const state = main.mainReducer(initialState, defineDelayFilters(tasks, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    tasks.get("task1"),
                    tasks.get("task2"),
                    tasks.get("task3")
                ])
                chai.expect(state.delays.filters).to.deep.equal(filters)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce DELAY_FILTERS_DEFINE 3", () => {
            const checkState = (initialState: State) => {
                const filters: TaskListFilters = {
                    milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                    text: ""
                }
                const state = main.mainReducer(initialState, defineDelayFilters(tasks, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    tasks.get("milestone1"),
                    tasks.get("milestone2")
                ])
                chai.expect(state.delays.filters).to.deep.equal(filters)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce DELAY_FILTERS_DEFINE 4", () => {
            const checkState = (initialState: State) => {
                const filters: TaskListFilters = {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: "1"
                }
                const state = main.mainReducer(initialState, defineDelayFilters(tasks, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    tasks.get("milestone1"),
                    tasks.get("task1")
                ])
                chai.expect(state.delays.filters).to.deep.equal(filters)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 1", () => {
            const expectedDiffs: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        ["task1", "milestone1"]
                    ]
                }
            ]
            const state = main.mainReducer(initialState1, defineDelaySelection(tasks, relations, "milestone1", true))
            expectSetEqual(state.delays.selection, ["milestone1"])
            chai.expect(state.delays.diffs).to.deep.equal(expectedDiffs)
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 2", () => {
            const expectedDiffs: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        ["task1", "milestone1"]
                    ]
                },
                {
                    added: [],
                    removed: [
                        ["task1", "milestone1"]
                    ]
                }
            ]
            const state = main.mainReducer(initialState2, defineDelaySelection(tasks, relations, "milestone1", true))
            expectSetEqual(state.delays.selection, ["task1", "milestone1"])
            chai.expect(state.delays.diffs).to.deep.equal(expectedDiffs)
            chai.expect(state.delays.warnings.size).to.equal(1)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 3", () => {
            const state = main.mainReducer(initialState1, defineDelaySelection(tasks, relations, "milestone1", false))
            chai.expect(state.delays.selection.size).to.equal(0)
            chai.expect(state.delays.diffs).to.empty
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 4", () => {
            const expectedDiffs: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        ["task1", "milestone1"]
                    ]
                }
            ]
            const state = main.mainReducer(initialState2, defineDelaySelection(tasks, relations, "milestone1", false))
            expectSetEqual(state.delays.selection, ["task1"])
            chai.expect(state.delays.diffs).to.deep.equal(expectedDiffs)
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
    })
    describe("Overview reducers", () => {
        it("Should reduce OVERVIEW_FILTER", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, filterForOverview(tasks, selected, relations))
                chai.expect(state.overview.tasks).to.deep.equal(filteredTasks)
                chai.expect(state.overview.delays).to.deep.equal(filteredDelays)
                chai.expect(state.overview.relations).to.deep.equal(filteredRelations)
                chai.expect(state.overview.warnings.size).to.equal(0)
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
                    expectMapEqual(mapped.tasks, initialState.tasks.tasks)
                    expectMapEqual(mapped.warnings, initialState.tasks.warnings)
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
                    expectMapEqual(mapped.relations, initialState.relations.relations)
                    expectMapEqual(mapped.warnings, initialState.relations.warnings)
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
                    chai.expect(mapped.totalTasks).to.equal(initialState.tasks.length)
                    chai.expect(mapped.tasks).to.deep.equal(initialState.overview.tasks)
                    chai.expect(mapped.totalRelations).to.equal(initialState.relations.length)
                    chai.expect(mapped.relations).to.deep.equal(initialState.overview.relations)
                    expectMapEqual(mapped.warnings, initialState.overview.warnings)
                    chai.expect(mapped.submitState).to.equal(initialState.overview.submitState)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
    })
})
