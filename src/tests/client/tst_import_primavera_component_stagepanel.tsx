import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { StagePanel } from "../../client/imports/primavera/components/stagepanel"
import { Stage } from "../../client/imports/primavera/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera import StagePanel", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should be displayed on correct stage", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Tasks}
                                                     maxStage={Stage.Tasks}
                                                     title="Test"
                                                     onCurrent={onCurrent} />)
        chai.expect(component.hasClass("panel-info"))
        chai.expect(component.childAt(0).hasClass("clickable")).to.false
        chai.expect(component.childAt(1).hasClass("hidden")).to.false

        component.childAt(0).simulate("click")
        chai.expect(onCurrent.notCalled).to.true
    })
    it("Should not be displayed on incoming stage", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Project}
                                                     maxStage={Stage.Project}
                                                     title="Test"
                                                     onCurrent={onCurrent} />)
        chai.expect(component.hasClass("panel-info"))
        chai.expect(component.childAt(0).hasClass("clickable")).to.false
        chai.expect(component.childAt(1).hasClass("hidden")).to.true

        component.childAt(0).simulate("click")
        chai.expect(onCurrent.notCalled).to.true
    })
    it("Should not be displayed on backtracked stage 1", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Project}
                                                     maxStage={Stage.Tasks}
                                                     title="Test"
                                                     onCurrent={onCurrent} />)
        chai.expect(component.hasClass("panel-default"))

        chai.expect(component.hasClass("panel-info"))
        chai.expect(component.childAt(0).hasClass("clickable")).to.true
        chai.expect(component.childAt(1).hasClass("hidden")).to.true

        component.childAt(0).simulate("click")
        chai.expect(onCurrent.calledOnce).to.true
        chai.expect(onCurrent.calledWithExactly()).to.true
    })
    it("Should not be displayed on backtracked stage 2", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Project}
                                                     maxStage={Stage.Relations}
                                                     title="Test"
                                                     onCurrent={onCurrent} />)
        chai.expect(component.hasClass("panel-primary"))

        chai.expect(component.hasClass("panel-info"))
        chai.expect(component.childAt(0).hasClass("clickable")).to.true
        chai.expect(component.childAt(1).hasClass("hidden")).to.true

        component.childAt(0).simulate("click")
        chai.expect(onCurrent.calledOnce).to.true
        chai.expect(onCurrent.calledWithExactly()).to.true
    })
    it("Should display the warning indicator 1", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Tasks}
                                                     maxStage={Stage.Tasks}
                                                     title="Test"
                                                     onCurrent={onCurrent} />)
        const label = component.find("Label")
        chai.expect(label).to.length(0)
    })
    it("Should display the warning indicator 2", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Tasks}
                                                     maxStage={Stage.Tasks}
                                                     title="Test"
                                                     warnings={0}
                                                     onCurrent={onCurrent} />)
        const label = component.find("Label")
        chai.expect(label).to.length(0)
    })
    it("Should display the warning indicator 3", () => {
        const onCurrent = sinon.spy()
        const component = enzyme.shallow(<StagePanel displayStage={Stage.Tasks}
                                                     currentStage={Stage.Tasks}
                                                     maxStage={Stage.Tasks}
                                                     title="Test"
                                                     warnings={123}
                                                     onCurrent={onCurrent} />)
        const label = component.find("Label")
        chai.expect(label).to.length(1)
        chai.expect(label.children().text()).to.equal("123")
    })
})
