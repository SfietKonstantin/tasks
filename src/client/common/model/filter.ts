export type Colors = "red" | "orange" | "yellow" | "olive" | "green" | "teal" | "blue" | "violet" | "purple"
    | "pink" | "brown" | "grey" | "black"

export interface FilterCriterionDefinition<T> {
    label: string
    icon: string
    color: Colors
    filter(item: T): boolean
    visit<R>(visitor: FilterCriterionDefinitionVisitor<T, R>): R
}

export interface FilterCriterionDefinitionVisitor<T, R> {
    acceptSearch(criterion: SearchFilterCriterionDefinition<T>): R
    acceptSingleSelection(criterion: SingleSelectionFilterCriterionDefinition<T>): R
    acceptMultiSelection(criterion: MultiSelectionFilterCriterionDefinition<T>): R
}

export abstract class SearchFilterCriterionDefinition<T> implements FilterCriterionDefinition<T> {
    label: string
    icon: string
    color: Colors

    abstract filter(item: T): boolean

    visit<R>(visitor: FilterCriterionDefinitionVisitor<T, R>): R {
        return visitor.acceptSearch(this)
    }

    protected constructor(label: string, icon: string, color: Colors) {
        this.label = label
        this.icon = icon
        this.color = color
    }
}

export abstract class SingleSelectionFilterCriterionDefinition<T> implements FilterCriterionDefinition<T> {
    label: string
    icon: string
    color: Colors
    selection: Array<string>

    abstract filter(item: T): boolean

    visit<R>(visitor: FilterCriterionDefinitionVisitor<T, R>): R {
        return visitor.acceptSingleSelection(this)
    }

    protected constructor(label: string, icon: string, color: Colors, selection: Array<string>) {
        this.label = label
        this.icon = icon
        this.color = color
        this.selection = selection
    }
}

export abstract class MultiSelectionFilterCriterionDefinition<T> implements FilterCriterionDefinition<T> {
    label: string
    icon: string
    color: Colors
    selection: Array<string>

    abstract filter(item: T): boolean

    visit<R>(visitor: FilterCriterionDefinitionVisitor<T, R>): R {
        return visitor.acceptMultiSelection(this)
    }

    protected constructor(label: string, icon: string, color: Colors, selection: Array<string>) {
        this.label = label
        this.icon = icon
        this.color = color
        this.selection = selection
    }
}

export interface FilterCriterion<T> {
    definition: FilterCriterionDefinition<T>
    visit<R>(visitor: FilterCriterionVisitor<T, R>): R
}

export interface FilterCriterionVisitor<T, R> {
    acceptSearch(criterion: SearchFilterCriterion<T>): R
    acceptSingleSelection(criterion: SingleSelectionFilterCriterion<T>): R
    acceptMultiSelection(criterion: MultiSelectionFilterCriterion<T>): R
}

export class SearchFilterCriterion<T> implements FilterCriterion<T> {
    definition: SearchFilterCriterionDefinition<T>
    text: string

    constructor(definition: SearchFilterCriterionDefinition<T>, text: string) {
        this.definition = definition
        this.text = text
    }

    visit<R>(visitor: FilterCriterionVisitor<T, R>): R {
        return visitor.acceptSearch(this)
    }
}

export class SingleSelectionFilterCriterion<T> implements FilterCriterion<T> {
    definition: SingleSelectionFilterCriterionDefinition<T>
    selection: number

    constructor(definition: SingleSelectionFilterCriterionDefinition<T>, selection: number) {
        this.definition = definition
        this.selection = selection
    }

    visit<R>(visitor: FilterCriterionVisitor<T, R>): R {
        return visitor.acceptSingleSelection(this)
    }
}

export class MultiSelectionFilterCriterion<T> implements FilterCriterion<T> {
    definition: MultiSelectionFilterCriterionDefinition<T>
    selection: Array<number>

    constructor(definition: MultiSelectionFilterCriterionDefinition<T>, selection: Array<number>) {
        this.definition = definition
        this.selection = selection
    }

    visit<R>(visitor: FilterCriterionVisitor<T, R>): R {
        return visitor.acceptMultiSelection(this)
    }
}

export class FilterModel<T> {
    readonly criterionDefinitions: Array<FilterCriterionDefinition<T>>
    constructor(criterionDefinitions: Array<FilterCriterionDefinition<T>>) {
        this.criterionDefinitions = criterionDefinitions
    }
}
