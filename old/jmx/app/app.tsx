import { When } from '../jmx/lib'
import { mount } from '../base/common'
import { jsx, jsxf, patch, updateview } from '../jmx/jmx'



//export const When = ({ cond }, children) => cond ? <>{children}</> : undefined

let None = () => {
    undefined
}

let m = {
    count: 0
}

let c = {
    increment(ev) {
        m.count++
        //updateview("button")
        updateview(ev.target)
    }
}

let Counter = ({ offset }) => {
    return <button onclick={c.increment}>
        Count is: {m.count + offset}
    </button >
}

let App = (
    <body>
        <div>
            <Counter offset={0} />
            <Counter offset={10} />
            <Counter offset={100} />
            {/* <button onclick={c.increment}>Count is: {m.count}</button>
            <button onclick={c.increment}>Count is: {m.count + 10}</button>
            <button onclick={c.increment}>Count is: {m.count + 100}</button> */}
        </div>
    </body>
)

let X = (
    <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
    </ul>
)

console.log("app")

mount({ u: updateview, patch, App, m })

patch(document.body, <App />)

let h = (...args) => () => { console.log("args", args); return args }
let dom = h("ul", null, h("li", null, "1"), h("li", null, "2"), h("li", null, "3", "33", "333", ...[1, 2, 3, 4, 5, 6, 7, 8]))

mount({ dom })