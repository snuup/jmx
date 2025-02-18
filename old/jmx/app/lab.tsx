import { jsx, jsxf } from '../jmx/jmx'

let F = <>
    {"aa"}
    {"bb"}
</>

let _F = {
    kind: "<>",
    children: () => ["aa", "bb"]
}

let App3 = <body><F /><div /></body>

let _App3 = { // app3 -> getchildren() = eval()
    kind: "element",
    tag: "BODY",
    children: () => [{ // F
        kind: "component",
        tag: F = {              // direct assigned <>:
            kind: "<>",
            children: () => ["aa", "bb"]
        }
    }, { // div
        kind: "element",
        tag: "DIV"
    }]
}
