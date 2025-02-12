import { mount } from '../base/common'
import { jsx, jsxf, patch, updateview } from '../jmx/jmx'
import { JMXComp } from '../jmx/lib'
import { m } from './model'
import { Numero } from './number'
//import { TextComp } from './map'

class TextComp extends JMXComp<{ a: number; s: string }> {
    view() { return "hase" + this.props.s + Date.now() }

    mounted() {
        console.log("TextComp mounted", this.element)
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
    h: H

    // life

    // constructor(p) {
    //     super(p)
    //     console.log("Map ctor")

    // }

    // override mounted() {
    //     console.log("Map.mounted", this)
    // }

    override update(uc) {
        console.log("Map.update", this, uc)
        return true
    }

    // core

    increment() {
        this.state++
        // this.updateview()
        patch(this.element, this.h)
    }

    // view

    view() {
        console.log("Map.view")
        return this.h = <div class='map'>
            {this.props.a} {this.state} {m.i}
            <button onclick={this.increment}>increment</button>
        </div>
    }
}

// maybe assign comp + inner always <<<<<<<<<<<<<<<<<<<<<<<<

export class Counter extends JMXComp<{ start: number; name: string }> {

    count = this.props.start
    h: H

    override update(uc) {
        console.log("Map.update", this, uc)
        return true
    }

    increment() {
        this.count++
        let ch = this.element.h
        patch(this.element, this.h)
        //this.element.h = ch
    }

    view() {
        return this.h = <div class='map'>
            {this.props.name}: {this.count}
            <button onclick={this.increment}>increment</button>
        </div>
    }
}

// this does not work nicely -its catastrophic
// let FunWithState = () => {

//     console.log("funny")

//     return <div
//         mounted={e => { console.log("mounted"); e.state = { count:13 } }}
//         onclick={() => { element.state.count++; updateview(element) }}
//     >hoho, now i have state {state.count}</div>
// }

let Island = <div update={() => true}>island - {m.i} -.</div>

let App = (
    <body>
        {/* <FunWithState /> */}
        {/* <TextComp a={123} s='jaja-sss-1' />
        <TextComp a={123} s='jaja-sss-2' /> */}

        {/* <Numerotti n={m.i * 10} mounted={e => console.log("Numerotti mounted", e)} update={e => console.log("Numerotti update", e)} /> */}

        {/* <Map a={m.i} s='s' /> */}
        <Counter name="count-sheeps" start={m.i} />

        {/* <article update={() => true}>add something here {m.i}</article> */}

        {/* <Island /> */}

        {/* <div
            mounted={(e) => { console.log("div mounted", e) }}
            update={(n, uc) => { console.log("updatey", n, uc) }}
        >hoho, am i mounted=</div> */}


        {/* <div>{m.i * 3}</div> */}

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

patch(document.body, <App />)

//let ub = () => updateview(document.body)
//let p = x => patch(document.body, x)

