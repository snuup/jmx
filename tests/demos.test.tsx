import { FComponent, HFunction, HTag, jsx, patch } from '../jmx/jmx'
import { describe, it, expect, beforeEach, vitest } from 'vitest'

beforeEach(() => {
    document.body.replaceChildren()
    document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a))
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

        let F = ({ x }: { x: number }) => <div class={"classo" + x * 3}>{x * 2}</div>
        let a = <body><F x={7} /></body>

        let _F = ({ x }) => (
            {
                tag: "DIV",
                props: () => ({
                    class: "classo" + x * 3
                }),
                children: () => [x * 2]
            })

        let _a =
        {
            tag: "BODY",
            children: () => [
                {
                    tag: F,
                    props: () => ({
                        x: 7
                    }),
                    children: () => []
                }]
        }

        patch(document.body, a)
        expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>')
    })

})


//const window = new Window({ url: 'https://localhost:8080' });
//const document = window.document;

//let static1 = () => <div></div>
