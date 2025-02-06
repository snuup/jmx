function setape(n, props, clearold, refresh) {
  if (clearold) {
    clearattrs(n, props, refresh);
    clearprops(n, props);
  }
  if (!props)
    return;
  setprops(n, props);
  n.propsset && n.propsset();
}
function isproperty(name, value) {
  return ["href", "value", "model", "checked", "mounted", "fargs"].includes(name) || value instanceof Object || value instanceof Function || value instanceof Number || value === void 0 || value === null;
}
function isevent(name) {
  return name.startsWith("on");
}
function evalProperty(value) {
  if (value instanceof Number)
    return value.valueOf();
  if (value instanceof String)
    return value.valueOf();
  return value;
}
function setprops(n, props) {
  let events = {};
  for (let k in props) {
    let value = props[k];
    if (isevent(k)) {
      events[k] = value;
    } else if (isproperty(k, value))
      setprop(n, k, evalProperty(value));
    else
      setattr(n, k, value);
  }
  setevents(n, events);
}
function setattr(n, name, value) {
  if (value == null || value === false)
    n.removeAttribute(name);
  else
    n.setAttribute(name, value);
}
function clearattrs(e, attrs, refresh) {
  if (!attrs)
    return;
  for (const a in attrs)
    if (!attrs[a])
      e.removeAttribute(a);
  if (!refresh) {
    e.getAttributeNames().forEach((a) => {
      if (!attrs || !(a in attrs)) {
        if (a != "comp")
          e.removeAttribute(a);
      }
    });
  }
}
function setprop(e, name, value) {
  let d = e.defaultprops = e.defaultprops || {};
  if (!d.hasOwnProperty(name)) {
    d[name] = e[name];
  }
  try {
    e[name] = value;
  } catch (ex) {
    console.error(ex);
  }
}
function clearprops(e, excepts) {
  for (var p in e.defaultprops)
    if (!excepts || excepts[p] == void 0)
      e[p] = e.defaultprops[p];
}
function setevents(e, props) {
  if (e.events) {
    Object.keys(e.events).filter((name) => props[name] != e.events[name]).forEach((name) => {
      delete e.events[name];
      return e.removeEventListener(name, e.events[name]);
    });
  }
  Object.keys(props).filter((name) => isevent(name) && (!e.events || !e.events[name])).forEach((name) => {
    let handler = props[name];
    e.addEventListener(name.slice(2), handler);
    e.events = e.events || {};
    e.events[name] = handler;
  });
}

function rebind(o) {
  let proto = Object.getPrototypeOf(o);
  let names = Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([, p]) => p.value instanceof Function).filter(([name]) => name != "constructor").map(([name]) => name);
  for (const name of names)
    o[name] = o[name].bind(o);
  return o;
}
const evaluate = (expr) => {
  return expr instanceof Function ? evaluate(expr()) : expr;
};
let isClassComponent = (h) => h.tag.prototype?.view;
function evalComponent(h, n) {
  const props = evaluate(h.props);
  let isupdate = n?.h?.tag === h.tag;
  if (isClassComponent(h)) {
    if (!isupdate) {
      h.i = rebind(new h.tag(props));
    } else {
      h.i.props = props;
    }
    return h.i.view();
  } else {
    let f = h.tag;
    let cn = evaluate(h.children);
    return f(evaluate(h.props), cn);
  }
}
function removeexcesschildren(n, i) {
  while (n.childNodes[i])
    n.childNodes[i].remove();
}
function createElement(tag) {
  return document.createElement(tag);
}
function syncelement(p, i, tag, props, comp) {
  const c = p.childNodes[i];
  if (!c || c.tagName != tag) {
    const n = createElement(tag);
    c ? c.replaceWith(n) : p.appendChild(n);
    setape(n, props, false, false);
    props?.mounted?.(n);
    return n;
  } else {
    setape(c, props, true, false);
    props?.update?.(c);
    return c;
  }
}
function synctextnode(p, i, text) {
  const c = p.childNodes[i];
  if (c && c.nodeType == 3) {
    if (c.textContent != text)
      c.textContent = text;
  } else {
    const tn = document.createTextNode(text);
    c ? c.replaceWith(tn) : p.appendChild(tn);
  }
}
function setcomp(e, htag) {
  e.h = htag;
  if (isClassComponent(htag) && !htag.i) {
    throw "??? tbd";
  }
  e.setAttribute("comp", getHName(htag));
}
function getHName(h) {
  switch (typeof h) {
    case "string":
    case "number":
      return h.toString();
    case "object":
      switch (typeof h.tag) {
        case "string":
          return h.tag.toLowerCase();
        default:
          return h.tag.name;
      }
  }
}
const iswebcomponent = (h) => h.tag.includes("-");
function sync(p, i, h, uc) {
  let syncchildren = !uc.patchElementOnly;
  switch (typeof h) {
    case "string":
    case "number":
    case "boolean":
      synctextnode(p, i, h.toString());
      return i + 1;
    case "object":
      switch (typeof h.tag) {
        case "function":
          console.log("tbd: update life cycle");
          const h2 = evalComponent(h, p.childNodes[i]);
          return h2 ? sync(p, i, h2, uc) : i;
        case "string": {
          switch (h.tag) {
            case "jsxf":
              return syncChildren(p, h, i, uc);
            default:
              const props = evaluate(h.props);
              const n = syncelement(p, i, h.tag, props);
              if (props?.patch) {
                props?.patch(n);
              } else if (n.h?.i?.update) {
                let o = n.h?.i;
                o.update?.(uc);
              } else if (syncchildren && !iswebcomponent(h)) {
                const j = syncChildren(n, h, 0, uc);
                removeexcesschildren(n, j);
              }
              setcomp(n, h);
              return i + 1;
          }
        }
      }
    default:
      throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`;
  }
}
function syncChildren(e, h, j, uc) {
  const hcn = evaluate(h.children).flatMap(evaluate).filter((c) => c !== null && c !== void 0);
  hcn.forEach((hc) => j = sync(e, j, hc, uc));
  return j;
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

let m = {
  i: 10
};
mount({ m });

// jmx transformed:
let Numerotti = ({
  n
}) => ({
  tag: "DIV",
  props: () => ({
    class: "carrots"
  }),
  children: () => [n]
});
let App = {
  tag: "BODY",
  children: () => [{
    tag: "DIV",
    children: () => [{
      tag: "SPAN",
      children: () => ["hase ", 42, " ", true, " ", false]
    }, {
      tag: Numerotti,
      props: () => ({
        n: m.i
      }),
      children: () => []
    }]
  }]
};
let ZZZ = x => ({
  tag: "BODY",
  props: () => ({
    class: "cc"
  }),
  children: () => ["hase", 42, true, false, x]
});
console.log(ZZZ);
patch(document.body, App);
mount({
  u: updateview
});
