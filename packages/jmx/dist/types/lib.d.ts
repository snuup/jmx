import { Props, IClassComponent, UpdateContext, H } from 'h';
export declare const When: ({ cond }: {
    cond: any;
}, cn: any) => {
    cn: any;
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