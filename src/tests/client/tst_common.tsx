import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as jsdom from "jsdom"
import { Header } from "../../client/common/header"
import { TabBar } from "../../client/common/tabs"

let document = jsdom.jsdom('<!doctype html><html><body></body></html>')
let window = document.defaultView

global.document = document
global.window = window

describe("Common components", () => {
    describe("Header", () => {
        it("Should create a Header", () => {
            const component = testutils.renderIntoDocument(<Header identifier="test" name="Test" />) as React.Component<any, any>
            const h1 = testutils.findRenderedDOMComponentWithTag(component, "h1") as HTMLElement
            chai.expect(h1.textContent).to.equals("Test #test")
        })
    })
    describe("TabBar", () => {
        it("Should create a TabBar", () => {
            let currentIndex: number | null = null
            const callback = (index: number) => {
                currentIndex = index
            }
            const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"] 
            const component = testutils.renderIntoDocument(<TabBar tabs={tabs} tabChangedCallback={callback} />) as React.Component<any, any>
            const nav = testutils.findRenderedDOMComponentWithClass(component, "nav") as HTMLElement
            
            chai.expect(currentIndex).to.equals(0)
            chai.expect(nav.classList.toString()).to.contains("nav-tabs")
            chai.expect(nav.childNodes).to.length(5)

            const tab1 = nav.childNodes[0] as HTMLElement
            const tab2 = nav.childNodes[1] as HTMLElement
            const tab3 = nav.childNodes[2] as HTMLElement
            const tab4 = nav.childNodes[3] as HTMLElement
            const tab5 = nav.childNodes[4] as HTMLElement

            chai.expect(tab1.textContent).to.equals("Tab 1")
            chai.expect(tab1.classList.toString()).to.contains("active")
            chai.expect(tab2.textContent).to.equals("Tab 2")
            chai.expect(tab2.classList.toString()).to.not.contains("active")
            chai.expect(tab3.textContent).to.equals("Tab 3")
            chai.expect(tab3.classList.toString()).to.not.contains("active")
            chai.expect(tab4.textContent).to.equals("Tab 4")
            chai.expect(tab3.classList.toString()).to.not.contains("active")
            chai.expect(tab5.textContent).to.equals("Tab 5")
            chai.expect(tab5.classList.toString()).to.not.contains("active")
        })
        it("Should handle change", () => {
            let currentIndex: number | null = null
            const callback = (index: number) => {
                currentIndex = index
            }
            const tabs = ["Tab 1", "Tab 2", "Tab 3"] 
            const component = testutils.renderIntoDocument(<TabBar tabs={tabs} tabChangedCallback={callback} />) as React.Component<any, any>
            const nav = testutils.findRenderedDOMComponentWithClass(component, "nav") as HTMLElement
            const tab1 = nav.childNodes[0] as HTMLElement
            const tab2 = nav.childNodes[1] as HTMLElement
            const tab3 = nav.childNodes[2] as HTMLElement
            const tab3a = tab3.getElementsByTagName("a")
            
            chai.expect(tab3a).to.length(1)

            testutils.Simulate.click(tab3a[0])

            chai.expect(currentIndex).to.equals(2)
            chai.expect(tab1.textContent).to.equals("Tab 1")
            chai.expect(tab1.classList.toString()).to.not.contains("active")
            chai.expect(tab2.textContent).to.equals("Tab 2")
            chai.expect(tab2.classList.toString()).to.not.contains("active")
            chai.expect(tab3.textContent).to.equals("Tab 3")
            chai.expect(tab3.classList.toString()).to.contains("active")
        })
    })
})