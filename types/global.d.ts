//declare global {
    interface Object {
        log(msg: string): ThisType
        eval(this: ThisType<any>): ThisType<any>
        eve(this: ThisType<any>): ThisType<any>
    }
//}