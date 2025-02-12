function mount(x) {
  Object.assign(globalThis, x);
}

function rebind(o) {
  let proto = Object.getPrototypeOf(o);
  let names = Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([, p]) => p.value instanceof Function).filter(([name]) => name != "constructor").map(([name]) => name);
  for (const n of names) o[n] = o[n].bind(o);
  return o;
}
let evaluate = (expr) => expr instanceof Function ? expr() : expr;
let removeexcesschildren = (n, i) => {
  let c;
  while (c = n.childNodes[i]) c.remove();
};
let iswebcomponent = (h) => h.tag.includes("-");
let isclasscomponent = (h) => h.tag?.prototype?.view;
let iselement = (h) => h.kind == "element";
let isfragment = (h) => {
  return h.tag == undefined && h.children != undefined;
};
let isobject = (x) => typeof x === "object";
let isproperty = (name, value) => ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(name) || value instanceof Object || value instanceof Function;
let setprops = (e, newprops = {}) => {
  let oldprops = evaluate(e.h?.props) ?? {};
  for (let p in oldprops) !(p in newprops) && isproperty(p, oldprops[p]) ? e[p] = null : e.removeAttribute(p);
  for (let p in newprops) isproperty(p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
};
function sync(p, i, h, uc) {
  h = evaluate(h);
  if (h === null || h === undefined) return i;
  let c = p.childNodes[i];
  function synctextnode(text) {
    if (c && c.nodeType == 3 /* TextNode */) {
      if (c.textContent != text) c.textContent = text;
    } else {
      let tn = document.createTextNode(text);
      c ? c.replaceWith(tn) : p.appendChild(tn);
    }
  }
  if (isobject(h)) {
    let syncchildren = function(p2, h2, i2) {
      evaluate(h2.children)?.forEach((hc) => i2 = sync(p2, i2, hc, uc));
      return i2;
    };
    if (isfragment(h)) return syncchildren(p, h, i);
    const props = evaluate(h.props);
    if (iselement(h)) {
      let n;
      if (c?.tagName != h.tag) {
        n = document.createElement(h.tag);
        c ? c.replaceWith(n) : p.appendChild(n);
        setprops(n, props);
        props?.mounted?.(n);
      } else {
        n = c;
        setprops(n, props);
        if (props?.update?.(c, uc)) {
          console.log("no update for ", n);
          return i + 1;
        }
      }
      n.h = h;
      if (!uc.patchElementOnly && !iswebcomponent(h)) {
        const j = syncchildren(n, h, 0);
        removeexcesschildren(n, j);
      }
      return i + 1;
    }
    switch (typeof h.tag) {
      case "function":
        let isupdate = c?.h?.tag == h.tag;
        let ci;
        if (isclasscomponent(h)) {
          h.i = ci = c?.h?.i ?? rebind(new h.tag(props));
          ci.props = props;
          if (isupdate && ci.update(uc)) return i + 1;
        }
        let hr = ci?.view() ?? h.tag(props, evaluate(h.children));
        let j = sync(p, i, hr, uc);
        let cn = p.childNodes[i];
        cn.h = h;
        cn.hr = hr;
        if (ci) ci.element = cn;
        if (!isupdate) ci?.mounted();
        return j;
      case "object":
        return sync(p, i, h.tag, uc);
    }
  }
  synctextnode(h);
  return i + 1;
}
function patch(e, h, uc = {}) {
  const p = e.parentElement;
  const i = [].indexOf.call(p.childNodes, e);
  sync(p, i, h, uc);
}
function updateview(selector = "body", uc = {}) {
  const ns = typeof selector == "string" ? document.querySelectorAll(selector) : [selector];
  let n;
  for (n of ns) {
    if (uc.replace) n.replaceChildren();
    if (!n.h) throw ["jmx: no h exists on the node", n];
    patch(n, n.h, uc);
  }
}

class JMXComp {
  constructor(props) {
    this.props = props;
  }
  element;
  // we do this for jsx. at runtime, we pass the props directly
  mounted() {
  }
  update(uc) {
  }
  updateview() {
    updateview(this.element);
  }
}

let m = {
  i: 10,
  name: "hase"
};
mount({ m });

class Map extends JMXComp {
  state = 500;
  h;
  // override mounted() {
  //     console.log("Map.mounted", this)
  // }
  update(uc) {
    console.log("Map.update", this, uc);
    return false;
  }
  // core
  increment() {
    this.state++;
    this.updateview();
  }
  // view
  view() {
    console.log("Map.view");
    return this.h = {
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => [this.props.a, " ", this.state, " ", m.i, {
        kind: "element",
        tag: "BUTTON",
        props: () => ({
          onclick: this.increment
        }),
        children: () => ["increment"]
      }]
    };
  }
}
class Counter extends JMXComp {
  count = this.props.start;
  increment() {
    this.count++;
    this.updateview();
  }
  view() {
    return {
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => [this.props.name, ": ", this.count, {
        kind: "element",
        tag: "BUTTON",
        props: () => ({
          onclick: this.increment
        }),
        children: () => ["increment"]
      }]
    };
  }
}
let App = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: Counter,
    props: () => ({
      name: m.name,
      start: m.i
    })
  }, {
    kind: "component",
    tag: Map,
    props: () => ({
      a: 55,
      s: "s"
    })
  }]
};
mount({
  u: updateview,
  patch
});
patch(document.body, {
  kind: "component",
  tag: App
});
