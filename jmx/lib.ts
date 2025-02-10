import { updateview } from './jmx'

export let When = ({ cond }, { children }) => cond && { children }

export abstract class BaseComp<P extends Props> implements IClassComponent {
    element: Node

    constructor(public props: P) { } // we do this for jsx. at runtime, we pass the props directly
    mounted(n: Node) { }
    update(uc: UpdateContext): boolean {
        return false
    }
    updateview() {
        updateview(this.element)
    }

    abstract view()
}
