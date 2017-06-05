import * as tinycolor from "tinycolor2"

// Cf http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

const golden_ratio_conjugate = 0.618033988749895
let h = Math.random()

export const generateColor = (): string => {
    h += golden_ratio_conjugate
    h %= 1
    return tinycolor.fromRatio({h, s: 0.5, v: 0.95}).toHexString()
}
