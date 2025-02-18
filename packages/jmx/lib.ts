import { Props, IClassComponent, UpdateContext, H, FComponentT, Children } from 'h'
import { updateview } from './jmx'

export const When = ({ cond }: { cond: boolean }, cn: Children) => cond ? { cn } : void 0;

export abstract class JMXComp<P extends Props = {}> implements IClassComponent {

    // assigned by jmx framework
    element!: Node

    // we provide this ctor for jsx which uses ctor arguments as properties of class components.
    // at runtime, we pass the props directly
    constructor(public props: P) { }

    // overrides
    mounted() { }
    update(uc: UpdateContext): boolean | void { }
    abstract view(): H

    // utility: update view() of this component
    updateview() { updateview(this.element) }
}

export function cc(...namesOrObjects: (string | any)[]): string {
    return namesOrObjects.flatMap(n => (n.trim ? n : Object.keys(n).filter(k => n[k]))).join(' ') // n.trim distinguishes strings from objects
}