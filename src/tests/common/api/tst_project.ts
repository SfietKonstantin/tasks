import * as chai from "chai"
import {ProjectBuilder} from "../../../common/api/project"
import {Project} from "../../../common/project"
import {InputError} from "../../../common/errors/input"

describe("API ProjectBuilder", () => {
    it("Should create a project from correct input", () => {
        const project: Project = {
            identifier: "project",
            name: "Project",
            description: "Description"
        }
        chai.expect(ProjectBuilder.fromObject(project)).to.deep.equal(project)
    })
    it("Should not create a project from an input without identifier", () => {
        const project = {
            name: "Project",
            description: "Description"
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
    it("Should not create a project from an input wrong identifier type", () => {
        const project = {
            identifier: {test: "test"},
            name: "Project",
            description: "Description"
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
    it("Should not create a project from an input without name", () => {
        const project = {
            identifier: "project",
            name: {test: "test"},
            description: "Description"
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
    it("Should not create a project from an input with a wrong name type", () => {
        const project = {
            identifier: "project",
            description: "Description"
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
    it("Should not create a project from an input without description", () => {
        const project = {
            identifier: "project",
            name: "Project",
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
    it("Should not create a project from an input with a wrong description type", () => {
        const project = {
            identifier: "project",
            name: "Project",
            description: {test: "test"}
        }
        chai.expect(() => {
            ProjectBuilder.fromObject(project)
        }).to.throw(InputError)
    })
})
