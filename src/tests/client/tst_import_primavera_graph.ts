import * as chai from "chai"
import { RelationGraph, GraphDiff } from "../../client/imports/primavera/graph"
import { PrimaveraTask, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import { expectMapEqual } from "./expectutils"

describe("Primavera graph", () => {
    describe("Create selection diff", () => {
        it("Should create a simple selection diff 1", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task11", {
                identifier: "task11",
                name: "Task 1-1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task12", {
                identifier: "task12",
                name: "Task 1-2",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task13", {
                identifier: "task13",
                name: "Task 1-3",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone", {
                identifier: "milestone",
                name: "Milestone",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task21", {
                identifier: "task21",
                name: "Task 2-1",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            tasks.set("task22", {
                identifier: "task21",
                name: "Task 2-2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task11",
                next: "milestone",
                type: "FS",
                lag: 1
            })
            graph.addRelation({
                previous: "task12",
                next: "milestone",
                type: "FF",
                lag: 2
            })
            graph.addRelation({
                previous: "task13",
                next: "milestone",
                type: "SS",
                lag: 3
            })
            graph.addRelation({
                previous: "milestone",
                next: "task21",
                type: "FS",
                lag: 10
            })
            graph.addRelation({
                previous: "milestone",
                next: "task22",
                type: "SS",
                lag: 20
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [
                        {
                            previous: "task11",
                            next: "task21",
                            type: "FS",
                            lag: 11
                        },
                        {
                            previous: "task11",
                            next: "task22",
                            type: "FS",
                            lag: 21
                        },
                        {
                            previous: "task12",
                            next: "task21",
                            type: "FS",
                            lag: 12
                        },
                        {
                            previous: "task12",
                            next: "task22",
                            type: "FS",
                            lag: 22
                        },
                        {
                            previous: "task13",
                            next: "task21",
                            type: "SS",
                            lag: 13
                        },
                        {
                            previous: "task13",
                            next: "task22",
                            type: "SS",
                            lag: 23
                        }
                    ],
                    removed: [
                        [ "task11", "milestone" ],
                        [ "task12", "milestone" ],
                        [ "task13", "milestone" ],
                        [ "milestone", "task21" ],
                        [ "milestone", "task22" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["milestone"]), tasks)
            chai.expect(results.warnings.size).to.equal(0)
            chai.expect(results.diffs).deep.equal(expected)
        })
        it("Should create a simple selection diff 2", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task11", {
                identifier: "task11",
                name: "Task 1-1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("delay", {
                identifier: "delay",
                name: "Task delay",
                duration: 10,
                startDate: new Date(2016, 8, 6),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task21", {
                identifier: "task21",
                name: "Task 2-1",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            tasks.set("task22", {
                identifier: "task21",
                name: "Task 2-2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task11",
                next: "delay",
                type: "FF",
                lag: 1
            })
            graph.addRelation({
                previous: "delay",
                next: "task21",
                type: "FS",
                lag: 10
            })
            graph.addRelation({
                previous: "delay",
                next: "task22",
                type: "SS",
                lag: 20
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [
                        {
                            previous: "task11",
                            next: "task21",
                            type: "FS",
                            lag: 11
                        },
                        {
                            previous: "task11",
                            next: "task22",
                            type: "FS",
                            lag: 21
                        }
                    ],
                    removed: [
                        [ "task11", "delay" ],
                        [ "delay", "task21" ],
                        [ "delay", "task22" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["delay"]), tasks)
            chai.expect(results.warnings.size).to.equal(0)
            chai.expect(results.diffs).deep.equal(expected)
        })
        it("Should not create relations between delays", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone1", {
                identifier: "milestone1",
                name: "Milestone 1",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone2", {
                identifier: "milestone2",
                name: "Milestone 2",
                duration: 0,
                startDate: new Date(2016, 8, 16),
                endDate: null
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task1",
                next: "milestone1",
                type: "FS",
                lag: 0
            })
            graph.addRelation({
                previous: "milestone1",
                next: "milestone2",
                type: "FF",
                lag: 3
            })
            graph.addRelation({
                previous: "milestone2",
                next: "task2",
                type: "FS",
                lag: 0
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        [ "task1", "milestone1" ],
                        [ "milestone1", "milestone2" ]
                    ]
                },
                {
                    added: [],
                    removed: [
                        [ "milestone1", "milestone2" ],
                        [ "milestone2", "task2" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["milestone1", "milestone2"]), tasks)
            chai.expect(results.warnings.size).to.equal(2)
            chai.expect(results.diffs).deep.equal(expected)
        })
        it("Should not create delay for invalid selection", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone", {
                identifier: "milestone",
                name: "Milestone",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task1",
                next: "milestone",
                type: "FS",
                lag: 0
            })
            graph.addRelation({
                previous: "milestone",
                next: "task2",
                type: "FS",
                lag: 0
            })
            const results = graph.createSelectionDiff(new Set<string>(["milestone1", "milestone2"]), tasks)
            chai.expect(results.warnings.size).to.equal(0)
            chai.expect(results.diffs).to.empty
        })
        it("Should not create delay for invalid relations", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone", {
                identifier: "milestone",
                name: "Milestone",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task1",
                next: "milestone",
                type: "FS",
                lag: 0
            })
            graph.addRelation({
                previous: "milestone",
                next: "task2",
                type: "FF",
                lag: 0
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        [ "task1", "milestone" ],
                        [ "milestone", "task2" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["milestone"]), tasks)
            chai.expect(results.warnings.size).to.equal(1)
            chai.expect(results.diffs).to.deep.equal(expected)
        })
        it("Should not create relations for task delays without FF", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("delay", {
                identifier: "delay",
                name: "Task as delay",
                duration: 10,
                startDate: new Date(2016, 8, 6),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task1",
                next: "delay",
                type: "FS",
                lag: 0
            })
            graph.addRelation({
                previous: "delay",
                next: "task2",
                type: "FS",
                lag: 0
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        [ "task1", "delay" ],
                        [ "delay", "task2" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["delay"]), tasks)
            chai.expect(results.warnings.size).to.equal(1)
            chai.expect(results.diffs).deep.equal(expected)
        })
        it("Should not create relations for task delays without FF that is selected", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task1", {
                identifier: "task1",
                name: "Task 1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("delay", {
                identifier: "delay",
                name: "Task as delay",
                duration: 10,
                startDate: new Date(2016, 8, 6),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task2", {
                identifier: "task2",
                name: "Task 2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task1",
                next: "delay",
                type: "FS",
                lag: 0
            })
            graph.addRelation({
                previous: "delay",
                next: "task2",
                type: "FS",
                lag: 0
            })
            const expected: Array<GraphDiff> = [
                {
                    added: [],
                    removed: [
                        [ "task1", "delay" ]
                    ]
                },
                {
                    added: [],
                    removed: [
                        [ "task1", "delay" ],
                        [ "delay", "task2" ]
                    ]
                }
            ]
            const results = graph.createSelectionDiff(new Set<string>(["task1", "delay"]), tasks)
            chai.expect(results.warnings.size).to.equal(0)
            chai.expect(results.diffs).deep.equal(expected)
        })
    })
    describe("Apply diff", () => {
        it("Should apply a simple selection diff", () => {
            let graph = new RelationGraph()
            let tasks = new Map<string, PrimaveraTask>()
            tasks.set("task11", {
                identifier: "task11",
                name: "Task 1-1",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task12", {
                identifier: "task12",
                name: "Task 1-2",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task13", {
                identifier: "task13",
                name: "Task 1-3",
                duration: 15,
                startDate: new Date(2016, 8, 1),
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("milestone", {
                identifier: "milestone",
                name: "Milestone",
                duration: 0,
                startDate: null,
                endDate: new Date(2016, 8, 16)
            })
            tasks.set("task21", {
                identifier: "task21",
                name: "Task 2-1",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            tasks.set("task22", {
                identifier: "task21",
                name: "Task 2-2",
                duration: 10,
                startDate: new Date(2016, 8, 16),
                endDate: new Date(2016, 8, 26)
            })
            graph.addRelation({
                previous: "task11",
                next: "milestone",
                type: "FS",
                lag: 1
            })
            graph.addRelation({
                previous: "task12",
                next: "milestone",
                type: "FF",
                lag: 2
            })
            graph.addRelation({
                previous: "task13",
                next: "milestone",
                type: "SS",
                lag: 3
            })
            graph.addRelation({
                previous: "milestone",
                next: "task21",
                type: "FS",
                lag: 10
            })
            graph.addRelation({
                previous: "milestone",
                next: "task22",
                type: "SS",
                lag: 20
            })
            const diff: GraphDiff = {
                added: [
                    {
                        previous: "task11",
                        next: "task21",
                        type: "FS",
                        lag: 11
                    },
                    {
                        previous: "task11",
                        next: "task22",
                        type: "FS",
                        lag: 21
                    },
                    {
                        previous: "task12",
                        next: "task21",
                        type: "FS",
                        lag: 12
                    },
                    {
                        previous: "task12",
                        next: "task22",
                        type: "FS",
                        lag: 22
                    },
                    {
                        previous: "task13",
                        next: "task21",
                        type: "SS",
                        lag: 13
                    },
                    {
                        previous: "task13",
                        next: "task22",
                        type: "SS",
                        lag: 23
                    }
                ],
                removed: [
                    [ "task11", "milestone" ],
                    [ "task12", "milestone" ],
                    [ "task13", "milestone" ],
                    [ "milestone", "task21" ],
                    [ "milestone", "task22" ]
                ]
            }
            let expected = new RelationGraph()
            expected.nodes.set("milestone", {
                identifier: "milestone",
                parents: new Map<string, PrimaveraTaskRelation>(),
                children: new Map<string, PrimaveraTaskRelation>()
            })
            expected.addRelation({
                previous: "task11",
                next: "task21",
                type: "FS",
                lag: 11
            })
            expected.addRelation({
                previous: "task12",
                next: "task21",
                type: "FS",
                lag: 12
            })
            graph.addRelation({
                previous: "task13",
                next: "task21",
                type: "SS",
                lag: 13
            })
            expected.addRelation({
                previous: "task11",
                next: "task22",
                type: "FS",
                lag: 21
            })
            expected.addRelation({
                previous: "task12",
                next: "task22",
                type: "FS",
                lag: 22
            })
            expected.addRelation({
                previous: "task13",
                next: "task22",
                type: "SS",
                lag: 23
            })
            graph.applyDiff(diff)
            expectMapEqual(graph.nodes, expected.nodes)
        })
    })
})
