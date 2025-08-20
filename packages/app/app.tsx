import { jsx, patch } from "jmx-runtime";

let App = () => <body>
    hase war da 123
</body>

patch(document.body, App)