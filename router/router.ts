export function initrouter (onroute?) {
    window.addEventListener('click', function (ev) {
        let e = ev.target
        if (e instanceof HTMLAnchorElement) {
            const linkurl = new URL(e.href)
            const currurl = this.document.location
            if (linkurl.host != currurl.host) return // external links are handled normally
            if (linkurl.pathname !== currurl.pathname) { // filter repeated clicks on same link
                history.pushState(null, '', linkurl)
                onroute()
            }
            ev.preventDefault()
        }
    })
    window.onload = window.onpopstate = onroute
}
