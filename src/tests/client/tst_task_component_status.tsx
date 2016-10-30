import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { Status, StatusStateIndicator, StatusTime } from "../../client/task/components/status"
import { Task, TaskResults } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Task components", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    describe("Status components", () => {
        it("Should create a StatusStateIndicator", () => {
            const component = enzyme.shallow(<StatusStateIndicator icon="test" text="Hello World" />)
            chai.expect(component.children()).to.length(3)
            chai.expect(component.childAt(0).hasClass("glyphicon glyphicon-test")).to.true
            chai.expect(component.childAt(2).text()).to.equal("Hello World")
        })
        it("Should create a StatusTime", () => {
            const component = enzyme.shallow(<StatusTime className="someclass" color="danger" state="State"
                                                         date="23/12/2015" todayDiff="10 days" />)
            chai.expect(component.hasClass("someclass")).to.true
            chai.expect(component.children()).to.length(3)
            const label = component.childAt(0).children()
            chai.expect(label).to.length(1)
            chai.expect(label.prop("bsStyle")).to.equal("danger")
            chai.expect(label.children().text()).to.equal("State")
            chai.expect(component.childAt(1).text()).to.equal("23/12/2015")
            chai.expect(component.childAt(2).text()).to.equal("10 days")
        })
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
        const checkState = (component: enzyme.CommonWrapper<any, {}>,
                            stateIcon: string, stateText: string,
                            progressPercentage: number) => {
            const state = component.find("StatusStateIndicator")
            chai.expect(state).to.length(1)
            chai.expect(state.prop("icon")).to.equal(stateIcon)
            chai.expect(state.prop("text")).to.equal(stateText)

            const progress = component.find("ProgressBar")
            chai.expect(progress).to.length(1)
            chai.expect(progress.prop("now")).to.equal(progressPercentage)
        }
        const checkTask = (component: enzyme.CommonWrapper<any, {}>,
                           startColor: string, startState: string, startDate: string, startDays: string,
                           endColor: string, endState: string, endDate: string, endDays: string) => {
            const times = component.find("StatusTime")
            chai.expect(times).to.length(2)

            chai.expect(times.at(0).prop("color")).to.equal(startColor)
            chai.expect(times.at(0).prop("state")).to.equal(startState)
            chai.expect(times.at(0).prop("date")).to.equal(startDate)
            chai.expect(times.at(0).prop("todayDiff")).to.equal(startDays)

            chai.expect(times.at(1).prop("color")).to.equal(endColor)
            chai.expect(times.at(1).prop("state")).to.equal(endState)
            chai.expect(times.at(1).prop("date")).to.equal(endDate)
            chai.expect(times.at(1).prop("todayDiff")).to.equal(endDays)
        }
        const checkMilestone = (component: enzyme.CommonWrapper<any, {}>,
                                startColor: string, startState: string,
                                startDate: string, startDays: string) => {
            const times = component.find("StatusTime")
            chai.expect(times).to.length(1)

            chai.expect(times.prop("color")).to.equal(startColor)
            chai.expect(times.prop("state")).to.equal(startState)
            chai.expect(times.prop("date")).to.equal(startDate)
            chai.expect(times.prop("todayDiff")).to.equal(startDays)
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
            const component = enzyme.shallow(<Status task={task} taskResults={taskResults} />)
            checkState(component, "time", "Not started", 0)
            checkTask(component,
                      "success", "On time", "Starting the 1/4/2016", "In 26 days",
                      "success", "On time", "Ending the 21/4/2016", "In 46 days")
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
            const component = enzyme.shallow(<Status task={task} taskResults={taskResults} />)
            checkState(component, "time", "Not started", 0)
            checkTask(component,
                      "success", "On time", "Starting the 1/4/2016", "In 26 days",
                      "warning", "Late 5 days", "Ending the 26/4/2016", "In 51 days")
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
            const component = enzyme.shallow(<Status task={task} taskResults={taskResults} />)
            checkState(component, "time", "Not started", 0)
            checkTask(component,
                      "warning", "Late 5 days", "Starting the 6/4/2016", "In 31 days",
                      "success", "On time", "Ending the 21/4/2016", "In 46 days")
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
            const component = enzyme.shallow(<Status task={task} taskResults={taskResults} />)
            checkState(component, "plane", "In progress", 25)
            checkTask(component,
                      "success", "On time", "Started the 1/3/2016", "5 days ago",
                      "success", "On time", "Ending the 21/3/2016", "In 15 days")
        })
    })
})
