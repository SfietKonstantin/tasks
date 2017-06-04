import * as chai from "chai"
import {DelayNode} from "../../../../../server/old/graph/impl/delaynode"
import {MockProjectNode} from "../mockprojectnode"
import {
    project1,
    delayd1,
    taskd1,
    taskd2,
    delayRelation1,
    delayRelation2,
    modifier1,
    modifier2
} from "../../../../common/old/testdata"
import {MockGraph} from "../mockgraph"
import {MockTaskNode} from "../mocktasknode"
import {addDays, diffDates} from "../../../../../common/old/utils/date"

describe("Graph delay node", () => {
    xit("Should compute initial margin and current margin without impacted end date and lag", () => {
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const task1Node = new MockTaskNode(projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)

        const node = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.tasks = [task1Node]
        node.relations.set(taskd1.identifier, delayRelation1)

        node.compute()

        const diff = diffDates(addDays(taskd1.estimatedStartDate, taskd1.estimatedDuration), delayd1.date)
        chai.expect(node.initialMargin).to.equal(diff)
        chai.expect(node.margin).to.equal(diff)
    })
    xit("Should compute initial margin and current margin with lag", () => {
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const task2Node = new MockTaskNode(projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)

        const node = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.tasks = [task2Node]
        node.relations.set(taskd2.identifier, delayRelation2)

        node.compute()

        const diff = diffDates(addDays(taskd2.estimatedStartDate, taskd2.estimatedDuration), delayd1.date)
            - delayRelation2.lag
        chai.expect(node.initialMargin).to.equal(diff)
        chai.expect(node.margin).to.equal(diff)
    })
    xit("Should compute initial margin and current margin with impacted end date", () => {
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const task1Node = new MockTaskNode(projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        task1Node.startDate = addDays(task1Node.startDate, modifier1.duration)
        task1Node.duration = task1Node.duration + modifier2.duration

        const node = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.tasks = [task1Node]
        node.relations.set(taskd1.identifier, delayRelation1)

        node.compute()

        const diff = diffDates(addDays(taskd1.estimatedStartDate, taskd1.estimatedDuration), delayd1.date)
        const diffWithModifier = diff - modifier1.duration - modifier2.duration
        chai.expect(node.initialMargin).to.equal(diff)
        chai.expect(node.margin).to.equal(diffWithModifier)
    })
    xit("Should compute initial margin and current margin with multiple tasks", () => {
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const task1Node = new MockTaskNode(projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        task1Node.startDate = addDays(task1Node.startDate, modifier1.duration)
        task1Node.duration = task1Node.duration + modifier2.duration
        const task2Node = new MockTaskNode(projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)

        const node = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.tasks = [task1Node, task2Node]
        node.relations.set(taskd1.identifier, delayRelation1)
        node.relations.set(taskd2.identifier, delayRelation2)

        node.compute()

        const diff = diffDates(addDays(taskd2.estimatedStartDate, taskd2.estimatedDuration), delayd1.date)
            - delayRelation2.lag
        chai.expect(node.initialMargin).to.equal(diff)
        chai.expect(node.margin).to.equal(diff)
    })
})
