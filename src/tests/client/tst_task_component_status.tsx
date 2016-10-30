import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as sinon from "sinon"
import { Status } from "../../client/task/components/status"
import { Task, TaskResults } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Task components", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    describe("Status", () => {
        let sandbox: Sinon.SinonSandbox
        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            sandbox.useFakeTimers(new Date(2016, 2, 6).getTime())
        })
        afterEach(() => {
            sandbox.restore()
        })
        const check = (component: React.Component<any, any>, stateText: string, progressStyle: string,
                       startText: string, startClass: string, startDate: string, startDays: string,
                       endText: string, endClass: string, endDate: string, endDays: string) => {
            const state = testutils.findRenderedDOMComponentWithClass(component, "task-overview-state")
            chai.expect(state.textContent).to.equal(" " + stateText)
            const progress = testutils.findRenderedDOMComponentWithClass(component, "task-overview-progress")
            const progressDivs = progress.getElementsByTagName("div")
            chai.expect(progressDivs).to.length(1)
            chai.expect(progressDivs[0].style.width).to.equal(progressStyle)
            const start = testutils.findRenderedDOMComponentWithClass(component, "task-overview-start")
            const startDivs = start.getElementsByTagName("div")
            chai.expect(startDivs).to.length(3)
            chai.expect(startDivs[0].textContent).to.equal(startText)
            const startDivs1Labels = startDivs[0].getElementsByClassName("label")
            chai.expect(startDivs1Labels).to.length(1)
            chai.expect(startDivs1Labels[0].className).to.contains(startClass)
            chai.expect(startDivs[1].textContent).to.equal(startDate)
            chai.expect(startDivs[2].textContent).to.equal(startDays)
            const end = testutils.findRenderedDOMComponentWithClass(component, "task-overview-end")
            const endDivs = end.getElementsByTagName("div")
            chai.expect(endDivs).to.length(3)
            chai.expect(endDivs[0].textContent).to.equal(endText)
            const endDivs1Labels = endDivs[0].getElementsByClassName("label")
            chai.expect(endDivs1Labels).to.length(1)
            chai.expect(endDivs1Labels[0].className).to.contains(endClass)
            chai.expect(endDivs[1].textContent).to.equal(endDate)
            chai.expect(endDivs[2].textContent).to.equal(endDays)
        }
        it("Should create Status for not started and on time task", () => {
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 3, 1),
                estimatedDuration: 20
            }
            const taskResults: TaskResults = {
                startDate: new Date(2016, 3, 1),
                duration: 20
            }
            const component = testutils.renderIntoDocument(
                <Status task={task} taskResults={taskResults} />
            ) as React.Component<any, any>
            check(component, "Not started", "0%",
                  "On time", "label-success", "Starting the 1/4/2016", "In 26 days",
                  "On time", "label-success", "Ending the 21/4/2016", "In 46 days")
        })
        it("Should create Status for not started and ending late task", () => {
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 3, 1),
                estimatedDuration: 20
            }
            const taskResults: TaskResults = {
                startDate: new Date(2016, 3, 1),
                duration: 25
            }
            const component = testutils.renderIntoDocument(
                <Status task={task} taskResults={taskResults} />
            ) as React.Component<any, any>
            check(component, "Not started", "0%",
                  "On time", "label-success", "Starting the 1/4/2016", "In 26 days",
                  "Late 5 days", "label-warning", "Ending the 26/4/2016", "In 51 days")
        })
        it("Should create Status for not started and starting late task", () => {
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 3, 1),
                estimatedDuration: 20
            }
            const taskResults: TaskResults = {
                startDate: new Date(2016, 3, 6),
                duration: 15
            }
            const component = testutils.renderIntoDocument(
                <Status task={task} taskResults={taskResults} />
            ) as React.Component<any, any>
            check(component, "Not started", "0%",
                  "Late 5 days", "label-warning", "Starting the 6/4/2016", "In 31 days",
                  "On time", "label-success", "Ending the 21/4/2016", "In 46 days")
        })
        it("Should create Status for in progress and on time task", () => {
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 20
            }
            const taskResults: TaskResults = {
                startDate: new Date(2016, 2, 1),
                duration: 20
            }
            const component = testutils.renderIntoDocument(
                <Status task={task} taskResults={taskResults} />
            ) as React.Component<any, any>
            check(component, "In progress", "25%",
                  "On time", "label-success", "Started the 1/3/2016", "5 days ago",
                  "On time", "label-success", "Ending the 21/3/2016", "In 15 days")
        })
    })
})
