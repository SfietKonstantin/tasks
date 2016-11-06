import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { MenuItem } from "react-bootstrap"
import * as sinon from "sinon"
import * as CommonHeader from "../../client/common/components/header"
import { Breadcrumb } from "../../client/project/components/breadcrumb"
import { Header } from "../../client/project/components/header"
import { Overview } from "../../client/project/components/overview"
import { TasksHeader } from "../../client/project/components/tasksheader"
import { AllTasks } from "../../client/project/components/alltasks"
import { TaskFilters } from "../../client/project/types"
import { MilestoneFilterMode } from "../../client/common/components/tasklist"
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
    describe("Header", () => {
        it("Should render a Header", () => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: ""
            }
            const callback = sinon.spy()
            const component = enzyme.shallow(<Header project={project} onTabChanged={callback}/>)
            const header = component.find(CommonHeader.Header)
            chai.expect(header.prop("identifier")).to.equal("project")
            chai.expect(header.prop("name")).to.equal("Project")

            const tabBar = component.find("TabBar")
            tabBar.simulate("tabChanged")

            chai.expect(callback.calledOnce).to.true
        })
    })
    describe("Overview", () => {
        it("Should render an Overview 1", () => {
            const component = enzyme.shallow(<Overview visible={false} />)
            chai.expect(component.hasClass("hidden")).to.true
        })
        it("Should render an Overview 2", () => {
            const component = enzyme.shallow(<Overview visible={true} />)
            chai.expect(component.hasClass("hidden")).to.false
        })
    })
    describe("TasksHeader", () => {
        it("Should create a TasksHeader 1", () => {
            const callback = sinon.spy()
            const filters: TaskFilters = {
                notStartedChecked: true,
                inProgressChecked: false,
                doneChecked: false,
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
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
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
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
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
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
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(0).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: true,
                inProgressChecked: false,
                doneChecked: false,
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
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
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(1).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: true,
                doneChecked: false,
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
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
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
            }
            const component = enzyme.shallow(<TasksHeader filters={filters} onFilterChanged={callback} />)

            const buttons = component.find("Button")
            chai.expect(buttons).to.length(3)
            buttons.at(2).simulate("click")

            const expected: TaskFilters = {
                notStartedChecked: false,
                inProgressChecked: false,
                doneChecked: true,
                filters: {
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: ""
                }
            }
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(expected)).to.true
        })
    })
    describe("AllTasks", () => {
        it("Should render an AllTasks 1", () => {
            const component = enzyme.shallow(<AllTasks visible={false} />)
            chai.expect(component.hasClass("hidden")).to.true
        })
        it("Should render an AllTasks 2", () => {
            const component = enzyme.shallow(<AllTasks visible={true} />)
            chai.expect(component.hasClass("hidden")).to.false
        })
    })
})
