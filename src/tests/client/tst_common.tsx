import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { Nav, NavItem, Pager } from "react-bootstrap"
import * as sinon from "sinon"
import { Header } from "../../client/common/components/header"
import { TabBar } from "../../client/common/components/tabs"
import { TaskListFiltersToolbar } from "../../client/common/tasklist/components/tasklistfilterstoolbar"
import { Status, StatusIndicator } from "../../client/common/components/statusindicator"
import { TaskList, TaskListProperties } from "../../client/common/tasklist/components/tasklist"
import { TaskListFilters, MilestoneFilterMode } from "../../client/common/tasklist/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Common components", () => {
    let component: Header
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    describe("Header", () => {
        it("Should create a Header", () => {
            const component = enzyme.shallow(<Header identifier="test" name="Test" />)
            chai.expect(component.find("h1").text()).to.equal("Test #test")
        })
    })
    describe("TabBar", () => {
        it("Should create a TabBar", () => {
            const callback = sinon.spy()
            const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"]
            const component = enzyme.mount(<TabBar tabs={tabs} onTabChanged={callback} />)
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(0)).to.true

            const navItems = component.find(NavItem)
            chai.expect(navItems).to.length(5)

            chai.expect(navItems.at(0).children().text()).to.equal("Tab 1")
            chai.expect(navItems.at(0).prop("active")).to.true
            chai.expect(navItems.at(1).children().text()).to.equal("Tab 2")
            chai.expect(navItems.at(1).prop("active")).to.false
            chai.expect(navItems.at(2).children().text()).to.equal("Tab 3")
            chai.expect(navItems.at(2).prop("active")).to.false
            chai.expect(navItems.at(3).children().text()).to.equal("Tab 4")
            chai.expect(navItems.at(3).prop("active")).to.false
            chai.expect(navItems.at(4).children().text()).to.equal("Tab 5")
            chai.expect(navItems.at(4).prop("active")).to.false
        })
        it("Should handle change", () => {
            const callback = sinon.spy()
            const tabs = ["Tab 1", "Tab 2", "Tab 3"]
            const component = enzyme.mount(<TabBar tabs={tabs} onTabChanged={callback} />)
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(0)).to.true

            const navItems = component.find(NavItem)
            chai.expect(navItems).to.length(3)
            chai.expect(navItems.at(0).prop("active")).to.true
            chai.expect(navItems.at(1).prop("active")).to.false
            chai.expect(navItems.at(2).prop("active")).to.false

            navItems.at(2).children().simulate("click")

            chai.expect(callback.calledTwice)
            chai.expect(callback.calledWithExactly(2))
            chai.expect(navItems.at(0).prop("active")).to.false
            chai.expect(navItems.at(1).prop("active")).to.false
            chai.expect(navItems.at(2).prop("active")).to.true
        })
    })
    describe("TaskListFiltersToolbar", () => {
        it("Should create a TaskListFiltersToolbar with no milestone filter", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneDropdown = buttonGroup.find("DropdownButton")
            chai.expect(milestoneDropdown.prop("title")).to.equal("Tasks and milestones")

            const milestoneMenuItems = buttonGroup.find("MenuItem")
            chai.expect(milestoneMenuItems.at(0).prop("active")).to.true
        })
        it("Should create a TaskListFiltersToolbar with milestone tasks filter", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneDropdown = buttonGroup.find("DropdownButton")
            chai.expect(milestoneDropdown.prop("title")).to.equal("Tasks only")

            const milestoneMenuItems = buttonGroup.find("MenuItem")
            chai.expect(milestoneMenuItems.at(1).prop("active")).to.true
        })
        it("Should create a TaskListFiltersToolbar with milestone milestones filter", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneDropdown = buttonGroup.find("DropdownButton")
            chai.expect(milestoneDropdown.prop("title")).to.equal("Milestones only")

            const milestoneMenuItems = buttonGroup.find("MenuItem")
            chai.expect(milestoneMenuItems.at(2).prop("active")).to.true
        })
        it("Should call the milestone callback 1", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneMenuItems = buttonGroup.find("MenuItem")
            milestoneMenuItems.at(0).simulate("select")

            chai.expect(callback.calledOnce).to.true
            const expected: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
        it("Should call the milestone callback 1", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneMenuItems = buttonGroup.find("MenuItem")
            milestoneMenuItems.at(1).simulate("select")

            chai.expect(callback.calledOnce).to.true
            const expected: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                text: ""
            }
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
        it("Should call the milestone callback 2", () => {
            const callback = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                text: ""
            }
            const component = enzyme.shallow(<TaskListFiltersToolbar filters={filters} onFiltersChanged={callback} />)

            const buttonGroup = component.find("ButtonGroup")
            const milestoneMenuItems = buttonGroup.find("MenuItem")
            milestoneMenuItems.at(2).simulate("select")

            chai.expect(callback.calledOnce).to.true
            const expected: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                text: ""
            }
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
    })
    describe("TaskList", () => {
        interface TestTask {
            identifier: string
            name: string
            duration: number
        }
        class TestTaskList extends TaskList<TestTask,
                                            TaskListFilters,
                                            TaskListProperties<TestTask, TaskListFilters>
                                           > {
            constructor(props: TaskListProperties<TestTask, TaskListFilters>) {
                super(props)
            }
            protected createElement(task: TestTask): JSX.Element {
                return <p key={task.name}>{task.name}</p>
            }
        }
        it("Should create a TaskList", () => {
            const tasks: Array<TestTask> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    duration: 20
                },
                {
                    identifier: "milestone1",
                    name: "Milestone 1",
                    duration: 0
                }
            ]
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={tasks}
                                                         filters={filters}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onPreviousPage={onPreviousPage}
                                                         onNextPage={onNextPage} />)
            const p = component.find("p")
            chai.expect(p).to.length(2)
            chai.expect(p.at(0).text()).to.equal("Task 1")
            chai.expect(p.at(1).text()).to.equal("Milestone 1")
        })
        it("Should create an empty ItemList", () => {
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={0}
                                                           maxPage={0}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const statusIndicator = component.find("StatusIndicator")
            chai.expect(statusIndicator).to.length(1)
        })
        it("Should render pages correctly 1", () => {
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={0}
                                                           maxPage={2}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const pagerItems = component.find(Pager.Item)
            chai.expect(pagerItems.at(0).prop("previous")).to.true
            chai.expect(pagerItems.at(0).prop("disabled")).to.true
            chai.expect(pagerItems.at(1).prop("next")).to.true
            chai.expect(pagerItems.at(1).prop("disabled")).to.false
        })
        it("Should render pages correctly 2", () => {
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={1}
                                                           maxPage={2}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const pagerItems = component.find(Pager.Item)
            chai.expect(pagerItems.at(0).prop("previous")).to.true
            chai.expect(pagerItems.at(0).prop("disabled")).to.false
            chai.expect(pagerItems.at(1).prop("next")).to.true
            chai.expect(pagerItems.at(1).prop("disabled")).to.false
        })
        it("Should render pages correctly 3", () => {
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={2}
                                                           maxPage={2}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const pagerItems = component.find(Pager.Item)
            chai.expect(pagerItems.at(0).prop("previous")).to.true
            chai.expect(pagerItems.at(0).prop("disabled")).to.false
            chai.expect(pagerItems.at(1).prop("next")).to.true
            chai.expect(pagerItems.at(1).prop("disabled")).to.true
        })
        it("Should handle text changed", () => {
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         filters={filters}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onPreviousPage={onPreviousPage}
                                                         onNextPage={onNextPage} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)
            formControls.at(0).simulate("input", { target: { value: "Test" } })

            chai.expect(component.state("textFilter")).to.equal("Test")
        })
        it("Should handle blur", () => {
            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         filters={filters}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onPreviousPage={onPreviousPage}
                                                         onNextPage={onNextPage} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("blur")
            chai.expect(onFiltersChanged.calledOnce).to.true
            chai.expect(onFiltersChanged.calledWithExactly(filters)).to.true
        })
        it("Should handle submit", () => {
            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         filters={filters}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onPreviousPage={onPreviousPage}
                                                         onNextPage={onNextPage} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("submit")
            chai.expect(onFiltersChanged.calledOnce).to.true
            chai.expect(onFiltersChanged.calledWithExactly(filters)).to.true
        })
        it("Should handle click on previous", () => {
            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={1}
                                                           maxPage={1}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const pagerItems = component.find(Pager.Item)
            pagerItems.at(0).simulate("click")
            chai.expect(onPreviousPage.calledOnce).to.true
            chai.expect(onPreviousPage.calledWithExactly()).to.true
        })
        it("Should handle click on next", () => {
            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const onPreviousPage = sinon.spy()
            const onNextPage = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.shallow(<TestTaskList tasks={[]}
                                                           filters={filters}
                                                           currentPage={1}
                                                           maxPage={1}
                                                           onFiltersChanged={onFiltersChanged}
                                                           onPreviousPage={onPreviousPage}
                                                           onNextPage={onNextPage} />)
            const pagerItems = component.find(Pager.Item)
            pagerItems.at(1).simulate("click")
            chai.expect(onNextPage.calledOnce).to.true
            chai.expect(onNextPage.calledWithExactly()).to.true
        })
    })
    describe("StatusIndicator", () => {
        it("Should get the correct status 1", () => {
            const component = enzyme.shallow(<StatusIndicator status={Status.Error} />)
            const span = component.find("span")
            chai.expect(span).to.length(1)
            chai.expect(span.hasClass("glyphicon")).to.true
            chai.expect(span.hasClass("glyphicon-remove")).to.true
        })
        it("Should get the correct status 2", () => {
            const component = enzyme.shallow(<StatusIndicator status={Status.Loading} />)
            const span = component.find("span")
            chai.expect(span).to.length(1)
            chai.expect(span.hasClass("glyphicon")).to.true
            chai.expect(span.hasClass("glyphicon-hourglass")).to.true
        })
        it("Should get the correct status 3", () => {
            const component = enzyme.shallow(<StatusIndicator status={Status.Info} />)
            const span = component.find("span")
            chai.expect(span).to.length(1)
            chai.expect(span.hasClass("glyphicon")).to.true
            chai.expect(span.hasClass("glyphicon-info-sign")).to.true
        })
        it("Should get the correct status 4", () => {
            const component = enzyme.shallow(<StatusIndicator status={123} />)
            const span = component.find("span")
            chai.expect(span).to.length(1)
            chai.expect(span.hasClass("glyphicon")).to.false
        })
        it("Should get the correct message 1", () => {
            const component = enzyme.shallow(<StatusIndicator status={Status.Info}
                                                              message="Test message" />)
            const p = component.find("p")
            chai.expect(p).to.length(1)
            chai.expect(p.text()).to.equal("Test message")
        })
        it("Should get the correct message 2", () => {
            const component = enzyme.shallow(<StatusIndicator status={Status.Info} />)
            const p = component.find("p")
            chai.expect(p).to.length(0)
        })
    })
})
