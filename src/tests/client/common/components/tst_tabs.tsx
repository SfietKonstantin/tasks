import * as chai from "chai"
import * as sinon from "sinon"
import * as React from "react"
import * as enzyme from "enzyme"
import "isomorphic-fetch"
import {TabBar} from "../../../../client/common/components/tabs"
import {addMockWindow, removeMockWindow} from "../../utils/mockwindow"

describe("Client common components tabs", () => {
    const tabs = ["Tab 1", "Tab 2"]
    let onTabChanged: sinon.SinonSpy
    beforeEach(() => {
        addMockWindow()
        onTabChanged = sinon.spy()
    })
    afterEach(() => {
        removeMockWindow()
    })
    it("Should render tabs", () => {
        const component = enzyme.shallow(<TabBar tabs={tabs} onTabChanged={onTabChanged}/>)
        chai.expect(component.hasClass("tabular")).to.true
        chai.expect(component.children()).to.length(2)
        chai.expect(component.childAt(0).text()).to.equal("Tab 1")
        chai.expect(component.childAt(1).text()).to.equal("Tab 2")
    })
    it("Should select tab 0 by default", () => {
        const component = enzyme.shallow(<TabBar tabs={tabs} onTabChanged={onTabChanged}/>)
        chai.expect(component.childAt(0).hasClass("active")).to.true
        chai.expect(component.childAt(1).hasClass("active")).to.false
    })
    it("Should select tab based on state", () => {
        const component = enzyme.shallow(<TabBar tabs={tabs} onTabChanged={onTabChanged}/>)
        component.setState({currentTab: 1})
        component.update()
        chai.expect(component.childAt(0).hasClass("active")).to.false
        chai.expect(component.childAt(1).hasClass("active")).to.true
    })
    it("Should react to click", () => {
        const component = enzyme.shallow(<TabBar tabs={tabs} onTabChanged={onTabChanged}/>)
        const tab1 = component.childAt(1)
        tab1.simulate("click")
        chai.expect(onTabChanged.calledWithExactly(1)).to.true
        chai.expect(component.state()).to.deep.equal({currentTab: 1})
    })
})
