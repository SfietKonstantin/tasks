import * as chai from "chai"
import * as apitypes from "../../common/apitypes"
import { Project, Task } from "../../common/types"

const compareTasks = (first: Task, second: Task) => {
    chai.expect(first.projectIdentifier).to.equals(second.projectIdentifier)
    chai.expect(first.identifier).to.equals(second.identifier)
    chai.expect(first.name).to.equals(second.name)
    chai.expect(first.description).to.equals(second.description)
    chai.expect(first.estimatedStartDate.getTime()).to.equals(second.estimatedStartDate.getTime())
    chai.expect(first.estimatedDuration).to.equals(second.estimatedDuration)
}

describe("API types", () => {
    describe("createTaskFromApiImportTask", () => {
        it("Should create a Task", () => {
            const apiTask: apitypes.ApiInputTask = {
                projectIdentifier: "project",
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15).toISOString(),
                estimatedDuration: 123
            }
            const task: Task = {
                projectIdentifier: "project",
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedStartDate: new Date(2015, 1, 15),
                estimatedDuration: 123
            }
            compareTasks(apitypes.createTaskFromApiImportTask(apiTask), task)
        })
    })
})
