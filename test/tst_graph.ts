import * as chai from "chai"
import { Task } from "../core/types"
import { TaskNode } from "../core/graph/graph"

describe("Graph", () => {
    describe("Simple compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode()
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode()
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node0.addChild(node1)

            node0.recompute()

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
    })
    describe("Dependencies compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode()
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode()
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node0.addChild(node1)

            let node2 = new TaskNode()
            node2.estimatedStartDate = new Date(2015, 9, 16)
            node2.estimatedDuration = 30
            node0.addChild(node2)

            let node3 = new TaskNode()
            node3.estimatedStartDate = new Date(2015, 10, 15)
            node3.estimatedDuration = 15
            node1.addChild(node3)
            node2.addChild(node3)

            node0.recompute()

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node1.duration).to.equals(15)
            chai.expect(node2.startDate.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node2.duration).to.equals(30)
            chai.expect(node3.startDate.getTime()).to.equals(new Date(2015, 10, 15).getTime())
            chai.expect(node3.duration).to.equals(15)
        })
    })
})
