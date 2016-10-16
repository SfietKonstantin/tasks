import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as jsdom from "jsdom"
import * as sinon from "sinon"
import { Header } from "../../client/common/header"
import { TabBar } from "../../client/common/tabs"

const document = jsdom.jsdom("<!doctype html><html><body></body></html>")
const window = document.defaultView

global.document = document
global.window = window

describe("Common components", () => {
    describe("Header", () => {
        it("Should create a Header", () => {
            const component = testutils.renderIntoDocument(
                <Header identifier="test" name="Test" />
            ) as React.Component<any, any>
            const h1 = testutils.findRenderedDOMComponentWithTag(component, "h1")
            chai.expect(h1.textContent).to.equal("Test #test")
        })
    })
    describe("TabBar", () => {
        it("Should create a TabBar", () => {
            const callback = sinon.spy()
            const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"]
            const component = testutils.renderIntoDocument(
                <TabBar tabs={tabs} tabChangedCallback={callback} />
            ) as React.Component<any, any>
            const nav = testutils.findRenderedDOMComponentWithClass(component, "nav")

            chai.expect(callback.calledOnce).to.true
            chai.expect(callback.calledWith(0)).to.true
            chai.expect(nav.classList.toString()).to.contains("nav-tabs")
            const navLi = nav.getElementsByTagName("li")
            chai.expect(navLi).to.length(5)

            chai.expect(navLi[0].textContent).to.equal("Tab 1")
            chai.expect(navLi[0].classList.toString()).to.contains("active")
            chai.expect(navLi[1].textContent).to.equal("Tab 2")
            chai.expect(navLi[1].classList.toString()).to.not.contains("active")
            chai.expect(navLi[2].textContent).to.equal("Tab 3")
            chai.expect(navLi[2].classList.toString()).to.not.contains("active")
            chai.expect(navLi[3].textContent).to.equal("Tab 4")
            chai.expect(navLi[3].classList.toString()).to.not.contains("active")
            chai.expect(navLi[4].textContent).to.equal("Tab 5")
            chai.expect(navLi[4].classList.toString()).to.not.contains("active")
        })
        it("Should handle change", () => {
            const callback = sinon.spy()
            const tabs = ["Tab 1", "Tab 2", "Tab 3"]
            const component = testutils.renderIntoDocument(
                <TabBar tabs={tabs} tabChangedCallback={callback} />
            ) as React.Component<any, any>
            const nav = testutils.findRenderedDOMComponentWithClass(component, "nav")
            const navLi = nav.getElementsByTagName("li")
            const tab3a = navLi[2].getElementsByTagName("a")
            chai.expect(tab3a).to.length(1)

            testutils.Simulate.click(tab3a[0])
            chai.expect(callback.calledTwice)
            chai.expect(callback.calledWith(0))
            chai.expect(callback.calledWith(2))
            chai.expect(navLi[0].textContent).to.equal("Tab 1")
            chai.expect(navLi[0].classList.toString()).to.not.contains("active")
            chai.expect(navLi[1].textContent).to.equal("Tab 2")
            chai.expect(navLi[1].classList.toString()).to.not.contains("active")
            chai.expect(navLi[2].textContent).to.equal("Tab 3")
            chai.expect(navLi[2].classList.toString()).to.contains("active")
        })
    })
})
