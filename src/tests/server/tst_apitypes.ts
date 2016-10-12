import * as chai from "chai"
import * as apitypes from "../../common/apitypes"
import { Project, Task} from "../../common/types"

function compareTasks(first: Task, second: Task) {
    chai.expect(first.identifier).to.equals(second.identifier)
    chai.expect(first.projectIdentifier).to.equals(second.projectIdentifier)
    chai.expect(first.name).to.equals(second.name)
    chai.expect(first.description).to.equals(second.description)
    chai.expect(first.estimatedStartDate.getTime()).to.equals(second.estimatedStartDate.getTime())
    chai.expect(first.estimatedDuration).to.equals(second.estimatedDuration)
}

describe("API types", () => {
    describe("createTaskFromApiImportTask", () => {
        it("Should create a Task", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
        it("Should create a Task with null identifier", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: null,
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: null,
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
        it("Should create a Task with null projectIdentifier", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: "identifier",
                projectIdentifier: null,
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: "identifier",
                projectIdentifier: null,
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
        it("Should create a Task with null name", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: null,
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: null,
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
        it("Should create a Task with null description", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: null,
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: null,
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
        it("Should create a Task with null estimatedDuration", () => {
            const apiTask: apitypes.ApiImportTask = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: null
            }
            const task: Task = {
                identifier: "identifier",
                projectIdentifier: "project",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: null
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
    })
})