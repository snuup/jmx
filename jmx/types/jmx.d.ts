// the following types describe the js expression we get from tsx after conversion be our jmx plugin
//
type Expr<T> = () => T

type ChildrenH = (H | undefined)[]
type Children = Expr<ChildrenH>

type Action = () => void
type ActionT<T> = (arg: T) => void

type Props = Record<string, any> // tbd: add types for update and so on

type FComponent = (props: Props | undefined, children?: ChildrenH) => HTag // show an example for usage of children

interface IClassComponent {
    element: Node
    props?: Record<string, any>
    //children: Children //tbd ??
    view(): H
    update?: (uc: UpdateContext) => void
    mounted?: (n: Node) => void
}

interface CComponent {
    new(): IClassComponent
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

// runtime api
type UpdateContext = {
    patchElementOnly?: boolean
    replace?: boolean
    [key: string]: any
}

interface HTMLElement {
    events?: any // holds event listeners, so we can remove them
    model: any
}
interface Node {
    h?: HTFC
    mounted?: (e: Element) => void
    update?: (e: Element) => void
}
