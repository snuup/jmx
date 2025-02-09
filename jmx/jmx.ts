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

let iswebcomponent = (h: HTag) => (h.tag as string).includes('-')

const evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

let iscomp = (h: H): h is HFunction => typeof ((h as any).tag) == "function"

let isclasscomponent = (h: HTFC): h is HClass => (h.tag as any)?.prototype?.view

function sync(p: Element, i: number, h: H | Func<H>, uc: UpdateContext): number {

    // console.log('%csync', "background:orange", p.tagName, i, h, 'html = ' + document.body.outerHTML)

    if (h === null || h === undefined) return i // skip this element

    h = evaluate(h)
    const props = evaluate(h.props)
    const c = p.childNodes[i] // is often null, eg during fresh creation

    function synctextnode(text: string) {
        if (c && c.nodeType == NodeType.TextNode) {
            if (c.textContent != text) c.textContent = text// firefox updates even equal text, loosing an existing text selection
        } else {
            const tn = document.createTextNode(text)
            c ? c.replaceWith(tn) : p.appendChild(tn)
        }
    }

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

    function evalComponent(h: HComp, n: Node | undefined): H {

        if (isclasscomponent(h)) {
            let i = (n?.h as HClass).i ??= rebind(new h.tag(props!)) // rebind is important for simple event handlers
            i.props = props
            return i.view() // inefficient: we compute view() although we do not use if then the component has an update function
        } else {
            return h.tag(props, evaluate(h.children))
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

            switch (typeof h.tag) {

                case 'function':
                    return sync(p, i, evalComponent(h as HComp, c), uc) //otherwise continue with the computed h

                case 'string':
                    let n = syncelement(h.tag as string) // tbd: order of this line right and good?
                    if (!uc.patchElementOnly && !iswebcomponent(h as HTag)) {
                        const j = syncchildren(n, h, 0, uc)
                        removeexcesschildren(n, j)
                    }
                    return i + 1
            }
    }

    throw "invalid execution - code is wrong"
}

let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.children != undefined }
let isfragment2 = (h: any): h is any => { return h.tag instanceof Function && h.children == undefined && h.props == undefined }

function getchildren(h: HTag | HComp) {
    return (evaluate(h.children) ?? [])
        //.log("children")
        .flatMap(h => isfragment2(h) ? evaluate(evaluate(h.tag).children) : h)
        .flatMap(c => ((c as any).tag && isfragment((c as any).tag) ? evaluate(c?.tag?.children) : c))
        .filter(c => c !== null && c !== undefined) //as H[]
}

/** synchronizes children starting at the i-th element.
 *  returns the index of the last child synchronized */
function syncchildren(p: Element, h: HTag | HComp, i: number, uc: UpdateContext): number {
    // console.log('synchchildren', p.tagName, h, i)

    getchildren(h).forEach(hc => {

        let i0 = i
        i = sync(p, i, hc, uc)
        let cn = p.childNodes[i0] // this node might not exist before the sync call

        // life cycle calls -disabled for a moment
        // if (iscomp(hc)) {
        //     if (!cn.h) {
        //         if (isclasscomponent(hc)) {
        //             // if element is not yet set, the component was newly created
        //             hc.i.element = cn
        //             hc.i.mounted?.(cn)
        //         } else {
        //             let props = evaluate(hc.props)
        //             if (props) {
        //                 props.mounted?.(cn as Element)
        //             }
        //         }
        //     }
        // }

        if (cn && !cn.h) cn.h = hc as any // the node here might not exist before the call to sync // tbd, make this nicer
    })

    return i
}

export function jsx(): HTag { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it

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
