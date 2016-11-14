import * as chai from "chai"
import * as stringutils from "../../common/stringutils"

interface Data {
    identifier: string
    content: number
}

describe("String utils", () => {
    const sortFunction = (first: Data, second: Data): number => {
        return stringutils.sortStrings(first.identifier, second.identifier)
    }
    it("Should sort strings 1", () => {
        const input: Array<Data> = [
            {
                identifier: "b",
                content: 2
            },
            {
                identifier: "a",
                content: 1
            }
        ]
        const expected: Array<Data> = [
            {
                identifier: "a",
                content: 1
            },
            {
                identifier: "b",
                content: 2
            }
        ]
        chai.expect(input.sort(sortFunction)).to.deep.equal(expected)
    })
    it("Should sort strings 2", () => {
        const input: Array<Data> = [
            {
                identifier: "a",
                content: 1
            },
            {
                identifier: "b",
                content: 2
            }
        ]
        const expected: Array<Data> = [
            {
                identifier: "a",
                content: 1
            },
            {
                identifier: "b",
                content: 2
            }
        ]
        chai.expect(input.sort(sortFunction)).to.deep.equal(expected)
    })
    it("Should sort strings 3", () => {
        const input: Array<Data> = [
            {
                identifier: "b",
                content: 2
            },
            {
                identifier: "a",
                content: 1
            },
            {
                identifier: "e",
                content: 5
            },
            {
                identifier: "c",
                content: 3
            },
            {
                identifier: "d",
                content: 4
            }
        ]
        const expected: Array<Data> = [
            {
                identifier: "a",
                content: 1
            },
            {
                identifier: "b",
                content: 2
            },
            {
                identifier: "c",
                content: 3
            },
            {
                identifier: "d",
                content: 4
            },
            {
                identifier: "e",
                content: 5
            }
        ]
        chai.expect(input.sort(sortFunction)).to.deep.equal(expected)
    })
    it("Should not sort on equality", () => {
        const input: Array<Data> = [
            {
                identifier: "a",
                content: 2
            },
            {
                identifier: "a",
                content: 1
            }
        ]
        const expected: Array<Data> = [
            {
                identifier: "a",
                content: 2
            },
            {
                identifier: "a",
                content: 1
            }
        ]
        chai.expect(input.sort(sortFunction)).to.deep.equal(expected)
    })
})
