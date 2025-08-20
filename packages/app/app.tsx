import { jsx, mount, patch, updateview } from 'jmx-runtime'

let m = {
    x: 41,
}

let AA = () => <div>"" {42}</div>

let Lab = () => <div>{m.x}<AA /></div>

let App = () => (
    <body>
        hase war da 12: <Lab />
    </body>
)

patch(document.body, App)

mount({ m, updateview })
