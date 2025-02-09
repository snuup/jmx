import { mount } from '../base/common'

export function rebind(o) {
    let proto = Object.getPrototypeOf(o)
    let names = Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([, p]) => p.value instanceof Function)
        .filter(([name]) => name != 'constructor')
        .map(([name]) => name)
    for (const name of names) o[name] = o[name].bind(o)
    return o
}

/** remove all children from n with index >= i */
export let removeexcesschildren = (n: HTMLElement, i: number) => { let c: ChildNode; while ((c = n.childNodes[i])) c.remove() }

export let iswebcomponent = (h: HTag) => (h.tag as string).includes('-')


export const evaluate = <T>(expr: Expr<T>): T => expr instanceof Function ? evaluate(expr()) : expr

export let iscomp = (h: H): h is HFunction => typeof ((h as any).tag) == "function"

export let isclasscomponent = (h: HTFC): h is HClass => (h.tag as any)?.prototype?.view

export let isfragment = (h: any): h is HFragment => { return h.tag == undefined && h.children != undefined }
export let isfragment2 = (h: any): h is any => { return h.tag instanceof Function && h.children == undefined && h.props == undefined }

mount({ isfragment, isfragment2 })
