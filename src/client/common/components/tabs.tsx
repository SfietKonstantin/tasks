import * as React from "react"
import {makeActiveClassName} from "../utils/active"

interface TabBarProperties {
    tabs: Array<string>
    onTabChanged: (index: number) => void
}

interface TabBarState {
    currentTab: number
}

export class TabBar extends React.Component<TabBarProperties, TabBarState> {
    constructor(props: TabBarProperties) {
        super(props)
        this.state = {
            currentTab: 0
        }
    }

    render() {
        let tabs = this.props.tabs.map((tab: string, index: number) => {
            const className = makeActiveClassName("item", index === this.state.currentTab)
            return <a className={className} key={index} onClick={this.handleClick.bind(this, index)}>
                {tab}
            </a>
        })
        return <div className="ui top attached tabular menu page-header-tabs">
            {tabs}
        </div>
    }

    componentDidMount() {
        this.props.onTabChanged(this.state.currentTab)
    }

    private handleClick(index: number) {
        this.props.onTabChanged(index)
        this.setState({currentTab: index})
    }
}
