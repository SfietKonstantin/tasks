import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import {TasksSelector } from "../../client/imports/primavera/components/tasksselector"
import * as tasksActions from "../../client/imports/primavera/actions/tasks"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import { RelationsSelector } from "../../client/imports/primavera/components/relationsselector"
import * as overview from "../../client/imports/primavera/components/overview"
import { Main } from "../../client/imports/primavera/components/main"
import * as relationsActions from "../../client/imports/primavera/actions/relations"
import { filterForOverview } from "../../client/imports/primavera/actions/overview"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import { defineDelayFilters } from "../../client/imports/primavera/actions/delays"
import { submit } from "../../client/imports/primavera/actions/overview"
import { Stage, PrimaveraTask, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import * as connectedcomponents from "../../client/imports/primavera/connectedcomponents"
import { MilestoneFilterMode, TaskListFilters } from "../../client/common/tasklistfilter"
import { ApiInputTask } from "../../common/apitypes"
import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { FakeFile } from "./fakefile"
import { makeRelations } from "./primaverahelper"
import { expectMapEqual } from "./expectutils"

describe("Primavera components", () => {
    let sandbox: Sinon.SinonSandbox
    beforeEach(() => {
        addFakeGlobal()
        sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
        sandbox.restore()
        clearFakeGlobal()
    })
    describe("TasksSelector", () => {
        it("Should render the component correctly 1", () => {
            const tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 30,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 10, 1)
            }),
            tasks.set("milestone1", {
                identifier: "milestone1",
                name: "Milestone 1",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 10, 1)
            })
            const warnings = new Map<string, Array<string>>()
            warnings.set("task1", ["Warning 1", "Warning 2"])
            warnings.set("task2", ["Warning 3"])
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={tasks}
                                                            warnings={warnings}
                                                            isImporting={false}
                                                            isInvalidFormat={false}
                                                            onFileSelected={onFileSelected}
                                                            onCurrentStage={onCurrentStage}
                                                            onNextStage={onNextStage}
                                                            onDismissInvalidFormat={onDismissInvalidFormat} />)
            chai.expect(component.prop("displayStage")).to.equal(Stage.Tasks)
            chai.expect(component.prop("currentStage")).to.equal(Stage.Overview)
            chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("buttonText")).to.equal("Imported 2 tasks")
            chai.expect(component.prop("itemCount")).to.equal(2)
            expectMapEqual(component.prop("warnings"), warnings)
            chai.expect(component.prop("isImporting")).to.equal(false)
            chai.expect(component.prop("isInvalidFormat")).to.equal(false)

            component.simulate("fileSelected")
            chai.expect(onFileSelected.calledOnce).to.true
            chai.expect(onFileSelected.calledWithExactly()).to.true

            component.simulate("currentStage")
            chai.expect(onCurrentStage.calledOnce).to.true
            chai.expect(onCurrentStage.calledWithExactly()).to.true

            component.simulate("nextStage")
            chai.expect(onNextStage.calledOnce).to.true
            chai.expect(onNextStage.calledWithExactly()).to.true

            component.simulate("dismissInvalidFormat")
            chai.expect(onDismissInvalidFormat.calledOnce).to.true
            chai.expect(onDismissInvalidFormat.calledWithExactly()).to.true
        })
        it("Should render the component correctly 2", () => {
            const tasks = new Map<string, PrimaveraTask>()
            const warnings = new Map<string, Array<string>>()
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={tasks}
                                                            warnings={warnings}
                                                            isImporting={true}
                                                            isInvalidFormat={true}
                                                            onFileSelected={onFileSelected}
                                                            onCurrentStage={onCurrentStage}
                                                            onNextStage={onNextStage}
                                                            onDismissInvalidFormat={onDismissInvalidFormat} />)
            chai.expect(component.prop("buttonText")).to.equal("Import tasks")
            chai.expect(component.prop("itemCount")).to.equal(0)
            chai.expect(component.prop("isImporting")).to.equal(true)
            chai.expect(component.prop("isInvalidFormat")).to.equal(true)
        })
        it("Should map the onProjectChanged callback", () => {
            const fakeFile = new FakeFile()
            let dispatch = sinon.spy()
            const mapped = tasksSelector.mapDispatchToProps(dispatch)
            sandbox.mock(tasksActions).expects("importTasks").once().calledWithExactly(fakeFile)
            mapped.onFileSelected(fakeFile)
        })
        it("Should map the onCurrentStage callback", () => {
            let dispatch = sinon.spy()
            const mapped = tasksSelector.mapDispatchToProps(dispatch)

            mapped.onCurrentStage()
            chai.expect(dispatch.calledWithExactly(defineStage(Stage.Tasks))).to.true
        })
        it("Should map the onNextStage callback", () => {
            let dispatch = sinon.spy()
            const mapped = tasksSelector.mapDispatchToProps(dispatch)

            mapped.onNextStage()
            chai.expect(dispatch.calledWithExactly(defineStage(Stage.Relations))).to.true
            chai.expect(dispatch.calledWithExactly(defineMaxStage(Stage.Relations))).to.true
        })
        it("Should map the onDismissInvalidFormat callback", () => {
            let dispatch = sinon.spy()
            const mapped = tasksSelector.mapDispatchToProps(dispatch)

            mapped.onDismissInvalidFormat()
            chai.expect(dispatch.calledWithExactly(tasksActions.dismissInvalidTasksFormat())).to.true
        })

    })
    describe("RelationsSelector", () => {
        it("Should render the component correctly 1", () => {
            const tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 30,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 10, 1)
            }),
            tasks.set("milestone1", {
                identifier: "milestone1",
                name: "Milestone 1",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 10, 1)
            })
            const relationsArray: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "milestone1",
                    type: "FF",
                    lag: 3
                }
            ]
            const relations = makeRelations(relationsArray)
            const warnings = new Map<string, Array<string>>()
            warnings.set("task1", ["Warning 1", "Warning 2"])
            warnings.set("task2", ["Warning 3"])
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                tasks={tasks}
                                                                relations={relations}
                                                                warnings={warnings}
                                                                isImporting={false}
                                                                isInvalidFormat={false}
                                                                onFileSelected={onFileSelected}
                                                                onCurrentStage={onCurrentStage}
                                                                onNextStage={onNextStage}
                                                                onDismissInvalidFormat={onDismissInvalidFormat} />)
            chai.expect(component.prop("displayStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("currentStage")).to.equal(Stage.Overview)
            chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("buttonText")).to.equal("Imported 1 relations")
            chai.expect(component.prop("itemCount")).to.equal(1)
            expectMapEqual(component.prop("warnings"), warnings)
            chai.expect(component.prop("isImporting")).to.equal(false)
            chai.expect(component.prop("isInvalidFormat")).to.equal(false)

            component.simulate("fileSelected")
            chai.expect(onFileSelected.calledOnce).to.true
            chai.expect(onFileSelected.calledWithExactly()).to.true

            component.simulate("currentStage")
            chai.expect(onCurrentStage.calledOnce).to.true
            chai.expect(onCurrentStage.calledWithExactly()).to.true

            component.simulate("nextStage")
            chai.expect(onNextStage.calledOnce).to.true
            chai.expect(onNextStage.calledWithExactly(tasks, relations)).to.true

            component.simulate("dismissInvalidFormat")
            chai.expect(onDismissInvalidFormat.calledOnce).to.true
            chai.expect(onDismissInvalidFormat.calledWithExactly()).to.true
        })
        it("Should render the component correctly 2", () => {
            const tasks = new Map<string, PrimaveraTask>()
            const relations = makeRelations([])
            const warnings = new Map<string, Array<string>>()
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                tasks={tasks}
                                                                relations={relations}
                                                                warnings={warnings}
                                                                isImporting={true}
                                                                isInvalidFormat={true}
                                                                onFileSelected={onFileSelected}
                                                                onCurrentStage={onCurrentStage}
                                                                onNextStage={onNextStage}
                                                                onDismissInvalidFormat={onDismissInvalidFormat} />)
            chai.expect(component.prop("buttonText")).to.equal("Import relations")
            chai.expect(component.prop("itemCount")).to.equal(0)
            chai.expect(component.prop("isImporting")).to.equal(true)
            chai.expect(component.prop("isInvalidFormat")).to.equal(true)
        })
        it("Should map the onProjectChanged callback", () => {
            const fakeFile = new FakeFile()
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)
            sandbox.mock(relationsActions).expects("importRelations").once().calledWithExactly(fakeFile)
            mapped.onFileSelected(fakeFile)
        })
        it("Should map the onCurrentStage callback", () => {
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)

            mapped.onCurrentStage()
            dispatch.calledWithExactly(defineStage(Stage.Relations))
        })
        it("Should map the onNextStage callback", () => {
            const tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 30,
                startDate: new Date(2016, 9, 1),
                endDate: new Date(2016, 10, 1)
            }),
            tasks.set("milestone1", {
                identifier: "milestone1",
                name: "Milestone 1",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 10, 1)
            })
            const relationsArray: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "milestone1",
                    type: "FF",
                    lag: 3
                }
            ]
            const defaultFilters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const relations = makeRelations(relationsArray)
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)

            mapped.onNextStage(tasks, relations)
            chai.expect(dispatch.calledWithExactly(defineStage(Stage.Delays))).to.true
            chai.expect(dispatch.calledWithExactly(defineMaxStage(Stage.Delays))).to.true
            chai.expect(dispatch.calledWithExactly(defineDelayFilters(tasks, defaultFilters))).to.true
        })
        it("Should map the onDismissInvalidFormat callback", () => {
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)

            mapped.onDismissInvalidFormat()
            chai.expect(dispatch.calledWithExactly(relationsActions.dismissInvalidRelationsFormat())).to.true
        })
    })
    describe("Overview", () => {
        it("Should map the onCurrentStage callback", () => {
            let dispatch = sinon.spy()
            const mapped = overview.mapDispatchToProps(dispatch)

            mapped.onCurrentStage()
            dispatch.calledWithExactly(defineStage(Stage.Overview))
        })
        it("Should map the onSubmit callback", () => {
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
            const relations: Array<TaskRelation> = [
                {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: "milestone1",
                    lag: 3
                }
            ]
            let dispatch = sinon.spy()
            const mapped = overview.mapDispatchToProps(dispatch)

            mapped.onSubmit(project, tasks, relations)
            dispatch.calledWithExactly(submit(project, tasks, relations))
        })
    })
    describe("Main", () => {
        it("Should render the component correctly", () => {
            const component = enzyme.shallow(<Main  />)
            chai.expect(component.find(connectedcomponents.ProjectEditor)).to.length(1)
            chai.expect(component.find(connectedcomponents.TasksSelector)).to.length(1)
            chai.expect(component.find(connectedcomponents.RelationsSelector)).to.length(1)
            chai.expect(component.find(connectedcomponents.Overview)).to.length(1)
        })
    })
})
