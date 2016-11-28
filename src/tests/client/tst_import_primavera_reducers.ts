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
    State, Stage, SubmitState
} from "../../client/imports/primavera/types"
import { RelationGraph, RelationGraphNode, GraphDiff } from "../../client/imports/primavera/graph"
import * as projectEditor from "../../client/imports/primavera/components/projecteditor"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import * as delaysSelector from "../../client/imports/primavera/components/delaysselector"
import * as overview from "../../client/imports/primavera/components/overview"
import { TasksParseResults, RelationsParseResults } from "../../client/imports/primavera/imports"
import { TaskListFilters, MilestoneFilterMode } from "../../client/common/tasklist/types"
import * as states from "../../client/imports/primavera/states"
import { FakeFile, FakeFileReader } from "./fakefile"
import { FakeResponse } from "./fakeresponse"
import { makeRelations } from "./primaverahelper"
import { expectMapEqual, expectSetEqualToArray, expectSetEqual } from "./expectutils"
import {
    cloneObject, cloneArray, cloneMap, cloneSet, mapToArray,
    warnings, noWarnings, project, primaveraTasks2,
    primaveraRelationNodes2, selectedDelays2,
    inputTasks2, inputDelays2, inputTaskRelations2, inputDelayRelations2
} from "./testdata"

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

