function mount(x) {
  Object.assign(globalThis, x);
}

function setprops(e, newprops = {}) {
  let set = (p) => {
    if (isproperty(p, newprops[p]))
      e[p] = newprops[p];
    else
      e.setAttribute(p, newprops[p]);
  };
  let rem = (p) => {
    if (isproperty(p, oldprops[p]))
      e[p] = null;
    else
      e.removeAttribute(p);
  };
  let oldprops = e.h?.props?.() ?? {};
  for (let p in oldprops)
    if (p in newprops)
      set(p);
    else
      rem(p);
  for (let p in newprops)
    if (!(p in oldprops))
      set(p);
}
function isproperty(name, value) {
  return [
    "value",
    "checked",
    "disabled",
    "class",
    "style",
    "href",
    "src",
    "selected",
    "readOnly",
    "tabIndex"
  ].includes(name) || value instanceof Object || value instanceof Function;
}

function rebind(o) {
  let proto = Object.getPrototypeOf(o);
  let names = Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([, p]) => p.value instanceof Function).filter(([name]) => name != "constructor").map(([name]) => name);
  for (const name of names)
    o[name] = o[name].bind(o);
  return o;
}
let removeexcesschildren = (n, i) => {
  let c;
  while (letc = n.childNodes[i])
    c.remove();
};
let iswebcomponent = (h) => h.tag.includes("-");

const evaluate = (expr) => expr instanceof Function ? evaluate(expr()) : expr;
let iscomp = (h) => typeof h.tag == "function";
let isclasscomponent = (h) => h.tag.prototype?.view;
function evalComponent(h, n) {
  const props = evaluate(h.props);
  if (isclasscomponent(h)) {
    let hc;
    if ((hc = n?.h)?.i) {
      hc.i.props = props;
      console.log("best is to cancel view here if update exists");
    } else {
      (hc = h).i = rebind(new h.tag(props));
    }
    return hc.i.view();
  } else {
    let f = h.tag;
    let cn = evaluate(h.children);
    return f(props, cn);
  }
}
function syncelement(p, i, tag, props) {
  console.log("syncelement", p.childNodes[i]?.h, tag, props);
  const c = p.childNodes[i];
  if (!c || c.tagName != tag) {
    const n = document.createElement(tag);
    c ? c.replaceWith(n) : p.appendChild(n);
    setprops(n, props);
    props?.mounted?.(n);
    return n;
  } else {
    console.log("------------");
    console.log("old", c.h.props?.());
    console.log("new", props);
    setprops(c, props);
    props?.update?.(c);
    return c;
  }
}
function synctextnode(p, i, text) {
  const c = p.childNodes[i];
  if (c && c.nodeType == 3 /* TextNode */) {
    if (c.textContent != text)
      c.textContent = text;
  } else {
    const tn = document.createTextNode(text);
    c ? c.replaceWith(tn) : p.appendChild(tn);
  }
}
function getupdatefunction(h, e) {
  if (e?.h?.tag != h.tag)
    return;
  if (isclasscomponent(h))
    return e.h.i.update;
  else
    return evaluate(h.props)?.update;
}
function sync(p, i, h, uc) {
  switch (typeof h) {
    case "string":
    case "number":
    case "boolean":
      synctextnode(p, i, h);
      return i + 1;
    case "object":
      let e = p.childNodes[i];
      let update = getupdatefunction(h, e);
      if (update?.(uc)) {
        console.log("early exit");
        return i + 1;
      }
      switch (typeof h.tag) {
        case "function":
          const h2 = evalComponent(h, e);
          if (!h2)
            return i;
          return sync(p, i, h2, uc);
        case "string": {
          switch (h.tag) {
            case "jsxf":
              return syncchildren(p, h, i, uc);
            default:
              let props = evaluate(h.props);
              let n = syncelement(p, i, h.tag, props);
              if (!uc.patchElementOnly && !iswebcomponent(h)) {
                const j = syncchildren(n, h, 0, uc);
                removeexcesschildren(n, j);
              }
          }
        }
      }
      return i + 1;
    default:
      throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`;
  }
}
function syncchildren(p, h, i, uc) {
  (evaluate(h.children) ?? []).flatMap(evaluate).filter((c) => c !== null && c !== void 0).forEach((hc) => {
    let i0 = i;
    i = sync(p, i, hc, uc);
    let cn = p.childNodes[i0];
    if (iscomp(hc)) {
      if (!cn.h) {
        if (isclasscomponent(hc)) {
          hc.i.element = cn;
          hc.i.mounted?.(cn);
        } else {
          let props = evaluate(hc.props);
          if (props) {
            props.mounted?.(cn);
          }
        }
      }
    }
    if (cn)
      cn.h = hc;
  });
  return i;
}
function patch(e, h, uc = {}) {
  const p = e.parentElement;
  const i = [].indexOf.call(p.childNodes, e);
  e.h = h;
  sync(p, i, h, uc);
}
function updateview(selector = "body", uc = {}) {
  const ns = typeof selector == "string" ? document.querySelectorAll(selector) : [selector];
  let n;
  for (n of ns) {
    while (n && !n.h)
      n = n.parentElement;
    if (!n)
      continue;
    if (uc.replace)
      n.replaceChildren();
    if (!n.h)
      throw ["cannot update, because html was not created with jmx: no h exists on the node", n];
    patch(n, n.h, uc);
  }
}

let App = {
  tag: "BODY",
  children: () => [{
    tag: "DIV",
    props: () => ({
      class: "hase",
      ondblclick: e => console.log("hihi hase")
    }),
    children: () => ["hase"]
  }]
};
let App2 = {
  tag: "BODY",
  children: () => [{
    tag: "DIV",
    props: () => ({
      onclick: e => console.log("hehe, ente")
    }),
    children: () => ["ente"]
  }]
};
patch(document.body, App);
let ub = () => updateview(document.body);
let p = x => patch(document.body, x);
mount({
  u: updateview,
  ub,
  patch,
  App,
  App2,
  p
});
