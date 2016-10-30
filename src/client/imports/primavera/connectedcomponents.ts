import * as projectEditor from "./components/projecteditor"
import * as tasksSelector from "./components/tasksselector"
import * as relationsSelector from "./components/relationsselector"

const projectEditorConnection = ReactRedux.connect(projectEditor.mapStateToProps,
                                                   projectEditor.mapDispatchToProps)
export const ProjectEditor = projectEditorConnection(projectEditor.ProjectEditor)

const tasksSelectorConnection = ReactRedux.connect(tasksSelector.mapStateToProps,
                                                   tasksSelector.mapDispatchToProps)
export const TasksSelector = tasksSelectorConnection(tasksSelector.TasksSelector)

const relationsSelectorConnection = ReactRedux.connect(relationsSelector.mapStateToProps,
                                                       relationsSelector.mapDispatchToProps)
export const RelationsSelector = relationsSelectorConnection(relationsSelector.RelationsSelector)
