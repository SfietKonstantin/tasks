import * as React from "react"
import {Grid, GridColumn, Menu, MenuItem, SegmentGroup, Segment} from "semantic-ui-react"
import {FilterCriterionDefinition, FilterCriterion} from "../model/filter"


interface TaskListProperties<T> {
    entries: Array<T>
    filterCriterionDefinitions: Array<FilterCriterionDefinition<T>>
    renderFilterCriterion: (index: number, filterCriterionDefintion: FilterCriterionDefinition<T>) => JSX.Element
    renderItem: (item: T) => JSX.Element
}

interface TaskListState<T> {
    filteredEntries: Array<T>
    filterCriteria: Array<FilterCriterion<T>>
    currentPage: number
    displayedEntries: Array<T>
}

export class TaskList<T> extends React.Component<TaskListProperties<T>, TaskListState<T>> {
    constructor(props: TaskListProperties<T>) {
        super(props)
        this.state = {
            filteredEntries: [],
            filterCriteria: [],
            currentPage: 0,
            displayedEntries: []
        }
    }

    render() {
        const filters = this.props.filterCriterionDefinitions.map((criterion: FilterCriterionDefinition<T>,
                                                                   index: number) => {
            return this.props.renderFilterCriterion(index, criterion)
        })

        const entries = this.state.filteredEntries.map((entry: T) => {
            return this.props.renderItem(entry)
        })

        return <Grid stackable className="container">
            <GridColumn width={4}>
                <Menu vertical fluid>
                    {filters}
                </Menu>
            </GridColumn>
            <GridColumn width={12}>
                <SegmentGroup>
                    <Segment secondary>

                    </Segment>
                    {entries}
                    <Segment secondary>
                        <Menu pagination>
                            <MenuItem>1</MenuItem>
                        </Menu>
                    </Segment>
                </SegmentGroup>
            </GridColumn>
        </Grid>
    }
}
