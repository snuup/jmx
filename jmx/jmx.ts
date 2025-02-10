function rebind(o) {
    let proto = Object.getPrototypeOf(o)
    let names = Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([, p]) => p.value instanceof Function)
        .filter(([name]) => name != 'constructor')
        .map(([name]) => name)
    for (const n of names) o[n] = o[n].bind(o)
    return o
}

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
}

function setprops(e: Element, newprops: Props = {}) {

    let set = p => {
        if (isproperty(p, newprops[p])) e[p] = newprops[p]
        else e.setAttribute(p, newprops[p])
    }

    let rem = p => {
        if (isproperty(p, oldprops[p])) e[p] = null // tbd: not sure if that is correct, should be rare border cases where this matters
        else e.removeAttribute(p)
    }

    let oldprops = evaluate(e.h?.props) ?? {}
    for (let p in oldprops) (!(p in newprops)) && rem(p)
    for (let p in newprops) set(p)
}

let isproperty = (name: string, value: any) => (
    ['value', 'checked', 'disabled', 'className', 'style', 'href', 'src', 'selected', 'readOnly', 'tabIndex',].includes(name)
    || value instanceof Object
    || value instanceof Function
)

/** remove all children from n with index >= i */
let evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr
let removeexcesschildren = (n: Element, i: number) => { let c: ChildNode; while ((c = n.childNodes[i])) c.remove() }
let iswebcomponent = (h: HElement) => (h.tag as string).includes('-')
let isclasscomponent = (h: HTFC): h is HCompClass => (h.tag as any)?.prototype?.view
let iselement = (h): h is HElement => h.kind == "element" // typeof h.tag == string
let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.children != undefined }

function sync(p: Element, i: number, h: Expr<H | undefined>, uc: UpdateContext): number {

    // console.log('%csync', "background:orange", p.tagName, i, h, 'html = ' + document.body.outerHTML)

    h = evaluate(h)
    if (h === null || h === undefined) return i // skip this element

    const c = p.childNodes[i] // is often null, eg during fresh creation

    function synctextnode(text: string) {
        if (c && c.nodeType == NodeType.TextNode) {
            if (c.textContent != text) c.textContent = text// firefox updates even equal text, loosing an existing text selection
        } else {
            const tn = document.createTextNode(text)
            c ? c.replaceWith(tn) : p.appendChild(tn)
        }
    }

    switch (typeof h) {

        // text nodes
        case 'string':
        case 'number':
        case 'boolean':
            synctextnode(h as string) //not sure if we need toString() here
            return i + 1

        // element nodes
        case 'object':

            /** synchronizes children starting at the i-th element.
              * returns the index of the last child synchronized */
            function syncchildren(p: Element, h: HElement | HComp | HFragment, i: number): number {
                evaluate(h.children)?.forEach(hc => {
                    let i0 = i
                    i = sync(p, i, hc, uc)
                    let cn = p.childNodes[i0] // this node might not exist before the sync call
                    if (cn && !cn.h) cn.h = hc as any // the node here might not exist before the call to sync // tbd, make this nicer
                })
                return i
            }

            if (isfragment(h)) return syncchildren(p, h, i)

            const props = evaluate(h.props)

            function syncelement(tag: string): Element {

                if ((<Element>c)?.tagName != tag) {
                    const n = document.createElement(tag)
                    c ? c.replaceWith(n) : p.appendChild(n)
                    setprops(n, props)
                    props?.mounted?.(n)
                    return n
                } else {
                    setprops(<Element>c, props)
                    props?.update?.(uc)
                    return c as Element
                }
            }

            if (iselement(h)) {
                let n = syncelement(h.tag as string) // tbd: order of this line right and good?
                if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {
                    const j = syncchildren(n, h, 0)
                    removeexcesschildren(n, j)
                }
                return i + 1
            }

            switch (typeof h.tag) {

                case 'function':
                    let hr
                    if (isclasscomponent(h)) {
                        let i = (c?.h as HCompClass).i ??= rebind(new h.tag(props!)) // rebind is important for simple event handlers
                        i.props = props
                        hr = i.view() // inefficient: we compute view() although we do not use if then the component has an update function
                    } else {
                        hr = h.tag(props, evaluate(h.children))
                    }
                    return sync(p, i, hr, uc) //otherwise continue with the computed h

                case 'object': // tbd: typing
                    return sync(p, i, h.tag, uc)
            }
    }
}

export function jsx(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
export function jsxf(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it

// patches given dom and comp
export function patch(e: Node, h: Expr<H>, uc: UpdateContext = {}) {
    //console.log("%cpatch", `background:orange;color:white;padding:2px;font-weight:bold`, e, h)
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call(p.childNodes, e) // tell typescript that parentElement is not null
    sync(p, i, h, uc)
    e.h = h as any
}

// uses attached comps to patch elements
export function updateview(selector: string | Node = 'body', uc: UpdateContext = {}) {
    // console.log(`updateview(%c${selector}, ${patchElementOnly})`, "background:#d2f759;padding:2px")
    const ns = typeof selector == 'string' ? document.querySelectorAll(selector) : [selector]
    let n: Node | null
    for (n of ns) {
        while (n && !n.h) n = n.parentElement
        if (!n) continue

        if (uc.replace) (n as HTMLElement).replaceChildren()
        if (!n.h) throw ['cannot update, because html was not created with jmx: no h exists on the node', n]
        patch(n, n.h, uc)
    }
}

