import { Props, IClassComponent, UpdateContext, H, Children } from 'h';
export type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends Record<string, unknown> ? DeepReadonly<T[K]> : T[K];
};
export declare const When: ({ cond }: {
    cond: boolean;
}, cn: Children) => {
    cn: Children;
} | undefined;
export declare abstract class JMXComp<P extends Props = {}> implements IClassComponent {
    props: P;
    element: Node;
    constructor(props: P);
    mounted(): void;
    update(uc: UpdateContext): boolean | void;
    abstract view(): H;
    updateview(): void;
}
export declare function cc(...namesOrObjects: (string | any)[]): string;
//# sourceMappingURL=lib.d.ts.map