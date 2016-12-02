import * as ReactRedux from "react-redux"
import * as main from "./components/main"

const mainConnection = ReactRedux.connect(main.mapStateToProps, main.mapDispatchToProps)
export const Main = mainConnection(main.Main)
