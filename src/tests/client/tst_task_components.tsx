import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as jsdom from "jsdom"
import { Breadcrumb } from "../../client/task/components/breadcrumb"
import { Project, Task } from "../../common/types"

const document = jsdom.jsdom("<!doctype html><html><body></body></html>")
const window = document.defaultView

global.document = document
global.window = window

describe("Task components", () => {
    describe("Breadcrumb", () => {
        it("Should create a Breadcrumb", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: ""
            }
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            }
            const component = testutils.renderIntoDocument(
                <Breadcrumb project={project} task={task} />
            ) as React.Component<any, any>
            const ol = testutils.findRenderedDOMComponentWithTag(component, "ol")
            const olLi = ol.getElementsByTagName("li")
            chai.expect(olLi).to.length(3)
            chai.expect(olLi[1].textContent).to.equal("Project")
            chai.expect(olLi[2].textContent).to.equal("Task")

            const li1a = olLi[0].getElementsByTagName("a")
            chai.expect(li1a).to.length(1)
            chai.expect(li1a[0].href).to.equal("/")
            const li2a = olLi[1].getElementsByTagName("a")
            chai.expect(li2a).to.length(1)
            chai.expect(li2a[0].href).to.equal("/project/project")
        })
        it("Should create a Breadcrumb with a long task name", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: ""
            }
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task with a very very very very very long name and this name continues",
                description: "",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            }
            const component = testutils.renderIntoDocument(
                <Breadcrumb project={project} task={task} />
            ) as React.Component<any, any>
            const ol = testutils.findRenderedDOMComponentWithTag(component, "ol")
            const olLi = ol.getElementsByTagName("li")
            chai.expect(olLi).to.length(3)
            chai.expect(olLi[1].textContent).to.equal("Project")
            chai.expect(olLi[2].textContent).to.equal("Task with a very very very very very long name and ...")

            const li1a = olLi[0].getElementsByTagName("a")
            chai.expect(li1a).to.length(1)
            chai.expect(li1a[0].href).to.equal("/")
            const li2a = olLi[1].getElementsByTagName("a")
            chai.expect(li2a).to.length(1)
            chai.expect(li2a[0].href).to.equal("/project/project")
        })
    })
})
