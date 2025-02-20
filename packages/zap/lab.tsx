import { H, jsx, jsxf, patch } from "../jmx"

type FCounter<T, P> = (this: T, p: P) => H;

let Counter: FCounter<{ count: number }, { name: string }> = function ({ name }) {
    this.count = 456
    return <div>
        <h3>{name}</h3>
        <b>{this.count}</b>
        <br/>
        <br/>
        <button onclick={() => this.count++}>clicks</button>
    </div>
}

patch(document.body, <body><Counter name="hasen" /></body>)