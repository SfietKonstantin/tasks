import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { MenuItem } from "react-bootstrap"
import * as sinon from "sinon"
import { Breadcrumb } from "../../client/project/components/breadcrumb"
import { FilterButton } from "../../client/project/components/filterbutton"
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
            chai.expect(menuItems.at(0).prop<boolean>("active")).to.true
        })
        it("Should create a FilterButton without selected milestone", () => {
            const callback = sinon.spy()
            const component = enzyme.shallow(<FilterButton milestonesOnly={false} onToggleMilestonesOnly={callback} />)

            const menuItems = component.find(MenuItem)
            chai.expect(menuItems).to.length(1)
            chai.expect(menuItems.at(0).prop<boolean>("active")).to.false
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
})
