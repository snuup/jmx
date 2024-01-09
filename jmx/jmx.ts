/* eslint-disable @typescript-eslint/ban-types */
import { rebind, setAttributeSmooth } from "../util/common"
import { setape } from "./props"

// dumy function for app code - jmxplugin removes calls to this function
export function jsx(): HTag { throw "" }

type Expr<T> = () => T

type Children = Expr<(HNode | null)[]>

type FComponent = (Props: Props | null, { children, comp }: { children: Children, comp: CompInfo }) => HTag

// tbd
type CComponent = {
    new(): CComponent
    element: Node
    props: any
    children: Children
    view(): HElement
    update?: () => void
    mounted?: (Node) => void
}

type H = {
    props?: Props
    children: Children
}

type HFunction = { tag: FComponent } & H

type HClassComp = { tag: CComponent } & H

type HTag = { tag: string } & H

type HComp = HFunction | HClassComp

type HElement = HTag | HComp

type HNode = string | number | boolean | HTag | HComp

declare global {

    interface HTMLElement {
        events?: any // holds event listeners, so we can remove them
    }

    interface Node {
        comp: CompInfo
        mounted?: (e: Element) => void
        update?: (e: Element) => void
    }
}

export class CompInfo {

    factory: HNode // will be HComp when jmx finds a component in the tree. only when another HNode is passed to updateview,
    instance?: CComponent
    n: Node

    [key: string]: any // expandos

    constructor(factory, instance?) {
        // console.log("CompInfo", getHName(factory))
        this.factory = factory
        this.instance = instance
    }

    get<T>(ctor: new () => T): T {
        return this[ctor.name] ??= new ctor()
    }

    getr<T>(ctor: new () => T): T {
        let o = this[ctor.name]
        if (o) return o
        // return existing

        // create new
        o = this[ctor.name] = new ctor()
        rebind(o)
        o.comp = this
        return o
    }

    update() { // function components can override this
        patch(this.n, this.factory, false)
    }
}

export const jsxf = (props, { children }) => {
    return ({ tag: "jsxf", props: null, children })
}

const evaluate = <T>(expr: T | Expr<T>): T => {
    return expr instanceof Function ? evaluate(expr()) : expr
}

function isClassComp(h: HComp): h is HClassComp {
    return h.tag.prototype?.view
}

function evalComponent(h: HComp, n: Node | null): [HNode, CompInfo?] {
    //console.log("evalComponent", getHName(h))

    const props = evalprops(h.props)
    let isupdate = ((n?.comp?.factory as HComp)?.tag === h.tag)

    if (isClassComp(h)) {
        let instance = isupdate ? n?.comp.instance as CComponent : rebind(new h.tag()) // reuse state, reuse instance
        instance.props = props // assign props before evaluating view()
        instance.children = h.children
        let comp = isupdate ? n!.comp : new CompInfo(h, instance)
        return [instance.view(), comp] // inefficient: we compute view() although we do not use if then the component has an update function
    }
    else {
        let comp = isupdate ? n!.comp as CompInfo : new CompInfo(h)
        return [h.tag(props, { children: h.children, comp }), comp]
    }
}

function removeexcesschildren(n: HTMLElement, i: number) {
    while (n.childNodes[i]) n.childNodes[i].remove()
}

function evalprops(props): Props | null {
    return props && evaluate(props)
}

function issvg(tag) { // tbd: simplifiy and enhance svg handling
    return ["SVG", "DEFS", "MARKER", "PATH"].includes(tag)
}

function createElement(tag) {
    // console.log(`%ccreateElement ${tag}`, "background:#8f5296;color:white;padding:2px")
    return issvg(tag) ? (document.createElementNS("http://www.w3.org/2000/svg", tag.toLowerCase()) as any) : document.createElement(tag)
}

