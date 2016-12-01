import * as chai from "chai"
import * as React from "react"
import { ListGroup, ListGroupItem } from "react-bootstrap"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { TaskBrowser, mapDispatchToProps } from "../../client/project/components/taskbrowser"
import { TaskFilters } from "../../client/project/types"
import { filterTasks } from "../../client/project/actions/tasks"
import * as projectActions from "../../client/project/actions/tasks"
import { TaskListFilters } from "../../client/common/tasklist/types"
import { MilestoneFilterMode } from "../../client/common/tasklist/types"
import { previousTasksPage, nextTasksPage } from "../../client/common/tasklist/actions"
import { Task } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Project components", () => {
    const tasks: Array<Task> = [
        {
            identifier: "task1",
            name: "Task 1",
            description: "Description 1",
            estimatedStartDate: new Date(2016, 9, 1),
            estimatedDuration: 30,
            startDate: new Date(2016, 9, 1),
            duration: 30
        },
        {
            identifier: "task2",
            name: "Task 2",
            description: "Description 2",
            estimatedStartDate: new Date(2016, 9, 5),
            estimatedDuration: 15,
            startDate: new Date(2016, 9, 5),
            duration: 15
        },
        {
            identifier: "task3",
            name: "Task 3",
            description: "Description 3",
            estimatedStartDate: new Date(2016, 10, 1),
            estimatedDuration: 0,
            startDate: new Date(2016, 10, 1),
            duration: 0
        }
    ]
    const filters: TaskFilters = {
        notStartedChecked: false,
        inProgressChecked: true,
        doneChecked: true,
        text: "",
        milestoneFilterMode: MilestoneFilterMode.NoFilter,
        today: null
    }
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    describe("TaskBrowser", () => {
        it("Should render items correctly", () => {
            const onFiltersChanged = sinon.spy()
            const fetchTasks = sinon.spy()
            const onPreviousTasksPage = sinon.spy()
            const onNextTasksPage = sinon.spy()
            const component = enzyme.shallow(<TaskBrowser projectIdentifier="project"
                                                          tasks={tasks}
                                                          filters={filters}
                                                          currentPage={0}
                                                          maxPage={0}
                                                          onFiltersChanged={onFiltersChanged}
                                                          onFetchTasks={fetchTasks}
                                                          onPreviousTasksPage={onPreviousTasksPage}
                                                          onNextTasksPage={onNextTasksPage} />)
            const taskListComponent = component.dive()
            const listGroup = taskListComponent.find(ListGroup)
            chai.expect(listGroup.children()).to.length(3)

            const items = listGroup.find(ListGroupItem)
            const item1 = items.at(0)
            chai.expect(item1.childAt(1).childAt(0).text()).to.equal("Task 1")
            chai.expect(item1.childAt(2).childAt(1).text()).to.equal("task1")
            chai.expect(item1.prop("href")).to.equal("/project/project/task/task1")
            const item2 = items.at(1)
            chai.expect(item2.childAt(1).childAt(0).text()).to.equal("Task 2")
            chai.expect(item2.childAt(2).childAt(1).text()).to.equal("task2")
            chai.expect(item2.prop("href")).to.equal("/project/project/task/task2")
            const item3 = items.at(2)
            chai.expect(item3.childAt(0).childAt(0).hasClass("glyphicon")).to.true
            chai.expect(item3.childAt(0).childAt(0).hasClass("glyphicon-flag")).to.true
            chai.expect(item3.childAt(1).childAt(0).text()).to.equal("Task 3")
            chai.expect(item3.childAt(2).childAt(1).text()).to.equal("task3")
            chai.expect(item3.prop("href")).to.equal("/project/project/task/task3")
        })
        it("Should fetch tasks when mounted", () => {
            const onFiltersChanged = sinon.spy()
            const fetchTasks = sinon.spy()
            const onPreviousTasksPage = sinon.spy()
            const onNextTasksPage = sinon.spy()
            const component = enzyme.mount(<TaskBrowser projectIdentifier="project"
                                                        tasks={tasks}
                                                        filters={filters}
                                                        currentPage={0}
                                                        maxPage={0}
                                                        onFiltersChanged={onFiltersChanged}
                                                        onFetchTasks={fetchTasks}
                                                        onPreviousTasksPage={onPreviousTasksPage}
                                                        onNextTasksPage={onNextTasksPage} />)
            chai.expect(fetchTasks.calledOnce).to.true
            chai.expect(fetchTasks.calledWithExactly("project", filters)).to.true
        })
        it("Should react to callbacks", () => {
            const initialFilters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: true,
                doneChecked: true,
                text: "",
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                today: null
            }
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: true,
                doneChecked: true,
                text: "test",
                milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                today: null
            }
            const onFiltersChanged = sinon.spy()
            const fetchTasks = sinon.spy()
            const onPreviousTasksPage = sinon.spy()
            const onNextTasksPage = sinon.spy()
            const component = enzyme.shallow(<TaskBrowser projectIdentifier="project"
                                                          tasks={tasks}
                                                          filters={initialFilters}
                                                          currentPage={0}
                                                          maxPage={0}
                                                          onFiltersChanged={onFiltersChanged}
                                                          onFetchTasks={fetchTasks}
                                                          onPreviousTasksPage={onPreviousTasksPage}
                                                          onNextTasksPage={onNextTasksPage} />)
            component.simulate("filtersChanged", filters)
            chai.expect(onFiltersChanged.calledOnce).to.true
            chai.expect(onFiltersChanged.calledWithExactly("project", filters)).to.true

            component.simulate("previousPage")
            chai.expect(onPreviousTasksPage.calledOnce).to.true
            chai.expect(onPreviousTasksPage.calledWithExactly()).to.true

            component.simulate("nextPage")
            chai.expect(onNextTasksPage.calledOnce).to.true
            chai.expect(onNextTasksPage.calledWithExactly()).to.true
        })
    })
    it("Should map the onFiltersChanged callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onFiltersChanged("project", filters)
        chai.expect(dispatch.calledWithExactly(filterTasks("project", filters)))
    })
    it("Should map the onFetchTasks callback", () => {
        const mockedProject = sinon.mock(projectActions)
        mockedProject.expects("fetchTasks").once().calledWithExactly("project", filters)
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onFetchTasks("project", filters)
        mockedProject.verify()
    })
    it("Should map the onPreviousTasksPage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onPreviousTasksPage()
        dispatch.calledWithExactly(previousTasksPage())
    })
    it("Should map the onNextTasksPage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onNextTasksPage()
        dispatch.calledWithExactly(nextTasksPage())
    })
})
