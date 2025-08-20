import { Expr, H, HElement } from './h';
export declare function patch(e: Node | null, h: Expr<H>): void;
type Selector = string | Node | undefined | null;
type Selectors = Selector[];
export declare function updateviewuc(uc: IUpdateContext, ...sels: Selectors): void;
export declare function updateview(...sels: Selectors): void;
export declare function jsx(): HElement;
export declare function jsxf(): HElement;
export {};
//# sourceMappingURL=jmx.d.ts.map