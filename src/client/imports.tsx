import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Primavera from "./imports/primavera"

export function render(source: string) {
    if (source == "primavera") {
        Primavera.render()
    }
}