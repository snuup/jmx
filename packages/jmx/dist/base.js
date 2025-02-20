export function rebind(o) {
    Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(o)))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => o[name] = o[name].bind(o));
    return o;
}
export function mount(o) { Object.assign(globalThis, o); }
export const loggedmethods = (o) => new Proxy(o, {
    get(target, name, receiver) {
        if (typeof target[name] === "function") {
            return function (...args) {
                console.log("%c" + name.toString(), "background:#585059;color:white;padding:2px;font-weight:bold", args);
                return target[name].apply(this, args);
            };
        }
        return Reflect.get(target, name, receiver);
    },
});
//# sourceMappingURL=base.js.map