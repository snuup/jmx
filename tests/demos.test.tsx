import { jsx, jsxf, patch } from '../jmx/jmx'
import { describe, it, expect, beforeEach } from 'vitest'

beforeEach(() => {
    document.body.replaceChildren()
    document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a))
})

describe('JMX dom tests', () => {

    it('HTag 1', () => {

        var _h: HElement = <body>hase</body>

        let h: HElement = {
            kind: "element",
            tag: "BODY",
            children: () => ["hase"]
        }

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 1 thunked', () => {

        var _h: HElement = <body>hase</body>

        let h: Func<HElement> = () => ({
            kind: "element",
            tag: "BODY",
            children: () => ["hase"]
        })

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 2', () => {

        let _h = <body class="cc">hase{42}{true}{false}</body>

        let h: HElement = {
            kind: "element",
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
                kind: "element",
                tag: "DIV",
                props: () => ({
                    class: "classo" + x * 3
                }),
                children: () => [x * 2]
            }) as HElement

        let _a =
        {
            tag: "BODY",
            children: () => [
                {
                    kind: "component",
                    tag: _F,
                    props: () => ({
                        x: 7
                    }),
                    children: () => []
                } as HCompFun]
        }

        patch(document.body, a)
        expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>')
    })

    it('clear styles after update', () => {

        patch(document.body, <body><div class="hase">div</div></body>)
        expect(document.body.innerHTML).toBe('<div class="hase">div</div>')

        patch(document.querySelector("div")!, <div>snuff</div>)
        expect(document.body.innerHTML).toBe('<div>snuff</div>')
    })

    it('fragments', () => {

        let F = <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragment thunked', () => {

        let F = () => <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b>')
    })

    it('fragments many', () => {

        let F = <>
            <b>1</b>
            <b>2</b>
            <b>3</b>
        </>

        patch(document.body, <body><F /><F /></body>)
        expect(document.body.innerHTML).toBe('<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>')
    })
})
