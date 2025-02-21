import { FComponentState, HTMLAttributes, IntrinsicElementAttributes, jsx, jsxf, mount, patch, UpdateContext, updateview } from "../jmx"

let Counter: FComponentState<{ name: string }, { count: number }> = function ({ name }) {
    this.count = 50
    this.update = "i, b"
    return <counter>
        <i>{name} - {Date.now}</i>
        <b>{this.count}</b>
        <button onclick={() => { this.count++; updateview({ root: this.element }, "b") }}>clicks</button>
        <button onclick={() => { this.count++; updateview(this.element) }}>clicks 2</button>
    </counter>
}
//Counter.state = { count: 72 }

let m = {
    name: "cuuuu"
}

patch(document.body, <body><Counter name={m.name} /></body>)

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
