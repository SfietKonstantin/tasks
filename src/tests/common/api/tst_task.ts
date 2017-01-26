import * as chai from "chai"
import {Builder, TaskDefinition as ApiTaskDefinition, Task as ApiTask} from "../../../common/api/task"
import {TaskDefinition, Task} from "../../../common/task"
import {InputError} from "../../../common/errors/input"

describe("API Task", () => {
    describe("Builder", () => {
        it("Should build a Task", () => {
            const apiTask: ApiTaskDefinition = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: TaskDefinition = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            chai.expect(Builder.create(apiTask)).to.deep.equal(task)
        })
        it("Should not create a task without identifier", () => {
            const apiTask = {
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task with wrong identifier", () => {
            const apiTask = {
                identifier: {test: "test"},
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task without name", () => {
            const apiTask = {
                identifier: "identifier",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task with wrong name", () => {
            const apiTask = {
                identifier: "identifier",
                name: {test: "test"},
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task without description", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task with wrong description", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: {test: "test"},
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task without estimatedStartDate", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task with wrong estimatedStartDate", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: {test: "test"},
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task without estimatedDuration", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
        it("Should not create a task with wrong estimatedDuration", () => {
            const apiTask = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: {test: "test"}
            }
            chai.expect(() => {
                Builder.create(apiTask)
            }).to.throw(InputError)
        })
    })
    describe("Conversion operators", () => {
        const apiTask: ApiTask = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123,
            startDate: new Date(2015, 1, 16).toISOString(),
            duration: 234
        }
        const task: Task = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15),
            estimatedDuration: 123,
            startDate: new Date(2015, 1, 16),
            duration: 234
        }
        it("Should convert a Task to an API task", () => {
            chai.expect(Builder.to(task)).to.deep.equal(apiTask)
        })
        it("Should convert an API Task to a task", () => {
            chai.expect(Builder.from(apiTask)).to.deep.equal(task)
        })
    })
})
