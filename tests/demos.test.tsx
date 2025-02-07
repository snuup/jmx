import { HFunction, HTag, jsx, patch } from '../jmx/jmx'
import { describe, it, expect, beforeEach, vitest } from 'vitest'

beforeEach(() => {
    document.body.innerHTML = '' // Clear the document body
})

describe('JMX dom tests', () => {

    it('HTag 1', () => {

        var _h: HTag = <body>hase</body>

        let h: HTag = {
            tag: "BODY",
            children: () => ["hase"]
        }

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 2', () => {

        let _h = <body class="cc">hase{42}{true}{false}</body>

        let h: HTag = {
            tag: "BODY",
            props: () => ({
                class: "cc"
            }),
            children: () => ["hase", 42, true, false]
        }

        patch(document.body, h)
        expect(document.body.className).toBe("cc")
        expect(document.body.innerHTML).toBe("hase42truefalse")
    })

    it('HFunction', () => {

        let _h = x => <div class={"classo" + x * 3}>{x * 2}</div>

        let h: HFunction = {
            tag: () => ({
                tag: "DIV",
                props: () => ({
                    class: "classo" //+ (x * 3)
                }),
                children: () => ["hase", 42, true, false]
            })
        }

    })

})


//const window = new Window({ url: 'https://localhost:8080' });
//const document = window.document;

//let static1 = () => <div></div>
