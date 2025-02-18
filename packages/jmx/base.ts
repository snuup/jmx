export function rebind(o: Record<string, any>) {
    Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(o)))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => o[name] = o[name].bind(o))
    return o
}

export function mount(o: Record<string, any>) { Object.assign(globalThis, o) }

export const loggedmethods = <T extends Record<string, any>>(o: T) => new Proxy(o, {
    get(target, name: string, receiver) {
        if (typeof target[name] === "function") {
            return function (this: T, ...args: any[]) {
                console.log("%c" + name.toString(), "background:#585059;color:white;padding:2px;font-weight:bold", args)
                return target[name].apply(this, args)
            }
        }
        return Reflect.get(target, name, receiver)
    },
})