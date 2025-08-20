export function rebind(o) {
    Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(o)))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => o[name] = o[name].bind(o));
    return o;
}
export function mount(o) { Object.assign(globalThis, o); }
export const loggedmethodsex = (o, logger) => new Proxy(o, {
    get(target, name, receiver) {
        if (typeof target[name] === "function") {
            return function (...args) {
                logger(name, args, undefined);
                let r = target[name].apply(this, args);
                return r;
            };
        }
        return Reflect.get(target, name, receiver);
    },
});
export const loggedmethods = (o) => loggedmethodsex(o, (name, args, result) => console.log("%c" + name, "background:#585059;color:white;padding:2px;font-weight:bold", args));
export const loggedmethodscolored = (bgcolor, o) => loggedmethodsex(o, (name, args, result) => console.log("%c" + name, `background:${bgcolor};color:white;padding:2px;font-weight:bold`, args));
//# sourceMappingURL=base.js.map