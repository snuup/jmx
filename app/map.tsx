import { jsx, updateview } from '../jmx/jmx'

class BaseComp<P> {
    public element: HTMLElement
    constructor(public props: P) { }
    updateview() { updateview(this.element) }
}

export class Map extends BaseComp<{ a: number; s: string }> {

    state = 500

    increment() {
        this.state++
        this.updateview()
    }

    __update() {
        console.log("updating", this, arguments)
    }

    view() {
        let r = <div class='map'>
            {this.props.a}{this.state}
            <button onclick={this.increment} >increment</button>
        </div>

        return r
    }
}
