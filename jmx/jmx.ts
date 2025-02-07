/* eslint-disable @typescript-eslint/ban-types */
import { setape } from './props'
import { rebind, removeExcessChildren } from './utils'

// dumy function for app code - jmx-plugin removes calls to this function
export function jsx(): HTag { throw 'jmx plugin not configured' } // later

export const jsxf = (props, { children }) => ({ tag: 'jsxf', children })

const evaluate = <T>(expr: T | Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

let isClassComponent = (h: HTFC): h is HClass => (h.tag as any).prototype?.view

function evalComponent(h: HComp, n: Node): H {

    const props = evaluate(h.props)
    let isupdate = n?.h === h // was was already computed with this h
    console.log("isupdate", isupdate)

    if (isClassComponent(h)) {
        // HClass
        if (!isupdate) h.i = rebind(new h.tag()) // rebind is important for simple event handlers
        h.i!.props = props
        return h.i!.view() // inefficient: we compute view() although we do not use if then the component has an update function
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
    if (c && c.nodeType == 3) {
        if (c.textContent != text) c.textContent = text
    } else {
        const tn = document.createTextNode(text)
        c ? c.replaceWith(tn) : p.appendChild(tn)
    }
}

const iswebcomponent = (h: HTag) => (h.tag as string).includes('-')

function sync(p: HTMLElement, i: number, h: H, uc: UpdateContext): number {

    console.log("sync", p.tagName, i, h, p.childNodes[i])
    let syncchildren = !uc.patchElementOnly

    switch (typeof h) {

        // text nodes
        case 'string':
        case 'number':
        case 'boolean':
            synctextnode(p, i, h.toString())
            return i + 1

        case 'object':
            switch (typeof h.tag) {
                case 'function':

                    console.log("tbd: update life cycle methods")

                    const h2 = evalComponent(h as HComp, p.childNodes[i])
                    let r = h2 ? sync(p, i, h2, uc) : i // can be null, if function component returns null | undefined

                    if (isClassComponent(h)) {
                        let e = p.childNodes[i] as HTMLElement
                        console.log("tbd: do not call mount on every update");

                        h.i!.element = e
                        h.i!.mounted?.(e)
                    }

                    return r

                case 'string': {
                    switch (h.tag) {
                        case 'jsxf':
                            return syncChildren(p, h, i, uc)

                        default:
                            const props = evaluate(h.props)
                            const n = syncelement(p, i, h.tag, props)

                            if (props?.update) {
                                // call patch() instead of processing children
                                // this allows data islands as used for a maplibre object: <div id="map" patch={() => { }}></div>
                                props.update(n)
                            } else if (n.h?.i?.update) {
                                // call update() instead of processing children
                                let o = n.h?.i
                                o.update?.(uc)
                            } else if (syncchildren && !iswebcomponent(h as HTag)) {
                                // standard children processing
                                const j = syncChildren(n, h, 0, uc)
                                removeExcessChildren(n, j)
                            }

                            // setcomp(n, h) // ?? : could attach comps only to elements with id/class property. or could mark nodes in updateview as update targets and then lazily attach comp
                            return i + 1
                    }
                }
            }
        default:
            throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`
    }
}

function syncChildren(e: HTMLElement, h: HTag | HComp, j: number, uc: UpdateContext): number {
    console.log("syncChildren", e.tagName, j)

    const hcn = evaluate(h.children)
        .flatMap(evaluate) // children passed from components
        .filter(c => c !== null && c !== undefined) as H[]
    hcn.forEach(hc => {
        let j0 = j
        j = sync(e, j, hc, uc);
        (e.childNodes[j0]).h = hc as any
        return j
    })
    return j
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

class BaseComp<P extends any> implements IClassComponent {
    element: Node
    constructor(public props: P) { }
    updateview() { updateview(this.element) }
    view(): any { return 'tbd' }
}

// lib
export const When = ({ cond }, { children }) => cond && jsxf(null, { children })
