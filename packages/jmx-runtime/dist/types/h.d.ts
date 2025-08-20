export type Action = () => void;
export type Func<T> = () => T;
export type Expr<T> = T | Func<T>;
export type Props = Record<string, any>;
export interface FComponent {
    (props: Props | undefined, children?: ChildrenH): HElement;
    state?: Record<string, any>;
}
export type Selector = string | Node;
export type Selectors = [(IUpdateContext | Selector)?, ...Selector[]];
export interface FComponentState<P, S> {
    (this: S & {
        element: HTMLElement;
        update: (...ss: Selectors) => void;
        uc?: Selector | Selectors;
    }, p: P): H;
    state?: S;
}
export type FComponentT<P> = (pcn: P, cn?: Children) => H | void;
export interface IUpdateContext {
    patchElementOnly?: boolean;
    replace?: boolean;
    root?: HTMLElement;
    functionnode?: HTMLElement;
    [key: string]: any;
}
export interface IClassComponent {
    element: Node;
    props?: Record<string, any>;
    view(): H;
    update(uc: IUpdateContext): boolean | void;
    mounted(): void;
}
interface CComponent {
    new (props: any): IClassComponent;
}
export type ChildrenH = (H | undefined)[];
export type Children = Expr<ChildrenH>;
type HText = string | number | boolean;
export type HFragment = {
    cn: Children;
};
export type HElement = {
    tag: string;
    p?: Expr<Props>;
    cn: Children;
    i?: any;
};
export type HCompFun = {
    tag: FComponent;
    p?: Expr<Props>;
    cn?: Children;
};
export type HCompClass = {
    tag: CComponent;
    p?: Expr<Props>;
    cn: Children;
    i: IClassComponent;
};
export type HComp = HCompFun | HCompClass;
export type H = HText | HElement | HComp | HFragment;
declare global {
    interface Node {
        h?: HElement | HCompFun | HCompClass;
        hr?: HElement;
        state?: Record<string, any>;
    }
}
export {};
//# sourceMappingURL=h.d.ts.map