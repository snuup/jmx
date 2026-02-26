export declare function hopsi(): void;
export declare function rebind<T extends object>(o: T, proto?: any): T;
export declare function mount(o: Record<string, any>): void;
export declare const loggedmethodsex: <T extends Record<string, any>>(o: T, logger: (name: string, args: any[], result: any) => void) => T;
export declare const loggedmethods: <T extends Record<string, any>>(o: T) => T;
export declare const loggedmethodscolored: <T extends Record<string, any>>(bgcolor: string, o: T) => T;
//# sourceMappingURL=base.d.ts.map