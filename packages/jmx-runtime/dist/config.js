export function createElement(tag) {
    let ns = window.jmx?.getnamespace?.(tag);
    return ns ? document.createElementNS(ns, tag) : document.createElement(tag);
}
//# sourceMappingURL=config.js.map