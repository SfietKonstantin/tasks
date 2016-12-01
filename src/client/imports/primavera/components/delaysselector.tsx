import * as React from "react"
import { Dispatch } from "redux"
import { ListGroupItem, ButtonGroup, Button, Label, Checkbox } from "react-bootstrap"
import { TaskList, TaskListProperties } from "../../../common/tasklist/components/tasklist"
import { TaskListFilters, MilestoneFilterMode } from "../../../common/tasklist/types"
import { State, Stage, PrimaveraTask } from "../types"
import { RelationGraphNode } from "../graph"
import { StagePanel } from "./stagepanel"
import { WarningsButton } from "./warningsbutton"
import { defineStage, defineMaxStage } from "../actions/stages"
import { defineDelaySelection } from "../actions/delays"
import { filterForOverview } from "../actions/overview"
import { updateFilters, previousTasksPage, nextTasksPage } from "../../../common/tasklist/actions"
import * as maputils from "../../../../common/maputils"

interface PrimaveraTaskListProperties extends TaskListProperties<PrimaveraTask, TaskListFilters> {
    selection: Set<string>
    onSelectionChanged: (identifier: string, selected: boolean) => void
}

class PrimaveraTaskList extends TaskList<PrimaveraTask, TaskListFilters, PrimaveraTaskListProperties> {
    constructor(props: PrimaveraTaskListProperties) {
        super(props)
    }
    protected createElement(task: PrimaveraTask): JSX.Element {
        return <ListGroupItem key={task.identifier}>
            <Checkbox inline onClick={this.handleSelectionChanged.bind(this, task.identifier)}
                      checked={this.props.selection.has(task.identifier)}>
                {task.name} <span className="text-muted">#{task.identifier}</span>
            </Checkbox>
        </ListGroupItem>
    }
    private handleSelectionChanged(identifier: string, e: React.MouseEvent) {
        const input = e.target as HTMLInputElement
        this.props.onSelectionChanged(identifier, input.checked)
    }
}

interface DelaysSelectorProperties {
    stage: Stage
    maxStage: Stage
    tasks: Map<string, PrimaveraTask>
    displayedTasks: Array<PrimaveraTask>
    filters: TaskListFilters
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
    selection: Set<string>
    currentPage: number
    maxPage: number
    onFiltersChanged: (filters: TaskListFilters) => void
    onPreviousTasksPage: () => void
    onNextTasksPage: () => void
    onSelectionChanged: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>,
                         identifier: string, selected: boolean) => void
    onCurrentStage: () => void
    onNextStage: (tasks: Map<string, PrimaveraTask>, delays: Set<string>,
                  relations: Map<string, RelationGraphNode>) => void
}

export class DelaysSelector extends React.Component<DelaysSelectorProperties, {}> {
    render() {
        let warningsButton: JSX.Element | null = null
        let totalWarnings = maputils.lengthOfMapOfList(this.props.warnings)
        if (totalWarnings > 0) {
            warningsButton = <WarningsButton warnings={this.props.warnings} />
        }
        return <StagePanel displayStage={Stage.Delays} currentStage={this.props.stage}
                           maxStage={this.props.maxStage} title="4. Select delays"
                           warnings={totalWarnings} onCurrent={this.props.onCurrentStage.bind(this)}>
            <PrimaveraTaskList tasks={this.props.displayedTasks}
                               filters={this.props.filters}
                               selection={this.props.selection}
                               currentPage={this.props.currentPage}
                               maxPage={this.props.maxPage}
                               onSelectionChanged={this.handleSelectionChanged.bind(this)}
                               onFiltersChanged={this.handleFiltersChanged.bind(this)}
                               onPreviousPage={this.onPreviousPage.bind(this)}
                               onNextPage={this.onNextPage.bind(this)} >
                <span className="import-primavera-delay-indicator">
                    <Label bsStyle="primary">{this.props.selection.size}</Label> delays selected
                </span>
                <ButtonGroup>
                    <Button bsStyle="primary" onClick={this.handleNext.bind(this)}>
                        Next
                    </Button>
                    {warningsButton}
                </ButtonGroup>
            </PrimaveraTaskList>
        </StagePanel>
    }
    private handleSelectionChanged(identifier: string, selected: boolean) {
        this.props.onSelectionChanged(this.props.tasks, this.props.relations, identifier, selected)
    }
    private handleFiltersChanged(filters: TaskListFilters) {
        this.props.onFiltersChanged(filters)
    }
    private handleNext(e: React.MouseEvent) {
        this.props.onNextStage(this.props.tasks, this.props.selection, this.props.relations)
    }
    private onPreviousPage() {
        this.props.onPreviousTasksPage()
    }
    private onNextPage() {
        this.props.onNextTasksPage()
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        tasks: state.tasks.tasks,
        displayedTasks: state.delays.taskList.displayedTasks,
        filters: state.delays.taskList.filters,
        relations: state.relations.relations,
        warnings: state.delays.selection.warnings,
        selection: state.delays.selection.selection,
        currentPage: state.delays.taskList.currentPage,
        maxPage: state.delays.taskList.maxPage
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFiltersChanged: (filters: TaskListFilters) => {
            dispatch(updateFilters(filters))
        },
        onPreviousTasksPage: () => {
            dispatch(previousTasksPage())
        },
        onNextTasksPage: () => {
            dispatch(nextTasksPage())
        },
        onSelectionChanged: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>,
                             identifier: string, selected: boolean) => {
            dispatch(defineDelaySelection(tasks, relations, identifier, selected))
        },
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Delays))
        },
        onNextStage: (tasks: Map<string, PrimaveraTask>, delays: Set<string>,
                      relations: Map<string, RelationGraphNode>) => {
            dispatch(defineStage(Stage.Overview))
            dispatch(defineMaxStage(Stage.Overview))
            dispatch(filterForOverview(tasks, delays, relations))
        }
    }
}
