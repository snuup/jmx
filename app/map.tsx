import { BaseComp, jsx, updateview } from '../jmx/jmx'

// class BaseComp<P> {
//     public element: HTMLElement
//     public props: P
//     updateview() { updateview(this.element) }
// }

export class Map extends BaseComp<{ a: number; s: string }> {

    state = 500

    // life

    override mounted(e) {
        console.log("Map mounted", e)
    }

    override update(uc) {
        console.log("Map update", this, uc)
        return true
    }

    // core

    increment() {
        this.state++
        this.updateview()
    }

    // view

    view() {
        console.log("Map view")

        let r = <div class='map'>
            {this.props.a}{this.state}
            <button onclick={this.increment} >increment</button>
        </div>
        return r
    }
}

export class TextComp extends BaseComp<{ a: number; s: string }> {
    view() { return "hase" + this.props.s + Date.now() }

    mounted(e) {
        console.log("TextComp mounted", e, this.element)
    }

    update() {
        console.log("TextComp update")
    }
}