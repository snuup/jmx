//const EMPTYOBJECT = {}

// special handling of attributes: https://github.com/jorgebucaran/hyperapp/blob/main/index.js

// export function P<T>(x: T): T {
//     return ((typeof x === "number") ? new Number(x) : new String(x)) as T
// }

declare global {
    interface HTMLElement {
        events?: any // holds event listeners, so we can remove them
        propsset?: Action<void>
    }
}

export function setape(e: HTMLElement, newprops: Props = {}) {

    // remove all attributes that do not occur in props
    //e.getAttributeNames().forEach(a => a in newprops || e.removeAttribute(a))

    let oldprops = e.h?.props?.() ?? {}
    for (let p in oldprops) {
        if (p in newprops) {
            // re-set
            console.log("re-set", p)
            e.setAttribute(p, newprops[p])
        } else {
            // delete
            console.log("delete", p)
            if (isevent(p)) {
                console.log("event")
                e[p] = null
            } else if (isproperty(p, newprops[p])) {
                console.log("property")
                e[p] = null // tbd: not sure if that is correct, should be rare border cases where this matters
            } else {
                e.removeAttribute(p)
            }
        }
    }
    for (let p in newprops) {
        if (!(p in oldprops)) {
            // set-fresh
            console.log("set-fresh", p)
            if (isevent(p)) {
                console.log("event")
                e[p] = newprops[p]
            } else if (isproperty(p, newprops[p])) {
                console.log("property")
                e[p] = newprops[p]
            } else {
                console.log("attribute", p)
                e.setAttribute(p, newprops[p])
            }
        }
    }

    //clearprops(n, newprops)
    //if (!newprops) return
    //setprops(n, newprops)
    //n.propsset && n.propsset()
}
// function isref(name) {
//     return name == 'ref'
// }
function isproperty(name: string, value: any) {
    return (
        ['href', 'value', 'model', 'checked', 'mounted', 'fargs'].includes(name)
        ||
        value instanceof Object
        ||
        value instanceof Function
        //||
        //value instanceof Number
    )
        || value === undefined
        || value === null
}
function isevent(name) {
    return name.startsWith('on')
}
// function isattribute(name) {
//     return !isref(name) && !isproperty(name) && !isevent(name)
// }

function evalProperty(value) {
    if (value instanceof Number) return value.valueOf()
    if (value instanceof String) return value.valueOf()
    return value
}

// new all together
function setprops(n, props) {
    // console.log('setprops', n, props)
    let events = {}
    for (let k in props) {
        let value = props[k]
        // ref is a called with the n, the view
        //if (isref(k)) props[k](n)

        if (isevent(k)) {
            events[k] = value
        }
        else if (isproperty(k, value)) setprop(n, k, evalProperty(value))
        else setattr(n, k, value)
    }
    setevents(n, events)
}

function setattr(n, name, value) {
    if (value == null || value === false) n.removeAttribute(name)
    else n.setAttribute(name, value)
}

function clearattrs(e: HTMLElement) {
    e.getAttributeNames().forEach(a => e.removeAttribute(a))
}

// code and comments copied from preact
// https://github.com/developit/preact/blob/8aa7ec9e87e34596d0ec292d12fb9f79135e382f/src/dom/index.js
// export function isprop(e, name) {
//   return name !== 'list' && name !== 'type' && name in e
// }

function setprop(e, name, value) {
    //console.log("setprop", name, value)
    // if (e[name] == value) return // even when the value is just the browsers default value - we can exit


    // remember default values
    let d = (e.defaultprops = e.defaultprops || {})
    if (!d.hasOwnProperty(name)) {
        d[name] = e[name] // store original value
        ////console.log("store default property", name, e[name])
    }

    // Attempt to set a DOM property to the given value.
    // IE & FF throw for certain property-value combinations.
    try {
        e[name] = value // == null ? '' : value <- causes a value of undefined to be converted to empty string. not good. could use ===. but guess dont need this at all
    } catch (ex) {
        console.error(ex) // report any problems
    }

    // spellcheck is treated differently than all other boolean values and
    // should not be removed when the value is `false`. See:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-spellcheck
    // not used in my code
    // if ((value == null || value === false) && name != 'spellcheck') e.removeAttribute(name)
}

export function clearprops(e, excepts) {
    for (var p in e.defaultprops) if (!excepts || excepts[p] == undefined) e[p] = e.defaultprops[p]
}

function setevents(e: HTMLElement, props) {
    // console.log("setevents", props)

    // remove
    if (e.events) {
        Object.keys(e.events)
            .filter((name) => props[name] != e.events[name])
            .forEach((name) => {
                //console.log("remove", name)
                delete e.events[name]
                return e.removeEventListener(name, e.events[name])
            })
    }
    // add
    Object.keys(props)
        .filter((name) => isevent(name) && (!e.events || !e.events[name])) // test if not registered yet
        .forEach((name) => {
            let handler = props[name]
            //console.log("add", name)
            e.addEventListener(name.slice(2), handler)
            e.events = e.events || {}
            e.events[name] = handler
        })
}

export function clearevents(e: HTMLElement) {
    e.events && Object.keys(e.events).forEach((name) => {
        console.log("remove")
        return e.removeEventListener(name, e.events[name])
    })
    delete e.events
}
