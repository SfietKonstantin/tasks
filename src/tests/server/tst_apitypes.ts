import * as chai from "chai"
import * as apitypes from "../../common/apitypes"
import { Project, Task, TaskRelation, TaskLocation, Delay, DelayRelation } from "../../common/types"
import { InputError } from "../../common/errors"

describe("API types", () => {
    describe("createProject", () => {
        it("Should create a project", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            chai.expect(apitypes.createProject(project)).to.deep.equal(project)
        })
        it("Should not create a project without identifier", () => {
            const project = {
                name: "Project",
                description: "Description"
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
        it("Should not create a project with wrong identifier", () => {
            const project = {
                identifier: { test: "test" },
                name: "Project",
                description: "Description"
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
        it("Should not create a project without name", () => {
            const project = {
                identifier: "project",
                name: { test: "test" },
                description: "Description"
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
        it("Should not create a project with wrong name", () => {
            const project = {
                identifier: "project",
                description: "Description"
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
        it("Should not create a project without description", () => {
            const project = {
                identifier: "project",
                name: "Project",
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
        it("Should not create a project with wrong description", () => {
            const project = {
                identifier: "project",
                name: "Project",
                description: { test: "test" }
            }
            chai.expect(() => { apitypes.createProject(project) }).to.throw(InputError)
        })
    })
    describe("createTask", () => {
        it("Should create a Task", () => {
            const apiTask: apitypes.ApiInputTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            chai.expect(apitypes.createTask(apiTask)).to.deep.equal(task)
        })
        it("Should not create a task without identifier", () => {
            const apiTask = {
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task with wrong identifier", () => {
            const apiTask = {
                identifier: { test: "test" },
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task without name", () => {
            const apiTask = {
                identifier: "identifier",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task with wrong name", () => {
            const apiTask = {
                identifier: "identifier",
                name: { test: "test" },
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task without description", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task with wrong description", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: { test: "test" },
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task without estimatedStartDate", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task with wrong estimatedStartDate", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: { test: "test" },
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task without estimatedDuration", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
        it("Should not create a task with wrong estimatedDuration", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: { test: "test" }
            }
            chai.expect(() => { apitypes.createTask(apiTask) }).to.throw(InputError)
        })
    })
    describe("createTaskRelation", () => {
        it("Should create a relation 1", () => {
            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "task2",
                lag: 3
            }
            chai.expect(apitypes.createTaskRelation(relation)).to.deep.equal(relation)
        })
        it("Should create a relation 2", () => {
            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 3
            }
            chai.expect(apitypes.createTaskRelation(relation)).to.deep.equal(relation)
        })
        it("Should not create a relation without previous", () => {
            const relation = {
                previousLocation: TaskLocation.Beginning,
                next: "task2",
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong previous", () => {
            const relation = {
                previous: { test: "test" },
                previousLocation: TaskLocation.Beginning,
                next: "task2",
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation without previousLocation", () => {
            const relation = {
                previous: "task1",
                next: "task2",
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong previousLocation 1", () => {
            const relation = {
                previous: "task1",
                previousLocation: { test: "test" },
                next: "task2",
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong previousLocation 2", () => {
            const relation = {
                previous: "task1",
                previousLocation: 123,
                next: "task2",
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation without next", () => {
            const relation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong next", () => {
            const relation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: { test: "test" },
                lag: 3
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation without lag", () => {
            const relation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "task2"
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong lag", () => {
            const relation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "task2",
                lag: { test: "test" }
            }
            chai.expect(() => { apitypes.createTaskRelation(relation) }).to.throw(InputError)
        })
    })
    describe("createDelay", () => {
        it("Should create a Delay", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            const delay: Delay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15)
            }
            chai.expect(apitypes.createDelay(apiDelay)).to.deep.equal(delay)
        })
        it("Should not create a delay without identifier", () => {
            const apiDelay = {
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay with wrong identifier", () => {
            const apiDelay = {
                identifier: { test: "test" },
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay without name", () => {
            const apiDelay = {
                identifier: "identifier",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay with wrong name", () => {
            const apiDelay = {
                identifier: "identifier",
                name: { test: "test" },
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay without description", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay with wrong description", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: { test: "test" },
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay without estimatedStartDate", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedDuration: 123
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
        it("Should not create a delay with wrong estimatedStartDate", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: { test: "test" }
            }
            chai.expect(() => { apitypes.createDelay(apiDelay) }).to.throw(InputError)
        })
    })
    describe("createDelayRelation", () => {
        it("Should create a relation", () => {
            const relation: DelayRelation = {
                delay: "delay",
                task: "task",
                lag: 3
            }
            chai.expect(apitypes.createDelayRelation(relation)).to.deep.equal(relation)
        })
        it("Should not create a relation without delay", () => {
            const relation = {
                task: "task",
                lag: 3
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong delay", () => {
            const relation = {
                delay: { test: "test" },
                task: "task",
                lag: 3
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation without task", () => {
            const relation = {
                delay: "delay",
                lag: 3
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong task", () => {
            const relation = {
                delay: "delay",
                task: { test: "test" },
                lag: 3
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation without lag", () => {
            const relation = {
                delay: "delay",
                task: "task"
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
        it("Should not create a relation with wrong lag", () => {
            const relation = {
                delay: "delay",
                task: "task",
                lag: { test: "test" }
            }
            chai.expect(() => { apitypes.createDelayRelation(relation) }).to.throw(InputError)
        })
    })
})
