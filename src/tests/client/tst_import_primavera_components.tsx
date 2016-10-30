import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import * as tasksSelector from "../../client/imports/primavera/components/tasksselector"
import {TasksSelector } from "../../client/imports/primavera/components/tasksselector"
import * as tasksActions from "../../client/imports/primavera/actions/tasks"
import * as relationsSelector from "../../client/imports/primavera/components/relationsselector"
import { RelationsSelector } from "../../client/imports/primavera/components/relationsselector"
import * as relationsActions from "../../client/imports/primavera/actions/relations"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import { Stage, PrimaveraTask, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { FakeFile } from "./fakefile"

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
            const warnings = [
                "Warning 1",
                "Warning 2",
                "Warning 3"
            ]
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={tasks}
                                                            warnings={warnings}
                                                            isImporting={false}
                                                            onFileSelected={onFileSelected}
                                                            onCurrentStage={onCurrentStage}
                                                            onNextStage={onNextStage} />)
            chai.expect(component.prop("displayStage")).to.equal(Stage.Tasks)
            chai.expect(component.prop("currentStage")).to.equal(Stage.Overview)
            chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("buttonText")).to.equal("Imported 2 tasks")
            chai.expect(component.prop("itemCount")).to.equal(2)
            chai.expect(component.prop("warnings")).to.deep.equal(warnings)
            chai.expect(component.prop("isImporting")).to.equal(false)

            component.simulate("fileSelected")
            chai.expect(onFileSelected.calledOnce).to.true
            chai.expect(onFileSelected.calledWithExactly()).to.true

            component.simulate("currentStage")
            chai.expect(onCurrentStage.calledOnce).to.true
            chai.expect(onCurrentStage.calledWithExactly()).to.true

            component.simulate("nextStage")
            chai.expect(onNextStage.calledOnce).to.true
            chai.expect(onNextStage.calledWithExactly()).to.true
        })
        it("Should render the component correctly 2", () => {
            const tasks = new Map<string, PrimaveraTask>()
            const warnings = []
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={tasks}
                                                            warnings={warnings}
                                                            isImporting={true}
                                                            onFileSelected={onFileSelected}
                                                            onCurrentStage={onCurrentStage}
                                                            onNextStage={onNextStage} />)
            chai.expect(component.prop("buttonText")).to.equal("Import tasks")
            chai.expect(component.prop("itemCount")).to.equal(0)
            chai.expect(component.prop("isImporting")).to.equal(true)
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
            dispatch.calledWithExactly(defineStage(Stage.Tasks))
        })
        it("Should map the onNextStage callback", () => {
            let dispatch = sinon.spy()
            const mapped = tasksSelector.mapDispatchToProps(dispatch)

            mapped.onNextStage()
            dispatch.calledWithExactly(defineStage(Stage.Relations))
            dispatch.calledWithExactly(defineStage(Stage.Relations))
        })
    })
    describe("RelationsSelector", () => {
        it("Should render the component correctly 1", () => {
            const relations: Array<PrimaveraTaskRelation> = [
                {
                    previous: "task1",
                    next: "milestone1",
                    type: "FF",
                    lag: 3
                }
            ]
            const warnings = [
                "Warning 1",
                "Warning 2",
                "Warning 3"
            ]
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                relations={relations}
                                                                warnings={warnings}
                                                                isImporting={false}
                                                                onFileSelected={onFileSelected}
                                                                onCurrentStage={onCurrentStage}
                                                                onNextStage={onNextStage} />)
            chai.expect(component.prop("displayStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("currentStage")).to.equal(Stage.Overview)
            chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
            chai.expect(component.prop("buttonText")).to.equal("Imported 1 relations")
            chai.expect(component.prop("itemCount")).to.equal(1)
            chai.expect(component.prop("warnings")).to.deep.equal(warnings)
            chai.expect(component.prop("isImporting")).to.equal(false)

            component.simulate("fileSelected")
            chai.expect(onFileSelected.calledOnce).to.true
            chai.expect(onFileSelected.calledWithExactly()).to.true

            component.simulate("currentStage")
            chai.expect(onCurrentStage.calledOnce).to.true
            chai.expect(onCurrentStage.calledWithExactly()).to.true

            component.simulate("nextStage")
            chai.expect(onNextStage.calledOnce).to.true
            chai.expect(onNextStage.calledWithExactly()).to.true
        })
        it("Should render the component correctly 2", () => {
            const relations = new Array<PrimaveraTaskRelation>()
            const warnings = []
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                relations={relations}
                                                                warnings={warnings}
                                                                isImporting={true}
                                                                onFileSelected={onFileSelected}
                                                                onCurrentStage={onCurrentStage}
                                                                onNextStage={onNextStage} />)
            chai.expect(component.prop("buttonText")).to.equal("Import relations")
            chai.expect(component.prop("itemCount")).to.equal(0)
            chai.expect(component.prop("isImporting")).to.equal(true)
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
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)

            mapped.onNextStage()
            dispatch.calledWithExactly(defineStage(Stage.Overview))
            dispatch.calledWithExactly(defineStage(Stage.Overview))
        })
    })
})
