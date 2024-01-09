import { When, jsx, patch, updateview } from '../jmx/jmx'
import { mount, rebind } from '../util/common'
import { initrouter } from './router'

type Url =
    ["hase", number, string] |
    ["flap", string, number, number] |
    ["/"]

let m = {
    url: ['/'] as Url,
}

const Link = ({ url }: { url: Url }) => <a href={'/' + url.join('/')}>{url[0]}</a>

const RouterApp = () => (
    <body>
        <h1>{Date.now} remains constant while spa is not reloaded</h1>
        <h1>router</h1>
        <h2 id='path'>path = {decodeURI(document.location.pathname)}</h2>
        <Link url={['hase', 2, 'juju']}>hase</Link>
        <Link url={['flap', 'trühh', 3, 4]}>flappy</Link>
        <article id='main'>
            <When cond={m.url[0] == 'hase'}>
                <div>
                    <h1>hasen component</h1>
                </div>
            </When>
            <When cond={m.url[0] == 'flap'}>
                <div>
                    <h1>flappen component</h1>
                </div>
            </When>
        </article>
    </body>
)

class Controller {
    constructor() {
        rebind(this)
        patch(document.body, <RouterApp />)
        initrouter(this.setroute)
    }

    setroute() {
        m.url = document.location.pathname.split('/').slice(1) as Url
        updateview('#main')
    }
}

let c = new Controller()

mount({ m, c })