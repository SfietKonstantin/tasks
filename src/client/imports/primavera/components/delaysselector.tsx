import * as React from "react"
import { Dispatch } from "redux"
import { ListGroupItem, ButtonGroup, Button, Label, Checkbox } from "react-bootstrap"
import { TaskList } from "../../../common/components/tasklist"
import { TaskListFilters, MilestoneFilterMode } from "../../../common/tasklistfilter"
import { State, Stage, PrimaveraTask } from "../types"
import { RelationGraphNode } from "../graph"
import { StagePanel } from "./stagepanel"
import { WarningsButton } from "./warningsbutton"
import { defineStage, defineMaxStage } from "../actions/stages"
import { defineDelayFilters, defineDelaySelection } from "../actions/delays"
import { filterForOverview } from "../actions/overview"
import * as maputils from "../../../../common/maputils"

interface DelaysSelectorProperties {
    stage: Stage
    maxStage: Stage
    tasks: Map<string, PrimaveraTask>
    filteredTasks: Array<PrimaveraTask>
    filters: TaskListFilters
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
    selection: Set<string>
    onFiltersChanged: (tasks: Map<string, PrimaveraTask>, filters: TaskListFilters) => void
    onSelectionChanged: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>,
                         identifier: string, selected: boolean) => void
    onCurrentStage: () => void
    onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>) => void
}

class PrimaveraTaskList extends TaskList<PrimaveraTask> {}

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
            <PrimaveraTaskList tasks={this.props.filteredTasks}
                               createElement={this.createTaskElement.bind(this)}
                               filters={this.props.filters}
                               onFiltersChanged={this.handleFiltersChanged.bind(this)} >
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
    private createTaskElement(task: PrimaveraTask): JSX.Element {
        return <ListGroupItem>
            <Checkbox inline onClick={this.handleSelectionChanged.bind(this, task.identifier)}
                      selected={this.props.selection.has(task.identifier)}>
                {task.name} <span className="text-muted">#{task.identifier}</span>
            </Checkbox>
        </ListGroupItem>
    }
    private handleFiltersChanged(filters: TaskListFilters) {
        this.props.onFiltersChanged(this.props.tasks, filters)
    }
    private handleSelectionChanged(identifier: string, e: React.MouseEvent) {
        const input = e.target as HTMLInputElement
        this.props.onSelectionChanged(this.props.tasks, this.props.relations, identifier, input.checked)
    }
    private handleNext(e: React.MouseEvent) {
        this.props.onNextStage(this.props.tasks, this.props.relations)
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        tasks: state.tasks.tasks,
        filteredTasks: state.delays.tasks,
        filters: state.delays.filters,
        relations: state.relations.relations,
        warnings: state.delays.warnings,
        selection: state.delays.selection
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFiltersChanged: (tasks: Map<string, PrimaveraTask>, filters: TaskListFilters) => {
            dispatch(defineDelayFilters(tasks, filters))
        },
        onSelectionChanged: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>,
                             identifier: string, selected: boolean) => {
            dispatch(defineDelaySelection(tasks, relations, identifier, selected))
        },
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Delays))
        },
        onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>) => {
            dispatch(defineStage(Stage.Overview))
            dispatch(defineMaxStage(Stage.Overview))
            dispatch(filterForOverview(tasks, relations))
        }
    }
}
