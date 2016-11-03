import * as chai from "chai"
import * as sinon from "sinon"
import { Action } from "redux"
import { ErrorAction } from "../../client/common/actions/errors"
import { Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import { StageAction, STAGE_DEFINE, defineStage } from "../../client/imports/primavera/actions/stages"
import {
    ProjectAction, PROJECT_DEFINE, defineProject
} from "../../client/imports/primavera/actions/project"
import {
    TasksAction, TASKS_IMPORT_BEGIN, TASKS_IMPORT_END, TASKS_IMPORT_INVALID_FORMAT, TASKS_DISMISS_INVALID_FORMAT,
    importTasks, beginTasksImport, endTasksImport, tasksImportInvalidFormat,
    dismissInvalidTasksFormat,
} from "../../client/imports/primavera/actions/tasks"
import {
    RelationsAction, RELATIONS_IMPORT_BEGIN, RELATIONS_IMPORT_END, RELATIONS_IMPORT_INVALID_FORMAT,
    RELATIONS_DISMISS_INVALID_FORMAT,
    importRelations, beginRelationsImport, endRelationsImport, relationsImportInvalidFormat,
    dismissInvalidRelationsFormat
} from "../../client/imports/primavera/actions/relations"
import {
    OverviewFilterAction, OVERVIEW_FILTER, OVERVIEW_SUBMIT_REQUEST, OVERVIEW_SUBMIT_RECEIVE,
    OVERVIEW_SUBMIT_RECEIVE_FAILURE,
    filterForOverview, requestSubmit, receiveSubmit, receiveSubmitFailure, submit
} from "../../client/imports/primavera/actions/overview"
import * as files from "../../client/common/actions/files"
import { parseTasks, parseRelations } from "../../client/imports/primavera/imports"
import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { ApiInputTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"
import { FakeFile } from "./fakefile"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera actions", () => {
    let sandbox: Sinon.SinonSandbox
    beforeEach(() => {
        addFakeGlobal()
        sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
        sandbox.restore()
        clearFakeGlobal()
    })
    describe("Stage", () => {
        it("Should create STAGE_DEFINE 1", () => {
            const expected: StageAction = {
                type: STAGE_DEFINE,
                stage: Stage.Project
            }
            chai.expect(defineStage(Stage.Project)).to.deep.equal(expected)
        })
        it("Should create STAGE_DEFINE 2", () => {
            const expected: StageAction = {
                type: STAGE_DEFINE,
                stage: Stage.Tasks
            }
            chai.expect(defineStage(Stage.Tasks)).to.deep.equal(expected)
        })
        it("Should create STAGE_DEFINE 3", () => {
            const expected: StageAction = {
                type: STAGE_DEFINE,
                stage: Stage.Relations
            }
            chai.expect(defineStage(Stage.Relations)).to.deep.equal(expected)
        })
        it("Should create STAGE_DEFINE 4", () => {
            const expected: StageAction = {
                type: STAGE_DEFINE,
                stage: Stage.Overview
            }
            chai.expect(defineStage(Stage.Overview)).to.deep.equal(expected)
        })
    })
    describe("Project", () => {
        describe("Synchronous", () => {
            it("Should create PROJECT_DEFINE", () => {
                const expected: ProjectAction = {
                    type: PROJECT_DEFINE,
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                }
                chai.expect(defineProject("identifier", "Name", "Description")).to.deep.equal(expected)
            })
        })
    })
    describe("Tasks", () => {
        describe("Synchronous", () => {
            it("Should create TASKS_IMPORT_BEGIN", () => {
                const expected: Action = {
                    type: TASKS_IMPORT_BEGIN
                }
                chai.expect(beginTasksImport()).to.deep.equal(expected)
            })
            it("Should create TASKS_IMPORT_END", () => {
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
                const delays = new Map<string, PrimaveraDelay>()
                const warnings = new Map<string, Array<string>>()
                warnings.set("task1", ["Warning 1", "Warning 2"])
                warnings.set("task2", ["Warning 3"])
                const expected: TasksAction = {
                    length: 123,
                    type: TASKS_IMPORT_END,
                    tasks,
                    delays,
                    warnings
                }
                chai.expect(endTasksImport({length: 123, tasks, delays, warnings})).to.deep.equal(expected)
            })
            it("Should create TASKS_IMPORT_INVALID_FORMAT", () => {
                const expected: ErrorAction = {
                    type: TASKS_IMPORT_INVALID_FORMAT,
                    message: "Invalid format for tasks CSV file"
                }
                chai.expect(tasksImportInvalidFormat()).to.deep.equal(expected)
            })
            it("Should create TASKS_DISMISS_INVALID_FORMAT", () => {
                const expected: Action = {
                    type: TASKS_DISMISS_INVALID_FORMAT
                }
                chai.expect(dismissInvalidTasksFormat()).to.deep.equal(expected)
            })
        })
        describe("Asynchronous", () => {
            it("Should parse a file", () => {
                const fakeFile = new FakeFile()
                let dispatch = sinon.spy()
                const mock = sandbox.mock(files).expects("processFile").once()
                mock.calledWithExactly(fakeFile, parseTasks, beginTasksImport, endTasksImport,
                                       tasksImportInvalidFormat)
                importTasks(fakeFile)
                chai.expect(mock.calledOnce).to.true
            })
        })
    })
    describe("Relations", () => {
        describe("Synchronous", () => {
            it("Should create RELATIONS_IMPORT_BEGIN", () => {
                const expected: Action = {
                    type: RELATIONS_IMPORT_BEGIN
                }
                chai.expect(beginRelationsImport()).to.deep.equal(expected)
            })
            it("Should create RELATIONS_IMPORT_END", () => {
                const relations: Array<PrimaveraTaskRelation> = [
                    {
                        previous: "task1",
                        next: "milestone1",
                        type: "FF",
                        lag: 3
                    }
                ]
                const warnings = new Map<string, Array<string>>()
                warnings.set("task1", ["Warning 1", "Warning 2"])
                warnings.set("task2", ["Warning 3"])
                const expected: RelationsAction = {
                    length: 123,
                    type: RELATIONS_IMPORT_END,
                    relations,
                    warnings
                }
                chai.expect(endRelationsImport({length: 123, relations, warnings})).to.deep.equal(expected)
            })
            it("Should create RELATIONS_IMPORT_INVALID_FORMAT", () => {
                const expected: ErrorAction = {
                    type: RELATIONS_IMPORT_INVALID_FORMAT,
                    message: "Invalid format for relations CSV file"
                }
                chai.expect(relationsImportInvalidFormat()).to.deep.equal(expected)
            })
            it("Should create RELATIONS_DISMISS_INVALID_FORMAT", () => {
                const expected: Action = {
                    type: RELATIONS_DISMISS_INVALID_FORMAT
                }
                chai.expect(dismissInvalidRelationsFormat()).to.deep.equal(expected)
            })
        })
        describe("Asynchronous", () => {
            it("Should parse a file", () => {
                const fakeFile = new FakeFile()
                let dispatch = sinon.spy()
                const mock = sandbox.mock(files).expects("processFile").once()
                mock.calledWithExactly(fakeFile, parseRelations, beginRelationsImport, endRelationsImport,
                                       relationsImportInvalidFormat)
                importRelations(fakeFile)
                chai.expect(mock.calledOnce).to.true
            })
        })
    })
    describe("Overview", () => {
        describe("Synchronous", () => {
            it("Should create OVERVIEW_FILTER", () => {
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
                const expected: OverviewFilterAction = {
                    type: OVERVIEW_FILTER,
                    tasks: filteredTasks,
                    relations: filteredRelations,
                    warnings: new Map<string, Array<string>>()
                }
                chai.expect(filterForOverview(tasks, relations)).to.deep.equal(expected)
            })
            it("Should create OVERVIEW_SUBMIT_REQUEST", () => {
                const expected: Action = {
                    type: OVERVIEW_SUBMIT_REQUEST
                }
                chai.expect(requestSubmit()).to.deep.equal(expected)
            })
            it("Should create OVERVIEW_SUBMIT_RECEIVE", () => {
                const expected: Action = {
                    type: OVERVIEW_SUBMIT_RECEIVE
                }
                chai.expect(receiveSubmit()).to.deep.equal(expected)
            })
            it("Should create OVERVIEW_SUBMIT_RECEIVE_FAILURE", () => {
                const expected: ErrorAction = {
                    type: OVERVIEW_SUBMIT_RECEIVE_FAILURE,
                    message: "Some error"
                }
                chai.expect(receiveSubmitFailure("Some error")).to.deep.equal(expected)
            })
        })
        describe("Asynchronous", () => {
            let sandbox: Sinon.SinonSandbox
            let dispatch: Sinon.SinonSpy
            let fetchMock: Sinon.SinonExpectation

            beforeEach(() => {
                addFakeGlobal()
                sandbox = sinon.sandbox.create()
                dispatch = sinon.spy()
                fetchMock = sandbox.mock(global).expects("fetch")
            })
            afterEach(() => {
                sandbox.restore()
                clearFakeGlobal()
            })
            it("Should submit", (done) => {
                // Mock
                const project: Project = {
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                }
                const tasks: Array<ApiInputTask> = [
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
                const relations: Array<TaskRelation> = [
                    {
                        previous: "task1",
                        next: "milestone1",
                        previousLocation: TaskLocation.End,
                        lag: 3
                    }
                ]
                const response = new FakeResponse(true, {})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                submit(project, tasks, relations)(dispatch).then(() => {
                    const expected: Action = {
                        type: OVERVIEW_SUBMIT_RECEIVE
                    }
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWithExactly(expected)).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                const expected: Action = { type: OVERVIEW_SUBMIT_REQUEST }
                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true

                chai.expect(fetchMock.calledOnce).to.true
                chai.expect(fetchMock.args[0]).to.length(2)
                chai.expect(fetchMock.args[0][0]).to.equal("/api/import")
                const requestInit = fetchMock.args[0][1] as RequestInit
                chai.expect(requestInit.method).to.equal("PUT")
                const body = JSON.parse(requestInit.body as string)
                chai.expect(body).to.haveOwnProperty("project")
                chai.expect(body.project).to.deep.equal(project)
                chai.expect(body).to.haveOwnProperty("tasks")
                chai.expect(body.tasks).to.deep.equal(tasks)
                chai.expect(body).to.haveOwnProperty("relations")
                chai.expect(body.relations).to.deep.equal(relations)
            })
            it("Should react to error from server", (done) => {
                // Mock
                const project: Project = {
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                }
                const tasks: Array<ApiInputTask> = [
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
                const relations: Array<TaskRelation> = [
                    {
                        previous: "task1",
                        next: "milestone1",
                        previousLocation: TaskLocation.End,
                        lag: 3
                    }
                ]
                const response = new FakeResponse(false, {error: "Error message"})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                submit(project, tasks, relations)(dispatch).then(() => {
                    const expected: ErrorAction = {
                        type: OVERVIEW_SUBMIT_RECEIVE_FAILURE,
                        message: "Error message"
                    }
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWithExactly(expected)).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                const expected: Action = { type: OVERVIEW_SUBMIT_REQUEST }
                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
            })
        })
    })
})
