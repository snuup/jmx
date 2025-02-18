export interface IController {
    onroute(): any;
    oncommand(cmd: string, arg: any): any;
}
export declare function initrouter(c: IController): void;
