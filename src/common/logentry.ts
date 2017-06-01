import {Task, TaskState} from "./task"
import {Sprint, SprintState} from "./sprint"

enum LogEvent {
    TaskCreated,
    TaskRemoved,
    TaskAddedInSprint,
    TaskRemovedFromSprint,
    TaskStateChanged,
    SprintStateChanged
}

export interface LogEntry {
    event: LogEvent
    task?: Task
    sprint?: Sprint
    taskOldState: TaskState
    taskNewState: TaskState
    sprintOldState: SprintState
    sprintNewState: SprintState
}
