/* eslint-disable @typescript-eslint/ban-types */
import { setape } from './props'

function rebind(o) {
    let proto = Object.getPrototypeOf(o)
    let names = Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([, p]) => p.value instanceof Function)
        .filter(([name]) => name != 'constructor')
        .map(([name]) => name)
    for (const name of names) o[name] = o[name].bind(o)
    return o
}

// the following types describe the js expression we get from tsx after conversion be our jmx plugin

// dumy function for app code - jmxplugin removes calls to this function
export function jsx(): HTag { throw 'jmx plugin not configured' } // later

type Expr<T> = () => T

type ChildrenH = (H | undefined)[]
type Children = Expr<ChildrenH>

//declare type ActionT<T> = (arg: T) => void

type Props = Record<string, any>

type FComponent = (props: Props | undefined, children?: ChildrenH) => HTag // show an example for usage of children

type UpdateContext = {
    patchElementOnly?: boolean
    replace?: boolean
    [key: string]: any
}

interface IClassComponent {
    element: Node
    props: any
    //children: Children //tbd ??
    view(): H
    update?: (uc: UpdateContext) => void
    mounted?: (n: Node) => void
}

interface CComponent {
    new(props: any): IClassComponent
}

class BaseComp<P extends any> implements IClassComponent {
    element: Node
    constructor(public props: P) { }
    updateview() { updateview(this.element) }
    view(): any { return 'tbd' }
}

type HTag =
    {
        tag: string,
        props?: Expr<Props>
        children: Children
        i?: any
    }
type HFunction =
    {
        tag: FComponent,
        props?: Expr<Props>
        children?: Children
    }
type HClass =
    {
        tag: CComponent,
        props?: Expr<Props>
        children: Children
        i?: IClassComponent
    }
type HComp = HFunction | HClass
type H = // a hyperscript atom that describes a ...
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that
    | HTag // a tag, like p, div with attributes and children
    | HComp // a dynamic component computing any other HNode
type HTFC = HTag | HFunction | HClass

export { HTag, HFunction, FComponent }

/////////////////////////

let Numero = ({ n }): HTag => ({
    tag: "DIV",
    props: () => ({ class: "carrots" }),
    children: () => [n]
})

let m: any


class Map extends BaseComp<{ a: number; s: string }> {

    state = 500;

    increment() {
        this.state++
        this.updateview()
    }
    update() {
        console.log("updating", this, arguments)
    }
    view() {
        return {
            tag: "DIV",
            props: () => ({
                class: "map"
            }),
            children: () => ["map ", JSON.stringify(this.props.a), " - ", this.state, {
                tag: "DIV",
                props: null,
                children: () => [{
                    tag: "BUTTON",
                    props: () => ({
                        onclick: this.increment
                    }),
                    children: () => ["increment"]
                }]
            }]
        }
    }
}

let App = {
    tag: "BODY",
    props: null,
    children: () => [{
        tag: "DIV",
        props: null,
        children: () => ["hase mit ", {
            tag: Numero,
            props: () => ({
                n: m.i
            }),
            children: () => []
        }, " karotten ente mit ", {
                tag: Numero,
                props: () => ({
                    n: m.i
                }),
                children: () => []
            }, " schnecken", {
                tag: Map,
                props: () => ({
                    a: m.i,
                    s: "hase"
                }),
                children: () => []
            }, {
                tag: "UL",
                props: null,
                children: () => [{
                    tag: "LI",
                    props: null,
                    children: () => ["aa"]
                }, {
                    tag: "LI",
                    props: null,
                    children: () => ["bb"]
                }]
            }]
    }]
}



/////////////////////////

// api
declare global {
    interface HTMLElement {
        events?: any // holds event listeners, so we can remove them
        model: any
    }
    interface Node {
        h?: HTFC
        mounted?: (e: Element) => void
        update?: (e: Element) => void
    }
}

// export class CompInfo {
//     constructor(public h: H, public i?: IClassComponent) { }
// }

export const jsxf = (props, { children }) => {
    return { tag: 'jsxf', children }
}

