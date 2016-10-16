import * as chai from "chai"
import * as apitypes from "../../common/apitypes"
import { Project, Task } from "../../common/types"

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
            chai.expect(apitypes.createTaskFromApiImportTask(apiTask)).to.deep.equal(task)
        })
    })
})
