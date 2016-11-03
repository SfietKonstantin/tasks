import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import { Nav, NavItem } from "react-bootstrap"
import * as sinon from "sinon"
import { Header } from "../../client/common/components/header"
import { TabBar } from "../../client/common/components/tabs"
import { ItemList } from "../../client/common/components/itemlist"
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
            const component = enzyme.mount(<TabBar tabs={tabs} tabChangedCallback={callback} />)
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(0)).to.true

            const navItems = component.find(NavItem)
            chai.expect(navItems).to.length(5)

            chai.expect(navItems.at(0).children().text()).to.equal("Tab 1")
            chai.expect(navItems.at(0).prop<boolean>("active")).to.true
            chai.expect(navItems.at(1).children().text()).to.equal("Tab 2")
            chai.expect(navItems.at(1).prop<boolean>("active")).to.false
            chai.expect(navItems.at(2).children().text()).to.equal("Tab 3")
            chai.expect(navItems.at(2).prop<boolean>("active")).to.false
            chai.expect(navItems.at(3).children().text()).to.equal("Tab 4")
            chai.expect(navItems.at(3).prop<boolean>("active")).to.false
            chai.expect(navItems.at(4).children().text()).to.equal("Tab 5")
            chai.expect(navItems.at(4).prop<boolean>("active")).to.false
        })
        it("Should handle change", () => {
            const callback = sinon.spy()
            const tabs = ["Tab 1", "Tab 2", "Tab 3"]
            const component = enzyme.mount(<TabBar tabs={tabs} tabChangedCallback={callback} />)
            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWithExactly(0)).to.true

            const navItems = component.find(NavItem)
            chai.expect(navItems).to.length(3)
            chai.expect(navItems.at(0).prop<boolean>("active")).to.true
            chai.expect(navItems.at(1).prop<boolean>("active")).to.false
            chai.expect(navItems.at(2).prop<boolean>("active")).to.false

            navItems.at(2).children().simulate("click")

            chai.expect(callback.calledTwice)
            chai.expect(callback.calledWithExactly(2))
            chai.expect(navItems.at(0).prop<boolean>("active")).to.false
            chai.expect(navItems.at(1).prop<boolean>("active")).to.false
            chai.expect(navItems.at(2).prop<boolean>("active")).to.true
        })
    })
    describe("ItemList", () => {
        it("Should create a ItemList", () => {
            class TestItemList extends ItemList<number> {}

            const createElement = sinon.stub()
            createElement.withArgs(1).returns(<p>test 1</p>)
            createElement.withArgs(2).returns(<p>test 2</p>)
            createElement.withArgs(3).returns(<p>test 3</p>)
            const onTextFilter = sinon.spy()
            const component = enzyme.mount(<TestItemList items={[1, 2, 3]}
                                                         createElement={createElement}
                                                         onTextFilter={onTextFilter} />)
            const p = component.find("p")
            chai.expect(p).to.length(3)
        })
        it("Should handle text changed", () => {
            class TestItemList extends ItemList<number> {}

            const createElement = sinon.stub()
            const onTextFilter = sinon.spy()
            const component = enzyme.mount(<TestItemList items={[]}
                                                         createElement={createElement}
                                                         onTextFilter={onTextFilter} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            chai.expect(component.state("filter")).to.equal("Test")
        })
        it("Should handle blur", () => {
            class TestItemList extends ItemList<number> {}

            const createElement = sinon.stub()
            const onTextFilter = sinon.spy()
            const component = enzyme.mount(<TestItemList items={[]}
                                                         createElement={createElement}
                                                         onTextFilter={onTextFilter} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("blur")
            chai.expect(onTextFilter.calledOnce)
            chai.expect(onTextFilter.calledWithExactly("Test"))
        })
        it("Should handle submit", () => {
            class TestItemList extends ItemList<number> {}

            const createElement = sinon.stub()
            const onTextFilter = sinon.spy()
            const component = enzyme.mount(<TestItemList items={[]}
                                                         createElement={createElement}
                                                         onTextFilter={onTextFilter} />)
            const formControls = component.children().find("FormControl")
            chai.expect(formControls).to.length(1)

            formControls.at(0).simulate("input", { target: { value: "Test" } })
            formControls.at(0).simulate("submit")
            chai.expect(onTextFilter.calledOnce)
            chai.expect(onTextFilter.calledWithExactly("Test"))
        })
    })
})