describe("Primavera reducers", () => {
    let dispatch: Sinon.SinonSpy
    let initialState1: State
    let initialState2: State

    beforeEach(() => {
        dispatch = sinon.spy()
        initialState1 = {
            stage: cloneObject(states.stage),
            project: cloneObject(states.project),
            tasks: cloneObject(states.tasks),
            relations: cloneObject(states.relations),
            delays: cloneObject(states.delays),
            overview: cloneObject(states.overview)
        }
        initialState2 = {
            stage: {
                current: Stage.Overview,
                max: Stage.Overview
            },
            project: cloneObject(project),
            tasks: {
                length: 123,
                tasks: cloneMap(primaveraTasks2),
                warnings: cloneMap(warnings),
                isImporting: true,
                isInvalidFormat: true,
            },
            relations: {
                length: 123,
                relations: cloneMap(primaveraRelationNodes2),
                warnings: cloneMap(warnings),
                isImporting: true,
                isInvalidFormat: true
            },
            delays: {
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                    text: "test"
                },
                tasks: mapToArray(primaveraTasks2),
                selection: cloneSet(selectedDelays2),
                diffs: cloneArray(graphDiff),
                warnings: cloneMap(warnings)
            },
            overview: {
                tasks: cloneArray(inputTasks2),
                delays: cloneArray(inputDelays2),
                taskRelations: cloneArray(inputTaskRelations2),
                delayRelations: cloneArray(inputDelayRelations2),
                warnings: cloneMap(warnings),
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
                    tasks: cloneMap(primaveraTasks2),
                    warnings: cloneMap(warnings)
                }
                const state = main.mainReducer(initialState, endTasksImport(results))
                chai.expect(state.tasks.isImporting).to.false
                chai.expect(state.tasks.isInvalidFormat).to.false
                chai.expect(state.tasks.length).to.equal(123)
                expectMapEqual(state.tasks.tasks, primaveraTasks2)
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
                    relations: cloneMap(primaveraRelationNodes2),
                    warnings: cloneMap(warnings)
                }
                const state = main.mainReducer(initialState, endRelationsImport(results))
                chai.expect(state.relations.isImporting).to.false
                chai.expect(state.relations.isInvalidFormat).to.false
                chai.expect(state.relations.length).to.equal(123)
                expectMapEqual(state.relations.relations, primaveraRelationNodes2)
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
                const state = main.mainReducer(initialState, defineDelayFilters(primaveraTasks2, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    primaveraTasks2.get("milestone1"),
                    primaveraTasks2.get("milestone2"),
                    primaveraTasks2.get("task1"),
                    primaveraTasks2.get("task2"),
                    primaveraTasks2.get("task3"),
                    primaveraTasks2.get("task4")
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
                const state = main.mainReducer(initialState, defineDelayFilters(primaveraTasks2, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    primaveraTasks2.get("task1"),
                    primaveraTasks2.get("task2"),
                    primaveraTasks2.get("task3"),
                    primaveraTasks2.get("task4")
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
                const state = main.mainReducer(initialState, defineDelayFilters(primaveraTasks2, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    primaveraTasks2.get("milestone1"),
                    primaveraTasks2.get("milestone2")
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
                const state = main.mainReducer(initialState, defineDelayFilters(primaveraTasks2, filters))
                chai.expect(state.delays.tasks).to.deep.equal([
                    primaveraTasks2.get("milestone1"),
                    primaveraTasks2.get("task1")
                ])
                chai.expect(state.delays.filters).to.deep.equal(filters)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 1", () => {
            const expectedDiffs: Array<GraphDiff> = [
                {
                    added: [
                        {
                            previous: "task1",
                            next: "task2",
                            type: "FS",
                            lag: 10
                        }
                    ],
                    removed: [
                        ["task1", "milestone1"],
                        ["milestone1", "task2"]
                    ]
                }
            ]
            const action = defineDelaySelection(primaveraTasks2, primaveraRelationNodes2, "milestone1", true)
            const state = main.mainReducer(initialState1, action)
            expectSetEqualToArray(state.delays.selection, ["milestone1"])
            chai.expect(state.delays.diffs).to.deep.equal(expectedDiffs)
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 2", () => {
            const expectedDiffs: Array<GraphDiff> = [
                {
                    added: [
                        {
                            previous: "task1",
                            next: "task2",
                            type: "FS",
                            lag: 10
                        }
                    ],
                    removed: [
                        ["task1", "milestone1"],
                        ["milestone1", "task2"]
                    ]
                }
            ]
            const action = defineDelaySelection(primaveraTasks2, primaveraRelationNodes2, "milestone1", true)
            const state = main.mainReducer(initialState2, action)
            expectSetEqualToArray(state.delays.selection, ["task3", "milestone1"])
            chai.expect(state.delays.diffs).to.deep.equal(expectedDiffs)
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 3", () => {
            const action = defineDelaySelection(primaveraTasks2, primaveraRelationNodes2, "milestone1", false)
            const state = main.mainReducer(initialState1, action)
            chai.expect(state.delays.selection.size).to.equal(0)
            chai.expect(state.delays.diffs).to.empty
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
        it("Should reduce DELAY_SELECTION_DEFINE 4", () => {
            const action = defineDelaySelection(primaveraTasks2, primaveraRelationNodes2, "milestone1", false)
            const state = main.mainReducer(initialState2, action)
            expectSetEqualToArray(state.delays.selection, ["task3"])
            chai.expect(state.delays.diffs).to.empty
            chai.expect(state.delays.warnings.size).to.equal(0)
        })
    })
    describe("Overview reducers", () => {
        it("Should reduce OVERVIEW_FILTER", () => {
            const checkState = (initialState: State) => {
                const action = filterForOverview(primaveraTasks2, selectedDelays2, primaveraRelationNodes2)
                const state = main.mainReducer(initialState, action)
                chai.expect(state.overview.tasks).to.deep.equal(inputTasks2)
                chai.expect(state.overview.delays).to.deep.equal(inputDelays2)
                chai.expect(state.overview.taskRelations).to.deep.equal(inputTaskRelations2)
                chai.expect(state.overview.delayRelations).to.deep.equal(inputDelayRelations2)
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
        describe("DelaysSelector", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = delaysSelector.mapStateToProps(initialState)
                    chai.expect(mapped.stage).to.equal(initialState.stage.current)
                    expectMapEqual(mapped.tasks, initialState.tasks.tasks)
                    chai.expect(mapped.filteredTasks).to.deep.equal(initialState.delays.tasks)
                    chai.expect(mapped.filters).to.deep.equal(initialState.delays.filters)
                    expectMapEqual(mapped.relations, initialState.relations.relations)
                    expectMapEqual(mapped.warnings, initialState.delays.warnings)
                    expectSetEqual(mapped.selection, initialState.delays.selection)
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
                    chai.expect(mapped.delays).to.deep.equal(initialState.overview.delays)
                    chai.expect(mapped.totalRelations).to.equal(initialState.relations.length)
                    chai.expect(mapped.taskRelations).to.deep.equal(initialState.overview.taskRelations)
                    chai.expect(mapped.delayRelations).to.deep.equal(initialState.overview.delayRelations)
                    expectMapEqual(mapped.warnings, initialState.overview.warnings)
                    chai.expect(mapped.submitState).to.equal(initialState.overview.submitState)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
    })
})
