import { mount } from "jmx"

type Id = string

export type Todo = {
    id: Id
    text: string
    completed: boolean
}

export const m = {

    items: [
        { id: "id1", text: "hasentext", completed: false },
        { id: "id2", text: "mausetext", completed: false },
        { id: "id3", text: "der osterhase kommt bald", completed: false }
    ] as Todo[],

    // ui mode
    editingItem: null as Todo | null,
    filter: "all" as Filter,

    get filtereditems() {
        switch (m.filter) {
            case "all": return this.items
            case "active": return this.activeitems
            case "completed": return this.completeditems
        }
    },

    get completeditems() { return this.items.filter(t => t.completed) },
    get activeitems() { return this.items.filter(t => !t.completed) },

    get completedcount() { return this.completeditems.length },
    get activecount() { return this.activeitems.length },

    get allarecompleted() { return m.items.every(c => c.completed) },
    get anycompleted() { return this.items.some(t => t.completed) }
}

mount({ m })