import * as React from "react"
import * as ReactDOM from "react-dom"
import { Row, Col, ListGroup, FormGroup, FormControl } from "react-bootstrap"

interface ItemListProperties<T> {
    items: Array<T>
    createElement: (item: T) => JSX.Element
    onTextFilter: (text: string) => void
}

interface ItemListState {
    filter: string
}

export class ItemList<T> extends React.Component<ItemListProperties<T>, ItemListState> {
    constructor(props: ItemListProperties<T>) {
        super(props)
        this.state = {
            filter: ""
        }
    }
    render() {
        const content: Array<JSX.Element> = this.props.items.map((item) => {
            return this.props.createElement(item)
        })
        return <div className="tab-table">
            <Row>
                <Col xs={12} sm={6}>
                    <form action="#" onSubmit={this.handleTextSubmit.bind(this)}>
                        <FormGroup>
                            <FormControl type="text" ref="filter" placeholder="Search"
                                         onInput={this.handleTextChange.bind(this)}
                                         onBlur={this.handleBlur.bind(this)} />
                        </FormGroup>
                    </form>
                </Col>
            </Row>
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.children}
                </div>
                <ListGroup fill hover>
                    {content}
                </ListGroup>
            </div>
        </div>
    }
    private handleTextChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.state.filter = input.value
    }
    private handleBlur(e: React.FocusEvent) {
        this.props.onTextFilter(this.state.filter)
    }
    private handleTextSubmit(e: React.FormEvent) {
        this.props.onTextFilter(this.state.filter)
    }
}
