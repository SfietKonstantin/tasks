import * as React from "react"
import { DropdownButton, MenuItem } from "react-bootstrap"

interface FilterButtonProperties {
    milestonesOnly: boolean
    onToggleMilestonesOnly: () => void
}

export class FilterButton extends React.Component<FilterButtonProperties, {}> {
    render() {
        return <div className="project-all-tasks-filter">
            <DropdownButton id="tasks-filter" title="Filters" bsStyle="link" >
                <MenuItem eventKey="milestonesOnly" active={this.props.milestonesOnly}
                          onSelect={this.handleToggleMilestonesOnly.bind(this)}>Milestones only</MenuItem>
            </DropdownButton>
        </div>
    }
    private handleToggleMilestonesOnly(e: React.SyntheticEvent) {
        this.props.onToggleMilestonesOnly()
    }
}
