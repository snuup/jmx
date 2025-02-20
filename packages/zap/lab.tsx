import { Action, H, HTMLAttributes, IntrinsicElementAttributes, jsx, jsxf, mount, patch, updateview } from "../jmx"

type FCounter<P, S> = (this: S & {update: Action}, p: P) => H;

let Counter: FCounter<{ name: string }, { count: number }> = function ({ name }) {
    this.count ??= 100
    return <counter>
        <i>{name}</i>
        <b>{this.count}</b>
        <button onclick={() => { this.count++; this.update() }}>clicks</button>
    </counter>
}

// update
// state init

patch(document.body, <body><Counter name="here the counterotti:" /></body>)

mount({ updateview })

declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementAttributes {
            counter: HTMLAttributes
        }
    }
}
