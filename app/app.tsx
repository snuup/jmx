import { mount } from '../base/common'
import { jsx, jsxf, patch, updateview } from '../jmx/jmx'
import { JMXComp } from '../jmx/lib'
import { m } from './model'
import { Numero } from './number'
//import { TextComp } from './map'

class TextComp extends JMXComp<{ a: number; s: string }> {
    view() { return "hase" + this.props.s + Date.now() }

    mounted(e) {
        console.log("TextComp mounted", e, this.element)
    }

    update(uc) {
        console.log("TextComp update")
        return true
    }
}


let a: Action<number>

// tbd: inherit function
export let Numerotti: FComponent = ({ n }: { n: number }) => {
    return <div class='carrots'>{n}</div>
}

export class Map extends JMXComp<{ a: number; s: string }> {

    state = 500

    // life

    override mounted(e) {
        console.log("Map mounted", e)
    }

    override update(uc) {
        console.log("Map update", this, uc)
        return true
    }

    // core

    increment() {
        this.state++
        this.updateview()
    }

    // view

    view() {
        console.log("Map view")

        return <aside>map</aside>

        let r = <div class='map'>
            {this.props.a}{this.state}
            <button onclick={this.increment} >increment</button>
        </div>
        return r
    }
}

let App = (
    <body>
        {/* <TextComp a={123} s='jaja-sss-1' />
        <TextComp a={123} s='jaja-sss-2' /> */}

        <Numerotti n={m.i * 10} mounted={e => console.log("Numerotti mounted", e)} update={e => console.log("Numerotti update", e)} />

        <Map a={m.i} s='s' />

        {/* <h2>
            <div>1</div>
            <div>{m.i}</div>
            <div>{[3, 4, 5].map(x => <i>{x}</i>)}</div>
            <div>{[7, 8].map(x => <>{x}</>)}</div>
        </h2> */}

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

// let L1 = () => <>
//     <b>bb1</b>
//     <b>bb2</b>
//     <b>bb3</b>
// </>

// let L2 = <>
//     <a>aa1</a>
//     <a>aa2</a>
// </>

// let App2 = (
//     <body>
//         <L1 />
//         <L2 />
//     </body>
// )

// let F = () => <>
//     <b>aa</b>
//     <b>bb</b>
// </>

// let F = <>
//     {"aa"}
//     {"bb"}
// </>

// let FE = () => <>
//     {"aa"}
//     {"bb"}
// </>

// let G = <>
//     <a>1</a>
//     <a>2</a>
// </>

// let App2 = <body><FE /><div /></body>
// let App3 = <body><F /><div /></body>
let App4 = "hase"

mount({ u: updateview, patch })

//patch(document.body, "hasen")

patch(document.body, App)

//let ub = () => updateview(document.body)
//let p = x => patch(document.body, x)

