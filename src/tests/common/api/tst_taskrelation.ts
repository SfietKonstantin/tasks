import * as chai from "chai"
import {TaskRelationBuilder} from "../../../common/api/taskrelation"
import {TaskRelation} from "../../../common/taskrelation"
import {TaskLocation} from "../../../common/tasklocation"
import {InputError} from "../../../common/errors/input"

describe("API TaskRelationBuilder", () => {
    it("Should create a TaskRelation from a correct input (Beginning)", () => {
        const relation: TaskRelation = {
            previous: "task1",
            previousLocation: TaskLocation.Beginning,
            next: "task2",
            lag: 3
        }
        chai.expect(TaskRelationBuilder.fromObject(relation)).to.deep.equal(relation)
    })
    it("Should create a TaskRelation from a correct input (End)", () => {
        const relation: TaskRelation = {
            previous: "task1",
            previousLocation: TaskLocation.End,
            next: "task2",
            lag: 3
        }
        chai.expect(TaskRelationBuilder.fromObject(relation)).to.deep.equal(relation)
    })
    it("Should not create a relation from an input without previous", () => {
        const relation = {
            previousLocation: TaskLocation.Beginning,
            next: "task2",
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input with a wrong previous type", () => {
        const relation = {
            previous: {test: "test"},
            previousLocation: TaskLocation.Beginning,
            next: "task2",
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input without previousLocation", () => {
        const relation = {
            previous: "task1",
            next: "task2",
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input with a wrong previousLocation type", () => {
        const relation = {
            previous: "task1",
            previousLocation: {test: "test"},
            next: "task2",
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input with an out of range previousLocation", () => {
        const relation = {
            previous: "task1",
            previousLocation: 123,
            next: "task2",
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input without next", () => {
        const relation = {
            previous: "task1",
            previousLocation: TaskLocation.Beginning,
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input with a wrong next type", () => {
        const relation = {
            previous: "task1",
            previousLocation: TaskLocation.Beginning,
            next: {test: "test"},
            lag: 3
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input without lag", () => {
        const relation = {
            previous: "task1",
            previousLocation: TaskLocation.Beginning,
            next: "task2"
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    it("Should not create a relation from an input with a wrong lag type", () => {
        const relation = {
            previous: "task1",
            previousLocation: TaskLocation.Beginning,
            next: "task2",
            lag: {test: "test"}
        }
        chai.expect(() => {
            TaskRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
})

