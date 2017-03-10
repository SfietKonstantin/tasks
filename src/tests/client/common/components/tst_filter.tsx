import * as chai from "chai"
import * as sinon from "sinon"
import * as React from "react"
import * as enzyme from "enzyme"
import {renderFilterCriterion} from "../../../../client/common/components/filter"
import {
    SearchFilterCriterionDefinition,
    SingleSelectionFilterCriterionDefinition, MultiSelectionFilterCriterionDefinition
} from "../../../../client/common/model/filter"
import {addMockWindow, removeMockWindow} from "../../utils/mockwindow"
import {MenuItem, Icon} from "semantic-ui-react"

describe("Client common components filter", () => {
    let onTabChanged: sinon.SinonSpy
    beforeEach(() => {
        addMockWindow()
        onTabChanged = sinon.spy()
    })
    afterEach(() => {
        removeMockWindow()
    })
    it("Should render search", () => {
        class TestSearchFilterCriterionDefinition extends SearchFilterCriterionDefinition<string> {
            constructor() {
                super("Test search", "search", "red")
            }
            filter(item: string): boolean {
                return true
            }
        }

        const filter = renderFilterCriterion(123, new TestSearchFilterCriterionDefinition())
        const component = enzyme.shallow(<div>{filter}</div>)
        const menuItem = component.find(MenuItem)
        chai.expect(menuItem).to.length(1)
        const input = menuItem.find("input")
        chai.expect(input).to.length(1)
        chai.expect(input.prop("placeholder")).to.equal("Test search")
        const icon = menuItem.find(Icon)
        chai.expect(icon).to.length(1)
        chai.expect(icon.prop("name")).to.equal("search")
        chai.expect(icon.prop("color")).to.equal("red")
    })
    it("Should render single selection", () => {
        class TestSingleSelectionFilterCriterionDefinition extends SingleSelectionFilterCriterionDefinition<string> {
            constructor() {
                super("Single selection", "question", "red", ["First", "Second", "Third"])
            }
            filter(item: string): boolean {
                return true
            }
        }

        const filter = renderFilterCriterion(123, new TestSingleSelectionFilterCriterionDefinition())
        const component = enzyme.shallow(<div>{filter}</div>)
        const root = component.children()
        const text = root.children().at(0)
        chai.expect(text.text()).to.equal("Single selection")
        const icon = root.children().find(Icon)
        chai.expect(icon.prop("name")).to.equal("question")
        chai.expect(icon.prop("color")).to.equal("red")
        const menu = root.children().findWhere((wrapper) => {
            return wrapper.hasClass("menu")
        })
        const menuItems = menu.children()
        chai.expect(menuItems).to.length(3)
        const menuItem0 = menuItems.at(0)
        chai.expect(menuItem0.children().prop("radio")).to.true
        chai.expect(menuItem0.children().prop("label")).to.equal("First")
        const menuItem1 = menuItems.at(1)
        chai.expect(menuItem1.children().prop("radio")).to.true
        chai.expect(menuItem1.children().prop("label")).to.equal("Second")
        const menuItem2 = menuItems.at(2)
        chai.expect(menuItem2.children().prop("radio")).to.true
        chai.expect(menuItem2.children().prop("label")).to.equal("Third")
    })
    it("Should render multi selection", () => {
        class TestMultiSelectionFilterCriterionDefinition extends MultiSelectionFilterCriterionDefinition<string> {
            constructor() {
                super("Multi selection", "question", "red", ["First", "Second", "Third"])
            }
            filter(item: string): boolean {
                return true
            }
        }

        const filter = renderFilterCriterion(123, new TestMultiSelectionFilterCriterionDefinition())
        const component = enzyme.shallow(<div>{filter}</div>)
        const root = component.children()
        const text = root.children().at(0)
        chai.expect(text.text()).to.equal("Multi selection")
        const icon = root.children().find(Icon)
        chai.expect(icon.prop("name")).to.equal("question")
        chai.expect(icon.prop("color")).to.equal("red")
        const menu = root.children().findWhere((wrapper) => {
            return wrapper.hasClass("menu")
        })
        const menuItems = menu.children()
        chai.expect(menuItems).to.length(3)
        const menuItem0 = menuItems.at(0)
        chai.expect(menuItem0.children().prop("radio")).to.false
        chai.expect(menuItem0.children().prop("label")).to.equal("First")
        const menuItem1 = menuItems.at(1)
        chai.expect(menuItem1.children().prop("radio")).to.false
        chai.expect(menuItem1.children().prop("label")).to.equal("Second")
        const menuItem2 = menuItems.at(2)
        chai.expect(menuItem2.children().prop("radio")).to.false
        chai.expect(menuItem2.children().prop("label")).to.equal("Third")
    })
})
