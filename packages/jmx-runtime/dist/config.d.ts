declare global {
    interface Window {
        jmx?: {
            getnamespace: (tag: string) => string;
        };
    }
}
export declare function createElement(tag: string): Element;
//# sourceMappingURL=config.d.ts.map