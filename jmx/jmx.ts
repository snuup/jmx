import { mount } from '../base/common'
import { setprops } from './props'
import { iswebcomponent, rebind, removeexcesschildren } from './utils'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3
}

export function jsx(): HTag { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it

export const jsxf = "jsxf" //(props, { children }) => ({ tag: 'jsxf', children })

const evaluate = <T>(expr: T | Func<T>): T => expr instanceof Function ? evaluate(expr()) : expr

let iscomp = (h: H): h is HFunction => typeof ((h as any).tag) == "function"

let isclasscomponent = (h: HTFC): h is HClass => (h.tag as any).prototype?.view

function evalComponent(h: HComp, n: Node | undefined): H {

    // console.log("evalComponent", h, n, "h.tag:", h.tag.toString())

    const props = evaluate(h.props)

    if (isclasscomponent(h)) {
        // HClass
        let hc: HClass
        if ((hc = n?.h as HClass)?.i) {
            hc.i.props = props
            // console.log("best is to cancel view here if update exists")
        }
        else {
            (hc = h).i = rebind(new h.tag(props!)) // rebind is important for simple event handlers
        }
        return hc.i.view() // inefficient: we compute view() although we do not use if then the component has an update function
    } else {
        // HFunction
        let f: FComponent = h.tag
        let cn = evaluate(h.children)
        //let update
        //if (update = n?.h && props?.update) {
        //    update?.(n)
        //console.log("can do: update and exit here!", props?.update?.(n))
        //}

        return f(props, cn)
    }
}

function syncelement(p: HTMLElement, i: number, tag: string, props: Props | undefined): HTMLElement {

    const c: any = p.childNodes[i]

    if (!c || c.tagName != tag) {
        const n = document.createElement(tag)
        c ? c.replaceWith(n) : p.appendChild(n)
        setprops(n, props)
        props?.mounted?.(n)
        return n
    }
    setprops(c, props)
    props?.update?.(c)
    return c
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

function getupdatefunction(h: HTFC, e: Node | undefined) {
    if (e?.h?.tag != h.tag) return // update only if the new h is the same component
    if (isclasscomponent(h)) return (e.h as HClass).i.update
    else return evaluate(h.props)?.update
}

/**
 * synchronizes p.children[i] with h
 */
function sync(p: HTMLElement, i: number, h: H | Func<H>, uc: UpdateContext): number {

    // console.log("sync", p.tagName, i, h, p.childNodes[i], h.tag?.toString())

    h = evaluate(h)

    switch (typeof h) {

        // text nodes
        case 'string':
        case 'number':
        case 'boolean':
            synctextnode(p, i, h) //not sure if we need toString() here
            return i + 1

        case 'object':

            let e = p.childNodes[i]
            if (getupdatefunction(h, e)?.(uc)) return i + 1

            switch (typeof h.tag) {

                case 'function':

                    const h2 = evalComponent(h as HComp, e)
                    if (!h2) return i // can be null, if function component returns null | undefined
                    return sync(p, i, h2, uc)

                case 'string':

                    switch (h.tag) {

                        case 'jsxf':
                            return syncchildren(p, h, i, uc)

                        default:
                            let props = evaluate(h.props)
                            let n = syncelement(p, i, h.tag, props) // tbd: order of this line right and good?
                            // if (update(uc)) {
                            // } else
                            if (!uc.patchElementOnly && !iswebcomponent(h as HTag)) {
                                // default children processing
                                const j = syncchildren(n, h, 0, uc)
                                removeexcesschildren(n, j)
                            }
                    }
                    break

                case 'object':
                    // this case occurs when a fragment without thunk is nested, when a fragment is assigned to a variable
                    if ((h.tag as any)?.tag == jsxf) { // tbd, express this as typescript type
                        console.log("jsxf??? !!!")
                        return sync(p, i, h.tag, uc)
                    }


            }
            return i + 1
        default:
            throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`
    }
}

/** synchronizes children starting at the i-th element.
 *  returns the index of the last child synchronized */
function syncchildren(p: HTMLElement, h: HTag | HComp, i: number, uc: UpdateContext): number {

    // console.log("synchchildren", p.tagName, h, i);

    (evaluate(h.children) ?? [])
        .flatMap(evaluate)
        .filter(c => c !== null && c !== undefined) //as H[]
        .forEach(hc => {
            let i0 = i
            i = sync(p, i, hc, uc)


            let cn = p.childNodes[i0]

            // life cycle calls
            if (iscomp(hc)) {

                if (!cn.h) {
                    if (isclasscomponent(hc)) { // if element is not yet set, the component was newly created
                        hc.i.element = cn
                        hc.i.mounted?.(cn)
                    }
                    else {
                        let props = evaluate(hc.props)
                        if (props) {
                            props.mounted?.(cn as HTMLElement)
                        }
                    }
                }
            }

            console.log("set", cn, cn.h)

            if (cn && !cn.h) cn.h = hc as any // the node here might not exist before the call to sync // tbd, make this nicer
        })
    return i
}

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
        if (!n.h) throw ["cannot update, because html was not created with jmx: no h exists on the node", n]
        patch(n, n.h, uc)
    }
}

// lib
export let When = ({ cond }, { children }) => cond && { tag: 'jsxf', children }

export abstract class BaseComp<P extends Props> implements IClassComponent {

    element: Node

    constructor(public props: P) { } // we do this for jsx. at runtime, we pass the props directly
    mounted(n: Node) { }
    update(uc: UpdateContext): boolean { return false }
    updateview() { updateview(this.element) }

    abstract view()
}

mount({ jsxf })