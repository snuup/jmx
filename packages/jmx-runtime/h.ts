// jmx internal types - hopst
// the following types describe the js expression we get from tsx after conversion be our jmx plugin
// they can be useful for users as well, components might return them.

type Func<T> = () => T
export type Expr<T> = T | Func<T>

export type Props = Record<string, any>

export type FComponent = (props: Props | undefined, children?: ChildrenH) => HElement // show an example for usage of children

export type FComponentT<P> = (pcn: P, cn?: Children) => H | void

export interface IClassComponent {
    element: Node
    props?: Record<string, any>
    view(): H
    update(uc: IUpdateContext): boolean | void
    mounted?(): void
    //new(props: any): IClassComponent
}

interface CComponent {
    new (props: any): IClassComponent // while a real component expresses its interface via props pass to the ctor, internally we assign props after construction with new()
}

export type ChildrenH = (H | undefined)[]
export type Children = Expr<ChildrenH>

type HText =
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that

export type HFragment = {
    cn: Children
}

export type HElement = {
    tag: string
    p?: Expr<Props>
    cn: Children
    i?: any
}

type HCompFun = {
    tag: FComponent
    p?: Expr<Props>
    cn?: Children
}

export type HCompClass = {
    tag: CComponent
    p?: Expr<Props>
    cn: Children
    i: IClassComponent
}

export type HComp = HCompFun | HCompClass

export type H = // a hyperscript atom that describes a ...

        | HText
        | HElement // a tag, like p, div with attributes and children
        | HComp // a dynamic component computing any other HNode
        | HFragment

declare global {
    interface Node {
        h?: HElement | HCompFun | HCompClass
    }
    export interface IUpdateContext {
        patchElementOnly?: boolean
        replace?: boolean
    }

    export interface Window {
        jmx?: {
            getnamespace: (tag: string) => string | undefined
        }
    }
}

export function jsx(): HElement {
    throw 'jmx plugin not configured'
} // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
export function jsxf(): HElement {
    throw 'jmx plugin not configured'
} // dumy function for app code - jmx-plugin removes calls to this function, minifyer then removes it
