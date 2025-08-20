import { jsx, mount, patch, updateview } from 'jmx-runtime'

let m = {
    x: 41,
}

let AA = () => <a>"" {42}</a>

let Lab = () => <b>{m.x}<AA /></b>

let App = () => (
    <body class={m.x.toString()}>
        <div>{m.x}</div>
        hase war da 12: <Lab />
    </body>
)

patch(document.body, App)

mount({ m, updateview })
