import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { Overview } from "../../client/imports/primavera/components/overview"
import { FakeFile } from "./fakefile"
import { Stage, SubmitState } from "../../client/imports/primavera/types"
import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { ApiInputTask, ApiInputDelay } from "../../common/apitypes"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { expectMapEqual } from "./expectutils"

describe("Primavera import Overview", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should render the component correctly", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const tasks: Array<ApiInputTask> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "",
                estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                estimatedDuration: 30
            },
            {
                identifier: "milestone1",
                name: "Milestone 1",
                description: "",
                estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                estimatedDuration: 0
            }
        ]
        const delays: Array<ApiInputDelay> = [
            {
                identifier: "delay",
                name: "Delay",
                description: "",
                date: new Date(2016, 9, 1).toISOString()
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "milestone1",
                lag: 3
            }
        ]
        const warnings = new Map<string, Array<string>>()
        warnings.set("task1", ["Warning 1", "Warning 2"])
        warnings.set("task2", ["Warning 3"])
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={tasks}
                                                   delays={delays}
                                                   totalRelations={234}
                                                   relations={relations}
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
        chai.expect(tasksComponents.childAt(3).text()).to.equal(" delays of the ")
        chai.expect(tasksComponents.childAt(4).text()).to.equal("123")
        chai.expect(tasksComponents.childAt(5).text()).to.equal(" tasks will be imported")

        const relationsComponents = component.childAt(1)
        chai.expect(relationsComponents.childAt(0).children().text()).to.equal("1")
        chai.expect(relationsComponents.childAt(1).text()).to.equal(" of the ")
        chai.expect(relationsComponents.childAt(2).text()).to.equal("234")
        chai.expect(relationsComponents.childAt(3).text()).to.equal(" relations will be imported")

        component.simulate("current")
        chai.expect(onCurrentStage.calledOnce).to.true
        chai.expect(onCurrentStage.calledWithExactly()).to.true
    })
    it("Should react to submit", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const tasks: Array<ApiInputTask> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "",
                estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                estimatedDuration: 30
            },
            {
                identifier: "milestone1",
                name: "Milestone 1",
                description: "",
                estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                estimatedDuration: 0
            }
        ]
        const delays: Array<ApiInputDelay> = [
            {
                identifier: "delay",
                name: "Delay",
                description: "",
                date: new Date(2016, 9, 1).toISOString()
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "milestone1",
                lag: 3
            }
        ]
        const warnings = new Map<string, Array<string>>()
        warnings.set("task1", ["Warning 1", "Warning 2"])
        warnings.set("task2", ["Warning 3"])
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={tasks}
                                                   delays={delays}
                                                   totalRelations={234}
                                                   relations={relations}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        submitButton.simulate("click")
        chai.expect(onSubmit.calledOnce).to.true
        chai.expect(onSubmit.calledWithExactly(project, tasks, relations)).to.true
    })
    it("Should render the warning button 1", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const warnings = new Map<string, Array<string>>()
        warnings.set("task1", ["Warning 1", "Warning 2"])
        warnings.set("task2", ["Warning 3"])
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
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const warnings = new Map<string, Array<string>>()
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
        chai.expect(warningButton).to.length(0)
    })
    it("Should render button state 1", () => {
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 2", () => {
        const project: Project = {
            identifier: "identifier",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 3", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 4", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: ""
        }
        const tasks: Array<ApiInputTask> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "",
                estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                estimatedDuration: 30
            },
            {
                identifier: "milestone1",
                name: "Milestone 1",
                description: "",
                estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                estimatedDuration: 0
            }
        ]
        const delays: Array<ApiInputDelay> = [
            {
                identifier: "delay",
                name: "Delay",
                description: "",
                date: new Date(2016, 9, 1).toISOString()
            }
        ]
        const warnings = new Map<string, Array<string>>()
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={tasks}
                                                   delays={delays}
                                                   totalRelations={234}
                                                   relations={[]}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 5", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const tasks: Array<ApiInputTask> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "",
                estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                estimatedDuration: 30
            },
            {
                identifier: "milestone1",
                name: "Milestone 1",
                description: "",
                estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                estimatedDuration: 0
            }
        ]
        const delays: Array<ApiInputDelay> = [
            {
                identifier: "delay",
                name: "Delay",
                description: "",
                date: new Date(2016, 9, 1).toISOString()
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "milestone1",
                lag: 3
            }
        ]
        const warnings = new Map<string, Array<string>>()
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={tasks}
                                                   delays={delays}
                                                   totalRelations={234}
                                                   relations={relations}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Submitted}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.true
    })
    it("Should render button state 6", () => {
        const project: Project = {
            identifier: "identifier",
            name: "Project",
            description: "Description"
        }
        const tasks: Array<ApiInputTask> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "",
                estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                estimatedDuration: 30
            },
            {
                identifier: "milestone1",
                name: "Milestone 1",
                description: "",
                estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                estimatedDuration: 0
            }
        ]
        const delays: Array<ApiInputDelay> = [
            {
                identifier: "delay",
                name: "Delay",
                description: "",
                date: new Date(2016, 9, 1).toISOString()
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "milestone1",
                lag: 3
            }
        ]
        const warnings = new Map<string, Array<string>>()
        const onCurrentStage = sinon.spy()
        const onSubmit = sinon.spy()
        const component = enzyme.shallow(<Overview stage={Stage.Tasks}
                                                   maxStage={Stage.Relations}
                                                   totalTasks={123}
                                                   project={project}
                                                   tasks={tasks}
                                                   delays={delays}
                                                   totalRelations={234}
                                                   relations={relations}
                                                   warnings={warnings}
                                                   submitState={SubmitState.Idle}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("disabled")).to.false
    })
    it("Should render button based on submitting state 1", () => {
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("primary")
        chai.expect(submitButton.children().text()).to.equal("Import")
    })
    it("Should render button based on submitting state 2", () => {
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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
                                                   submitState={SubmitState.Submitting}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("default")
        chai.expect(submitButton.children().text()).to.equal("Importing")
    })
    it("Should render button based on submitting state 3", () => {
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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
                                                   submitState={SubmitState.Submitted}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("success")
        chai.expect(submitButton.children().text()).to.equal("Import successful")
    })
    it("Should render button based on submitting state 4", () => {
        const project: Project = {
            identifier: "",
            name: "",
            description: ""
        }
        const warnings = new Map<string, Array<string>>()
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
                                                   submitState={SubmitState.SubmitError}
                                                   onCurrentStage={onCurrentStage}
                                                   onSubmit={onSubmit} />)

        const submitButton = component.find("Button")
        chai.expect(submitButton.prop("bsStyle")).to.equal("danger")
        chai.expect(submitButton.children().text()).to.equal("Import failed")
    })
})
