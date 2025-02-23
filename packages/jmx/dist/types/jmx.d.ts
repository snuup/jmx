import { Expr, H, HElement, Selectors, IUpdateContext } from './h';
export declare function patch(e: Node | null, h: Expr<H>, uc?: IUpdateContext): void;
export declare function patch3(e: Node | null, h: Expr<H>, uc?: IUpdateContext): void;
export declare function patch2(e: Node | null, h: Expr<H>, uc?: IUpdateContext): Promise<void> | undefined;
export declare function updateview(...us: Selectors): void;
export declare function jsx(): HElement;
export declare function jsxf(): HElement;
//# sourceMappingURL=jmx.d.ts.map