import { updateview } from './jmx'

//export let When = ({ cond }, children) => cond ? children : null;
//export const When = ({ cond }, children) => cond ? { children: () => [children] } : void 0;
export const When = ({ cond }, children) => cond ? { children } : void 0;

export abstract class JMXComp<P extends Props = {}> implements IClassComponent {
    element: Node

    constructor(public props: P) {
        // console.log("jmx comp ctor", props)

    } // we do this for jsx. at runtime, we pass the props directly
    mounted() { }
    update(uc: UpdateContext): boolean | void { }
    updateview() { updateview(this.element) }

    abstract view()
}
