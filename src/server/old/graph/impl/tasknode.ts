import * as winston from "winston"
import {ITaskNode} from "../itasknode"
import {ITaskNodeImpl} from "./itasknode"
import {IProjectNode} from "../iprojectnode"
import {IDelayNode} from "../idelaynode"
import {Modifier} from "../../../../common/old/modifier"
import {IDaoBuilder} from "../../dao/ibuilder"
import {TaskRelation} from "../../../../common/old/taskrelation"
import {DelayRelation} from "../../../../common/old/delayrelation"
import {GraphError} from "../error/graph"
import {TaskLocation} from "../../../../common/old/tasklocation"
import {get as mapGet} from "../../../../common/utils/map"
import {addDays} from "../../../../common/old/utils/date"
import {IModifierDao} from "../../dao/imodifier"
import {IDelayNodeImpl} from "./idelaynode"

export class TaskNode implements ITaskNodeImpl {
    readonly project: IProjectNode
    readonly taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    delays: Array<IDelayNode>
    modifiers: Array<Modifier>
    readonly estimatedStartDate: Date
    readonly estimatedDuration: number
    childrenRelations: Map<string, TaskRelation>
    parentsRelations: Map<string, TaskRelation>
    private readonly modifierDao: IModifierDao

    constructor(daoBuilder: IDaoBuilder,
                project: IProjectNode, taskIdentifier: string,
                estimatedStartDate: Date, estimatedDuration: number) {
        this.modifierDao = daoBuilder.buildModifierDao()
        this.project = project
        this.taskIdentifier = taskIdentifier
        this.estimatedStartDate = new Date(estimatedStartDate.getTime())
        this.estimatedDuration = estimatedDuration
        this.startDate = new Date(estimatedStartDate.getTime())
        this.duration = estimatedDuration
        this.children = []
        this.parents = []
        this.delays = []
        this.modifiers = []
        this.childrenRelations = new Map<string, TaskRelation>()
        this.parentsRelations = new Map<string, TaskRelation>()
    }

    compute(): Promise<void> {
        return this.markAndCompute(new Set<ITaskNode>())
    }

    addModifier(modifier: Modifier): Promise<Modifier> {
        const projectIdentifier = this.project.projectIdentifier
        return this.modifierDao.addModifier(projectIdentifier, modifier).then((id: number) => {
            return this.modifierDao.addModifierForTask(projectIdentifier, id, this.taskIdentifier)
        }).then(() => {
            this.modifiers.push(modifier)
            return this.compute()
        }).then(() => {
            return modifier
        })
    }

    addChild(node: ITaskNodeImpl, relation: TaskRelation): Promise<void> {
        this.children.push(node)
        this.childrenRelations.set(node.taskIdentifier, relation)
        node.parents.push(this)
        node.parentsRelations.set(this.taskIdentifier, relation)
        return this.computeChildren(new Set<ITaskNode>())
    }

    addDelay(node: IDelayNodeImpl, relation: DelayRelation) {
        this.delays.push(node)
        node.relations.set(this.taskIdentifier, relation)
        node.tasks.push(this)
        return this.computeDelays()
    }

    getEndDate(): Date {
        return addDays(this.startDate, this.duration)
    }

    markAndCompute(markedNodes: Set<ITaskNode>) {
        return Promise.resolve().then(() => {
            if (markedNodes.has(this)) {
                const markedTasks = Array.from(markedNodes, (node: ITaskNode) => {
                    return `"${node.taskIdentifier}"`
                }).join(", ")
                throw new GraphError(`Cyclic dependency found involving task ${markedTasks}`)
            }
            markedNodes.add(this)
            const currentEndDate = this.getEndDate()

            // Compute duration
            const beginningDurations = this.modifiers.map((modifier: Modifier) => {
                return modifier.location === TaskLocation.Beginning ? modifier.duration : 0
            })
            const beginningSum = beginningDurations.reduce((first: number, second: number) => {
                return first + second
            }, 0)

            const endDurations = this.modifiers.map((modifier: Modifier) => {
                return modifier.location === TaskLocation.End ? modifier.duration : 0
            })
            const endSum = endDurations.reduce((first: number, second: number) => {
                return first + second
            }, 0)

            this.duration = this.estimatedDuration + Math.max(endSum, 0)

            // Compute start date
            let parentEndDates = this.parents.map((node: ITaskNode) => {
                const relation = mapGet(this.parentsRelations, node.taskIdentifier)
                if (relation.previousLocation === TaskLocation.Beginning) {
                    return addDays(node.startDate, relation.lag)
                } else {
                    return addDays((node as ITaskNodeImpl).getEndDate(), relation.lag)
                }
            })
            parentEndDates.push(this.estimatedStartDate)
            parentEndDates = parentEndDates.filter((value: Date) => {
                return !Number.isNaN(value.getTime())
            })
            const parentEndDatesLog = parentEndDates.join(", ")
            winston.info(`Task "${this.taskIdentifier}" uses parent end dates: [${parentEndDatesLog}]`)

            if (parentEndDates.length === 0) {
                throw new GraphError(`Task "${this.taskIdentifier}" contains invalid parent dates`)
            }
            this.startDate = addDays(new Date(Math.max.apply(null, parentEndDates)),
                Math.max(beginningSum, 0))

            // Take milestones in account
            if (this.estimatedDuration === 0) {
                this.startDate = addDays(this.startDate, this.duration)
                this.duration = 0
            }
            const newEndDate = this.getEndDate()
            winston.info(`Task "${this.taskIdentifier}" computed end date: ${newEndDate}`)

            // No need to save / compute children if nothing changed
            return newEndDate.getTime() !== currentEndDate.getTime()
        }).then((shouldCompute: boolean) => {
            if (!shouldCompute) {
                return
            }

            // Try computing children first
            return this.computeChildren(markedNodes).then(() => {
                // Then compute delays
                this.computeDelays()
            })
        }).then(() => {
            markedNodes.delete(this)
        })
    }

    private computeChildren(markedNodes: Set<ITaskNode>): Promise<void> {
        return Promise.all(this.children.map((child: ITaskNode) => {
            return (child as ITaskNodeImpl).markAndCompute(new Set<ITaskNode>(markedNodes))
        })).then(() => {})
    }

    private computeDelays() {
        this.delays.forEach((delay: IDelayNode) => {
            (delay as IDelayNodeImpl).compute()
        })
    }
}
