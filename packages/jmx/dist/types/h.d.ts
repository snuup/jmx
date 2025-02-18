type Func<T> = () => T;
export type Expr<T> = T | Func<T>;
export type Props = Record<string, any>;
export type FComponent = (props: Props | undefined, children?: ChildrenH) => HElement;
export type FComponentT<P> = (pcn: P, cn?: Children) => H | void;
export interface IClassComponent {
    element: Node;
    props?: Record<string, any>;
    view(): H;
    update(uc: UpdateContext): boolean | void;
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
type HCompFun = {
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
export type UpdateContext = {
    patchElementOnly?: boolean;
    replace?: boolean;
};
declare global {
    interface Node {
        h?: HElement | HCompFun | HCompClass;
        hr?: H;
    }
}
export {};
//# sourceMappingURL=h.d.ts.map