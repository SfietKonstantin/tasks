import * as React from "react"
import { ButtonToolbar, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap"
import { MilestoneFilterMode, TaskListFilters } from "../tasklistfilters"
import { assign } from "../../common/assign"

interface TaskListFilterToolbarProperties {
    filters: TaskListFilters
    onFiltersChanged: (filter: TaskListFilters) => void
}

export class TaskListFiltersToolbar extends React.Component<TaskListFilterToolbarProperties, {}> {
    render() {
        const milestoneTitle = TaskListFiltersToolbar.getMilestoneFilterTitle(this.props.filters)
        return <ButtonToolbar className="common-filters-toolbar">
            <ButtonGroup>
                <DropdownButton id="tasks-filter" title={milestoneTitle}>
                    <MenuItem eventKey="noFilter"
                            active={this.props.filters.milestoneFilterMode === MilestoneFilterMode.NoFilter}
                            onSelect={this.handleNoFilter.bind(this)}>Tasks and milestones</MenuItem>
                    <MenuItem eventKey="tasksOnly"
                            active={this.props.filters.milestoneFilterMode === MilestoneFilterMode.TasksOnly}
                            onSelect={this.handleTasksOnly.bind(this)}>Tasks only</MenuItem>
                    <MenuItem eventKey="milestonesOnly"
                            active={this.props.filters.milestoneFilterMode === MilestoneFilterMode.MilestonesOnly}
                            onSelect={this.handleMilestonesOnly.bind(this)}>Milestones only</MenuItem>
                </DropdownButton>
            </ButtonGroup>
        </ButtonToolbar>
    }
    private static getMilestoneFilterTitle(filter: TaskListFilters): string {
        switch (filter.milestoneFilterMode) {
            case MilestoneFilterMode.TasksOnly:
                return "Tasks only"
            case MilestoneFilterMode.MilestonesOnly:
                return "Milestones only"
            default:
                return "Tasks and milestones"
        }
    }
    private handleNoFilter(e: React.SyntheticEvent) {
        this.props.onFiltersChanged(assign(this.props.filters, {
            milestoneFilterMode: MilestoneFilterMode.NoFilter
        }))
    }
    private handleTasksOnly(e: React.SyntheticEvent) {
        this.props.onFiltersChanged(assign(this.props.filters, {
            milestoneFilterMode: MilestoneFilterMode.TasksOnly
        }))
    }
    private handleMilestonesOnly(e: React.SyntheticEvent) {
        this.props.onFiltersChanged(assign(this.props.filters, {
            milestoneFilterMode: MilestoneFilterMode.MilestonesOnly
        }))
    }
}
