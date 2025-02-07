import { mount } from '../base/common'
import { jsx, patch, updateview } from '../jmx/jmx'
import { m } from './model'
import { Numero } from './number'
import { Map } from './map'

export let Numerotti = ({ n }: { n: number }) => <div class="carrots">{n}</div>

let App = (
    <body>

        <Map a={33} s='s' />

        {/*
        <Numerotti n={m.i} />
        <Numerotti n={m.i * 10} />
        <Numerotti n={m.i * 100} />
        <Numero n={m.i} />
        <span>hase {42} {true} {false}</span>
        <Numerotti n={m.i} />

            hase mit <Numero n={m.i} /> karotten
            ente mit <Numero n={m.i} /> schnecken
            <Map a={m.i} s="hase" />
            <ul>
                <li>aa</li>
                <li>bb</li>
            </ul>
            */}
    </body>
)

//let ZZZ = x => <body class="cc">{"hase"}{42}{true}{false}{x}</body>
//console.log(ZZZ)

patch(document.body, App)

mount({ u: updateview })