function syncelement(p: HTMLElement, i: number, tag: string, props: Props | null, comp?: FComponent): HTMLElement {

    const c: any = p.childNodes[i]

    //console.log("syncelement", p, i, c, tag)

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

function setcomp(n: Element, comp?: CompInfo) {
    if (!comp) return
    n.comp = comp
    comp.n = n
    if (comp.instance) comp.instance.element = n
    let name = getHName(comp.factory)
    setAttributeSmooth(n, "comp", name)
    comp.instance?.mounted?.(n)
}

function getHName(h: HNode) {
    switch (typeof h) {
        case "string":
        case "number":
            return h.toString()
        case "object":
            switch (typeof h.tag) {
                case "string":
                    return h.tag.toLowerCase()
                default:
                    return h.tag.name
            }
    }
}

const iswebcomponent = (h: HTag) => (h.tag as string).includes("-")

function sync(p: HTMLElement, i: number, h: HNode, compinfo?: CompInfo, syncchildren = true): number {

    // console.log("sync", p, i, h, compinfo, compinfo && getHName(compinfo.factory))

    switch (typeof h) {

        case "string":
        case "number":
        case "boolean":
            synctextnode(p, i, h.toString())
            return i + 1

        case "object":
            switch (typeof h.tag) {
                case "function":

                    let cc = p.childNodes[i]?.comp?.instance
                    if (cc?.constructor === h.tag && cc.update) {
                        cc.update?.()
                        return i + 1
                    }

                    const [h2, ci] = evalComponent(h as HFunction | HClassComp, p.childNodes[i])
                    return h2 ? sync(p, i, h2, ci) : i // can be null, if function component returns null | undefined

                case "string": {
                    switch (h.tag) {
                        case "jsxf":
                            return syncChildren(p, h, i)

                        default:
                            const props = evalprops(h.props)
                            const n = syncelement(p, i, h.tag, props)

                            if (props?.patch) {
                                // call patch() instead of processing children
                                props?.patch(n)
                            }
                            else if (n.comp?.instance?.update) {
                                // call update() instead of processing children
                                let o = n.comp?.instance
                                o.update?.()
                            }
                            else if (syncchildren && !iswebcomponent(h as HTag)) {
                                // standard children processing
                                const j = syncChildren(n, h, 0)
                                removeexcesschildren(n, j)
                            }

                            setcomp(n, compinfo ?? new CompInfo(h)) // ?? : could attach comps only to elements with id/class property. or could mark nodes in updateview as update targets and then lazily attach comp
                            return i + 1
                    }
                }
            }
        default:
            throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`
    }
}

function syncChildren(e: HTMLElement, h: H, j: number): number {
    const hcn =
        evaluate(h.children)
            .flatMap(evaluate) // children passed from components
            .filter(c => c !== null && c !== undefined && c !== false) as HNode[]
    hcn.forEach(hc => j = sync(e, j, hc))
    return j
}

// patches given dom and comp
export function patch(e: Node, h: HNode, patchElementOnly = false) {
    //console.log("%cpatch", `background:orange;color:white;padding:2px;font-weight:bold`, e, h)
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call(p.childNodes, e) // tell typescript that parentElement is not null
    let comp = (e.comp?.factory as HFunction)?.tag === (h as any).tag ? e.comp as CompInfo : new CompInfo(h)
    sync(p, i, h, comp, !patchElementOnly)
}

// uses attached comps to patch elements
export function updateview(selector: string | Node = "body", patchElementOnly?: false, replace = false) {
    //console.log(`updateview(%c${selector})`, "background:#d2f759;padding:2px")
    const ns = (typeof selector == "string") ? document.querySelectorAll(selector) : [selector]
    let n: Node | null
    for (n of ns) {
        while (n && !n.comp) n = n.parentElement
        if (!n) continue

        if (replace) (n as HTMLElement).replaceChildren()
        patch(n, n.comp.factory, patchElementOnly)
    }
}

// lib
export const When = ({ cond }, { children }) => cond && jsxf(null, { children })
