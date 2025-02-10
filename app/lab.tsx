import { jsx, jsxf } from '../jmx/jmx'

let F = <>
    {"aa"}
    {"bb"}
</>

let _App3 = <body><F /><div /></body>

let App3 = { // app3 -> getchildren() = eval()
    kind: "element",
    tag: "BODY",
    children: () => [{ // F
        kind: "component",
        tag: F
    }, { // div
        kind: "element",
        tag: "DIV"
    }]
}
