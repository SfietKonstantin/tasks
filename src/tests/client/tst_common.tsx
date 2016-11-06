import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { Nav, NavItem } from "react-bootstrap"
import * as sinon from "sinon"
import { Header } from "../../client/common/components/header"
import { TabBar } from "../../client/common/components/tabs"
import { TaskListFiltersToolbar } from "../../client/common/components/tasklistfilterstoolbar"
import { TaskList, TaskListFilters, MilestoneFilterMode } from "../../client/common/components/tasklist"
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
    describe("ItemList", () => {
        it("Should create a ItemList", () => {
            class TestTaskList extends TaskList<number> {}

            const createElement = sinon.stub()
            createElement.withArgs(1).returns(<p key="1">test 1</p>)
            createElement.withArgs(2).returns(<p key="2">test 2</p>)
            createElement.withArgs(3).returns(<p key="3">test 3</p>)
            const onFiltersChanged = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[1, 2, 3]}
                                                         createElement={createElement}
                                                         filters={filters}
                                                         onFiltersChanged={onFiltersChanged} />)
            const p = component.find("p")
            chai.expect(p).to.length(3)
        })
        it("Should handle text changed", () => {
            class TestTaskList extends TaskList<number> {}

            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         createElement={createElement}
                                                         filters={filters}
                                                         onFiltersChanged={onFiltersChanged} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)
            formControls.at(0).simulate("input", { target: { value: "Test" } })

            chai.expect(component.state("textFilter")).to.deep.equal("Test")
        })
        it("Should handle blur", () => {
            class TestTaskList extends TaskList<number> {}

            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         createElement={createElement}
                                                         filters={filters}
                                                         onFiltersChanged={onFiltersChanged} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("blur")
            chai.expect(onFiltersChanged.calledOnce)
            chai.expect(onFiltersChanged.calledWithExactly("Test"))
        })
        it("Should handle submit", () => {
            class TestTaskList extends TaskList<number> {}

            const createElement = sinon.stub()
            const onFiltersChanged = sinon.spy()
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const component = enzyme.mount(<TestTaskList tasks={[]}
                                                         createElement={createElement}
                                                         filters={filters}
                                                         onFiltersChanged={onFiltersChanged} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("submit")
            chai.expect(onFiltersChanged.calledOnce)
            chai.expect(onFiltersChanged.calledWithExactly("Test"))
        })
    })
})
