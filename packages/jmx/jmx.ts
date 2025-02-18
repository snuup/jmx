/// <reference path="./h.ts" />
import { rebind } from 'base'
import { Expr, FComponent, H, HComp, HCompClass, HElement, HFragment, IClassComponent, Props, UpdateContext } from 'h'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
}

let evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? expr() : expr
let removeexcesschildren = (n: Element, i: number) => { let c: ChildNode; while ((c = n.childNodes[i])) { c.remove() } }
let iswebcomponent = (h: HElement) => (h.tag as string).includes('-')
let isclasscomponent = (h: HComp): h is HCompClass => (h.tag as any)?.prototype?.view
let iselement = (h: any): h is HElement => typeof h.tag == "string"
let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.cn != undefined }
let isobject = (o: any): o is object => typeof o === "object"

let isproperty = (name: string, value: any) => (
    ['value', 'checked', 'disabled', 'className', 'style', 'href', 'src', 'selected', 'readOnly', 'tabIndex',].includes(name)
    || value instanceof Object
    || value instanceof Function
)

let setprops = (e: Element, newprops: Props = {}) => {
    let oldprops = evaluate(e.h?.p) ?? {}
    for (let p in oldprops) (!(p in newprops)) && isproperty(p, oldprops[p]) ? (e as any)[p] = null : e.removeAttribute(p)
    for (let p in newprops) isproperty(p, newprops[p]) ? (e as any)[p] = newprops[p] : e.setAttribute(p, newprops[p])
}

/** syncs at position i of p. returns the number of the element past the last added element.
 * if no element was added (eg when h=null) then it returns i
 * if a fragment with 5 nodes was added, it returns i + 5
 * when a single element or component is added, it is i+1 since they always create exactly 1 node
*/
function sync(p: Element, i: number, h: Expr<H | undefined>, uc: UpdateContext): number {

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

        /** synchronizes children starting at the i-th element. returns the index of the last child synchronized */
        function syncchildren(p: Element, h: HElement | HComp | HFragment, i: number): number {
            evaluate(h.cn)?.flat().forEach(hc => i = sync(p, i, hc, uc))
            return i
        }

        if (isfragment(h)) return syncchildren(p, h, i)

        const props = evaluate(h.p)

        if (iselement(h)) {

            let n: Element

            if ((<Element>c)?.tagName != h.tag) {
                n = document.createElement(h.tag)
                c ? c.replaceWith(n) : p.appendChild(n)
                setprops(n, props)
                props?.mounted?.(n)
            } else {
                n = c as Element
                setprops(n, props)
                if (props?.update?.(c, uc)) return i + 1
            }
            n.h = h

            if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) { // tbd: make "island" attribute
                const j = syncchildren(n, h, 0)
                removeexcesschildren(n, j)
            }
            return i + 1
        }

        switch (typeof h.tag) {

            case 'function':

                let isupdate = c?.h?.tag == h.tag

                let ci: IClassComponent | undefined

                if (isclasscomponent(h)) {
                    h.i = ci = (c?.h as HCompClass)?.i ?? rebind(new h.tag(props))
                    ci.props = props

                    // if component instance returns truthy for update(), then syncing is susbstituted by the component
                    if (isupdate && ci.update(uc)) return i + 1
                }

                // materialize the component
                // we run compoents view() and fun code often, we do not compare properties to avoid their computation
                // this means that the inner hr (h resolved) is run often
                let hr = ci?.view() ?? (h.tag as FComponent)(props, evaluate(h.cn))

                // a component can return undefined or null if it has no elements to show
                if (hr === undefined || hr == null) return i

                let j = sync(p, i, hr, uc)

                let cn = p.childNodes[i]!
                cn.h = h    // attach h onto the materialized component node

                if (ci) ci.element = cn
                if (!isupdate) ci?.mounted()

                return j

            case 'object':
                return sync(p, i, h.tag, uc) // tbd: type of h is not correct, h.tag == never
        }
    }
    // text nodes
    synctextnode(h as string)
    return i + 1
}

export function patch(e: Node, h: Expr<H>, uc: UpdateContext = {}) {
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call<any, any, any>(p.childNodes, e)
    // always called deferred, because removing elements can trigger events and their handlers (like blur)
    requestAnimationFrame(() => sync(p, i, h, uc))
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

