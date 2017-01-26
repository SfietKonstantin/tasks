import * as chai from "chai"
import {ProjectBuilder} from "../../../common/api/project"
import {Project} from "../../../common/project"
import {InputError} from "../../../common/errors/input"

describe("API Project", () => {
    describe("ProjectBuilder", () => {
        it("Should create a project", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            chai.expect(ProjectBuilder.create(project)).to.deep.equal(project)
        })
        it("Should not create a project without identifier", () => {
            const project = {
                name: "Project",
                description: "Description"
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
        it("Should not create a project with wrong identifier", () => {
            const project = {
                identifier: {test: "test"},
                name: "Project",
                description: "Description"
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
        it("Should not create a project without name", () => {
            const project = {
                identifier: "project",
                name: {test: "test"},
                description: "Description"
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
        it("Should not create a project with wrong name", () => {
            const project = {
                identifier: "project",
                description: "Description"
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
        it("Should not create a project without description", () => {
            const project = {
                identifier: "project",
                name: "Project",
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
        it("Should not create a project with wrong description", () => {
            const project = {
                identifier: "project",
                name: "Project",
                description: {test: "test"}
            }
            chai.expect(() => {
                ProjectBuilder.create(project)
            }).to.throw(InputError)
        })
    })
})