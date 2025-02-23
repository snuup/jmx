import { jsx, jsxf, updateview, patch } from "../jmx/jmx"
import { FComponentState, IUpdateContext } from "../jmx/h"
import { HTMLAttributes, IntrinsicElementAttributes } from "../jmx/jsx"
import { mount } from '../jmx/base'

// wrong:
// this.element
// update all   <- match with this.element

let Counter: FComponentState<{ name: string }, { count: number }> = function ({ name }) {
    this.count = 50
    this.uc = [{ patchElementOnly: true }]
    return <counter class={this.count.toString()}>
        <i>{name} - {Date.now}</i>
        <b>{this.count}</b>
        <button onclick={() => { this.count++; this.update("i") }}>i</button>
        <button onclick={() => { this.count++; this.update("b") }}>b</button>
        <button onclick={() => { this.count++; this.update(this.element) }}>this.element</button>
        <button onclick={() => { this.count++; this.update("i", "b") }}>i + b</button>
        <button onclick={() => { this.count++; this.update({ patchElementOnly: true }) }}>patchelementonly</button>
        <button onclick={() => { this.count++; this.update() }}>empty</button>
    </counter>
}
//Counter.state = { count: 72 }

let m = {
    name: "cuuuu"
}

let F = <>
    <b>1</b>
</>

let A = <div>
    <F />
    <article></article>
    <aside></aside>
</div>

// patch(document.body, <body><A /></body>)
patch(document.body, <body>
    <Counter name={m.name} />
    <Counter name={m.name + " no2"} />
    </body>)

let updateall = () => updateview(document.body)
let updatecounter = () => updateview("counter")

mount({ updateview, Counter, updateall, updatecounter })

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            counter: HTMLAttributes
        }
    }
}
