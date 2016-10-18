import { TaskNode } from "./types"
import { Delay } from "../../../common/types"
import * as maputils from "../../../common/maputils"
import { NotComputed, buildGraphIndex } from "./graph"
import { IDataProvider } from "../data/idataprovider"
import * as dateutils from "../../../common/dateutils"

export enum ImpactInfoType {
    Warning,
    Error
}

export interface ImpactInfo {
    type: ImpactInfoType
    taskIdentifier: string
    delayIdentifier: string
    oldMargin: number
    newMargin: number
}

const compareImpactInfo = (first: ImpactInfo, second: ImpactInfo): number => {
    if (first.type === ImpactInfoType.Warning && second.type === ImpactInfoType.Error) {
        return 1
    } else if (first.type === ImpactInfoType.Error && second.type === ImpactInfoType.Warning) {
        return -1
    }

    if (first.taskIdentifier !== second.taskIdentifier) {
        return first.taskIdentifier < second.taskIdentifier ? -1 : 1
    }

    if (first.newMargin !== second.newMargin) {
        return first.newMargin - second.newMargin
    }

    return 0
}

export const getImpactInfo = (projectIdentifier: string, root: TaskNode,
                              dataProvider: IDataProvider): Promise<Array<ImpactInfo>> => {
    let map = new Map<string, TaskNode>()
    buildGraphIndex(root, map)

    // Load delays
    let delayMaps = new Map<string, Array<Delay>>()
    return Promise.all(Array.from(map.keys(), (taskIdentifier: string) => {
        return dataProvider.getTaskDelayIds(projectIdentifier, taskIdentifier)
                           .then((delayIdentifiers: Array<string>) => {
            return dataProvider.getDelays(projectIdentifier, delayIdentifiers)
        }).then((delays: Array<Delay>) => {
            delayMaps.set(taskIdentifier, delays)
        })
    })).then(() => {
        // Compute impact infos
        let returned = new Array<ImpactInfo>()
        Array.from(map.values(), (node: TaskNode) => {
            if (node.startDate == null || node.duration == null) {
                throw new NotComputed(node)
            }
            const estimatedEndDate = dateutils.addDays(node.estimatedStartDate, node.estimatedDuration)
            const endDate = dateutils.addDays(node.startDate, node.duration)

            Array.from(maputils.get(delayMaps, node.taskIdentifier), (delay: Delay) => {
                const oldMargin = dateutils.getDateDiff(estimatedEndDate, delay.date)
                const newMargin = dateutils.getDateDiff(endDate, delay.date)

                if (delay.date < endDate) {
                    returned.push({
                        type: ImpactInfoType.Error,
                        taskIdentifier: node.taskIdentifier,
                        delayIdentifier: delay.identifier,
                        oldMargin: oldMargin,
                        newMargin: newMargin,
                    })
                } else if (endDate > estimatedEndDate) {
                    returned.push({
                        type: ImpactInfoType.Warning,
                        taskIdentifier: node.taskIdentifier,
                        delayIdentifier: delay.identifier,
                        oldMargin: oldMargin,
                        newMargin: newMargin,
                    })
                }
            })
        })

        return returned.sort(compareImpactInfo)
    })
}
