import { jsx, updateview } from '../jmx/jmx'

class BaseComp<P> {
    element: HTMLElement
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
        return <div class='map'>map {JSON.stringify(this.props.a)} - {this.state}
            <div><button onclick={this.increment} >increment</button></div>
        </div>
    }
}
