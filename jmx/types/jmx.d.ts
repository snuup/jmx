// the following types describe the js expression we get from tsx after conversion be our jmx plugin



type Action<T> = (arg: T) => void
type Action = () => void
type Func<T> = () => T
type Expr<T> = T | Func<T>

type Props =
    Record<string, any>
    & {
        mounted?: Action<Node>,
        update?: Action<UpdateContext>
    }

type FComponent = (props: Props | undefined, children?: ChildrenH) => HElement // show an example for usage of children

interface IClassComponent {
    element: Node
    props?: Record<string, any>
    //children: Children //tbd ??
    view(): H
    update(uc: UpdateContext): boolean
    mounted(n: Node): void
}

interface CComponent {
    new(props: Props): IClassComponent
}

type ChildrenH = (H | undefined)[]
type Children = Expr<ChildrenH>

type HText =
    | string // text node
    | number // text node
    | boolean // do not allow boolean, that
type HFragment =
    {
        kind: "<>"
        children: Children,
        [string]: never // no other keys
    }
type HElement =
    {
        kind: "element"
        tag: string,
        props?: Expr<Props>
        children: Children
        i?: any
    }
type HCompFun =
    {
        kind: "component"
        tag: FComponent,
        props?: Expr<Props>
        children?: Children
    }
type HCompClass =
    {
        kind: "component"
        tag: CComponent,
        props?: Expr<Props>
        children: Children
        i: IClassComponent
    }
type HComp = HCompFun | HCompClass
type HTagComp = HElement | HComp
type H = // a hyperscript atom that describes a ...
    | HText
    | HElement // a tag, like p, div with attributes and children
    | HComp // a dynamic component computing any other HNode
    | HFragment
type HTFC = HElement | HCompFun | HCompClass

// runtime api
type UpdateContext = {
    patchElementOnly?: boolean
    replace?: boolean
    //[key: string]: any
}

interface Element {
    events?: any // holds event listeners, so we can remove them
    model: any
}
interface Node {
    h?: HTFC
    mounted?: (e: Element) => void
    update?: (e: Element) => void
}
