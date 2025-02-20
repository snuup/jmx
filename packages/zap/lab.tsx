import { FComponentState, HTMLAttributes, IntrinsicElementAttributes, jsx, jsxf, mount, patch, UpdateContext, updateview } from "../jmx"

let Counter: FComponentState<{ name: string }, { count: number }> = function ({ name }) {

    console.log('Counter.ctor', name);

    this.count = 144
    this.update = "counter"
    return <counter>
        <i>{name}</i>
        <b>{this.count}</b>
        <button onclick={() => { this.count++; updateview({ root: this.element }, "b") }}>clicks</button>
        <button onclick={() => { this.count++; updateview(this.element) }}>clicks 2</button>
    </counter>
}
//Counter.state = { count: 72 }

patch(document.body, <body><Counter name="here the counterotti:" /></body>)

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
