import { updateview } from './jmx';
export const When = ({ cond }, cn) => cond ? { cn } : void 0;
export class JMXComp {
    props;
    element;
    constructor(props) {
        this.props = props;
    }
    mounted() { }
    update(uc) { }
    updateview() { updateview(this.element); }
}
export function cc(...namesOrObjects) {
    return namesOrObjects.flatMap(n => (n.trim ? n : Object.keys(n).filter(k => n[k]))).join(' ');
}
//# sourceMappingURL=lib.js.map