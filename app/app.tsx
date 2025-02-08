import { mount } from '../base/common'
import { jsx, patch, updateview } from '../jmx/jmx'
import { m } from './model'
import { Numero } from './number'
import { Map, TextComp } from './map'

let a: Action<number>

// tbd: inherit function
export let Numerotti: FComponent = ({ n }: { n: number }) => {
    return <div class="carrots">{n}</div>
}

let App = (
    <body>

        {/* <TextComp a={123} s='jaja-sss-1' />
        <TextComp a={123} s='jaja-sss-2' /> */}

        {/* <Numerotti n={m.i * 10} mounted={e => console.log("Numerotti mounted", e)} update={e => console.log("Numerotti update", e)} />*/}

        <Map a={m.i} s='s' />

        {/* <div update={() => false} >
            <a>hop</a>
        </div> */}

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

let App2 = <body><div>div</div></body>

//let ZZZ = x => <body class="cc">{"hase"}{42}{true}{false}{x}</body>
//console.log(ZZZ)

patch(document.body, App2)

let ub = () => updateview(document.body)
let p = x => patch(document.body, x)

mount({ u: updateview, ub, patch, App, App2, p })