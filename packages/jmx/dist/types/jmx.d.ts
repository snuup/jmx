import { Expr, H, HElement, UpdateContext } from './h';
export declare function patch(e: Node | null, h: Expr<H>, uc?: UpdateContext): void;
type Selector = string | Node | undefined | null;
type Selectors = Selector[];
export declare function updateview(uc: UpdateContext, ...selectors: Selectors): void;
export declare function updateview(...selectors: Selectors): void;
export declare function jsx(): HElement;
export declare function jsxf(): HElement;
export {};
//# sourceMappingURL=jmx.d.ts.map