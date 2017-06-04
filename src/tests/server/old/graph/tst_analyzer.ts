import * as chai from "chai"
import {findCyclicDependency} from "../../../../server/old/graph/analyzer"
import {
    taskd1, taskd2, taskRelation1, taskRelation2, taskRelation3, taskRelation6, taskd3, taskd4,
    taskRelation4, taskRelation5
} from "../../../common/old/testdata"
import {GraphError} from "../../../../server/old/graph/error/graph"

describe("Graph analyzer", () => {
    xit("Should analyze a simple graph", () => {
        findCyclicDependency([taskd1, taskd2], [])
    })
    xit("Should analyze a simple graph with relations", () => {
        findCyclicDependency([taskd1, taskd2], [taskRelation1])
    })
    xit("Should not take invalid relations in account", () => {
        findCyclicDependency([taskd1, taskd2], [taskRelation1, taskRelation2, taskRelation3])
    })
    xit("Should detect cyclic dependency", () => {
        chai.expect(() => {
            findCyclicDependency([taskd1, taskd2], [taskRelation1, taskRelation6])
        }).to.throw(GraphError)
    })
    xit("Should not detect diamonds", () => {
        findCyclicDependency([taskd1, taskd2, taskd3, taskd4],
            [taskRelation1, taskRelation2, taskRelation4, taskRelation5])
    })
})
