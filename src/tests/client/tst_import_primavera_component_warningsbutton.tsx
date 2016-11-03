import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { WarningsButton } from "../../client/imports/primavera/components/warningsbutton"
import { Stage } from "../../client/imports/primavera/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera import WarningsButton", () => {
    const warnings = new Map<string, Array<string>>()
    warnings.set("task1", ["Warning 1", "Warning 2"])
    warnings.set("task2", ["Warning 3"])
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should display warnings", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<WarningsButton warnings={warnings} />)

        const alert = component.find("Alert")
        chai.expect(alert.children()).to.length(3)

        chai.expect(alert.childAt(0).childAt(0).text()).to.equal("task1")
        chai.expect(alert.childAt(0).childAt(2).text()).to.equal("Warning 1")
        chai.expect(alert.childAt(1).childAt(0).text()).to.equal("task1")
        chai.expect(alert.childAt(1).childAt(2).text()).to.equal("Warning 2")
        chai.expect(alert.childAt(2).childAt(0).text()).to.equal("task2")
        chai.expect(alert.childAt(2).childAt(2).text()).to.equal("Warning 3")
    })
    it("Should be hidden by default", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<WarningsButton warnings={warnings} />)

        const modal = component.find("Modal")
        chai.expect(modal.prop("show")).to.false
    })
    it("Should react to open", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<WarningsButton warnings={warnings} />)

        component.simulate("click")

        const modal = component.find("Modal")
        chai.expect(modal.prop("show")).to.true
    })
    it("Should react to close 1", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<WarningsButton warnings={warnings} />)

        component.simulate("click")

        const modal1 = component.find("Modal")
        chai.expect(modal1.prop("show")).to.true

        modal1.simulate("hide")

        const modal2 = component.find("Modal")
        chai.expect(modal2.prop("show")).to.false
    })
    it("Should react to close 2", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<WarningsButton warnings={warnings} />)

        component.simulate("click")

        const modal1 = component.find("Modal")
        chai.expect(modal1.prop("show")).to.true

        const footer = component.find("ModalFooter")
        const closeButton = footer.find("Button")
        closeButton.simulate("click")

        const modal2 = component.find("Modal")
        chai.expect(modal2.prop("show")).to.false
    })
})
