import { rebind } from './base';
let evaluate = (expr) => (expr instanceof Function ? expr() : expr);
let removeexcesschildren = (n, i) => {
    let c;
    while ((c = n.childNodes[i])) {
        c.remove();
    }
};
let iswebcomponent = (h) => h.tag.includes('-');
let isclasscomponent = (h) => h.tag?.prototype?.view;
let iselement = (h) => typeof h.tag == 'string';
let isfragment = (h) => {
    return h.tag == undefined && h.cn != undefined;
};
let isobject = (o) => typeof o === 'object';
let isproperty = (name, value) => ['value', 'checked', 'disabled', 'className', 'style', 'href', 'src', 'selected', 'readOnly', 'tabIndex'].includes(name) ||
    value instanceof Object ||
    value instanceof Function;
let setprops = (e, newprops = {}) => {
    let oldprops = evaluate(e.h?.p) ?? {};
    for (let p in oldprops)
        !(p in newprops) && isproperty(p, oldprops[p]) ? (e[p] = null) : e.removeAttribute(p);
    for (let p in newprops)
        isproperty(p, newprops[p]) ? (e[p] = newprops[p]) : e.setAttribute(p, newprops[p]);
};
function sync(p, i, h) {
    h = evaluate(h);
    if (h === null || h === undefined)
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
            evaluate(h.cn)
                ?.flat()
                .forEach(hc => (i = sync(p, i, hc)));
            return i;
        }
        if (isfragment(h))
            return syncchildren(p, h, i);
        const props = evaluate(h.p);
        if (iselement(h)) {
            let n;
            if (c?.tagName != h.tag) {
                n = document.createElement(h.tag);
                c ? c.replaceWith(n) : p.appendChild(n);
                setprops(n, props);
                props?.mounted?.(n);
            }
            else {
                n = c;
                setprops(n, props);
                if (props?.update?.(c, globaluc))
                    return i + 1;
            }
            n.h = h;
            if (!globaluc.patchElementOnly && !iswebcomponent(h)) {
                const j = syncchildren(n, h, 0);
                removeexcesschildren(n, j);
            }
            return i + 1;
        }
        switch (typeof h.tag) {
            case 'function':
                let isupdate = c?.h?.tag == h.tag;
                let ci;
                if (isclasscomponent(h)) {
                    h.i = ci = c?.h?.i ?? rebind(new h.tag(props));
                    ci.props = props;
                    if (isupdate && ci.update(globaluc))
                        return i + 1;
                }
                let hr = ci?.view() ?? h.tag(props, evaluate(h.cn));
                if (hr === undefined || hr == null)
                    return i;
                let j = sync(p, i, hr);
                let cn = p.childNodes[i];
                cn.h = h;
                if (ci)
                    ci.element = cn;
                if (!isupdate)
                    ci?.mounted();
                return j;
            case 'object':
                return sync(p, i, h.tag);
        }
    }
    synctextnode(h);
    return i + 1;
}
let globaluc = {};
export function patch(e, h) {
    if (!e)
        return;
    if (globaluc.replace)
        e.replaceChildren();
    const p = e.parentElement;
    const i = [].indexOf.call(p.childNodes, e);
    requestAnimationFrame(() => sync(p, i, h));
}
export function updateviewuc(uc, ...sels) {
    {
        globaluc = uc;
        updateviewinternal(...sels);
    }
}
export function updateview(...sels) {
    {
        globaluc = {};
        updateviewinternal(...sels);
    }
}
function updateviewinternal(...sels) {
    sels.flatMap(s => (typeof s == 'string' ? [...document.querySelectorAll(s)] : s ? [s] : [])).forEach(e => {
        if (!e?.h)
            throw 'jmx: no h exists on the node';
        patch(e, e.h);
    });
}
export function jsx() {
    throw 'jmx plugin not configured';
}
export function jsxf() {
    throw 'jmx plugin not configured';
}
//# sourceMappingURL=jmx.js.map