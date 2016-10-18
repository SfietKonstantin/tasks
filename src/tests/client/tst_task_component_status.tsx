import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as jsdom from "jsdom"
import * as sinon from "sinon"
import { Status } from "../../client/task/components/status"
import { Task, TaskResults } from "../../common/types"

let document = jsdom.jsdom("<!doctype html><html><body></body></html>")
let window = document.defaultView

global.document = document
global.window = window

describe("Task components", () => {
    describe("Status", () => {
        before(() => {
            sinon.useFakeTimers(new Date(2016, 2, 6).getTime())
        })
        it("Should create Status for not started and on time task", () => {
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 3, 1),
                estimatedDuration: 20
            }
            const taskResults: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2016, 3, 1),
                duration: 20
            }
            const component = testutils.renderIntoDocument(
                <Status task={task} taskResults={taskResults} />
            ) as React.Component<any, any>
            const state = testutils.findRenderedDOMComponentWithClass(component, "task-overview-state") as HTMLElement
            chai.expect(state.textContent).to.equals(" Not started")
        })
    })
})