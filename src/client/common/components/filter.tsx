import * as React from "react"
import {
    MenuItem, Checkbox, Icon
} from "semantic-ui-react"
import {
    FilterCriterionDefinition, FilterCriterionDefinitionVisitor,
    SearchFilterCriterionDefinition, SingleSelectionFilterCriterionDefinition, MultiSelectionFilterCriterionDefinition
} from "../model/filter"

const renderSearch = <T extends {}>(index: number, criterion: SearchFilterCriterionDefinition<T>): JSX.Element => {
    return <MenuItem key={index}>
        <div className="ui icon input">
            <input placeholder={criterion.label} type="text"/>
            <Icon name={criterion.icon} color={criterion.color}/>
        </div>
    </MenuItem>
}

const renderSelection = <T extends {}>(index: number, criterion: FilterCriterionDefinition<T>,
                                       selection: Array<string>, radio: boolean): JSX.Element => {
    const items = selection.map((label: string, index: number) => {
        return <MenuItem key={index}>
            <Checkbox radio={radio} label={label}/>
        </MenuItem>
    })
    return <MenuItem key={index}>
        {criterion.label}
        <Icon name={criterion.icon} color={criterion.color}/>
        <div className="menu">
            {items}
        </div>
    </MenuItem>
}

export const renderFilterCriterion = <T extends {}>(index: number,
                                                    filterCriterion: FilterCriterionDefinition<T>): JSX.Element => {
    class RenderVisitor implements FilterCriterionDefinitionVisitor<T, JSX.Element> {
        acceptSearch(criterion: SearchFilterCriterionDefinition<T>): JSX.Element {
            return renderSearch(index, criterion)
        }

        acceptSingleSelection(criterion: SingleSelectionFilterCriterionDefinition<T>): JSX.Element {
            return renderSelection(index, criterion, criterion.selection, true)
        }

        acceptMultiSelection(criterion: MultiSelectionFilterCriterionDefinition<T>): JSX.Element {
            return renderSelection(index, criterion, criterion.selection, false)
        }
    }
    return filterCriterion.visit(new RenderVisitor())
}
