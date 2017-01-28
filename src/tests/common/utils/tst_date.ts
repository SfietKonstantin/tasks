import * as chai from "chai"
import * as utilsdate from "../../../common/utils/date"

describe("Date utils", () => {
    it("Should get a date as a label", () => {
        chai.expect(utilsdate.dateAsLabel(new Date(2016, 1, 15))).to.equal("15/2/2016")
    })
    it("Should get a difference between two dates", () => {
        const first = new Date(2016, 1, 15)
        const second = new Date(2016, 1, 25)
        chai.expect(utilsdate.diffDates(first, second)).to.equal(10)
    })
    it("Should get a negative difference if second date is prior to first", () => {
        const first = new Date(2016, 1, 25)
        const second = new Date(2016, 1, 15)
        chai.expect(utilsdate.diffDates(first, second)).to.equal(-10)
    })
    it("Should add a number of days to a date", () => {
        const date = new Date(2016, 1, 15)
        const expected = new Date(2016, 1, 25)
        chai.expect(utilsdate.addDays(date, 10)).to.deep.equal(expected)
    })
})

