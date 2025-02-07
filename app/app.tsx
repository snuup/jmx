import { mount } from '../base/common'
import { jsx, patch, updateview } from '../jmx/jmx'
import { m } from './model'
import { Numero } from './number'
import { Map } from './map'

let a: Action<number>

export let Numerotti = ({ n, mounted }: { n: number, mounted?: Action<HTMLElement> }) => {
    return <div class="carrots">{n}</div>
}

let App = (
    <body>

        <Numerotti n={m.i * 10} mounted={e => console.log(e)} />
        {/* <Map a={33} s='s' /> */}
        {/* <Map a={55} s='s' /> */}
        {/* <Numerotti n={m.i} />

        <Numerotti n={m.i * 100} />
        <Numero n={m.i} />
        <span>hase {42} {true} {false}</span>
        <Numerotti n={m.i} />

        hase mit <Numero n={m.i} /> karotten
        ente mit <Numero n={m.i} /> schnecken
        <Map a={m.i} s="hase" />
        <ul update={() => { console.log("no patchin") }} >
            <li>aa{m.i}</li>
            <li>bb</li>
        </ul> */}

    </body>
)

//let ZZZ = x => <body class="cc">{"hase"}{42}{true}{false}{x}</body>
//console.log(ZZZ)

patch(document.body, App)

mount({ u: updateview })