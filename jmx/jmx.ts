import { mount } from '../base/common'
import "../util/common"

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

function isproperty(name: string, value: any) {
    return (
        [
            'value',
            'checked',
            'disabled',
            'className',
            'style',
            'href',
            'src',
            'selected',
            'readOnly',
            'tabIndex',
        ].includes(name) ||
        value instanceof Object ||
        value instanceof Function
    )
}


function rebind(o) {
    let proto = Object.getPrototypeOf(o)
    let names = Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([, p]) => p.value instanceof Function)
        .filter(([name]) => name != 'constructor')
        .map(([name]) => name)
    for (const name of names) o[name] = o[name].bind(o)
    return o
}

/** remove all children from n with index >= i */
let removeexcesschildren = (n: Element, i: number) => {
    console.log("removeexcesschildren", n.tagName, i)
    let c: ChildNode; while ((c = n.childNodes[i])) c.remove()
}

let iswebcomponent = (h: HElement) => (h.tag as string).includes('-')

const evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

// let iscomp = (h: H): h is HCompFun => typeof ((h as any).tag) == "function"

let isclasscomponent = (h: HTFC): h is HCompClass => (h.tag as any)?.prototype?.view

function evalComponent(h: HComp, n?: Node): H {

    if (h.kind != "component") throw "evalComponent called with non-component"

    let props = h.props?.eval()

    if (isclasscomponent(h)) {
        let i = (n?.h as HCompClass).i ??= rebind(new h.tag(props!)) // rebind is important for simple event handlers
        i.props = props
        return i.view() // inefficient: we compute view() although we do not use if then the component has an update function
    } else {
        return h.tag(props, evaluate(h.children))
    }
}

let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.children != undefined }
//let isfragment2 = (h: any): h is any => { return h.tag instanceof Function && h.children == undefined && h.props == undefined }

function sync(p: Element, i: number, h: H | undefined, uc: UpdateContext): number {

    console.log('%csync', "background:orange", p.tagName, i, h, 'html = ' + document.body.outerHTML)

    if (h === null || h === undefined) return i // skip this element

    h = evaluate(h)
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

            if (isfragment(h)) return syncchildren2(evaluate(h.children), p, i, uc)

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

            switch (typeof h.tag) {

                case 'function':
                    return sync(p, i, evalComponent(h as HComp, c), uc) //otherwise continue with the computed h

                case 'string':
                    let n = syncelement(h.tag as string) // tbd: order of this line right and good?
                    if (!uc.patchElementOnly && !iswebcomponent(h as HElement)) {
                        const j = syncchildren(n, h, 0, uc)
                        removeexcesschildren(n, j)
                    }
                    return i + 1

                case 'object':
                    switch (h.kind) {

                        case "<>":
                            console.log(h)
                            throw "case <>"

                        case "component":
                            console.log(h)
                            return sync(p, i, h.tag, uc)
                    }
            }
    }

    throw "invalid execution - code is wrong"
}



// function evaluatefragment(c: HTag | HComp | HFragment) : H[] {
//     if (c.tag && isfragment(c.tag) return evaluate(evaluate(c.tag).children)
//         throw ""
// }


// mount({ isfragment, isfragment2, evaluate })

function syncchildren2(cn: ChildrenH, p: Element, i: number, uc): number {
    cn.forEach(hc => i = sync(p, i, hc, uc))
    return i
}

/** synchronizes children starting at the i-th element.
 *  returns the index of the last child synchronized */
function syncchildren(p: Element, h: HElement | HComp, i: number, uc: UpdateContext): number {
    evaluate(h.children)?.forEach(hc => {
        let i0 = i
        i = sync(p, i, hc, uc)
        let cn = p.childNodes[i0] // this node might not exist before the sync call
        if (cn && !cn.h) cn.h = hc as any // the node here might not exist before the call to sync // tbd, make this nicer
    })

    return i
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

// lib
export let When = ({ cond }, { children }) => cond && { children }

export abstract class BaseComp<P extends Props> implements IClassComponent {
    element: Node

    constructor(public props: P) { } // we do this for jsx. at runtime, we pass the props directly
    mounted(n: Node) { }
    update(uc: UpdateContext): boolean {
        return false
    }
    updateview() {
        updateview(this.element)
    }

    abstract view()
}

let iscomponent = (h): h is HComp => h.kind == "component"
let iselement = (h): h is HComp => h.kind == "element"
let isfrag = (h): h is HFragment => h.kind == "<>"

mount({ iscomponent, iselement, isfrag, evalComponent })

let z: Expr<H>

function eve(expr: Expr<H | undefined>) {
    let h = evaluate(expr)
    if (h == undefined) return h
    if (iscomponent(h)) return evalComponent(h)
    if (isfrag(h)) return evaluate(h.children)
    return h
}

mount({ eve })

mount({ eve })
