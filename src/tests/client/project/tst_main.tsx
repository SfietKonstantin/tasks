import * as chai from "chai"
import * as sinon from "sinon"
import * as React from "react"
import * as enzyme from "enzyme"
import "isomorphic-fetch"
import {Main} from "../../../client/project/main"
import {project1, taskd1, taskd2, task1, task2} from "../../common/testdata"
import {addMockWindow, removeMockWindow} from "../utils/mockwindow"
import {TaskBuilder} from "../../../common/api/task"
import {Header} from "../../../client/project/components/header"
import {Overview} from "../../../client/project/components/overview"

describe("Client project main", () => {
    let sandbox: sinon.SinonSandbox
    beforeEach(() => {
        addMockWindow()
        sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
        removeMockWindow()
        sandbox.restore()
    })
    it("Should retrieve the project and list of tasks when mounted", (done) => {
        let mockFetch = sandbox.stub(window, "fetch")
        const projectResults = new Response(JSON.stringify(project1), {status: 200})
        const projectResultsPromise = Promise.resolve(projectResults)
        mockFetch.withArgs(`/api/project/${project1.identifier}`).returns(projectResultsPromise)
        const tasks = [
            TaskBuilder.toApiTask(taskd1, task1.startDate, task1.duration),
            TaskBuilder.toApiTask(taskd2, task2.startDate, task2.duration)
        ]
        const taskResults = new Response(JSON.stringify(tasks), {status: 200})
        const taskResultsPromise = Promise.resolve(taskResults)
        mockFetch.withArgs(`/api/project/${project1.identifier}/task/list`).returns(taskResultsPromise)

        const component = enzyme.mount(<Main projectIdentifier={project1.identifier} />)

        let projectDone = false
        let taskDone = false

        const test = () => {
            chai.expect(component.state()).to.deep.equal({
                tabIndex: 0,
                isFetching: true,
                project: null,
                tasks: []
            })

            process.nextTick(() => {
                chai.expect(component.state()).to.deep.equal({
                    tabIndex: 0,
                    isFetching: false,
                    project: project1,
                    tasks: [task1, task2]
                })
                done()
            })
        }

        projectResultsPromise.then(() => {
            projectDone = true
            if (projectDone && taskDone) {
                test()
            }
        })
        taskResultsPromise.then(() => {
            taskDone = true
            if (projectDone && taskDone) {
                test()
            }
        })
    })
    it("Should render the overview page", () => {
        const component = enzyme.shallow(<Main projectIdentifier={project1.identifier} />)
        component.setState({
            tabIndex: 0,
            isFetching: false,
            project: project1,
            tasks: [task1, task2]
        })
        component.update()
        chai.expect(component.find(Header)).to.length(1)
        chai.expect(component.find(Overview)).to.length(1)
    })
    it("Should handle tab change to tasks tab", () => {
        const component = enzyme.shallow(<Main projectIdentifier={project1.identifier} />)
        component.setState({
            tabIndex: 0,
            isFetching: false,
            project: project1,
            tasks: [task1, task2]
        })
        component.update()
        const header = component.find(Header)
        header.simulate("tabChanged", 1)

        chai.expect(component.state()).to.deep.equal({
            tabIndex: 1,
            isFetching: false,
            project: project1,
            tasks: [task1, task2]
        })
    })
})
