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

let evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? expr() : expr
let removeexcesschildren = (n: Element, i: number) => { let c: ChildNode; while ((c = n.childNodes[i])) c.remove() }
let iswebcomponent = (h: HElement) => (h.tag as string).includes('-')
let isclasscomponent = (h: HComp): h is HCompClass => (h.tag as any)?.prototype?.view
let iselement = (h): h is HElement => h.kind == "element" // typeof h.tag == string
let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.children != undefined }
let isobject = (x: any): x is object => typeof x === "object"

let isproperty = (name: string, value: any) => (
    ['value', 'checked', 'disabled', 'className', 'style', 'href', 'src', 'selected', 'readOnly', 'tabIndex',].includes(name)
    || value instanceof Object
    || value instanceof Function
)

let setprops = (e: Element, newprops: Props = {}) => {
    let oldprops = evaluate(e.h?.props) ?? {} // tbd: should h always ba attached here? then we could remove the "?"
    for (let p in oldprops) (!(p in newprops)) && isproperty(p, oldprops[p]) ? e[p] = null : e.removeAttribute(p) // tbd: not sure if that is correct, should be rare border cases where this matters
    for (let p in newprops) isproperty(p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p])
}

export function patch(e: Node, h: Expr<H>, uc: UpdateContext = {}) {

    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call(p.childNodes, e) // tell typescript that parentElement is not null
    sync(p, i, h)

    function sync(p: Element, i: number, h: Expr<H | undefined>): number {

        // console.log('%csync', "background:orange", p.tagName, i, h, 'html = ' + document.body.outerHTML)

        h = evaluate(h)
        if (h === null || h === undefined) return i // skip this element. not that !!h would forbid to render the number 0 or the boolean value false

        let c = p.childNodes[i] // is often null, eg during fresh creation

        function synctextnode(text: string) {
            if (c && c.nodeType == NodeType.TextNode) {
                if (c.textContent != text) c.textContent = text// firefox updates even equal text, loosing an existing text selection
            } else {
                let tn = document.createTextNode(text)
                c ? c.replaceWith(tn) : p.appendChild(tn)
            }
        }

        if (isobject(h)) {

            // element nodes

            /** synchronizes children starting at the i-th element.
              * returns the index of the last child synchronized */
            function syncchildren(p: Element, h: HElement | HComp | HFragment, i: number): number {
                evaluate(h.children)?.forEach(hc => i = sync(p, i, hc))
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
                n.h = h
                if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) { // tbd: make "island" attribute
                    const j = syncchildren(n, h, 0)
                    removeexcesschildren(n, j)
                }
                return i + 1
            }

            switch (typeof h.tag) {

                case 'function':
                    let hr: H
                    if (isclasscomponent(h)) {
                        (h.i ??= rebind(new h.tag())).props = props
                        hr = h.i.view() // inefficient: we compute view() although we do not use if then the component has an update function
                    } else {
                        hr = h.tag(props, evaluate(h.children))
                    }
                    let j = sync(p, i, hr) //otherwise continue with the computed h
                    p.childNodes[i]!.h = h
                    return j

                case 'object':
                    return sync(p, i, h.tag) // tbd: type of h is not correct, h.tag == never
            }
        }
        // text nodes
        synctextnode(h as string)
        return i + 1
    }
}

export function updateview(selector: string | Node = 'body', uc: UpdateContext = {}) {
    const ns = typeof selector == 'string' ? document.querySelectorAll(selector) : [selector]
    let n: Node | null
    for (n of ns) {
        if (uc.replace) (n as HTMLElement).replaceChildren()
        if (!n.h) throw ['jmx: no h exists on the node', n]
        patch(n, n.h, uc)
    }
}

export function jsx(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
export function jsxf(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
