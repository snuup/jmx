function mount(x) {
  Object.assign(globalThis, x);
}

function rebind(o) {
  let proto = Object.getPrototypeOf(o);
  let names = Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([, p]) => p.value instanceof Function).filter(([name]) => name != "constructor").map(([name]) => name);
  for (const n of names)
    o[n] = o[n].bind(o);
  return o;
}
let isproperty = (name, value) => ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(name) || value instanceof Object || value instanceof Function;
let setprops = (e, newprops = {}) => {
  let oldprops = evaluate(e.h?.props) ?? {};
  for (let p in oldprops)
    !(p in newprops) && isproperty(p, oldprops[p]) ? e[p] = null : e.removeAttribute(p);
  for (let p in newprops)
    isproperty(p, newprops[p]) ? e[p] = newprops[p] : e.setAttribute(p, newprops[p]);
};
let evaluate = (expr) => expr instanceof Function ? expr() : expr;
let removeexcesschildren = (n, i) => {
  let c;
  while (c = n.childNodes[i])
    c.remove();
};
let iswebcomponent = (h) => h.tag.includes("-");
let isclasscomponent = (h) => h.tag?.prototype?.view;
let iselement = (h) => h.kind == "element";
let isfragment = (h) => {
  return h.tag == void 0 && h.children != void 0;
};
let isobject = (x) => typeof x === "object";
function patch(e, h, uc = {}) {
  const p = e.parentElement;
  const i = [].indexOf.call(p.childNodes, e);
  sync(p, i, h);
  function sync(p2, i2, h2) {
    h2 = evaluate(h2);
    if (h2 === null || h2 === void 0)
      return i2;
    let c = p2.childNodes[i2];
    function synctextnode(text) {
      if (c && c.nodeType == 3 /* TextNode */) {
        if (c.textContent != text)
          c.textContent = text;
      } else {
        let tn = document.createTextNode(text);
        c ? c.replaceWith(tn) : p2.appendChild(tn);
      }
    }
    if (isobject(h2)) {
      let syncchildren = function(p3, h3, i3) {
        evaluate(h3.children)?.forEach((hc) => i3 = sync(p3, i3, hc));
        return i3;
      }, syncelement = function(tag) {
        if (c?.tagName != tag) {
          const n = document.createElement(tag);
          c ? c.replaceWith(n) : p2.appendChild(n);
          setprops(n, props);
          props?.mounted?.(n);
          return n;
        } else {
          setprops(c, props);
          props?.update?.(uc);
          return c;
        }
      };
      if (isfragment(h2))
        return syncchildren(p2, h2, i2);
      const props = evaluate(h2.props);
      if (iselement(h2)) {
        let n = syncelement(h2.tag);
        n.h = h2;
        if (!uc.patchElementOnly && !iswebcomponent(h2)) {
          const j = syncchildren(n, h2, 0);
          removeexcesschildren(n, j);
        }
        return i2 + 1;
      }
      switch (typeof h2.tag) {
        case "function":
          let j;
          let hr;
          if (isclasscomponent(h2)) {
            (h2.i ??= rebind(new h2.tag())).props = props;
            hr = h2.i.view();
          } else {
            hr = h2.tag(props, evaluate(h2.children));
          }
          j = sync(p2, i2, hr);
          p2.childNodes[i2].h = h2;
          return j;
        case "object":
          return sync(p2, i2, h2.tag);
      }
    }
    synctextnode(h2);
    return i2 + 1;
  }
}
function updateview(selector = "body", uc = {}) {
  const ns = typeof selector == "string" ? document.querySelectorAll(selector) : [selector];
  let n;
  for (n of ns) {
    if (uc.replace)
      n.replaceChildren();
    if (!n.h)
      throw ["jmx: no h exists on the node", n];
    patch(n, n.h, uc);
  }
}

class JMXComp {
  constructor(props) {
    this.props = props;
  }
  element;
  // we do this for jsx. at runtime, we pass the props directly
  mounted(n) {
  }
  update(uc) {
    return false;
  }
  updateview() {
    updateview(this.element);
  }
}

let m = {
  i: 10
};
mount({ m });

class Map extends JMXComp {
  state = 500;
  // life
  constructor(p) {
    super(p);
    console.log("ctor");
  }
  mounted(e) {
    console.log("Map mounted", e);
  }
  update(uc) {
    console.log("Map update", this, uc);
    return true;
  }
  // core
  increment() {
    this.state++;
    this.updateview();
  }
  // view
  view() {
    return {
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
mount({
  u: updateview,
  patch
});
patch(document.body, {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: Map,
    props: () => ({
      a: 11,
      s: "hase"
    })
  }]
});
