import * as chai from "chai"
import { Task } from "../core/types"
import { TaskNode } from "../core/graph/graph"

describe("Graph", () => {
    describe("Simple compute test", () => {
        it("Should compute the correct start time", () => {
            let task0 = new Task(0, 0)
            task0.estimatedStartDate = new Date(2015, 9, 1)
            task0.estimatedDuration = 15
            let node0 = new TaskNode(task0)

            let task1 = new Task(1, 0)
            task1.estimatedStartDate = new Date(2015, 9, 16)
            task1.estimatedDuration = 15
            let node1 = new TaskNode(task1)
            node0.addChild(node1)

            node0.recompute()

            chai.expect(node0.start_date.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.start_date.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
    })
    describe("Dependencies compute test", () => {
        it("Should compute the correct start time", () => {
            let task0 = new Task(0, 0)
            task0.estimatedStartDate = new Date(2015, 9, 1)
            task0.estimatedDuration = 15
            let node0 = new TaskNode(task0)

            let task1 = new Task(1, 0)
            task1.estimatedStartDate = new Date(2015, 9, 16)
            task1.estimatedDuration = 15
            let node1 = new TaskNode(task1)
            node0.addChild(node1)

            let task2 = new Task(2, 0)
            task2.estimatedStartDate = new Date(2015, 9, 16)
            task2.estimatedDuration = 30
            let node2 = new TaskNode(task2)
            node0.addChild(node2)

            let task3 = new Task(3, 0)
            task3.estimatedStartDate = new Date(2015, 10, 15)
            task3.estimatedDuration = 15
            let node3 = new TaskNode(task3)
            node1.addChild(node3)
            node2.addChild(node3)

            node0.recompute()

            chai.expect(node0.start_date.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.start_date.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node1.duration).to.equals(15)
            chai.expect(node2.start_date.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node2.duration).to.equals(30)
            chai.expect(node3.start_date.getTime()).to.equals(new Date(2015, 10, 15).getTime())
            chai.expect(node3.duration).to.equals(15)
        })
    })
})
