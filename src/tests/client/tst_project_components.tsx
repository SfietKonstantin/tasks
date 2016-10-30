import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
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
            const component = testutils.renderIntoDocument(
                <Breadcrumb project={project} />
            ) as React.Component<any, any>
            const ol = testutils.findRenderedDOMComponentWithTag(component, "ol")
            const olLi = ol.getElementsByTagName("li")
            chai.expect(olLi).to.length(2)
            chai.expect(olLi[1].textContent).to.equal("Project")

            const li1a = olLi[0].getElementsByTagName("a")
            chai.expect(li1a).to.length(1)
            chai.expect(li1a[0].href).to.equal("/")
        })
    })
    describe("FilterButton", () => {
        it("Should create a FilterButton with selected milestone", () => {
            const callback = sinon.spy()
            const component = testutils.renderIntoDocument(
                <FilterButton milestonesOnly={true} onToggleMilestonesOnly={callback} />
            ) as React.Component<any, any>
            chai.expect(callback.notCalled).to.true
            const button = testutils.findRenderedDOMComponentWithTag(component, "button")
            chai.expect(button).to.not.null
            const dropdownMenu = testutils.findRenderedDOMComponentWithClass(component, "dropdown-menu")
            const dropdownMenuLi = dropdownMenu.getElementsByTagName("li")
            chai.expect(dropdownMenuLi).to.length(1)
            chai.expect(dropdownMenuLi[0].classList.toString()).to.contains("active")
        })
        it("Should create a FilterButton without milestone", () => {
            const callback = sinon.spy()
            const component = testutils.renderIntoDocument(
                <FilterButton milestonesOnly={false} onToggleMilestonesOnly={callback} />
            ) as React.Component<any, any>
            chai.expect(callback.notCalled).to.true
            const dropdownMenu = testutils.findRenderedDOMComponentWithClass(component, "dropdown-menu")
            const dropdownMenuLi = dropdownMenu.getElementsByTagName("li")
            chai.expect(dropdownMenuLi).to.length(1)
            chai.expect(dropdownMenuLi[0].classList.toString()).to.not.contains("active")
        })
        it("Should call the callback", () => {
            const callback = sinon.spy()
            const component = testutils.renderIntoDocument(
                <FilterButton milestonesOnly={false} onToggleMilestonesOnly={callback} />
            ) as React.Component<any, any>
            const dropdownMenu = testutils.findRenderedDOMComponentWithClass(component, "dropdown-menu")
            const dropdownMenuLi = dropdownMenu.getElementsByTagName("li")
            const milestonesA = dropdownMenuLi[0].getElementsByTagName("a")
            chai.expect(milestonesA).to.length(1)
            chai.expect(callback.notCalled).to.true
            testutils.Simulate.click(milestonesA[0])
            chai.expect(callback.calledOnce).to.true
        })
    })
})
