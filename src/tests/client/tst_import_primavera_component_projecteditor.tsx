import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { ProjectEditor, mapDispatchToProps } from "../../client/imports/primavera/components/projecteditor"
import { defineProject } from "../../client/imports/primavera/actions/project"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import { Stage } from "../../client/imports/primavera/types"
import { Project } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera import ProjectEditor", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should validate project 1", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formGroups = component.children().find("FormGroup")
        chai.expect(formGroups).to.length(2)

        chai.expect(formGroups.at(0).prop("validationState")).to.equal("error")
        chai.expect(formGroups.at(1).prop("validationState")).to.equal("error")

        const button = component.children().find("Button")
        chai.expect(button).to.length(1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should validate project 2", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "project",
            name: "",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formGroups = component.children().find("FormGroup")
        chai.expect(formGroups).to.length(2)

        chai.expect(formGroups.at(0).prop("validationState")).to.equal("success")
        chai.expect(formGroups.at(1).prop("validationState")).to.equal("error")

        const button = component.children().find("Button")
        chai.expect(button).to.length(1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should validate project 3", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "",
            name: "Project",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formGroups = component.children().find("FormGroup")
        chai.expect(formGroups).to.length(2)

        chai.expect(formGroups.at(0).prop("validationState")).to.equal("error")
        chai.expect(formGroups.at(1).prop("validationState")).to.equal("success")

        const button = component.children().find("Button")
        chai.expect(button).to.length(1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should validate project 4", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "project",
            name: "Project",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formGroups = component.children().find("FormGroup")
        chai.expect(formGroups).to.length(2)

        chai.expect(formGroups.at(0).prop("validationState")).to.equal("success")
        chai.expect(formGroups.at(1).prop("validationState")).to.equal("success")

        const button = component.children().find("Button")
        chai.expect(button).to.length(1)
        chai.expect(button.prop("disabled")).to.false
    })
    it("Should handle next button", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const button = component.children().find("Button")
        chai.expect(button).to.length(1)

        button.simulate("click")
        chai.expect(onNextStage.calledOnce).to.true
        chai.expect(onNextStage.calledWithExactly()).to.true
    })
    it("Should handle current", () => {
        const stage = Stage.Tasks
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        component.simulate("current")
        chai.expect(onCurrentStage.calledOnce).to.true
        chai.expect(onCurrentStage.calledWithExactly()).to.true
    })
    it("Should handle project modification 1", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "",
            name: "Project",
            description: "Description"
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formControls = component.children().find("FormControl")
        chai.expect(formControls).to.length(2)

        formControls.at(0).simulate("input", { target: { value: "project" } })
        chai.expect(onProjectChanged.calledOnce).to.true
        chai.expect(onProjectChanged.calledWithExactly("project", "Project", "Description")).to.true
    })
    it("Should handle project modification 2", () => {
        const stage = Stage.Project
        const project: Project = {
            identifier: "project",
            name: "",
            description: "Description"
        }
        const onProjectChanged = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<ProjectEditor stage={stage} project={project}
                                                        onProjectChanged={onProjectChanged}
                                                        onCurrentStage={onCurrentStage}
                                                        onNextStage={onNextStage} />)
        const formControls = component.children().find("FormControl")
        chai.expect(formControls).to.length(2)

        formControls.at(1).simulate("input", { target: { value: "Project" } })
        chai.expect(onProjectChanged.calledOnce).to.true
        chai.expect(onProjectChanged.calledWithExactly("project", "Project", "Description")).to.true
    })
    it("Should map the onProjectChanged callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onProjectChanged("identifier", "Project", "Description")
        dispatch.calledWithExactly(defineProject("identifier", "Project", "Description"))
    })
    it("Should map the onCurrentStage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onCurrentStage()
        dispatch.calledWithExactly(defineStage(Stage.Project))
    })
    it("Should map the onNextStage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onNextStage()
        dispatch.calledWithExactly(defineStage(Stage.Tasks))
        dispatch.calledWithExactly(defineStage(Stage.Tasks))
    })
})
