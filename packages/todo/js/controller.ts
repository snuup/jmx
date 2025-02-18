import { updateview, rebind, mount, loggedmethods } from 'jmx'
import { m, Todo } from './model'

type KeyboardEventInput = KeyboardEvent & { target: HTMLInputElement }

class Controller {

    constructor() {
        rebind(this)
        window.addEventListener("hashchange", this.setroute)
    }

    setroute() {
        switch (window.location.hash) {
            case "#/active":
                m.filter = "active"
                break
            case "#/completed":
                m.filter = "completed"
                break
            default:
                m.filter = "all"
        }
        updateview(".main")
    }

    removeCompletedItems(ev: MouseEvent) {
        m.items = m.items.filter(t => !t.completed)
        updateview('main')
    }

    startEdit(item: Todo) {
        m.editingItem = item
        updateview()
    }

    endEdit() {
        m.editingItem = null
        updateview()
    }

    keyUp(ev: KeyboardEventInput) {

        switch (ev.key) {

            case "Enter":
                if (!m.editingItem) return
                let text = ev.target.value
                let i = m.editingItem
                if (text.length) {
                    i.text = text
                } else {
                    m.items = m.items.filter(x => x !== i)
                }
                debugger
                this.endEdit()
                break

            case "Escape":
                this.endEdit()
                break
        }
    }

    setCompleted(item: Todo, ev): void {
        item.completed = (ev.target as HTMLInputElement).checked
        let li = (ev.target as HTMLElement).closest("li")
        updateview(".footer") // allow array of selectors
        updateview(li!) // tbvd: accept null
    }

    toggleAllItems() { }

    addItem(ev: KeyboardEvent) {
        if (ev.key === "Enter") {
            const target = ev.target as HTMLInputElement

            let { value } = target
            value = value.trim()

            if (value.length) {
                m.items.push({
                    id: crypto.randomUUID(), // This only works in secure-context.
                    text: value,
                    completed: false,
                })
                target.value = ""
            }
        }
        updateview()
    }

    removeItem(item: Todo) {
        m.items = m.items.filter(t => t.id != item.id)
        updateview()
    }
}

export let c = new Controller()
//export let c = loggedmethods(new Controller())

mount({ updateview, c })