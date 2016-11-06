import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { MenuItem } from "react-bootstrap"
import * as sinon from "sinon"
import { Breadcrumb } from "../../client/project/components/breadcrumb"
import { FilterButton } from "../../client/project/components/filterbutton"
import { TasksHeader } from "../../client/project/components/tasksheader"
import { TaskFilters } from "../../client/project/types"
import { Project } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Project components", () => {
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
            const component = enzyme.shallow(<Breadcrumb project={project} />)
            const items = component.find("li")
            chai.expect(items).to.length(2)
            chai.expect(items.at(0).children().prop("href")).to.equal("/")
            chai.expect(items.at(1).children().text()).to.equal("Project")
        })
    })
    describe("FilterButton", () => {
        it("Should create a FilterButton with selected milestone", () => {
            const callback = sinon.spy()
            const component = enzyme.shallow(<FilterButton milestonesOnly={true} onToggleMilestonesOnly={callback} />)

            const menuItems = component.find(MenuItem)
            chai.expect(menuItems).to.length(1)
            chai.expect(menuItems.at(0).prop("active")).to.true
        })
        it("Should create a FilterButton without selected milestone", () => {
            const callback = sinon.spy()
            const component = enzyme.shallow(<FilterButton milestonesOnly={false} onToggleMilestonesOnly={callback} />)

            const menuItems = component.find(MenuItem)
            chai.expect(menuItems).to.length(1)
            chai.expect(menuItems.at(0).prop("active")).to.false
        })
        it("Should call the callback", () => {
            const callback = sinon.spy()
            const component = enzyme.shallow(<FilterButton milestonesOnly={false} onToggleMilestonesOnly={callback} />)

            const menuItems = component.find(MenuItem)
            chai.expect(menuItems).to.length(1)
            menuItems.at(0).simulate("select")

            chai.expect(callback.calledOnce).to.true
        })
    })
    describe("TasksHeader", () => {
        it("Should create a TasksHeader 1", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: true,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            chai.expect(buttons.at(0).prop("bsStyle")).to.equal("primary")
            chai.expect(buttons.at(1).prop("bsStyle")).to.equal("default")
            chai.expect(buttons.at(2).prop("bsStyle")).to.equal("default")
        })
        it("Should create a TasksHeader 2", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: true,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            chai.expect(buttons.at(0).prop("bsStyle")).to.equal("default")
            chai.expect(buttons.at(1).prop("bsStyle")).to.equal("primary")
            chai.expect(buttons.at(2).prop("bsStyle")).to.equal("default")
        })
        it("Should create a TasksHeader 3", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: true,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            chai.expect(buttons.at(0).prop("bsStyle")).to.equal("default")
            chai.expect(buttons.at(1).prop("bsStyle")).to.equal("default")
            chai.expect(buttons.at(2).prop("bsStyle")).to.equal("primary")
        })
        it("Should call the callback 1", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(0).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: true,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
        it("Should call the callback 2", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(1).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: true,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
        it("Should call the callback 3", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: false,
                milestonesOnlyChecked: false,
                text: ""
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(2).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: true,
                milestonesOnlyChecked: false,
                text: ""
            }
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
    })
})
