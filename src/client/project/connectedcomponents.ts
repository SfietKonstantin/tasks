import * as ReactRedux from "react-redux"
import * as taskbrowser from "./components/taskbrowser"

const taskBrowserConnection = ReactRedux.connect(taskbrowser.mapStateToProps,
                                                 taskbrowser.mapDispatchToProps)
export const TaskBrowser = taskBrowserConnection(taskbrowser.TaskBrowser)
