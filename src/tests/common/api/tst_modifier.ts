import * as chai from "chai"
import {ModifierBuilder} from "../../../common/api/modifier"
import {Modifier} from "../../../common/old/modifier"
import {TaskLocation} from "../../../common/old/tasklocation"
import {InputError} from "../../../common/errors/input"

describe("API ModifierBuilder", () => {
    it("Should create a Modifier from a correct input (Beginning)", () => {
        const modifier: Modifier = {
            name: "Name",
            description: "Description",
            duration: 3,
            location: TaskLocation.Beginning
        }
        chai.expect(ModifierBuilder.fromObject(modifier)).to.deep.equal(modifier)
    })
    it("Should create a Modifier from a correct input (End)", () => {
        const modifier: Modifier = {
            name: "Name",
            description: "Description",
            duration: 3,
            location: TaskLocation.End
        }
        chai.expect(ModifierBuilder.fromObject(modifier)).to.deep.equal(modifier)
    })
    it("Should not create a modifier from an input without name", () => {
        const modifier = {
            description: "Description",
            duration: 3,
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input with a wrong name type", () => {
        const modifier = {
            name: {test: "test"},
            description: "Description",
            duration: 3,
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input without description", () => {
        const modifier = {
            name: "Name",
            duration: 3,
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input with a wrong description type", () => {
        const modifier = {
            name: "Name",
            description: {test: "test"},
            duration: 3,
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input without duration", () => {
        const modifier = {
            name: "Name",
            description: "Description",
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input with a wrong duration type", () => {
        const modifier = {
            name: "Name",
            description: "Description",
            duration: {test: "test"},
            location: TaskLocation.Beginning
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input without location", () => {
        const modifier = {
            name: "Name",
            description: "Description",
            duration: 3,
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input with a wrong location type", () => {
        const modifier = {
            name: "Name",
            description: "Description",
            duration: 3,
            location: {test: "test"}
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
    it("Should not create a modifier from an input with an out of range location", () => {
        const modifier = {
            name: "Name",
            description: "Description",
            duration: 3,
            location: 123
        }
        chai.expect(() => {
            ModifierBuilder.fromObject(modifier)
        }).to.throw(InputError)
    })
})

