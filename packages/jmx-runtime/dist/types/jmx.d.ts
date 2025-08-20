import { Expr, H, HElement, Selectors, IUpdateContext } from './h';
declare global {
    interface Window {
        jmx: {
            create: (tagName: string) => Element;
        };
    }
}
export declare function patch(e: Node | null, h: Expr<H>, uc?: IUpdateContext): void;
export declare function updateview(...us: Selectors): Promise<void>;
export declare function jsx(): HElement;
export declare function jsxf(): HElement;
//# sourceMappingURL=jmx.d.ts.map