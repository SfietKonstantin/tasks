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
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { FakeFile } from "./fakefile"
import { makeRelations } from "./primaverahelper"
import { expectMapEqual } from "./expectutils"
import {
    warnings, noWarnings, primaveraTasks1, emptyPrimaveraTasks, primaveraRelations1,
    taskListFilters, project, inputTasks1, inputDelays1, inputTaskRelations1, inputDelayRelations1
} from "./testdata"

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
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={primaveraTasks1}
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
            chai.expect(component.prop("buttonText")).to.equal("Imported 3 tasks")
            chai.expect(component.prop("itemCount")).to.equal(3)
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
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<TasksSelector stage={Stage.Overview}
                                                            maxStage={Stage.Relations}
                                                            tasks={emptyPrimaveraTasks}
                                                            warnings={noWarnings}
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
            const relations = makeRelations(primaveraRelations1)
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                tasks={primaveraTasks1}
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
            chai.expect(component.prop("buttonText")).to.equal("Imported 3 relations")
            chai.expect(component.prop("itemCount")).to.equal(3)
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
            chai.expect(onNextStage.calledWithExactly(primaveraTasks1, relations)).to.true

            component.simulate("dismissInvalidFormat")
            chai.expect(onDismissInvalidFormat.calledOnce).to.true
            chai.expect(onDismissInvalidFormat.calledWithExactly()).to.true
        })
        it("Should render the component correctly 2", () => {
            const relations = makeRelations([])
            const onFileSelected = sinon.spy()
            const onCurrentStage = sinon.spy()
            const onNextStage = sinon.spy()
            const onDismissInvalidFormat = sinon.spy()
            const component = enzyme.shallow(<RelationsSelector stage={Stage.Overview}
                                                                maxStage={Stage.Relations}
                                                                tasks={emptyPrimaveraTasks}
                                                                relations={relations}
                                                                warnings={noWarnings}
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
            const relations = makeRelations(primaveraRelations1)
            let dispatch = sinon.spy()
            const mapped = relationsSelector.mapDispatchToProps(dispatch)

            mapped.onNextStage(primaveraTasks1, relations)
            chai.expect(dispatch.calledWithExactly(defineStage(Stage.Delays))).to.true
            chai.expect(dispatch.calledWithExactly(defineMaxStage(Stage.Delays))).to.true
            chai.expect(dispatch.calledWithExactly(defineDelayFilters(primaveraTasks1, taskListFilters))).to.true
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
            let dispatch = sinon.spy()
            const mapped = overview.mapDispatchToProps(dispatch)

            mapped.onSubmit(project, inputTasks1, inputDelays1, inputTaskRelations1, inputDelayRelations1)
            dispatch.calledWithExactly(submit(project, inputTasks1, inputDelays1,
                                              inputTaskRelations1, inputDelayRelations1))
        })
    })
    describe("Main", () => {
        it("Should render the component correctly", () => {
            const component = enzyme.shallow(<Main  />)
            chai.expect(component.find(connectedcomponents.ProjectEditor)).to.length(1)
            chai.expect(component.find(connectedcomponents.TasksSelector)).to.length(1)
            chai.expect(component.find(connectedcomponents.RelationsSelector)).to.length(1)
            chai.expect(component.find(connectedcomponents.DelaysSelector)).to.length(1)
            chai.expect(component.find(connectedcomponents.Overview)).to.length(1)
        })
    })
})
