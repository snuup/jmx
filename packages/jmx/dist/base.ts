export function rebind(o: Record<string, any>) {
    Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(o)))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => o[name] = o[name].bind(o))
    return o
}

export function mount(o: Record<string, any>) { Object.assign(globalThis, o) }

export const loggedmethodsex = <T extends Record<string, any>>(o: T, logger: (name: string, args: any[], result: any) => void) => new Proxy(o, {
    get(target, name: string, receiver) {
        if (typeof target[name] === "function") {
            return function (this: T, ...args: any[]) {

                let r = target[name].apply(this, args)
                logger(name, args, r)


                return r
            }
        }
        return Reflect.get(target, name, receiver)
    },
})

export const loggedmethods = (o: any) => loggedmethodsex(o, (name, args, result) => console.log("%c" + name, "background:#585059;color:white;padding:2px;font-weight:bold", args, result))
