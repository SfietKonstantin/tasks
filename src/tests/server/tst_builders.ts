import * as chai from "chai"
import * as builders from "../../common/builders"
import { Project, Task } from "../../common/types"

describe("Builders", () => {
    describe("Project", () => {
        it("Should build a project", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            chai.expect(builders.buildProject(project)).to.deep.equal(project)
        })
        it("Should not build a project without identifier", () => {
            const project = {
                name: "Project",
                description: "Description"
            }
            chai.expect(() => { builders.buildProject(project) }).to.throw(builders.InvalidInput)
        })
        it("Should not build a project without name", () => {
            const project = {
                identifier: "project",
                description: "Description"
            }
            chai.expect(() => { builders.buildProject(project) }).to.throw(builders.InvalidInput)
        })
        it("Should not build a project without description", () => {
            const project = {
                identifier: "project",
                name: "Project",
            }
            chai.expect(() => { builders.buildProject(project) }).to.throw(builders.InvalidInput)
        })
    })
})
