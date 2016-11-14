import * as ReactRedux from "react-redux"
import * as projectEditor from "./components/projecteditor"
import * as tasksSelector from "./components/tasksselector"
import * as relationsSelector from "./components/relationsselector"
import * as delaysselector from "./components/delaysselector"
import * as overview from "./components/overview"
import * as main from "./components/main"

const projectEditorConnection = ReactRedux.connect(projectEditor.mapStateToProps,
                                                   projectEditor.mapDispatchToProps)
export const ProjectEditor = projectEditorConnection(projectEditor.ProjectEditor)

const tasksSelectorConnection = ReactRedux.connect(tasksSelector.mapStateToProps,
                                                   tasksSelector.mapDispatchToProps)
export const TasksSelector = tasksSelectorConnection(tasksSelector.TasksSelector)

const relationsSelectorConnection = ReactRedux.connect(relationsSelector.mapStateToProps,
                                                       relationsSelector.mapDispatchToProps)
export const RelationsSelector = relationsSelectorConnection(relationsSelector.RelationsSelector)

const delaysSelectorConnection = ReactRedux.connect(delaysselector.mapStateToProps,
                                                    delaysselector.mapDispatchToProps)
export const DelaysSelector = delaysSelectorConnection(delaysselector.DelaysSelector)

const overviewConnection = ReactRedux.connect(overview.mapStateToProps,
                                              overview.mapDispatchToProps)
export const Overview = overviewConnection(overview.Overview)
