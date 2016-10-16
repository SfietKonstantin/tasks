import * as chai from "chai"
import { parseTasks, InvalidFormatError } from "../../client/imports/primavera/import"
import { PrimaveraTask } from "../../client/imports/primavera/types"
import * as maputils from "../../common/maputils"

describe("Primavera import", () => {
    it("Should throw an exception on input < 2 lines", () => {
        const tasks = "header"
        chai.expect(() => {parseTasks(tasks)}).to.throw(Error)
    })
    it("Should import a empty task listing", () => {
        const tasks = "header\nsecond_line"
        const results = parseTasks(tasks)
        chai.expect(results.tasks.size).to.equal(0)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.empty
    })
    it("Should throw an exception on input < 9 column", () => {
        const tasks = "header\nsecond_line\ntest"
        chai.expect(() => {parseTasks(tasks)}).to.throw(Error)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.empty
    })
    it("Should not import a task without id", () => {
        const tasks = "header\nsecond_line\n\t\t\t\tTask\t25\t\t1/02/2016 12:34:56\t26/02/2016 12:34:56"
        const results = parseTasks(tasks)
        chai.expect(results.tasks.size).to.equal(0)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.empty
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(1)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(1)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(0)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(0)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(1)
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
        chai.expect(results.tasks.get("id")).to.deep.equal(expected)
        chai.expect(results.delays.size).to.equal(0)
        chai.expect(results.warnings).to.length(1)
    })
})
