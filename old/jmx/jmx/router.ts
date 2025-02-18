export interface IController {
    onroute()
    oncommand(cmd: string, arg: any)
}

export function initrouter(c: IController) {

    window.addEventListener('click', function (ev) {
        let e = ev.target as HTMLElement
        if (e instanceof HTMLAnchorElement) {
            const linkurl = new URL(e.href)
            const currurl = this.document.location
            if (linkurl.host != currurl.host) return // external links are handled normally
            if (linkurl.pathname !== currurl.pathname) { // filter repeated clicks on same link
                history.pushState(null, '', linkurl)
                c.onroute()
            }
            ev.preventDefault()
            return
        }

        throw "closestby not available, tbd"
        // if (e = e.closestby(ee => ee.hasAttribute("cmd"))) {
        //     let cmd = e.getAttribute("cmd")!
        //     let args = e.getAttribute("arg")
        //     c.oncommand(cmd, args)
        //     return
        // }

        console.warn("global click handler found no route and no command in", e)
    })

    window.onload = window.onpopstate = c.onroute
}
