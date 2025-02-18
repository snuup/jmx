// the following types describe the js expression we get from tsx after conversion be our jmx plugin


type Action<T> = (arg: T) => void
type Func<T> = () => T
export type Expr<T> = T | Func<T>

export type Props =
    Record<string, any>
// & {
//     mounted?: Action<Node>,
//     update?: Action<Node, UpdateContext>
// }

export type FComponent = (props: Props | undefined, children?: ChildrenH) => HElement // show an example for usage of children

export type FComponentT<P> = (pcn: P, cn?: Children) => H | void

export interface IClassComponent {
    element: Node
    props?: Record<string, any>
    view(): H
    update(uc: UpdateContext): boolean | void
    mounted(): void
}

interface CComponent {
    new(props: any): IClassComponent // while a real component expresses its interface via props pass to the ctor, internally we assign props after construction with new()
}

export type ChildrenH = (H | undefined)[]
export type Children = Expr<ChildrenH>

type HText =
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that

export type HFragment =
    {
        //kind: "<>"
        cn: Children,
        //        [string]: never // no other keys - tbd
    }

export type HElement =
    {
        //kind: "element"
        tag: string,
        p?: Expr<Props>
        cn: Children
        i?: any
    }

type HCompFun =
    {
        //kind: "component"
        tag: FComponent,
        p?: Expr<Props>
        cn?: Children
    }

export type HCompClass =
    {
        //kind: "component"
        tag: CComponent,
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

// runtime api
export type UpdateContext = {
    patchElementOnly?: boolean
    replace?: boolean
    //[key: string]: any
}

// interface Element {
//     events?: any // holds event listeners, so we can remove them
//     model: any
// }

declare global {
    interface Node {
        h?: HElement | HCompFun | HCompClass
        hr?: H
    }
}