const evaluate = <T>(expr: T | Expr<T>): T => {
    return expr instanceof Function ? evaluate(expr()) : expr
}

let isClassComponent = (h: HTFC): h is HClass => (h.tag as any).prototype?.view

function evalComponent(h: HComp, n: Node): H {

    console.log("evalComponent", h, n)

    const props = evaluate(h.props)
    console.log("die props", props)


    let isupdate = n?.h?.tag === h.tag // was was already computed with this h

    if (isClassComponent(h)) {
        // HClass
        if (!isupdate) {
            // create new
            h.i = rebind(new h.tag(props)) // rebind is important for simple event handlers
        } else {
            // update
            h.i!.props = props //new props
        }
        return h.i!.view() // inefficient: we compute view() although we do not use if then the component has an update function
    } else {
        // HFunction
        let f: FComponent = h.tag
        let cn = evaluate(h.children)
        return f(evaluate(h.props), cn)
        //let comp = isupdate ? (n!.h) : h
        //return [h.tag(props, { children: h.children, comp }), comp]
    }
}

function removeexcesschildren(n: HTMLElement, i: number) { while (n.childNodes[i]) n.childNodes[i].remove() }

function createElement(tag) { return document.createElement(tag) }

function syncelement(p: HTMLElement, i: number, tag: string, props: Props | undefined, comp?: FComponent): HTMLElement {
    const c: any = p.childNodes[i]
    if (!c || c.tagName != tag) {
        const n = createElement(tag)
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

function setcomp(e: Element, htag: HTFC) {

    console.log("setcomp", e, htag)

    // attach component info only on function or class components instead of the every html element:
    // if(typeof ((comp?.factory as any).tag) != "function" ) return

    //e.h = htag

    // class component, first time, instance must have been set before
    if (isClassComponent(htag)) {
        htag.i!.element = e

        console.log("mounted tbd")

        //htag.i?.mounted?.(e)

    }

    // debug
    //e.setAttribute('comp', getHName(htag)!)
}

function getHName(h: H) {
    switch (typeof h) {
        case 'string':
        case 'number':
            return h.toString()
        case 'object':
            switch (typeof h.tag) {
                case 'string':
                    return h.tag.toLowerCase()
                default:
                    return h.tag.name
            }
    }
}

const iswebcomponent = (h: HTag) => (h.tag as string).includes('-')

function sync(p: HTMLElement, i: number, h: H, uc: UpdateContext): number {

    console.log("sync", p.tagName, i, h, p.childNodes[i])
    let syncchildren = !uc.patchElementOnly

    switch (typeof h) {
        case 'string':
        case 'number':
        case 'boolean':
            synctextnode(p, i, h.toString())
            return i + 1

        case 'object':
            switch (typeof h.tag) {
                case 'function':
                    // let cc = p.childNodes[i]?.h?.i
                    // if (cc?.constructor === h.tag && cc.update) {
                    //     cc.update?.(uc)
                    //     return i + 1
                    // }
                    console.log("tbd: update life cycle methods")

                    const hresolved = evalComponent(h as HComp, p.childNodes[i])
                    let r = hresolved ? sync(p, i, hresolved, uc) : i // can be null, if function component returns null | undefined

                    console.log("können wir hier h setzen? das element sollte ja jetzt da sein?", r, p.childNodes[i], hresolved, h)
                    setcomp(p.childNodes[i] as HTMLElement, h)

                    return r

                case 'string': {
                    switch (h.tag) {
                        case 'jsxf':
                            return syncChildren(p, h, i, uc)

                        default:
                            const props = evaluate(h.props)
                            const n = syncelement(p, i, h.tag, props)

                            if (props?.patch) {
                                // call patch() instead of processing children
                                props?.patch(n)
                            } else if (n.h?.i?.update) {
                                // call update() instead of processing children
                                let o = n.h?.i
                                o.update?.(uc)
                            } else if (syncchildren && !iswebcomponent(h as HTag)) {
                                // standard children processing
                                const j = syncChildren(n, h, 0, uc)
                                removeexcesschildren(n, j)
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

// lib
export const When = ({ cond }, { children }) => cond && jsxf(null, { children })
