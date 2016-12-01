import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { Checkbox, ListGroup } from "react-bootstrap"
import { DelaysSelector, mapDispatchToProps } from "../../client/imports/primavera/components/delaysselector"
import { FakeFile } from "./fakefile"
import { Stage, SubmitState } from "../../client/imports/primavera/types"
import { Project } from "../../common/types"
import { MilestoneFilterMode, TaskListFilters } from "../../client/common/tasklist/types"
import { defineStage, defineMaxStage } from "../../client/imports/primavera/actions/stages"
import { defineDelaySelection } from "../../client/imports/primavera/actions/delays"
import { filterForOverview } from "../../client/imports/primavera/actions/overview"
import { updateFilters, previousTasksPage, nextTasksPage } from "../../client/common/tasklist/actions"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { expectMapEqual } from "./expectutils"
import {
    warnings, noWarnings, primaveraTasks2, filteredPrimaveraTasks2,
    primaveraRelationNodes2, taskListFilters, noSelectedDelays, selectedDelays2
 } from "./testdata"
import * as maputils from "../../common/maputils"

describe("Primavera import DelaySelector", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should render the component correctly", () => {
        const onFiltersChanged = sinon.spy()
        const onSelectionChanged = sinon.spy()
        const onPreviousTasksPage = sinon.spy()
        const onNextTasksPage = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<DelaysSelector stage={Stage.Tasks}
                                                         maxStage={Stage.Relations}
                                                         tasks={primaveraTasks2}
                                                         displayedTasks={filteredPrimaveraTasks2}
                                                         filters={taskListFilters}
                                                         relations={primaveraRelationNodes2}
                                                         warnings={warnings}
                                                         selection={selectedDelays2}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onSelectionChanged={onSelectionChanged}
                                                         onNextTasksPage={onNextTasksPage}
                                                         onPreviousTasksPage={onPreviousTasksPage}
                                                         onCurrentStage={onCurrentStage}
                                                         onNextStage={onNextStage} />)
        chai.expect(component.prop("displayStage")).to.equal(Stage.Delays)
        chai.expect(component.prop("currentStage")).to.equal(Stage.Tasks)
        chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)
        chai.expect(component.prop("warnings")).to.equal(3)

        const taskListComponent = component.childAt(0)
        chai.expect(taskListComponent.prop("tasks")).to.deep.equal(filteredPrimaveraTasks2)
        chai.expect(taskListComponent.prop("filters")).to.deep.equal(taskListFilters)

        const indicatorComponent = taskListComponent.childAt(0)
        chai.expect(indicatorComponent.childAt(0).children().text()).to.equal("2")
        chai.expect(indicatorComponent.childAt(1).text()).to.equal(" delays selected")

        const buttonGroup = taskListComponent.childAt(1)
        const nextButton = buttonGroup.childAt(0)
        nextButton.simulate("click")
        chai.expect(onNextStage.calledOnce).to.true
        chai.expect(onNextStage.calledWithExactly(primaveraTasks2, selectedDelays2, primaveraRelationNodes2)).to.true

        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
            text: "test"
        }
        taskListComponent.simulate("filtersChanged", filters)
        chai.expect(onFiltersChanged.calledOnce).to.true
        chai.expect(onFiltersChanged.calledWithExactly(filters)).to.true

        component.simulate("current")
        chai.expect(onCurrentStage.calledOnce).to.true
        chai.expect(onCurrentStage.calledWithExactly()).to.true

        taskListComponent.simulate("previousPage")
        chai.expect(onPreviousTasksPage.calledOnce).to.true
        chai.expect(onPreviousTasksPage.calledWithExactly()).to.true

        taskListComponent.simulate("nextPage")
        chai.expect(onNextTasksPage.calledOnce).to.true
        chai.expect(onNextTasksPage.calledWithExactly()).to.true
    })
    it("Should render items correctly", () => {
        const onFiltersChanged = sinon.spy()
        const onSelectionChanged = sinon.spy()
        const onPreviousTasksPage = sinon.spy()
        const onNextTasksPage = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<DelaysSelector stage={Stage.Tasks}
                                                         maxStage={Stage.Relations}
                                                         tasks={primaveraTasks2}
                                                         displayedTasks={filteredPrimaveraTasks2}
                                                         filters={taskListFilters}
                                                         relations={primaveraRelationNodes2}
                                                         warnings={noWarnings}
                                                         selection={selectedDelays2}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onSelectionChanged={onSelectionChanged}
                                                         onNextTasksPage={onNextTasksPage}
                                                         onPreviousTasksPage={onPreviousTasksPage}
                                                         onCurrentStage={onCurrentStage}
                                                         onNextStage={onNextStage} />)
        const taskListComponent = component.childAt(0).dive()
        const listGroup = taskListComponent.find(ListGroup)
        chai.expect(listGroup.children()).to.length(6)

        const checkboxes = listGroup.find(Checkbox)
        const checkbox1 = checkboxes.at(0)
        chai.expect(checkbox1.childAt(0).text()).to.equal("Task 1")
        chai.expect(checkbox1.childAt(2).childAt(1).text()).to.equal("task1")
        const checkbox2 = checkboxes.at(1)
        chai.expect(checkbox2.childAt(0).text()).to.equal("Task 2")
        chai.expect(checkbox2.childAt(2).childAt(1).text()).to.equal("task2")
        const checkbox3 = checkboxes.at(2)
        chai.expect(checkbox3.childAt(0).text()).to.equal("Task 3")
        chai.expect(checkbox3.childAt(2).childAt(1).text()).to.equal("task3")
        const checkbox4 = checkboxes.at(3)
        chai.expect(checkbox4.childAt(0).text()).to.equal("Task 4")
        chai.expect(checkbox4.childAt(2).childAt(1).text()).to.equal("task4")
        const checkbox5 = checkboxes.at(4)
        chai.expect(checkbox5.childAt(0).text()).to.equal("Milestone 1")
        chai.expect(checkbox5.childAt(2).childAt(1).text()).to.equal("milestone1")
        const checkbox6 = checkboxes.at(5)
        chai.expect(checkbox6.childAt(0).text()).to.equal("Milestone 2")
        chai.expect(checkbox6.childAt(2).childAt(1).text()).to.equal("milestone2")

        checkbox4.simulate("click", { target: { checked: true } })
        chai.expect(onSelectionChanged.calledOnce).to.true
        chai.expect(onSelectionChanged.calledWithExactly(primaveraTasks2, primaveraRelationNodes2,
                                                         "task4", true)).to.true

    })
    it("Should render the warning button 1", () => {
        const onFiltersChanged = sinon.spy()
        const onSelectionChanged = sinon.spy()
        const onPreviousTasksPage = sinon.spy()
        const onNextTasksPage = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<DelaysSelector stage={Stage.Tasks}
                                                         maxStage={Stage.Relations}
                                                         tasks={primaveraTasks2}
                                                         displayedTasks={[]}
                                                         filters={taskListFilters}
                                                         relations={primaveraRelationNodes2}
                                                         warnings={warnings}
                                                         selection={noSelectedDelays}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onSelectionChanged={onSelectionChanged}
                                                         onNextTasksPage={onNextTasksPage}
                                                         onPreviousTasksPage={onPreviousTasksPage}
                                                         onCurrentStage={onCurrentStage}
                                                         onNextStage={onNextStage} />)
        const warningsButton = component.find("WarningsButton")
        expectMapEqual(warningsButton.prop("warnings"), warnings)
    })
    it("Should render the warning button 2", () => {
        const onFiltersChanged = sinon.spy()
        const onSelectionChanged = sinon.spy()
        const onPreviousTasksPage = sinon.spy()
        const onNextTasksPage = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<DelaysSelector stage={Stage.Tasks}
                                                         maxStage={Stage.Relations}
                                                         tasks={primaveraTasks2}
                                                         displayedTasks={[]}
                                                         filters={taskListFilters}
                                                         relations={primaveraRelationNodes2}
                                                         warnings={noWarnings}
                                                         selection={noSelectedDelays}
                                                         currentPage={0}
                                                         maxPage={0}
                                                         onFiltersChanged={onFiltersChanged}
                                                         onSelectionChanged={onSelectionChanged}
                                                         onNextTasksPage={onNextTasksPage}
                                                         onPreviousTasksPage={onPreviousTasksPage}
                                                         onCurrentStage={onCurrentStage}
                                                         onNextStage={onNextStage} />)

        const warningButton = component.find("WarningsButton")
        chai.expect(warningButton).to.length(0)
    })
    it("Should map the onFiltersChanged callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onFiltersChanged(taskListFilters)
        dispatch.calledWithExactly(updateFilters(taskListFilters))
    })
    it("Should map the onPreviousTasksPage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onPreviousTasksPage()
        dispatch.calledWithExactly(previousTasksPage())
    })
    it("Should map the onNextTasksPage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onNextTasksPage()
        dispatch.calledWithExactly(nextTasksPage())
    })
    it("Should map the onSelectionChanged callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onSelectionChanged(primaveraTasks2, primaveraRelationNodes2, "task", true)
        dispatch.calledWithExactly(defineDelaySelection(primaveraTasks2, primaveraRelationNodes2, "task", true))
    })
    it("Should map the onCurrentStage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onCurrentStage()
        dispatch.calledWithExactly(defineStage(Stage.Delays))
    })
    it("Should map the onNextStage callback", () => {
        let dispatch = sinon.spy()
        const mapped = mapDispatchToProps(dispatch)

        mapped.onNextStage(primaveraTasks2, selectedDelays2, primaveraRelationNodes2)
        dispatch.calledWithExactly(defineStage(Stage.Overview))
        dispatch.calledWithExactly(defineMaxStage(Stage.Overview))
        dispatch.calledWithExactly(filterForOverview(primaveraTasks2, selectedDelays2, primaveraRelationNodes2))
    })
})
