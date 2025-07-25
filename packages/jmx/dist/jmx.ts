import { mount, rebind } from './base'
import { Expr, FComponent, H, HComp, HCompClass, HCompFun, HElement, HFragment, IClassComponent, Props, Selector, Selectors, IUpdateContext } from './h'

const enum NodeType { // vaporizes (but for that must be in this file, otherwise not)
    TextNode = 3,
}

// configuration
declare global {
    interface Window {
        jmx: {
            create: (tagName: string) => Element;
        }
    }
}

(globalThis as any).jmx = {
    create: (tagName: string) => document.createElement(tagName)
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

let clean = (o: Record<string, any>) => { for (let k in o) o[k] === undefined && delete o[k] }

let setprops = (e: Element, newprops: Props = {}) => {
    let oldprops = evaluate(e.h?.p) ?? {}
    clean(newprops)
    for (let p in oldprops) {
        if (!(p in newprops)) {
            if (isproperty(p, oldprops[p])) {
                (e as any)[p] = null
            }
            else {
                e.removeAttribute(p)
            }
        }
    }
    for (let p in newprops) isproperty(p, newprops[p]) ? (e as any)[p] = newprops[p] : e.setAttribute(p, newprops[p])

    // for (let p in newprops) {
    //     let newval = newprops[p]
    //     let del = p === undefined
    //     isproperty(p, newval) ? (e as any)[p] = newval : del ? e.removeAttribute(p) : e.setAttribute(p, newval)
    // }
}

/** syncs at position i of p. returns the number of the element past the last added element.
 * if no element was added (eg when h=null) then it returns i
 * if a fragment with 5 nodes was added, it returns i + 5
 * when a single element or component is added, it is i+1 since they always create exactly 1 node
*/
function sync(p: Element, i: number, h: Expr<H | undefined>, uc: IUpdateContext): number {

    // console.log('%csync', "background:orange", p.tagName, i, h)

    h = evaluate(h)
    if (h === null || h === undefined || h === false || h === true) return i // this is jsx standard behavior

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
                n = window.jmx.create(h.tag)
                c ? c.replaceWith(n) : p.appendChild(n)
                setprops(n, props)
                props?.mounted?.(n)
            } else {
                n = c as Element
                if (props?.const && n.hasAttribute("const")) {
                    return i + 1
                }
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

                // tbd: code review this part

                let isupdate = c?.h?.tag == h.tag
                let state: FunCompState

                let ci: IClassComponent | undefined

                if (isclasscomponent(h)) {
                    h.i = ci = (c?.h as HCompClass)?.i ?? rebind(new h.tag(props))
                    ci.props = props

                    // if component instance returns truthy for update(), then syncing is susbstituted by the component
                    if (isupdate && ci.update(uc)) return i + 1
                }
                else {
                    state = p.childNodes[i]?.state as any
                    if (uc.functionnode?.h == h) {
                        return sync(p, i, c.hr, uc)
                    }
                    if (state?.uc) {
                        //console.log("yeah")
                        state.updateglobal()
                        return i + 1
                    }
                    //console.log("state >>>", state)
                }

                // materialize the component
                // we run compoents view() and fun code often, we do not compare properties to avoid their computation
                // this means that the inner hr (h resolved) is run often

                let hr = ci?.view() ?? (h.tag as FComponent).bind(state ??= (h.tag.state ?? new FunCompState()))(props, evaluate(h.cn))

                // a component can return undefined or null if it has no elements to show
                if (hr === undefined || hr == null) return i

                let j = sync(p, i, hr, uc)

                let cn = p.childNodes[i]!
                cn.h = h    // attach h onto the materialized component node
                cn.hr = hr as any // tbd - nested functions !?
                Object.assign(cn, { h, state })
                if (state) state.element ??= cn

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

export function patch(e: Node | null, h: Expr<H>, uc: IUpdateContext = {}) {
    if (!e) return
    if (uc.replace) (e as HTMLElement).replaceChildren()
    const p = e.parentElement as HTMLElement
    const i = [].indexOf.call<any, any, any>(p.childNodes, e)
    sync(p, i, h, uc)
}

// export function patch3(e: Node | null, h: Expr<H>, uc: IUpdateContext = {}) {
//     if (!e) return
//     if (uc.replace) (e as HTMLElement).replaceChildren()
//     const p = e.parentElement as HTMLElement
//     const i = [].indexOf.call<any, any, any>(p.childNodes, e)
//     // call deferred, because removing elements can trigger events and their handlers (like blur)
//     sync(p, i, h, uc)
// }

// export function patch2(e: Node | null, h: Expr<H>, uc: IUpdateContext = {}) {
//     if (!e) return
//     if (uc.replace) (e as HTMLElement).replaceChildren()
//     const p = e.parentElement as HTMLElement
//     const i = [].indexOf.call<any, any, any>(p.childNodes, e)
//     // always called deferred, because removing elements can trigger events and their handlers (like blur)
//     return new Promise<void>((resolve) => {

//         requestAnimationFrame(() => {

//             // Your animation logic here
//             //console.log("Animation frame starts")
//             sync(p, i, h, uc)
//             //console.log("Animation frame done")

//             // Resolve the promise after the frame completes
//             resolve()
//         })
//     })

// }


// Overload signatures


//export function updateview(uc: UpdateContext, ...selectors: Selectors): void;
//export function updateview(...selectors: Selectors): void;

// class UpdateContext implements IUpdateContext {

// }

let isselector = (x: any): x is Selector => typeof x === "string" || x instanceof Node

// Implementation
export function updateview(...us: Selectors): Promise<void> {
    {
        // console.log('%cupdateview', "background:violet;color:white;padding:2px", us)

        //default parameter
        if (!us.length) us = [document.body]

        let uc: IUpdateContext

        let u0 = us[0]
        if (!isselector(u0)) {
            uc = u0!
            us = us.slice(1) as any
        }

        return new Promise<void>((resolve) => {

            requestAnimationFrame(() => {

                (us as Selector[])
                    .flatMap(x => (typeof x == 'string') ? [...(uc?.root ?? document).querySelectorAll(x)] : [x])
                    .forEach(e => {
                        if (!e?.h) throw 'jmx: no h exists on the node'
                        patch(e, e.h, uc)
                    })

                resolve()
            })
        })
    }
}

export function jsx(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
export function jsxf(): HElement { throw 'jmx plugin not configured' } // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it

mount({ updateview })

class FunCompState {

    element!: HTMLElement// | undefined
    uc?: IUpdateContext

    update(...us: Selectors) {

        // console.log("fun update")

        // update()
        if (!us.length) {
            updateview({ functionnode: this.element }, this.element)
            return
        }

        let uc: IUpdateContext
        let usx: Selector[]
        let u0 = us[0]
        if (!isselector(u0)) {
            uc = u0!
            const [_, ...ss] = us // as Selector[]
            usx = ss
        }
        else {
            uc = {}
            usx = us as Selector[]
        }
        uc.root = this.element
        uc.functionnode = this.element

        if (!usx.length) usx = [this.element]

        updateview(uc, ...usx)
        // if (ss[0] == this.element) {
        //     patch3(this.element, this.element.hr!)
        // }
        // else {
        //     console.log("else - non full fun comp update")
        //     updateview({ root: this.element }, ...ss)
        // }
    }

    updateglobal() {
        if (this.uc == "*") this.uc = this.element //adjust *, because setting this.element does not work
        this.update(...this.uc)
    }
}