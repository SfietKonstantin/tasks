import * as chai from "chai"
import {findCyclicDependency} from "../../../server/graph/analyzer"
import {
    taskd1, taskd2, taskRelation1, taskRelation2, taskRelation3, taskRelation6, taskd3, taskd4,
    taskRelation4, taskRelation5
} from "../../common/testdata"
import {GraphError} from "../../../server/graph/error/graph"

describe("Graph analyzer", () => {
    it("Should analyze a simple graph", () => {
        findCyclicDependency([taskd1, taskd2], [])
    })
    it("Should analyze a simple graph with relations", () => {
        findCyclicDependency([taskd1, taskd2], [taskRelation1])
    })
    it("Should not take invalid relations in account", () => {
        findCyclicDependency([taskd1, taskd2], [taskRelation1, taskRelation2, taskRelation3])
    })
    it("Should detect cyclic dependency", () => {
        chai.expect(() => {
            findCyclicDependency([taskd1, taskd2], [taskRelation1, taskRelation6])
        }).to.throw(GraphError)
    })
    it("Should not detect diamonds", () => {
        findCyclicDependency([taskd1, taskd2, taskd3, taskd4],
            [taskRelation1, taskRelation2, taskRelation4, taskRelation5])
    })
})
