import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { Overview } from "../../client/imports/primavera/components/overview"
import { FakeFile } from "./fakefile"
import { Stage, SubmitState } from "../../client/imports/primavera/types"
import { Project } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { expectMapEqual } from "./expectutils"
import { warnings, noWarnings, project, emptyProject, inputTasks1, inputDelays1, inputRelations1 } from "./testdata"

describe("Primavera import Overview", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should render the component correctly", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={inputTasks1}
                                                   delays={inputDelays1}
                                                   totalRelations={234}
                                                   relations={inputRelations1}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)
        chai.expect(component.prop("displayStage")).to.equal(Stage.Overview)
        chai.expect(component.prop("currentStage")).to.equal(Stage.Tasks)
        chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
        chai.expect(component.prop("warnings")).to.equal(3)

        const tasksComponents = component.childAt(0)
        chai.expect(tasksComponents.childAt(0).children().text()).to.equal("2")
        chai.expect(tasksComponents.childAt(1).text()).to.equal(" tasks and ")
        chai.expect(tasksComponents.childAt(2).children().text()).to.equal("1")
        chai.expect(tasksComponents.childAt(3).text()).to.equal(" delays of the 123 tasks will be imported")

        const relationsComponents = component.childAt(1)
        chai.expect(relationsComponents.childAt(0).children().text()).to.equal("1")
        chai.expect(relationsComponents.childAt(1).text()).to.equal(" of the 234 relations will be imported")

        component.simulate("current")
        chai.expect(onCurrentStage.calledOnce).to.true
        chai.expect(onCurrentStage.calledWithExactly()).to.true
    })
    it("Should react to submit", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={inputTasks1}
                                                   delays={inputDelays1}
                                                   totalRelations={234}
                                                   relations={inputRelations1}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        submitButton.simulate("click")
        chai.expect(onSubmit.calledOnce).to.true
        chai.expect(onSubmit.calledWithExactly(project, inputTasks1, inputRelations1)).to.true
    })
    it("Should render the warning button 1", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const warningButton = component.find("WarningsButton")
        expectMapEqual(warningButton.prop("warnings"), warnings)
    })
    it("Should render the warning button 2", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const warningButton = component.find("WarningsButton")
        chai.expect(warningButton).to.length(0)
    })
    it("Should render button state 1", () => {
        const intermediateProject: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={intermediateProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 2", () => {
        const intermediateProject: Project = {
            identifier: "identifier",
            name: "",
            description: ""
        }
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={intermediateProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 3", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 4", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={inputTasks1}
                                                   delays={inputDelays1}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 5", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={inputTasks1}
                                                   delays={inputDelays1}
                                                   totalRelations={234}
                                                   relations={inputRelations1}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Submitted}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 6", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={inputTasks1}
                                                   delays={inputDelays1}
                                                   totalRelations={234}
                                                   relations={inputRelations1}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.false
    })
    it("Should render button based on submitting state 1", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={emptyProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("primary")
        chai.expect(submitButton.children().text()).to.equal("Import")
    })
    it("Should render button based on submitting state 2", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={emptyProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Submitting}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("default")
        chai.expect(submitButton.children().text()).to.equal("Importing")
    })
    it("Should render button based on submitting state 3", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={emptyProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.Submitted}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("success")
        chai.expect(submitButton.children().text()).to.equal("Import successful")
    })
    it("Should render button based on submitting state 4", () => {
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={emptyProject}
                                                   tasks={[]}
                                                   delays={[]}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={noWarnings}
                                                   submitState={SubmitState.SubmitError}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("danger")
        chai.expect(submitButton.children().text()).to.equal("Import failed")
    })
})
