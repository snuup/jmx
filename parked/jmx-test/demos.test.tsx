import { Func, HCompClass, HCompFun, HElement, jsx, jsxf, patch } from '@snupo/jmx'
import { describe, expect, beforeEach, it } from 'vitest'
import { JMXComp } from '@snupo/jmx'

beforeEach(() => {
    document.body.replaceChildren()
    document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a))
    window.requestAnimationFrame = (cb) => { cb(0); return 0 }
})

describe('JMX dom tests', () => {

    it('HTag 1', () => {

        var _h: HElement = <body>hase</body>

        let h: HElement = {
            tag: "BODY",
            cn: () => ["hase"]
        }

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 1 thunked', () => {

        var _h: HElement = <body>hase</body>

        let h: Func<HElement> = () => ({
            tag: "BODY",
            cn: () => ["hase"]
        })

        patch(document.body, h)
        expect(document.body.outerHTML).toBe("<body>hase</body>")
    })

    it('HTag 2', () => {

        let _h = <body class="cc">hase{42}{true}{false}</body>

        let h: HElement = {
            tag: "BODY",
            p: () => ({
                class: "cc"
            }),
            cn: () => ["hase", 42, true, false]
        }

        patch(document.body, h)
        expect(document.body.className).toBe("cc")
        expect(document.body.innerHTML).toBe("hase42truefalse")
    })

    it('HFunction', () => {

        let F = ({ x }: { x: number }) => <div class={"classo" + x * 3}>{x * 2}</div>
        let a = <body><F x={7} /></body>

        let _F = ({ x }: { x: number }) => (
            {
                tag: "DIV",
                p: () => ({
                    class: "classo" + x * 3
                }),
                cn: () => [x * 2]
            }) as HElement

        let _a =
        {
            tag: "BODY",
            cn: () => [
                {
                    tag: _F,
                    p: () => ({ x: 7 }),
                    cn: () => []
                } // as HCompFun // tbd - why ??
            ]
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

    it('element as object', () => {

        let D = <div />

        patch(document.body, <body><D /></body>)
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('element as thunked object', () => {

        let D = () => <div />

        patch(document.body, <body><D /></body>)
        expect(document.body.innerHTML).toBe('<div></div>')
    })

    it('class component is constructed', () => {

        class C extends JMXComp {
            view() {
                return 'bunny component'
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.body.innerHTML).toBe('bunny component')
    })

    it('class component h is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(document.body, <body><C /></body>)
        expect(document.querySelector("div")?.h).toBeDefined()
    })

    it('class component instance h.i is attached', () => {
        class C extends JMXComp {
            view() {
                return <div />
            }
        }

        patch(document.body, <body><C /></body>)
        let h = document.querySelector("div")?.h as HCompClass
        expect(h.i).toBeDefined()
    })

    it('fragments in context', () => {

        let F = <>
            <b>1</b>
        </>

        let A = <div>
            <F />
            <article></article>
            <aside></aside>
        </div>

        patch(document.body, <body><A /></body>)
        expect(document.body.innerHTML).toBe('<div><b>1</b><article></article><aside></aside></div>')
    })

    it('fragments in context2', () => {

        let F = () => <>
            <b>1</b>
        </>

        let A = <div>
            <F />
            <article></article>
            <aside></aside>
        </div>

        patch(document.body, <body><A /></body>)
        expect(document.body.innerHTML).toBe('<div><b>1</b><article></article><aside></aside></div>')
    })
})
