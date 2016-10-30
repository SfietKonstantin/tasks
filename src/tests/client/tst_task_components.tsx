import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { Breadcrumb } from "../../client/task/components/breadcrumb"
import { Project, Task } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Task components", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    describe("Breadcrumb", () => {
        it("Should create a Breadcrumb", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: ""
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            }
            const component = enzyme.shallow(<Breadcrumb project={project} task={task} />)
            const items = component.find("li")
            chai.expect(items).to.length(3)
            chai.expect(items.at(0).children().prop("href")).to.equal("/")
            chai.expect(items.at(1).children().text()).to.equal("Project")
            chai.expect(items.at(1).children().prop("href")).to.equal("/project/project")
            chai.expect(items.at(2).children().text()).to.equal("Task")
        })
        it("Should create a Breadcrumb with a long task name", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: ""
            }
            const task: Task = {
                identifier: "task",
                name: "Task with a very very very very very long name and this name continues",
                description: "",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            }
            const component = enzyme.shallow(<Breadcrumb project={project} task={task} />)
            const items = component.find("li")
            chai.expect(items).to.length(3)
            chai.expect(items.at(0).children().prop("href")).to.equal("/")
            chai.expect(items.at(1).children().text()).to.equal("Project")
            chai.expect(items.at(1).children().prop("href")).to.equal("/project/project")
            const expected = "Task with a very very very very very long name and ..."
            chai.expect(items.at(2).children().text()).to.equal(expected)
        })
    })
})
