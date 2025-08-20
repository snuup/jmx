function rebind(o) {
    Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(o)))
        .filter(([name, p]) => name != 'constructor' && p.value instanceof Function)
        .forEach(([name]) => o[name] = o[name].bind(o));
    return o;
}
function mount(o) { Object.assign(globalThis, o); }

globalThis.jmx = {
    create: (tagName) => document.createElement(tagName)
};
let evaluate = (expr) => expr instanceof Function ? expr() : expr;
let removeexcesschildren = (n, i) => { let c; while ((c = n.childNodes[i])) {
    c.remove();
} };
let iswebcomponent = (h) => h.tag.includes('-');
let isclasscomponent = (h) => h.tag?.prototype?.view;
let iselement = (h) => typeof h.tag == "string";
let isfragment = (h) => { return h.tag == undefined && h.cn != undefined; };
let isobject = (o) => typeof o === "object";
let isproperty = (name, value) => (['value', 'checked', 'disabled', 'className', 'style', 'href', 'src', 'selected', 'readOnly', 'tabIndex',].includes(name)
    || value instanceof Object
    || value instanceof Function);
let clean = (o) => { for (let k in o)
    o[k] === undefined && delete o[k]; };
let setprops = (e, newprops = {}) => {
    let oldprops = evaluate(e.h?.p) ?? {};
    clean(newprops);
    for (let p in oldprops) {
        if (!(p in newprops)) {
            if (isproperty(p, oldprops[p])) {
                e[p] = null;
            }
            else {
                e.removeAttribute(p);
            }
        }
    }
    for (let p in newprops)
        isproperty(p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
};
function sync(p, i, h, uc) {
    h = evaluate(h);
    if (h === null || h === undefined || h === false || h === true)
        return i;
    let c = p.childNodes[i];
    function synctextnode(text) {
        if (c && c.nodeType == 3) {
            if (c.textContent != text)
                c.textContent = text;
        }
        else {
            let tn = document.createTextNode(text);
            c ? c.replaceWith(tn) : p.appendChild(tn);
        }
    }
    if (isobject(h)) {
        function syncchildren(p, h, i) {
            evaluate(h.cn)?.flat().forEach(hc => i = sync(p, i, hc, uc));
            return i;
        }
        if (isfragment(h))
            return syncchildren(p, h, i);
        const props = evaluate(h.p);
        if (iselement(h)) {
            let n;
            if (c?.tagName != h.tag) {
                n = window.jmx.create(h.tag);
                c ? c.replaceWith(n) : p.appendChild(n);
                setprops(n, props);
                props?.mounted?.(n);
            }
            else {
                n = c;
                if (props?.const && n.hasAttribute("const")) {
                    return i + 1;
                }
                setprops(n, props);
                if (props?.update?.(c, uc))
                    return i + 1;
            }
            n.h = h;
            if (!uc.patchElementOnly && !iswebcomponent(h)) {
                const j = syncchildren(n, h, 0);
                removeexcesschildren(n, j);
            }
            return i + 1;
        }
        switch (typeof h.tag) {
            case 'function':
                let isupdate = c?.h?.tag == h.tag;
                let state;
                let ci;
                if (isclasscomponent(h)) {
                    h.i = ci = c?.h?.i ?? rebind(new h.tag(props));
                    ci.props = props;
                    if (isupdate && ci.update(uc))
                        return i + 1;
                }
                else {
                    state = p.childNodes[i]?.state;
                    if (uc.functionnode?.h == h) {
                        return sync(p, i, c.hr, uc);
                    }
                    if (state?.uc) {
                        state.updateglobal();
                        return i + 1;
                    }
                }
                let hr = ci?.view() ?? h.tag.bind(state ??= (h.tag.state ?? new FunCompState()))(props, evaluate(h.cn));
                if (hr === undefined || hr == null)
                    return i;
                let j = sync(p, i, hr, uc);
                let cn = p.childNodes[i];
                cn.h = h;
                cn.hr = hr;
                Object.assign(cn, { h, state });
                if (state)
                    state.element ??= cn;
                if (ci)
                    ci.element = cn;
                if (!isupdate)
                    ci?.mounted();
                return j;
            case 'object':
                return sync(p, i, h.tag, uc);
        }
    }
    synctextnode(h);
    return i + 1;
}
function patch(e, h, uc = {}) {
    if (!e)
        return;
    if (uc.replace)
        e.replaceChildren();
    const p = e.parentElement;
    const i = [].indexOf.call(p.childNodes, e);
    sync(p, i, h, uc);
}
let isselector = (x) => typeof x === "string" || x instanceof Node;
function updateview(...us) {
    {
        if (!us.length)
            us = [document.body];
        let uc;
        let u0 = us[0];
        if (!isselector(u0)) {
            uc = u0;
            us = us.slice(1);
        }
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                us
                    .flatMap(x => (typeof x == 'string') ? [...(uc?.root ?? document).querySelectorAll(x)] : [x])
                    .forEach(e => {
                    if (!e?.h)
                        throw 'jmx: no h exists on the node';
                    patch(e, e.h, uc);
                });
                resolve();
            });
        });
    }
}
mount({ updateview });
class FunCompState {
    element;
    uc;
    update(...us) {
        if (!us.length) {
            updateview({ functionnode: this.element }, this.element);
            return;
        }
        let uc;
        let usx;
        let u0 = us[0];
        if (!isselector(u0)) {
            uc = u0;
            const [_, ...ss] = us;
            usx = ss;
        }
        else {
            uc = {};
            usx = us;
        }
        uc.root = this.element;
        uc.functionnode = this.element;
        if (!usx.length)
            usx = [this.element];
        updateview(uc, ...usx);
    }
    updateglobal() {
        if (this.uc == "*")
            this.uc = this.element;
        this.update(...this.uc);
    }
}
//# sourceMappingURL=app.js.map
