/* eslint-disable @typescript-eslint/ban-types */
import { setape } from './props'
import { iswebcomponent, rebind, removeexcesschildren } from './utils'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3
}

export function jsx(): HTag { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it

export const jsxf = (props, { children }) => ({ tag: 'jsxf', children })

const evaluate = <T>(expr: T | Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

let istag = (h: H): h is HTagComp => typeof h == "object"

let iscomp = (h: H): h is HFunction => typeof ((h as any).tag) == "function"

let isclasscomponent = (h: HTFC): h is HClass => (h.tag as any).prototype?.view

function evalComponent(h: HComp, n: Node | undefined): H {

    console.log("evalComponent", h, n)

    const props = evaluate(h.props)
    let isupdate = n?.h?.tag == h.tag // was was already computed with this h
    console.log("isupdate", isupdate)

    if (isclasscomponent(h)) {
        // HClass
        let hc: HClass
        if ((hc = n?.h as HClass)?.i) {
            // instance available
            console.log("class update")
        }
        else {
            //n.h = hc = h
            (hc = h).i = rebind(new h.tag()) // rebind is important for simple event handlers
        }
        hc.i.props = props
        return hc.i.view() // inefficient: we compute view() although we do not use if then the component has an update function
    } else {
        // HFunction
        let f: FComponent = h.tag
        let cn = evaluate(h.children)
        return f(props, cn)
    }
}

function syncelement(p: HTMLElement, i: number, tag: string, props: Props | undefined, comp?: FComponent): HTMLElement {
    const c: any = p.childNodes[i]
    if (!c || c.tagName != tag) {
        const n = document.createElement(tag)
        c ? c.replaceWith(n) : p.appendChild(n)
        setape(n, props, false, false)
        props?.mounted?.(n)
        return n
    } else {
        setape(c, props, true, false)
        props?.update?.(c)
        return c
    }
}

function synctextnode(p: HTMLElement, i: number, text) {
    const c = p.childNodes[i]
    if (c && c.nodeType == NodeType.TextNode) {
        if (c.textContent != text) c.textContent = text // firefox updates even equal text, loosing an existing text selection
    } else {
        const tn = document.createTextNode(text)
        c ? c.replaceWith(tn) : p.appendChild(tn)
    }
}

/**
 * synchronizes p.children[i] with h
 */
function sync(p: HTMLElement, i: number, h: H, uc: UpdateContext): number {

    console.log("sync", p.tagName, i, h, p.childNodes[i])

    switch (typeof h) {

        // text nodes
        case 'string':
        case 'number':
        case 'boolean':
            synctextnode(p, i, h) //not sure if we need toString() here
            return i + 1

        case 'object':
            switch (typeof h.tag) {

                case 'function':

                    const h2 = evalComponent(h as HComp, p.childNodes[i])
                    let r = h2 ? sync(p, i, h2, uc) : i // can be null, if function component returns null | undefined
                    return r

                case 'string': {
                    switch (h.tag) {

                        case 'jsxf':
                            return syncchildren(p, h, i, uc)

                        default:

                            let props = evaluate(h.props)
                            let n = syncelement(p, i, h.tag, props)

                            if (props?.update) {
                                // call patch() instead of processing children
                                // this allows data islands as used for a maplibre object: <div id="map" patch={() => { }}></div>
                                props.update(n)
                            } else if (n.h?.i?.update) {
                                // call update() instead of processing children
                                let o = n.h?.i
                                o.update?.(uc)
                            } else if (!uc.patchElementOnly && !iswebcomponent(h as HTag)) {
                                // standard children processing
                                const j = syncchildren(n, h, 0, uc)
                                removeexcesschildren(n, j)
                            }

                            return i + 1
                    }
                }
            }
        default:
            throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`
    }
}

/** synchronizes children starting at the i-th element.
 *  returns the index of the last child synchronized */
function syncchildren(e: HTMLElement, h: HTag | HComp, i: number, uc: UpdateContext): number {

    console.log("synchchildren", e.tagName, h, i);

    (evaluate(h.children) ?? [])
        .flatMap(evaluate)
        .filter(c => c !== null && c !== undefined) //as H[]
        .forEach(hc => {
            let i0 = i
            i = sync(e, i, hc, uc)
            let cn = e.childNodes[i0]

            //   console.log("hc", hc)

            if (iscomp(hc)) {

                console.log("comp", hc, cn)

                if(!cn.h){

                    console.log("mounted!")

                    if (isclasscomponent(hc)) { // if element is not yet set, the component was newly created
                        hc.i.element = e
                        hc.i.mounted?.(e)
                    }
                    else{
                        console.log("fun component mounted")
                    }

                    cn.h = hc // the node here might not exist before the call to sync
                }
            }
        })

    return i
}

// patches given dom and comp
export function patch(e: Node, h: H, uc: UpdateContext = {}) {
    //console.log("%cpatch", `background:orange;color:white;padding:2px;font-weight:bold`, e, h)
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call(p.childNodes, e) // tell typescript that parentElement is not null
    e.h = h as any
    sync(p, i, h, uc)
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
        if (!n.h) throw ["cannot update, because html was not created with jmx: no h exists on the node", n]
        patch(n, n.h, uc)
    }
}

// lib
export let When = ({ cond }, { children }) => cond && jsxf(null, { children })

export abstract class BaseComp<P extends any> implements IClassComponent {
    element: Node
    updateview() { updateview(this.element) }
    abstract view()
}