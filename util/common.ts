
export function mount(x) {
    Object.assign(globalThis, x)
}

export function rebind(o) {
    const proto = Object.getPrototypeOf(o)
    const names =
        Object.entries(Object.getOwnPropertyDescriptors(proto))
            .filter(([, p]) => p.value instanceof Function)
            .filter(([name,]) => name != "constructor")
            .map(([name,]) => name)
    for (const name of names) {
        o[name] = o[name].bind(o)
    }
    return o
}

export function setAttributeSmooth(n: Element, name, value) {
    if (n.getAttribute(name) != value) n.setAttribute(name, value)
}

declare global { }

export function mergePrototype(mixin, ...targets) {
    // instance
    let props = Object.getOwnPropertyDescriptors(mixin.prototype)
    delete (props as any).constructor // do not copy the constructor
    targets.forEach(t => Object.defineProperties(t.prototype, props))

    // static
    props = Object.getOwnPropertyDescriptors(mixin)
    Object.entries(props).forEach(([key, pd]) => !pd.writable && delete props[key])
    targets.forEach(t => Object.defineProperties(t, props))
}

const evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

mergePrototype(
    class extends Object {
        log(this: ThisType<any>, msg: string): ThisType<any> {
            console.log(msg, this)
            mount({ x: this })
            return this
        }
        eval() {
            return evaluate(this)
        }
        eve() {
            return globalThis["eve"](this)
        }
    },
    Object
)