import * as chai from "chai"
import {TaskBuilder, ApiTaskDefinition, ApiTask} from "../../../../common/old/api/task"
import {TaskDefinition, Task} from "../../../../common/old/task"
import {InputError} from "../../../../common/errors/input"

describe("API TaskBuilder", () => {
    xit("Should create a Task from correct input", () => {
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
        chai.expect(TaskBuilder.fromObject(apiTask)).to.deep.equal(task)
    })
    xit("Should not create a task from an input without identifier", () => {
        const apiTask = {
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not create a task from an input with a wrong identifier type", () => {
        const apiTask = {
            identifier: {test: "test"},
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task without name", () => {
        const apiTask = {
            identifier: "identifier",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task with a wrong name type", () => {
        const apiTask = {
            identifier: "identifier",
            name: {test: "test"},
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task without description", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task with a wrong description type", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            description: {test: "test"},
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task without estimatedStartDate", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task with a wrong estimatedStartDate type", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedStartDate: {test: "test"},
            estimatedDuration: 123
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task without estimatedDuration", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
    xit("Should not fromObject a task with a wrong estimatedDuration type", () => {
        const apiTask = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedStartDate: new Date(2015, 1, 15).toISOString(),
            estimatedDuration: {test: "test"}
        }
        chai.expect(() => {
            TaskBuilder.fromObject(apiTask)
        }).to.throw(InputError)
    })
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
    xit("Should convert a Task to an API task", () => {
        chai.expect(TaskBuilder.toApiTask(task, task.startDate, task.duration)).to.deep.equal(apiTask)
    })
    xit("Should convert an API Task to a task", () => {
        chai.expect(TaskBuilder.fromApiTask(apiTask)).to.deep.equal(task)
    })
})
