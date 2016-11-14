import * as chai from "chai"
import { parseTasks, parseRelations, filterTasks, filterRelations } from "../../client/imports/primavera/imports"
import { InvalidFormatError } from "../../client/common/actions/files"
import { PrimaveraTask, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import * as maputils from "../../common/maputils"
import { ApiInputTask } from "../../common/apitypes"
import { TaskRelation, TaskLocation } from "../../common/types"
import { makeRelations } from "./primaverahelper"

describe("Primavera import", () => {
    describe("Tasks", () => {
        it("Should throw an exception on input < 2 lines", () => {
            const tasks = "header"
            chai.expect(() => {parseTasks(tasks)}).to.throw(InvalidFormatError)
        })
        it("Should import a empty task listing", () => {
            const tasks = "header\nsecond_line"
            const results = parseTasks(tasks)
            chai.expect(results).to.length(0)
            chai.expect(results.tasks).to.empty
            chai.expect(results.warnings).to.empty
        })
        it("Should ignore empty lines", () => {
            const tasks = "header\nsecond_line\n\n\n"
            const results = parseTasks(tasks)
            chai.expect(results).to.length(0)
            chai.expect(results.tasks).to.empty
            chai.expect(results.warnings).to.empty
        })
        it("Should throw an exception on input < 9 column", () => {
            const tasks = "header\nsecond_line\ntest"
            chai.expect(() => {parseTasks(tasks)}).to.throw(InvalidFormatError)
        })
        it("Should import a simple task", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t25\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 25,
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 26)
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings).to.empty
        })
        it("Should not import a task without id", () => {
            const tasks = "header\nsecond_line\n\t\t\t\tTask\t25\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            chai.expect(results).to.length(0)
            chai.expect(results.tasks).to.empty
            chai.expect(results.warnings).to.empty
        })
        it("Should not import invalid task with invalid duration", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\tabcde\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            chai.expect(results).to.length(1)
            chai.expect(results.tasks).to.empty
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should not import invalid task with invalid start date and end date", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t25\t\tabcde\tabcde"
            const results = parseTasks(tasks)
            chai.expect(results).to.length(1)
            chai.expect(results.tasks).to.empty
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should emit different duration warnings", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t30\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 30,
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 26)
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should emit duplicated warnings", () => {
            const tasks = "header\nsecond_line\n" +
                        "id\t\t\t\tTask 1\t25\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56\n" +
                        "id\t\t\t\tTask 2\t10\t\t10/02/2016 10:00:00\t20/02/2016 10:00:00"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task 1",
                duration: 25,
                startDate: new Date(2016, 1, 1),
                endDate: new Date(2016, 1, 26)
            }
            chai.expect(results).to.length(2)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should parse start milestones", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t0\t\t1/02/2016 12:34:56\t"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 0,
                startDate: new Date(2016, 1, 1),
                endDate: null
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings).to.empty
        })
        it("Should parse end milestones", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t0\t\t\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 1, 26)
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings).to.empty
        })
        it("Should emit milestone with duration warning 1", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t25\t\t1/02/2016 12:34:56\t"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 0,
                startDate: new Date(2016, 1, 1),
                endDate: null
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should emit milestone with duration warning 2", () => {
            const tasks = "header\nsecond_line\nid\t\t\t\tTask\t25\t\t\t26/02/2016 12:34:56"
            const results = parseTasks(tasks)
            const expected: PrimaveraTask = {
                identifier: "id",
                name: "Task",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 1, 26)
            }
            chai.expect(results).to.length(1)
            chai.expect(results.tasks.get("id")).to.deep.equal(expected)
            chai.expect(results.warnings.size).to.equal(1)
        })
    })
    describe("Relations", () => {
        it("Should throw an exception on input < 2 lines", () => {
            const relations = "header"
            chai.expect(() => {parseRelations(relations)}).to.throw(InvalidFormatError)
        })
        it("Should import a empty relations listing", () => {
            const relations = "header\nsecond_line"
            const results = parseRelations(relations)
            chai.expect(results).to.length(0)
            chai.expect(results.relations).to.empty
            chai.expect(results.warnings).to.empty
        })
        it("Should ignore empty lines", () => {
            const relations = "header\nsecond_line\n\n\n"
            const results = parseRelations(relations)
            chai.expect(results).to.length(0)
            chai.expect(results.relations).to.empty
            chai.expect(results.warnings).to.empty
        })
        it("Should throw an exception on input < 10 column", () => {
            const relations = "header\nsecond_line\ntest"
            chai.expect(() => {parseRelations(relations)}).to.throw(InvalidFormatError)
        })
        it("Should import various relations", () => {
            const relations = "header\nsecond_line\n"
                              + "task1\ttask2\tFS\t\t\t\t\t\t\t10\n"
                              + "task3\ttask4\tSS\t\t\t\t\t\t\t5\n"
                              + "task5\ttask6\tSF\t\t\t\t\t\t\t3\n"
                              + "task7\ttask8\tFF\t\t\t\t\t\t\t1"
            const results = parseRelations(relations)
            const expected: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "task2",
                    type: "FS",
                    lag: 10
                },
                {
                    previous: "task3",
                    next: "task4",
                    type: "SS",
                    lag: 5
                },
                {
                    previous: "task5",
                    next: "task6",
                    type: "FF",
                    lag: 3
                }
            ]
            chai.expect(results).to.length(4)
            chai.expect(results.relations).to.deep.equal(makeRelations(expected))
            chai.expect(results.warnings).to.empty
        })
        it("Should import SF relation", () => {
            const relations = "header\nsecond_line\ntask1\ttask2\tSF\t\t\t\t\t\t\t1"
            const results = parseRelations(relations)
            const expected: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task2",
                    next: "task1",
                    type: "FS",
                    lag: -1
                }
            ]
            chai.expect(results).to.length(1)
            chai.expect(results.relations).to.deep.equal(makeRelations(expected))
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should not import invalid lag relation", () => {
            const relations = "header\nsecond_line\ntask1\ttask2\tFS\t\t\t\t\t\t\tabcde"
            const results = parseRelations(relations)
            chai.expect(results).to.length(1)
            chai.expect(results.relations).to.empty
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should not import invalid type relation", () => {
            const relations = "header\nsecond_line\ntask1\ttask2\tabcde\t\t\t\t\t\t\t10"
            const results = parseRelations(relations)
            chai.expect(results).to.length(1)
            chai.expect(results.relations).to.empty
            chai.expect(results.warnings.size).to.equal(1)
        })
        it("Should not import duplicated relation", () => {
            const relations = "header\nsecond_line\n"
                              + "task1\ttask2\tFS\t\t\t\t\t\t\t10\n"
                              + "task1\ttask3\tFS\t\t\t\t\t\t\t5\n"
                              + "task1\ttask2\tFS\t\t\t\t\t\t\t1"
            const results = parseRelations(relations)
            const expected: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "task2",
                    type: "FS",
                    lag: 10
                },
                {
                    previous: "task1",
                    next: "task3",
                    type: "FS",
                    lag: 5
                }
            ]
            chai.expect(results).to.length(3)
            chai.expect(results.relations).to.deep.equal(makeRelations(expected))
            chai.expect(results.warnings.size).to.equal(1)
        })
    })
    describe("Filter tasks", () => {
        it("Should filter invalid tasks", () => {
            const input: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
            input.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            input.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: NaN,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            input.set("task3", {
                identifier: "task3",
                name: "Task 3",
                duration: 0,
                startDate: null,
                endDate: null
            })
            input.set("task4", {
                identifier: "task4",
                name: "Task 4",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: null
            })
            input.set("task5", {
                identifier: "task5",
                name: "Task 5",
                duration: 20,
                startDate: null,
                endDate: new Date(2016, 9, 16)
            })
            const expected: Array<ApiInputTask> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    description: "",
                    estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                    estimatedDuration: 15
                }
            ]
            chai.expect(filterTasks(input)).to.deep.equal(expected)
        })
    })
    describe("Filter relations", () => {
        it("Should filter invalid relations", () => {
            const tasks: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            tasks.set("task3", {
                identifier: "task3",
                name: "Task 3",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            tasks.set("task4", {
                identifier: "task4",
                name: "Task 4",
                duration: 20,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 9, 16)
            })
            const relations: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "task2",
                    type: "FS",
                    lag: 3
                },
                {
                    previous: "task1",
                    next: "task3",
                    type: "SS",
                    lag: 5
                },
                {
                    previous: "task1",
                    next: "task5",
                    type: "FS",
                    lag: 0
                },
                {
                    previous: "task5",
                    next: "task4",
                    type: "FS",
                    lag: 0
                },
                {
                    previous: "task1",
                    next: "task4",
                    type: "FF",
                    lag: 0
                }
            ]
            const expected: Array<TaskRelation> = [
                {
                    previous: "task1",
                    previousLocation: TaskLocation.End,
                    next: "task2",
                    lag: 3
                },
                {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: "task3",
                    lag: 5
                }
            ]
            const results = filterRelations(tasks, makeRelations(relations))
            chai.expect(results.relations).to.deep.equal(expected)
            chai.expect(results.warnings.size).to.equal(3)
        })
    })
})
