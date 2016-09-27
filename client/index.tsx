import * as React from "react";
import * as ReactDOM from "react-dom";
import * as jquery from "jquery"

import { Hello } from "./Hello";

var ajaxSettings = {}
jQuery.ajax(ajaxSettings)

ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById("example")
);