import { mount } from '../base/common'
import { jsx, jsxf, patch, updateview } from '../jmx/jmx'
import { m } from './model'
import { Numero } from './number'
import { Map, TextComp } from './map'

let a: Action<number>

// tbd: inherit function
export let Numerotti: FComponent = ({ n }: { n: number }) => {
    return <div class='carrots'>{n}</div>
}

let App = (
    <body>
        {/* <TextComp a={123} s='jaja-sss-1' />
        <TextComp a={123} s='jaja-sss-2' /> */}

        {/* <Numerotti n={m.i * 10} mounted={e => console.log("Numerotti mounted", e)} update={e => console.log("Numerotti update", e)} />*/}

        {/* <Map a={m.i} s='s' /> */}

        <h2>
            <div>1</div>
            <div>{m.i}</div>
            <div>{[3,4,5].map(x => <i>{x}</i>)}</div>
            <div>{[7,8].map(x => <>{x}</>)}</div>
        </h2>

        {/* <>
            <p>11</p>
            <i>22</i>
        </> */}

        {/* <div class='hase' mounted={console.log}>hase</div> */}

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

let L1 = () => <>
    <b>bb1</b>
    <b>bb2</b>
    <b>bb3</b>
</>

let L2 = <>
    <a>aa1</a>
    <a>aa2</a>
</>

let App2 = (
    <body>
        <L1 />
        <L2 />
    </body>
)

patch(document.body, App)

let ub = () => updateview(document.body)
let p = x => patch(document.body, x)
mount({ u: updateview, ub, patch, App, App2, p })
