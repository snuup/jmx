function P$1(x) {
  return typeof x === "number" ? new Number(x) : new String(x);
}
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
function clearevents(e) {
  e.events && Object.keys(e.events).forEach((name) => {
    console.log("remove");
    return e.removeEventListener(name, e.events[name]);
  });
  delete e.events;
}

function rebind(o) {
  let proto = Object.getPrototypeOf(o);
  let names = Object.entries(Object.getOwnPropertyDescriptors(proto)).filter(([, p]) => p.value instanceof Function).filter(([name]) => name != "constructor").map(([name]) => name);
  for (const name of names)
    o[name] = o[name].bind(o);
  return o;
}
function jsx() {
  throw "jmx plugin not configured";
}
class BaseComp {
  constructor(props) {
    this.props = props;
  }
  element;
  updateview() {
    updateview(this.element);
  }
  view() {
    return "tbd";
  }
}
let Numero = ({ n }) => ({
  tag: "DIV",
  props: () => ({ class: "carrots" }),
  children: () => [n]
});
let m$2;
let Map$1 = class Map extends BaseComp {
  state = 500;
  increment() {
    this.state++;
    this.updateview();
  }
  update() {
    console.log("updating", this, arguments);
  }
  view() {
    return {
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => ["map ", JSON.stringify(this.props.a), " - ", this.state, {
        tag: "DIV",
        props: null,
        children: () => [{
          tag: "BUTTON",
          props: () => ({
            onclick: this.increment
          }),
          children: () => ["increment"]
        }]
      }]
    };
  }
};
let App = {
  tag: "BODY",
  props: null,
  children: () => [{
    tag: "DIV",
    props: null,
    children: () => ["hase mit ", {
      tag: Numero,
      props: () => ({
        n: m$2.i
      }),
      children: () => []
    }, " karotten ente mit ", {
      tag: Numero,
      props: () => ({
        n: m$2.i
      }),
      children: () => []
    }, " schnecken", {
      tag: Map$1,
      props: () => ({
        a: m$2.i,
        s: "hase"
      }),
      children: () => []
    }, {
      tag: "UL",
      props: null,
      children: () => [{
        tag: "LI",
        props: null,
        children: () => ["aa"]
      }, {
        tag: "LI",
        props: null,
        children: () => ["bb"]
      }]
    }]
  }]
};
const jsxf = (props, { children }) => {
  return { tag: "jsxf", children };
};
const evaluate = (expr) => {
  return expr instanceof Function ? evaluate(expr()) : expr;
};
let isClassComponent = (h) => h.tag.prototype?.view;
function evalComponent(h, n) {
  console.log("evalComponent", h, n);
  const props = evaluate(h.props);
  console.log("die props", props);
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
  console.log("setcomp", e, htag);
  if (isClassComponent(htag)) {
    htag.i.element = e;
    htag.i.mounted?.(e);
  }
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
  console.log("sync", p.tagName, i, h, p.childNodes[i]);
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
          console.log("tbd: update life cycle methods");
          const h2 = evalComponent(h, p.childNodes[i]);
          let r = h2 ? sync(p, i, h2, uc) : i;
          setcomp(p.childNodes[i], h);
          return r;
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
              return i + 1;
          }
        }
      }
    default:
      throw `invalid h ${h}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`;
  }
}
function syncChildren(e, h, j, uc) {
  console.log("syncChildren", e.tagName, j);
  const hcn = evaluate(h.children).flatMap(evaluate).filter((c) => c !== null && c !== void 0);
  hcn.forEach((hc) => {
    let j0 = j;
    j = sync(e, j, hc, uc);
    e.childNodes[j0].h = hc;
    return j;
  });
  return j;
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
const When = ({ cond }, { children }) => cond && jsxf(null, { children });

// src/index.ts
var f$2 = {
  reset: [0, 0],
  bold: [1, 22, "\x1B[22m\x1B[1m"],
  dim: [2, 22, "\x1B[22m\x1B[2m"],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
}, h$1 = Object.entries(f$2);
function a$2(n) {
  return String(n);
}
a$2.open = "";
a$2.close = "";
var B = /* @__PURE__ */ h$1.reduce(
  (n, [e]) => (n[e] = a$2, n),
  { isColorSupported: !1 }
);
function m$1() {
  return { ...B };
}
function C$2(n = !1) {
  let e = typeof process != "undefined" ? process : void 0, i = (e == null ? void 0 : e.env) || {}, g = (e == null ? void 0 : e.argv) || [];
  return !("NO_COLOR" in i || g.includes("--no-color")) && ("FORCE_COLOR" in i || g.includes("--color") || (e == null ? void 0 : e.platform) === "win32" || n && i.TERM !== "dumb" || "CI" in i) || typeof window != "undefined" && !!window.chrome;
}
function p$2(n = !1) {
  let e = C$2(n), i = (r, t, c, o) => {
    let l = "", s = 0;
    do
      l += r.substring(s, o) + c, s = o + t.length, o = r.indexOf(t, s);
    while (~o);
    return l + r.substring(s);
  }, g = (r, t, c = r) => {
    let o = (l) => {
      let s = String(l), b = s.indexOf(t, r.length);
      return ~b ? r + i(s, t, c, b) + t : r + s + t;
    };
    return o.open = r, o.close = t, o;
  }, u = {
    isColorSupported: e
  }, d = (r) => `\x1B[${r}m`;
  for (let [r, t] of h$1)
    u[r] = e ? g(
      d(t[0]),
      d(t[1]),
      t[2]
    ) : a$2;
  return u;
}

// src/browser.ts
function p$1() {
  return C$2();
}
function a$1() {
  return p$2();
}
var s = p$2();

function _mergeNamespaces(n, m) {
  m.forEach(function(e) {
    e && typeof e !== "string" && !Array.isArray(e) && Object.keys(e).forEach(function(k) {
      if (k !== "default" && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function() {
            return e[k];
          }
        });
      }
    });
  });
  return Object.freeze(n);
}
function getKeysOfEnumerableProperties(object, compareKeys) {
  const rawKeys = Object.keys(object);
  const keys = compareKeys === null ? rawKeys : rawKeys.sort(compareKeys);
  if (Object.getOwnPropertySymbols) {
    for (const symbol of Object.getOwnPropertySymbols(object)) {
      if (Object.getOwnPropertyDescriptor(object, symbol).enumerable) {
        keys.push(symbol);
      }
    }
  }
  return keys;
}
function printIteratorEntries(iterator, config, indentation, depth, refs, printer2, separator = ": ") {
  let result = "";
  let width = 0;
  let current = iterator.next();
  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    while (!current.done) {
      result += indentationNext;
      if (width++ === config.maxWidth) {
        result += "…";
        break;
      }
      const name = printer2(
        current.value[0],
        config,
        indentationNext,
        depth,
        refs
      );
      const value = printer2(
        current.value[1],
        config,
        indentationNext,
        depth,
        refs
      );
      result += name + separator + value;
      current = iterator.next();
      if (!current.done) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
function printIteratorValues(iterator, config, indentation, depth, refs, printer2) {
  let result = "";
  let width = 0;
  let current = iterator.next();
  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    while (!current.done) {
      result += indentationNext;
      if (width++ === config.maxWidth) {
        result += "…";
        break;
      }
      result += printer2(current.value, config, indentationNext, depth, refs);
      current = iterator.next();
      if (!current.done) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
function printListItems(list, config, indentation, depth, refs, printer2) {
  let result = "";
  list = list instanceof ArrayBuffer ? new DataView(list) : list;
  const isDataView = (l) => l instanceof DataView;
  const length = isDataView(list) ? list.byteLength : list.length;
  if (length > 0) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    for (let i = 0; i < length; i++) {
      result += indentationNext;
      if (i === config.maxWidth) {
        result += "…";
        break;
      }
      if (isDataView(list) || i in list) {
        result += printer2(
          isDataView(list) ? list.getInt8(i) : list[i],
          config,
          indentationNext,
          depth,
          refs
        );
      }
      if (i < length - 1) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
function printObjectProperties(val, config, indentation, depth, refs, printer2) {
  let result = "";
  const keys = getKeysOfEnumerableProperties(val, config.compareKeys);
  if (keys.length > 0) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name = printer2(key, config, indentationNext, depth, refs);
      const value = printer2(val[key], config, indentationNext, depth, refs);
      result += `${indentationNext + name}: ${value}`;
      if (i < keys.length - 1) {
        result += `,${config.spacingInner}`;
      } else if (!config.min) {
        result += ",";
      }
    }
    result += config.spacingOuter + indentation;
  }
  return result;
}
const asymmetricMatcher = typeof Symbol === "function" && Symbol.for ? Symbol.for("jest.asymmetricMatcher") : 1267621;
const SPACE$2 = " ";
const serialize$5 = (val, config, indentation, depth, refs, printer2) => {
  const stringedValue = val.toString();
  if (stringedValue === "ArrayContaining" || stringedValue === "ArrayNotContaining") {
    if (++depth > config.maxDepth) {
      return `[${stringedValue}]`;
    }
    return `${stringedValue + SPACE$2}[${printListItems(
      val.sample,
      config,
      indentation,
      depth,
      refs,
      printer2
    )}]`;
  }
  if (stringedValue === "ObjectContaining" || stringedValue === "ObjectNotContaining") {
    if (++depth > config.maxDepth) {
      return `[${stringedValue}]`;
    }
    return `${stringedValue + SPACE$2}{${printObjectProperties(
      val.sample,
      config,
      indentation,
      depth,
      refs,
      printer2
    )}}`;
  }
  if (stringedValue === "StringMatching" || stringedValue === "StringNotMatching") {
    return stringedValue + SPACE$2 + printer2(val.sample, config, indentation, depth, refs);
  }
  if (stringedValue === "StringContaining" || stringedValue === "StringNotContaining") {
    return stringedValue + SPACE$2 + printer2(val.sample, config, indentation, depth, refs);
  }
  if (typeof val.toAsymmetricMatcher !== "function") {
    throw new TypeError(
      `Asymmetric matcher ${val.constructor.name} does not implement toAsymmetricMatcher()`
    );
  }
  return val.toAsymmetricMatcher();
};
const test$5 = (val) => val && val.$$typeof === asymmetricMatcher;
const plugin$5 = { serialize: serialize$5, test: test$5 };
const SPACE$1 = " ";
const OBJECT_NAMES = /* @__PURE__ */ new Set(["DOMStringMap", "NamedNodeMap"]);
const ARRAY_REGEXP = /^(?:HTML\w*Collection|NodeList)$/;
function testName(name) {
  return OBJECT_NAMES.has(name) || ARRAY_REGEXP.test(name);
}
const test$4 = (val) => val && val.constructor && !!val.constructor.name && testName(val.constructor.name);
function isNamedNodeMap(collection) {
  return collection.constructor.name === "NamedNodeMap";
}
const serialize$4 = (collection, config, indentation, depth, refs, printer2) => {
  const name = collection.constructor.name;
  if (++depth > config.maxDepth) {
    return `[${name}]`;
  }
  return (config.min ? "" : name + SPACE$1) + (OBJECT_NAMES.has(name) ? `{${printObjectProperties(
    isNamedNodeMap(collection) ? [...collection].reduce(
      (props, attribute) => {
        props[attribute.name] = attribute.value;
        return props;
      },
      {}
    ) : { ...collection },
    config,
    indentation,
    depth,
    refs,
    printer2
  )}}` : `[${printListItems(
    [...collection],
    config,
    indentation,
    depth,
    refs,
    printer2
  )}]`);
};
const plugin$4 = { serialize: serialize$4, test: test$4 };
function escapeHTML(str) {
  return str.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function printProps(keys, props, config, indentation, depth, refs, printer2) {
  const indentationNext = indentation + config.indent;
  const colors = config.colors;
  return keys.map((key) => {
    const value = props[key];
    let printed = printer2(value, config, indentationNext, depth, refs);
    if (typeof value !== "string") {
      if (printed.includes("\n")) {
        printed = config.spacingOuter + indentationNext + printed + config.spacingOuter + indentation;
      }
      printed = `{${printed}}`;
    }
    return `${config.spacingInner + indentation + colors.prop.open + key + colors.prop.close}=${colors.value.open}${printed}${colors.value.close}`;
  }).join("");
}
function printChildren(children, config, indentation, depth, refs, printer2) {
  return children.map(
    (child) => config.spacingOuter + indentation + (typeof child === "string" ? printText(child, config) : printer2(child, config, indentation, depth, refs))
  ).join("");
}
function printText(text, config) {
  const contentColor = config.colors.content;
  return contentColor.open + escapeHTML(text) + contentColor.close;
}
function printComment(comment, config) {
  const commentColor = config.colors.comment;
  return `${commentColor.open}<!--${escapeHTML(comment)}-->${commentColor.close}`;
}
function printElement(type, printedProps, printedChildren, config, indentation) {
  const tagColor = config.colors.tag;
  return `${tagColor.open}<${type}${printedProps && tagColor.close + printedProps + config.spacingOuter + indentation + tagColor.open}${printedChildren ? `>${tagColor.close}${printedChildren}${config.spacingOuter}${indentation}${tagColor.open}</${type}` : `${printedProps && !config.min ? "" : " "}/`}>${tagColor.close}`;
}
function printElementAsLeaf(type, config) {
  const tagColor = config.colors.tag;
  return `${tagColor.open}<${type}${tagColor.close} …${tagColor.open} />${tagColor.close}`;
}
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const FRAGMENT_NODE = 11;
const ELEMENT_REGEXP = /^(?:(?:HTML|SVG)\w*)?Element$/;
function testHasAttribute(val) {
  try {
    return typeof val.hasAttribute === "function" && val.hasAttribute("is");
  } catch {
    return false;
  }
}
function testNode(val) {
  const constructorName = val.constructor.name;
  const { nodeType, tagName } = val;
  const isCustomElement = typeof tagName === "string" && tagName.includes("-") || testHasAttribute(val);
  return nodeType === ELEMENT_NODE && (ELEMENT_REGEXP.test(constructorName) || isCustomElement) || nodeType === TEXT_NODE && constructorName === "Text" || nodeType === COMMENT_NODE && constructorName === "Comment" || nodeType === FRAGMENT_NODE && constructorName === "DocumentFragment";
}
const test$3 = (val) => {
  var _a;
  return ((_a = val == null ? void 0 : val.constructor) == null ? void 0 : _a.name) && testNode(val);
};
function nodeIsText(node) {
  return node.nodeType === TEXT_NODE;
}
function nodeIsComment(node) {
  return node.nodeType === COMMENT_NODE;
}
function nodeIsFragment(node) {
  return node.nodeType === FRAGMENT_NODE;
}
const serialize$3 = (node, config, indentation, depth, refs, printer2) => {
  if (nodeIsText(node)) {
    return printText(node.data, config);
  }
  if (nodeIsComment(node)) {
    return printComment(node.data, config);
  }
  const type = nodeIsFragment(node) ? "DocumentFragment" : node.tagName.toLowerCase();
  if (++depth > config.maxDepth) {
    return printElementAsLeaf(type, config);
  }
  return printElement(
    type,
    printProps(
      nodeIsFragment(node) ? [] : Array.from(node.attributes, (attr) => attr.name).sort(),
      nodeIsFragment(node) ? {} : [...node.attributes].reduce(
        (props, attribute) => {
          props[attribute.name] = attribute.value;
          return props;
        },
        {}
      ),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer2
    ),
    printChildren(
      Array.prototype.slice.call(node.childNodes || node.children),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer2
    ),
    config,
    indentation
  );
};
const plugin$3 = { serialize: serialize$3, test: test$3 };
const IS_ITERABLE_SENTINEL = "@@__IMMUTABLE_ITERABLE__@@";
const IS_LIST_SENTINEL$1 = "@@__IMMUTABLE_LIST__@@";
const IS_KEYED_SENTINEL$1 = "@@__IMMUTABLE_KEYED__@@";
const IS_MAP_SENTINEL = "@@__IMMUTABLE_MAP__@@";
const IS_ORDERED_SENTINEL$1 = "@@__IMMUTABLE_ORDERED__@@";
const IS_RECORD_SENTINEL = "@@__IMMUTABLE_RECORD__@@";
const IS_SEQ_SENTINEL = "@@__IMMUTABLE_SEQ__@@";
const IS_SET_SENTINEL$1 = "@@__IMMUTABLE_SET__@@";
const IS_STACK_SENTINEL = "@@__IMMUTABLE_STACK__@@";
const getImmutableName = (name) => `Immutable.${name}`;
const printAsLeaf = (name) => `[${name}]`;
const SPACE = " ";
const LAZY = "…";
function printImmutableEntries(val, config, indentation, depth, refs, printer2, type) {
  return ++depth > config.maxDepth ? printAsLeaf(getImmutableName(type)) : `${getImmutableName(type) + SPACE}{${printIteratorEntries(
    val.entries(),
    config,
    indentation,
    depth,
    refs,
    printer2
  )}}`;
}
function getRecordEntries(val) {
  let i = 0;
  return {
    next() {
      if (i < val._keys.length) {
        const key = val._keys[i++];
        return { done: false, value: [key, val.get(key)] };
      }
      return { done: true, value: void 0 };
    }
  };
}
function printImmutableRecord(val, config, indentation, depth, refs, printer2) {
  const name = getImmutableName(val._name || "Record");
  return ++depth > config.maxDepth ? printAsLeaf(name) : `${name + SPACE}{${printIteratorEntries(
    getRecordEntries(val),
    config,
    indentation,
    depth,
    refs,
    printer2
  )}}`;
}
function printImmutableSeq(val, config, indentation, depth, refs, printer2) {
  const name = getImmutableName("Seq");
  if (++depth > config.maxDepth) {
    return printAsLeaf(name);
  }
  if (val[IS_KEYED_SENTINEL$1]) {
    return `${name + SPACE}{${// from Immutable collection of entries or from ECMAScript object
    val._iter || val._object ? printIteratorEntries(
      val.entries(),
      config,
      indentation,
      depth,
      refs,
      printer2
    ) : LAZY}}`;
  }
  return `${name + SPACE}[${val._iter || val._array || val._collection || val._iterable ? printIteratorValues(
    val.values(),
    config,
    indentation,
    depth,
    refs,
    printer2
  ) : LAZY}]`;
}
function printImmutableValues(val, config, indentation, depth, refs, printer2, type) {
  return ++depth > config.maxDepth ? printAsLeaf(getImmutableName(type)) : `${getImmutableName(type) + SPACE}[${printIteratorValues(
    val.values(),
    config,
    indentation,
    depth,
    refs,
    printer2
  )}]`;
}
const serialize$2 = (val, config, indentation, depth, refs, printer2) => {
  if (val[IS_MAP_SENTINEL]) {
    return printImmutableEntries(
      val,
      config,
      indentation,
      depth,
      refs,
      printer2,
      val[IS_ORDERED_SENTINEL$1] ? "OrderedMap" : "Map"
    );
  }
  if (val[IS_LIST_SENTINEL$1]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer2,
      "List"
    );
  }
  if (val[IS_SET_SENTINEL$1]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer2,
      val[IS_ORDERED_SENTINEL$1] ? "OrderedSet" : "Set"
    );
  }
  if (val[IS_STACK_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer2,
      "Stack"
    );
  }
  if (val[IS_SEQ_SENTINEL]) {
    return printImmutableSeq(val, config, indentation, depth, refs, printer2);
  }
  return printImmutableRecord(val, config, indentation, depth, refs, printer2);
};
const test$2$1 = (val) => val && (val[IS_ITERABLE_SENTINEL] === true || val[IS_RECORD_SENTINEL] === true);
const plugin$2 = { serialize: serialize$2, test: test$2$1 };
function getDefaultExportFromCjs$4(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var reactIs$1 = { exports: {} };
var reactIs_production = {};
/**
 * @license React
 * react-is.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_production;
function requireReactIs_production() {
  if (hasRequiredReactIs_production)
    return reactIs_production;
  hasRequiredReactIs_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function typeOf(object) {
    if ("object" === typeof object && null !== object) {
      var $$typeof = object.$$typeof;
      switch ($$typeof) {
        case REACT_ELEMENT_TYPE:
          switch (object = object.type, object) {
            case REACT_FRAGMENT_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_SUSPENSE_TYPE:
            case REACT_SUSPENSE_LIST_TYPE:
              return object;
            default:
              switch (object = object && object.$$typeof, object) {
                case REACT_CONTEXT_TYPE:
                case REACT_FORWARD_REF_TYPE:
                case REACT_LAZY_TYPE:
                case REACT_MEMO_TYPE:
                  return object;
                case REACT_CONSUMER_TYPE:
                  return object;
                default:
                  return $$typeof;
              }
          }
        case REACT_PORTAL_TYPE:
          return $$typeof;
      }
    }
  }
  reactIs_production.ContextConsumer = REACT_CONSUMER_TYPE;
  reactIs_production.ContextProvider = REACT_CONTEXT_TYPE;
  reactIs_production.Element = REACT_ELEMENT_TYPE;
  reactIs_production.ForwardRef = REACT_FORWARD_REF_TYPE;
  reactIs_production.Fragment = REACT_FRAGMENT_TYPE;
  reactIs_production.Lazy = REACT_LAZY_TYPE;
  reactIs_production.Memo = REACT_MEMO_TYPE;
  reactIs_production.Portal = REACT_PORTAL_TYPE;
  reactIs_production.Profiler = REACT_PROFILER_TYPE;
  reactIs_production.StrictMode = REACT_STRICT_MODE_TYPE;
  reactIs_production.Suspense = REACT_SUSPENSE_TYPE;
  reactIs_production.SuspenseList = REACT_SUSPENSE_LIST_TYPE;
  reactIs_production.isContextConsumer = function(object) {
    return typeOf(object) === REACT_CONSUMER_TYPE;
  };
  reactIs_production.isContextProvider = function(object) {
    return typeOf(object) === REACT_CONTEXT_TYPE;
  };
  reactIs_production.isElement = function(object) {
    return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
  };
  reactIs_production.isForwardRef = function(object) {
    return typeOf(object) === REACT_FORWARD_REF_TYPE;
  };
  reactIs_production.isFragment = function(object) {
    return typeOf(object) === REACT_FRAGMENT_TYPE;
  };
  reactIs_production.isLazy = function(object) {
    return typeOf(object) === REACT_LAZY_TYPE;
  };
  reactIs_production.isMemo = function(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
  };
  reactIs_production.isPortal = function(object) {
    return typeOf(object) === REACT_PORTAL_TYPE;
  };
  reactIs_production.isProfiler = function(object) {
    return typeOf(object) === REACT_PROFILER_TYPE;
  };
  reactIs_production.isStrictMode = function(object) {
    return typeOf(object) === REACT_STRICT_MODE_TYPE;
  };
  reactIs_production.isSuspense = function(object) {
    return typeOf(object) === REACT_SUSPENSE_TYPE;
  };
  reactIs_production.isSuspenseList = function(object) {
    return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
  };
  reactIs_production.isValidElementType = function(type) {
    return "string" === typeof type || "function" === typeof type || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_OFFSCREEN_TYPE || "object" === typeof type && null !== type && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || void 0 !== type.getModuleId) ? true : false;
  };
  reactIs_production.typeOf = typeOf;
  return reactIs_production;
}
var reactIs_development$1 = {};
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_development$1;
function requireReactIs_development$1() {
  if (hasRequiredReactIs_development$1)
    return reactIs_development$1;
  hasRequiredReactIs_development$1 = 1;
  return reactIs_development$1;
}
var hasRequiredReactIs$1;
function requireReactIs$1() {
  if (hasRequiredReactIs$1)
    return reactIs$1.exports;
  hasRequiredReactIs$1 = 1;
  if (true) {
    reactIs$1.exports = requireReactIs_production();
  } else {
    reactIs$1.exports = requireReactIs_development$1();
  }
  return reactIs$1.exports;
}
var reactIsExports$1 = /* @__PURE__ */ requireReactIs$1();
var index$1 = /* @__PURE__ */ getDefaultExportFromCjs$4(reactIsExports$1);
var ReactIs19 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: index$1
}, [reactIsExports$1]);
var reactIs = { exports: {} };
var reactIs_production_min = {};
/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_production_min;
function requireReactIs_production_min() {
  if (hasRequiredReactIs_production_min)
    return reactIs_production_min;
  hasRequiredReactIs_production_min = 1;
  var b = Symbol.for("react.element"), c = Symbol.for("react.portal"), d = Symbol.for("react.fragment"), e = Symbol.for("react.strict_mode"), f = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), h = Symbol.for("react.context"), k = Symbol.for("react.server_context"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), q = Symbol.for("react.lazy"), t = Symbol.for("react.offscreen"), u;
  u = Symbol.for("react.module.reference");
  function v(a) {
    if ("object" === typeof a && null !== a) {
      var r = a.$$typeof;
      switch (r) {
        case b:
          switch (a = a.type, a) {
            case d:
            case f:
            case e:
            case m:
            case n:
              return a;
            default:
              switch (a = a && a.$$typeof, a) {
                case k:
                case h:
                case l:
                case q:
                case p:
                case g:
                  return a;
                default:
                  return r;
              }
          }
        case c:
          return r;
      }
    }
  }
  reactIs_production_min.ContextConsumer = h;
  reactIs_production_min.ContextProvider = g;
  reactIs_production_min.Element = b;
  reactIs_production_min.ForwardRef = l;
  reactIs_production_min.Fragment = d;
  reactIs_production_min.Lazy = q;
  reactIs_production_min.Memo = p;
  reactIs_production_min.Portal = c;
  reactIs_production_min.Profiler = f;
  reactIs_production_min.StrictMode = e;
  reactIs_production_min.Suspense = m;
  reactIs_production_min.SuspenseList = n;
  reactIs_production_min.isAsyncMode = function() {
    return false;
  };
  reactIs_production_min.isConcurrentMode = function() {
    return false;
  };
  reactIs_production_min.isContextConsumer = function(a) {
    return v(a) === h;
  };
  reactIs_production_min.isContextProvider = function(a) {
    return v(a) === g;
  };
  reactIs_production_min.isElement = function(a) {
    return "object" === typeof a && null !== a && a.$$typeof === b;
  };
  reactIs_production_min.isForwardRef = function(a) {
    return v(a) === l;
  };
  reactIs_production_min.isFragment = function(a) {
    return v(a) === d;
  };
  reactIs_production_min.isLazy = function(a) {
    return v(a) === q;
  };
  reactIs_production_min.isMemo = function(a) {
    return v(a) === p;
  };
  reactIs_production_min.isPortal = function(a) {
    return v(a) === c;
  };
  reactIs_production_min.isProfiler = function(a) {
    return v(a) === f;
  };
  reactIs_production_min.isStrictMode = function(a) {
    return v(a) === e;
  };
  reactIs_production_min.isSuspense = function(a) {
    return v(a) === m;
  };
  reactIs_production_min.isSuspenseList = function(a) {
    return v(a) === n;
  };
  reactIs_production_min.isValidElementType = function(a) {
    return "string" === typeof a || "function" === typeof a || a === d || a === f || a === e || a === m || a === n || a === t || "object" === typeof a && null !== a && (a.$$typeof === q || a.$$typeof === p || a.$$typeof === g || a.$$typeof === h || a.$$typeof === l || a.$$typeof === u || void 0 !== a.getModuleId) ? true : false;
  };
  reactIs_production_min.typeOf = v;
  return reactIs_production_min;
}
var reactIs_development = {};
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactIs_development;
function requireReactIs_development() {
  if (hasRequiredReactIs_development)
    return reactIs_development;
  hasRequiredReactIs_development = 1;
  if (false) {
    (function() {
      var REACT_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_SERVER_CONTEXT_TYPE = Symbol.for("react.server_context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      var enableScopeAPI = false;
      var enableCacheElement = false;
      var enableTransitionTracing = false;
      var enableLegacyHidden = false;
      var enableDebugTracing = false;
      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
      }
      function isValidElementType(type) {
        if (typeof type === "string" || typeof type === "function") {
          return true;
        }
        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === "object" && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
            return true;
          }
        }
        return false;
      }
      function typeOf(object) {
        if (typeof object === "object" && object !== null) {
          var $$typeof = object.$$typeof;
          switch ($$typeof) {
            case REACT_ELEMENT_TYPE:
              var type = object.type;
              switch (type) {
                case REACT_FRAGMENT_TYPE:
                case REACT_PROFILER_TYPE:
                case REACT_STRICT_MODE_TYPE:
                case REACT_SUSPENSE_TYPE:
                case REACT_SUSPENSE_LIST_TYPE:
                  return type;
                default:
                  var $$typeofType = type && type.$$typeof;
                  switch ($$typeofType) {
                    case REACT_SERVER_CONTEXT_TYPE:
                    case REACT_CONTEXT_TYPE:
                    case REACT_FORWARD_REF_TYPE:
                    case REACT_LAZY_TYPE:
                    case REACT_MEMO_TYPE:
                    case REACT_PROVIDER_TYPE:
                      return $$typeofType;
                    default:
                      return $$typeof;
                  }
              }
            case REACT_PORTAL_TYPE:
              return $$typeof;
          }
        }
        return void 0;
      }
      var ContextConsumer = REACT_CONTEXT_TYPE;
      var ContextProvider = REACT_PROVIDER_TYPE;
      var Element = REACT_ELEMENT_TYPE;
      var ForwardRef = REACT_FORWARD_REF_TYPE;
      var Fragment = REACT_FRAGMENT_TYPE;
      var Lazy = REACT_LAZY_TYPE;
      var Memo = REACT_MEMO_TYPE;
      var Portal = REACT_PORTAL_TYPE;
      var Profiler = REACT_PROFILER_TYPE;
      var StrictMode = REACT_STRICT_MODE_TYPE;
      var Suspense = REACT_SUSPENSE_TYPE;
      var SuspenseList = REACT_SUSPENSE_LIST_TYPE;
      var hasWarnedAboutDeprecatedIsAsyncMode = false;
      var hasWarnedAboutDeprecatedIsConcurrentMode = false;
      function isAsyncMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsAsyncMode) {
            hasWarnedAboutDeprecatedIsAsyncMode = true;
            console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.");
          }
        }
        return false;
      }
      function isConcurrentMode(object) {
        {
          if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
            hasWarnedAboutDeprecatedIsConcurrentMode = true;
            console["warn"]("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.");
          }
        }
        return false;
      }
      function isContextConsumer(object) {
        return typeOf(object) === REACT_CONTEXT_TYPE;
      }
      function isContextProvider(object) {
        return typeOf(object) === REACT_PROVIDER_TYPE;
      }
      function isElement(object) {
        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function isForwardRef(object) {
        return typeOf(object) === REACT_FORWARD_REF_TYPE;
      }
      function isFragment(object) {
        return typeOf(object) === REACT_FRAGMENT_TYPE;
      }
      function isLazy(object) {
        return typeOf(object) === REACT_LAZY_TYPE;
      }
      function isMemo(object) {
        return typeOf(object) === REACT_MEMO_TYPE;
      }
      function isPortal(object) {
        return typeOf(object) === REACT_PORTAL_TYPE;
      }
      function isProfiler(object) {
        return typeOf(object) === REACT_PROFILER_TYPE;
      }
      function isStrictMode(object) {
        return typeOf(object) === REACT_STRICT_MODE_TYPE;
      }
      function isSuspense(object) {
        return typeOf(object) === REACT_SUSPENSE_TYPE;
      }
      function isSuspenseList(object) {
        return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
      }
      reactIs_development.ContextConsumer = ContextConsumer;
      reactIs_development.ContextProvider = ContextProvider;
      reactIs_development.Element = Element;
      reactIs_development.ForwardRef = ForwardRef;
      reactIs_development.Fragment = Fragment;
      reactIs_development.Lazy = Lazy;
      reactIs_development.Memo = Memo;
      reactIs_development.Portal = Portal;
      reactIs_development.Profiler = Profiler;
      reactIs_development.StrictMode = StrictMode;
      reactIs_development.Suspense = Suspense;
      reactIs_development.SuspenseList = SuspenseList;
      reactIs_development.isAsyncMode = isAsyncMode;
      reactIs_development.isConcurrentMode = isConcurrentMode;
      reactIs_development.isContextConsumer = isContextConsumer;
      reactIs_development.isContextProvider = isContextProvider;
      reactIs_development.isElement = isElement;
      reactIs_development.isForwardRef = isForwardRef;
      reactIs_development.isFragment = isFragment;
      reactIs_development.isLazy = isLazy;
      reactIs_development.isMemo = isMemo;
      reactIs_development.isPortal = isPortal;
      reactIs_development.isProfiler = isProfiler;
      reactIs_development.isStrictMode = isStrictMode;
      reactIs_development.isSuspense = isSuspense;
      reactIs_development.isSuspenseList = isSuspenseList;
      reactIs_development.isValidElementType = isValidElementType;
      reactIs_development.typeOf = typeOf;
    })();
  }
  return reactIs_development;
}
var hasRequiredReactIs;
function requireReactIs() {
  if (hasRequiredReactIs)
    return reactIs.exports;
  hasRequiredReactIs = 1;
  if (true) {
    reactIs.exports = requireReactIs_production_min();
  } else {
    reactIs.exports = requireReactIs_development();
  }
  return reactIs.exports;
}
var reactIsExports = requireReactIs();
var index$2 = /* @__PURE__ */ getDefaultExportFromCjs$4(reactIsExports);
var ReactIs18 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: index$2
}, [reactIsExports]);
const reactIsMethods = [
  "isAsyncMode",
  "isConcurrentMode",
  "isContextConsumer",
  "isContextProvider",
  "isElement",
  "isForwardRef",
  "isFragment",
  "isLazy",
  "isMemo",
  "isPortal",
  "isProfiler",
  "isStrictMode",
  "isSuspense",
  "isSuspenseList",
  "isValidElementType"
];
const ReactIs = Object.fromEntries(
  reactIsMethods.map((m) => [m, (v) => ReactIs18[m](v) || ReactIs19[m](v)])
);
function getChildren(arg, children = []) {
  if (Array.isArray(arg)) {
    for (const item of arg) {
      getChildren(item, children);
    }
  } else if (arg != null && arg !== false && arg !== "") {
    children.push(arg);
  }
  return children;
}
function getType$2(element) {
  const type = element.type;
  if (typeof type === "string") {
    return type;
  }
  if (typeof type === "function") {
    return type.displayName || type.name || "Unknown";
  }
  if (ReactIs.isFragment(element)) {
    return "React.Fragment";
  }
  if (ReactIs.isSuspense(element)) {
    return "React.Suspense";
  }
  if (typeof type === "object" && type !== null) {
    if (ReactIs.isContextProvider(element)) {
      return "Context.Provider";
    }
    if (ReactIs.isContextConsumer(element)) {
      return "Context.Consumer";
    }
    if (ReactIs.isForwardRef(element)) {
      if (type.displayName) {
        return type.displayName;
      }
      const functionName = type.render.displayName || type.render.name || "";
      return functionName === "" ? "ForwardRef" : `ForwardRef(${functionName})`;
    }
    if (ReactIs.isMemo(element)) {
      const functionName = type.displayName || type.type.displayName || type.type.name || "";
      return functionName === "" ? "Memo" : `Memo(${functionName})`;
    }
  }
  return "UNDEFINED";
}
function getPropKeys$1(element) {
  const { props } = element;
  return Object.keys(props).filter((key) => key !== "children" && props[key] !== void 0).sort();
}
const serialize$1$1 = (element, config, indentation, depth, refs, printer2) => ++depth > config.maxDepth ? printElementAsLeaf(getType$2(element), config) : printElement(
  getType$2(element),
  printProps(
    getPropKeys$1(element),
    element.props,
    config,
    indentation + config.indent,
    depth,
    refs,
    printer2
  ),
  printChildren(
    getChildren(element.props.children),
    config,
    indentation + config.indent,
    depth,
    refs,
    printer2
  ),
  config,
  indentation
);
const test$1$1 = (val) => val != null && ReactIs.isElement(val);
const plugin$1 = { serialize: serialize$1$1, test: test$1$1 };
const testSymbol = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.test.json") : 245830487;
function getPropKeys(object) {
  const { props } = object;
  return props ? Object.keys(props).filter((key) => props[key] !== void 0).sort() : [];
}
const serialize$6 = (object, config, indentation, depth, refs, printer2) => ++depth > config.maxDepth ? printElementAsLeaf(object.type, config) : printElement(
  object.type,
  object.props ? printProps(
    getPropKeys(object),
    object.props,
    config,
    indentation + config.indent,
    depth,
    refs,
    printer2
  ) : "",
  object.children ? printChildren(
    object.children,
    config,
    indentation + config.indent,
    depth,
    refs,
    printer2
  ) : "",
  config,
  indentation
);
const test$6 = (val) => val && val.$$typeof === testSymbol;
const plugin$6 = { serialize: serialize$6, test: test$6 };
const toString$3 = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
function getConstructorName$1(val) {
  return typeof val.constructor === "function" && val.constructor.name || "Object";
}
function isWindow(val) {
  return typeof window !== "undefined" && val === window;
}
const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
const NEWLINE_REGEXP = /\n/g;
class PrettyFormatPluginError extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
    this.name = this.constructor.name;
  }
}
function isToStringedArrayType(toStringed) {
  return toStringed === "[object Array]" || toStringed === "[object ArrayBuffer]" || toStringed === "[object DataView]" || toStringed === "[object Float32Array]" || toStringed === "[object Float64Array]" || toStringed === "[object Int8Array]" || toStringed === "[object Int16Array]" || toStringed === "[object Int32Array]" || toStringed === "[object Uint8Array]" || toStringed === "[object Uint8ClampedArray]" || toStringed === "[object Uint16Array]" || toStringed === "[object Uint32Array]";
}
function printNumber(val) {
  return Object.is(val, -0) ? "-0" : String(val);
}
function printBigInt(val) {
  return String(`${val}n`);
}
function printFunction(val, printFunctionName) {
  if (!printFunctionName) {
    return "[Function]";
  }
  return `[Function ${val.name || "anonymous"}]`;
}
function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, "Symbol($1)");
}
function printError(val) {
  return `[${errorToString.call(val)}]`;
}
function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false) {
    return `${val}`;
  }
  if (val === void 0) {
    return "undefined";
  }
  if (val === null) {
    return "null";
  }
  const typeOf = typeof val;
  if (typeOf === "number") {
    return printNumber(val);
  }
  if (typeOf === "bigint") {
    return printBigInt(val);
  }
  if (typeOf === "string") {
    if (escapeString) {
      return `"${val.replaceAll(/"|\\/g, "\\$&")}"`;
    }
    return `"${val}"`;
  }
  if (typeOf === "function") {
    return printFunction(val, printFunctionName);
  }
  if (typeOf === "symbol") {
    return printSymbol(val);
  }
  const toStringed = toString$3.call(val);
  if (toStringed === "[object WeakMap]") {
    return "WeakMap {}";
  }
  if (toStringed === "[object WeakSet]") {
    return "WeakSet {}";
  }
  if (toStringed === "[object Function]" || toStringed === "[object GeneratorFunction]") {
    return printFunction(val, printFunctionName);
  }
  if (toStringed === "[object Symbol]") {
    return printSymbol(val);
  }
  if (toStringed === "[object Date]") {
    return Number.isNaN(+val) ? "Date { NaN }" : toISOString.call(val);
  }
  if (toStringed === "[object Error]") {
    return printError(val);
  }
  if (toStringed === "[object RegExp]") {
    if (escapeRegex) {
      return regExpToString.call(val).replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");
    }
    return regExpToString.call(val);
  }
  if (val instanceof Error) {
    return printError(val);
  }
  return null;
}
function printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON) {
  if (refs.includes(val)) {
    return "[Circular]";
  }
  refs = [...refs];
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;
  if (config.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === "function" && !hasCalledToJSON) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }
  const toStringed = toString$3.call(val);
  if (toStringed === "[object Arguments]") {
    return hitMaxDepth ? "[Arguments]" : `${min ? "" : "Arguments "}[${printListItems(
      val,
      config,
      indentation,
      depth,
      refs,
      printer
    )}]`;
  }
  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth ? `[${val.constructor.name}]` : `${min ? "" : !config.printBasicPrototype && val.constructor.name === "Array" ? "" : `${val.constructor.name} `}[${printListItems(val, config, indentation, depth, refs, printer)}]`;
  }
  if (toStringed === "[object Map]") {
    return hitMaxDepth ? "[Map]" : `Map {${printIteratorEntries(
      val.entries(),
      config,
      indentation,
      depth,
      refs,
      printer,
      " => "
    )}}`;
  }
  if (toStringed === "[object Set]") {
    return hitMaxDepth ? "[Set]" : `Set {${printIteratorValues(
      val.values(),
      config,
      indentation,
      depth,
      refs,
      printer
    )}}`;
  }
  return hitMaxDepth || isWindow(val) ? `[${getConstructorName$1(val)}]` : `${min ? "" : !config.printBasicPrototype && getConstructorName$1(val) === "Object" ? "" : `${getConstructorName$1(val)} `}{${printObjectProperties(
    val,
    config,
    indentation,
    depth,
    refs,
    printer
  )}}`;
}
const ErrorPlugin = {
  test: (val) => val && val instanceof Error,
  serialize(val, config, indentation, depth, refs, printer2) {
    if (refs.includes(val)) {
      return "[Circular]";
    }
    refs = [...refs, val];
    const hitMaxDepth = ++depth > config.maxDepth;
    const { message, cause, ...rest } = val;
    const entries = {
      message,
      ...typeof cause !== "undefined" ? { cause } : {},
      ...val instanceof AggregateError ? { errors: val.errors } : {},
      ...rest
    };
    const name = val.name !== "Error" ? val.name : getConstructorName$1(val);
    return hitMaxDepth ? `[${name}]` : `${name} {${printIteratorEntries(
      Object.entries(entries).values(),
      config,
      indentation,
      depth,
      refs,
      printer2
    )}}`;
  }
};
function isNewPlugin(plugin2) {
  return plugin2.serialize != null;
}
function printPlugin(plugin2, val, config, indentation, depth, refs) {
  let printed;
  try {
    printed = isNewPlugin(plugin2) ? plugin2.serialize(val, config, indentation, depth, refs, printer) : plugin2.print(
      val,
      (valChild) => printer(valChild, config, indentation, depth, refs),
      (str) => {
        const indentationNext = indentation + config.indent;
        return indentationNext + str.replaceAll(NEWLINE_REGEXP, `
${indentationNext}`);
      },
      {
        edgeSpacing: config.spacingOuter,
        min: config.min,
        spacing: config.spacingInner
      },
      config.colors
    );
  } catch (error) {
    throw new PrettyFormatPluginError(error.message, error.stack);
  }
  if (typeof printed !== "string") {
    throw new TypeError(
      `pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`
    );
  }
  return printed;
}
function findPlugin(plugins2, val) {
  for (const plugin2 of plugins2) {
    try {
      if (plugin2.test(val)) {
        return plugin2;
      }
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }
  return null;
}
function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin2 = findPlugin(config.plugins, val);
  if (plugin2 !== null) {
    return printPlugin(plugin2, val, config, indentation, depth, refs);
  }
  const basicResult = printBasicValue(
    val,
    config.printFunctionName,
    config.escapeRegex,
    config.escapeString
  );
  if (basicResult !== null) {
    return basicResult;
  }
  return printComplexValue(
    val,
    config,
    indentation,
    depth,
    refs,
    hasCalledToJSON
  );
}
const DEFAULT_THEME = {
  comment: "gray",
  content: "reset",
  prop: "yellow",
  tag: "cyan",
  value: "green"
};
const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
const DEFAULT_OPTIONS = {
  callToJSON: true,
  compareKeys: void 0,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Number.POSITIVE_INFINITY,
  maxWidth: Number.POSITIVE_INFINITY,
  min: false,
  plugins: [],
  printBasicPrototype: true,
  printFunctionName: true,
  theme: DEFAULT_THEME
};
function validateOptions(options) {
  for (const key of Object.keys(options)) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_OPTIONS, key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  }
  if (options.min && options.indent !== void 0 && options.indent !== 0) {
    throw new Error(
      'pretty-format: Options "min" and "indent" cannot be used together.'
    );
  }
}
function getColorsHighlight() {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = DEFAULT_THEME[key];
    const color = value && s[value];
    if (color && typeof color.close === "string" && typeof color.open === "string") {
      colors[key] = color;
    } else {
      throw new Error(
        `pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`
      );
    }
    return colors;
  }, /* @__PURE__ */ Object.create(null));
}
function getColorsEmpty() {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = { close: "", open: "" };
    return colors;
  }, /* @__PURE__ */ Object.create(null));
}
function getPrintFunctionName(options) {
  return (options == null ? void 0 : options.printFunctionName) ?? DEFAULT_OPTIONS.printFunctionName;
}
function getEscapeRegex(options) {
  return (options == null ? void 0 : options.escapeRegex) ?? DEFAULT_OPTIONS.escapeRegex;
}
function getEscapeString(options) {
  return (options == null ? void 0 : options.escapeString) ?? DEFAULT_OPTIONS.escapeString;
}
function getConfig(options) {
  return {
    callToJSON: (options == null ? void 0 : options.callToJSON) ?? DEFAULT_OPTIONS.callToJSON,
    colors: (options == null ? void 0 : options.highlight) ? getColorsHighlight() : getColorsEmpty(),
    compareKeys: typeof (options == null ? void 0 : options.compareKeys) === "function" || (options == null ? void 0 : options.compareKeys) === null ? options.compareKeys : DEFAULT_OPTIONS.compareKeys,
    escapeRegex: getEscapeRegex(options),
    escapeString: getEscapeString(options),
    indent: (options == null ? void 0 : options.min) ? "" : createIndent((options == null ? void 0 : options.indent) ?? DEFAULT_OPTIONS.indent),
    maxDepth: (options == null ? void 0 : options.maxDepth) ?? DEFAULT_OPTIONS.maxDepth,
    maxWidth: (options == null ? void 0 : options.maxWidth) ?? DEFAULT_OPTIONS.maxWidth,
    min: (options == null ? void 0 : options.min) ?? DEFAULT_OPTIONS.min,
    plugins: (options == null ? void 0 : options.plugins) ?? DEFAULT_OPTIONS.plugins,
    printBasicPrototype: (options == null ? void 0 : options.printBasicPrototype) ?? true,
    printFunctionName: getPrintFunctionName(options),
    spacingInner: (options == null ? void 0 : options.min) ? " " : "\n",
    spacingOuter: (options == null ? void 0 : options.min) ? "" : "\n"
  };
}
function createIndent(indent) {
  return Array.from({ length: indent + 1 }).join(" ");
}
function format$2(val, options) {
  if (options) {
    validateOptions(options);
    if (options.plugins) {
      const plugin2 = findPlugin(options.plugins, val);
      if (plugin2 !== null) {
        return printPlugin(plugin2, val, getConfig(options), "", 0, []);
      }
    }
  }
  const basicResult = printBasicValue(
    val,
    getPrintFunctionName(options),
    getEscapeRegex(options),
    getEscapeString(options)
  );
  if (basicResult !== null) {
    return basicResult;
  }
  return printComplexValue(val, getConfig(options), "", 0, []);
}
const plugins = {
  AsymmetricMatcher: plugin$5,
  DOMCollection: plugin$4,
  DOMElement: plugin$3,
  Immutable: plugin$2,
  ReactElement: plugin$1,
  ReactTestComponent: plugin$6,
  Error: ErrorPlugin
};

const ansiColors$1 = {
    bold: ['1', '22'],
    dim: ['2', '22'],
    italic: ['3', '23'],
    underline: ['4', '24'],
    // 5 & 6 are blinking
    inverse: ['7', '27'],
    hidden: ['8', '28'],
    strike: ['9', '29'],
    // 10-20 are fonts
    // 21-29 are resets for 1-9
    black: ['30', '39'],
    red: ['31', '39'],
    green: ['32', '39'],
    yellow: ['33', '39'],
    blue: ['34', '39'],
    magenta: ['35', '39'],
    cyan: ['36', '39'],
    white: ['37', '39'],
    brightblack: ['30;1', '39'],
    brightred: ['31;1', '39'],
    brightgreen: ['32;1', '39'],
    brightyellow: ['33;1', '39'],
    brightblue: ['34;1', '39'],
    brightmagenta: ['35;1', '39'],
    brightcyan: ['36;1', '39'],
    brightwhite: ['37;1', '39'],
    grey: ['90', '39'],
};
const styles$1 = {
    special: 'cyan',
    number: 'yellow',
    bigint: 'yellow',
    boolean: 'yellow',
    undefined: 'grey',
    null: 'bold',
    string: 'green',
    symbol: 'green',
    date: 'magenta',
    regexp: 'red',
};
const truncator$1 = '…';
function colorise$1(value, styleType) {
    const color = ansiColors$1[styles$1[styleType]] || ansiColors$1[styleType] || '';
    if (!color) {
        return String(value);
    }
    return `\u001b[${color[0]}m${String(value)}\u001b[${color[1]}m`;
}
function normaliseOptions$1({ showHidden = false, depth = 2, colors = false, customInspect = true, showProxy = false, maxArrayLength = Infinity, breakLength = Infinity, seen = [], 
// eslint-disable-next-line no-shadow
truncate = Infinity, stylize = String, } = {}, inspect) {
    const options = {
        showHidden: Boolean(showHidden),
        depth: Number(depth),
        colors: Boolean(colors),
        customInspect: Boolean(customInspect),
        showProxy: Boolean(showProxy),
        maxArrayLength: Number(maxArrayLength),
        breakLength: Number(breakLength),
        truncate: Number(truncate),
        seen,
        inspect,
        stylize,
    };
    if (options.colors) {
        options.stylize = colorise$1;
    }
    return options;
}
function isHighSurrogate$1(char) {
    return char >= '\ud800' && char <= '\udbff';
}
function truncate$1(string, length, tail = truncator$1) {
    string = String(string);
    const tailLength = tail.length;
    const stringLength = string.length;
    if (tailLength > length && stringLength > tailLength) {
        return tail;
    }
    if (stringLength > length && stringLength > tailLength) {
        let end = length - tailLength;
        if (end > 0 && isHighSurrogate$1(string[end - 1])) {
            end = end - 1;
        }
        return `${string.slice(0, end)}${tail}`;
    }
    return string;
}
// eslint-disable-next-line complexity
function inspectList$1(list, options, inspectItem, separator = ', ') {
    inspectItem = inspectItem || options.inspect;
    const size = list.length;
    if (size === 0)
        return '';
    const originalLength = options.truncate;
    let output = '';
    let peek = '';
    let truncated = '';
    for (let i = 0; i < size; i += 1) {
        const last = i + 1 === list.length;
        const secondToLast = i + 2 === list.length;
        truncated = `${truncator$1}(${list.length - i})`;
        const value = list[i];
        // If there is more than one remaining we need to account for a separator of `, `
        options.truncate = originalLength - output.length - (last ? 0 : separator.length);
        const string = peek || inspectItem(value, options) + (last ? '' : separator);
        const nextLength = output.length + string.length;
        const truncatedLength = nextLength + truncated.length;
        // If this is the last element, and adding it would
        // take us over length, but adding the truncator wouldn't - then break now
        if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
            break;
        }
        // If this isn't the last or second to last element to scan,
        // but the string is already over length then break here
        if (!last && !secondToLast && truncatedLength > originalLength) {
            break;
        }
        // Peek at the next string to determine if we should
        // break early before adding this item to the output
        peek = last ? '' : inspectItem(list[i + 1], options) + (secondToLast ? '' : separator);
        // If we have one element left, but this element and
        // the next takes over length, the break early
        if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
            break;
        }
        output += string;
        // If the next element takes us to length -
        // but there are more after that, then we should truncate now
        if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
            truncated = `${truncator$1}(${list.length - i - 1})`;
            break;
        }
        truncated = '';
    }
    return `${output}${truncated}`;
}
function quoteComplexKey$1(key) {
    if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
        return key;
    }
    return JSON.stringify(key)
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')
        .replace(/(^"|"$)/g, "'");
}
function inspectProperty$1([key, value], options) {
    options.truncate -= 2;
    if (typeof key === 'string') {
        key = quoteComplexKey$1(key);
    }
    else if (typeof key !== 'number') {
        key = `[${options.inspect(key, options)}]`;
    }
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key}: ${value}`;
}

function inspectArray$1(array, options) {
    // Object.keys will always output the Array indices first, so we can slice by
    // `array.length` to get non-index properties
    const nonIndexProperties = Object.keys(array).slice(array.length);
    if (!array.length && !nonIndexProperties.length)
        return '[]';
    options.truncate -= 4;
    const listContents = inspectList$1(array, options);
    options.truncate -= listContents.length;
    let propertyContents = '';
    if (nonIndexProperties.length) {
        propertyContents = inspectList$1(nonIndexProperties.map(key => [key, array[key]]), options, inspectProperty$1);
    }
    return `[ ${listContents}${propertyContents ? `, ${propertyContents}` : ''} ]`;
}

const getArrayName$1 = (array) => {
    // We need to special case Node.js' Buffers, which report to be Uint8Array
    // @ts-ignore
    if (typeof Buffer === 'function' && array instanceof Buffer) {
        return 'Buffer';
    }
    if (array[Symbol.toStringTag]) {
        return array[Symbol.toStringTag];
    }
    return array.constructor.name;
};
function inspectTypedArray$1(array, options) {
    const name = getArrayName$1(array);
    options.truncate -= name.length + 4;
    // Object.keys will always output the Array indices first, so we can slice by
    // `array.length` to get non-index properties
    const nonIndexProperties = Object.keys(array).slice(array.length);
    if (!array.length && !nonIndexProperties.length)
        return `${name}[]`;
    // As we know TypedArrays only contain Unsigned Integers, we can skip inspecting each one and simply
    // stylise the toString() value of them
    let output = '';
    for (let i = 0; i < array.length; i++) {
        const string = `${options.stylize(truncate$1(array[i], options.truncate), 'number')}${i === array.length - 1 ? '' : ', '}`;
        options.truncate -= string.length;
        if (array[i] !== array.length && options.truncate <= 3) {
            output += `${truncator$1}(${array.length - array[i] + 1})`;
            break;
        }
        output += string;
    }
    let propertyContents = '';
    if (nonIndexProperties.length) {
        propertyContents = inspectList$1(nonIndexProperties.map(key => [key, array[key]]), options, inspectProperty$1);
    }
    return `${name}[ ${output}${propertyContents ? `, ${propertyContents}` : ''} ]`;
}

function inspectDate$1(dateObject, options) {
    const stringRepresentation = dateObject.toJSON();
    if (stringRepresentation === null) {
        return 'Invalid Date';
    }
    const split = stringRepresentation.split('T');
    const date = split[0];
    // If we need to - truncate the time portion, but never the date
    return options.stylize(`${date}T${truncate$1(split[1], options.truncate - date.length - 1)}`, 'date');
}

function inspectFunction$1(func, options) {
    const functionType = func[Symbol.toStringTag] || 'Function';
    const name = func.name;
    if (!name) {
        return options.stylize(`[${functionType}]`, 'special');
    }
    return options.stylize(`[${functionType} ${truncate$1(name, options.truncate - 11)}]`, 'special');
}

function inspectMapEntry$1([key, value], options) {
    options.truncate -= 4;
    key = options.inspect(key, options);
    options.truncate -= key.length;
    value = options.inspect(value, options);
    return `${key} => ${value}`;
}
// IE11 doesn't support `map.entries()`
function mapToEntries$1(map) {
    const entries = [];
    map.forEach((value, key) => {
        entries.push([key, value]);
    });
    return entries;
}
function inspectMap$1(map, options) {
    if (map.size === 0)
        return 'Map{}';
    options.truncate -= 7;
    return `Map{ ${inspectList$1(mapToEntries$1(map), options, inspectMapEntry$1)} }`;
}

const isNaN$1 = Number.isNaN || (i => i !== i); // eslint-disable-line no-self-compare
function inspectNumber$1(number, options) {
    if (isNaN$1(number)) {
        return options.stylize('NaN', 'number');
    }
    if (number === Infinity) {
        return options.stylize('Infinity', 'number');
    }
    if (number === -Infinity) {
        return options.stylize('-Infinity', 'number');
    }
    if (number === 0) {
        return options.stylize(1 / number === Infinity ? '+0' : '-0', 'number');
    }
    return options.stylize(truncate$1(String(number), options.truncate), 'number');
}

function inspectBigInt$1(number, options) {
    let nums = truncate$1(number.toString(), options.truncate - 1);
    if (nums !== truncator$1)
        nums += 'n';
    return options.stylize(nums, 'bigint');
}

function inspectRegExp$1(value, options) {
    const flags = value.toString().split('/')[2];
    const sourceLength = options.truncate - (2 + flags.length);
    const source = value.source;
    return options.stylize(`/${truncate$1(source, sourceLength)}/${flags}`, 'regexp');
}

// IE11 doesn't support `Array.from(set)`
function arrayFromSet$1(set) {
    const values = [];
    set.forEach(value => {
        values.push(value);
    });
    return values;
}
function inspectSet$1(set, options) {
    if (set.size === 0)
        return 'Set{}';
    options.truncate -= 7;
    return `Set{ ${inspectList$1(arrayFromSet$1(set), options)} }`;
}

const stringEscapeChars$1 = new RegExp("['\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5" +
    '\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]', 'g');
const escapeCharacters$1 = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    "'": "\\'",
    '\\': '\\\\',
};
const hex$1 = 16;
const unicodeLength$1 = 4;
function escape$1(char) {
    return (escapeCharacters$1[char] ||
        `\\u${`0000${char.charCodeAt(0).toString(hex$1)}`.slice(-unicodeLength$1)}`);
}
function inspectString$1(string, options) {
    if (stringEscapeChars$1.test(string)) {
        string = string.replace(stringEscapeChars$1, escape$1);
    }
    return options.stylize(`'${truncate$1(string, options.truncate - 2)}'`, 'string');
}

function inspectSymbol$1(value) {
    if ('description' in Symbol.prototype) {
        return value.description ? `Symbol(${value.description})` : 'Symbol()';
    }
    return value.toString();
}

let getPromiseValue$2 = () => 'Promise{…}';
try {
    // @ts-ignore
    const { getPromiseDetails, kPending, kRejected } = process.binding('util');
    if (Array.isArray(getPromiseDetails(Promise.resolve()))) {
        getPromiseValue$2 = (value, options) => {
            const [state, innerValue] = getPromiseDetails(value);
            if (state === kPending) {
                return 'Promise{<pending>}';
            }
            return `Promise${state === kRejected ? '!' : ''}{${options.inspect(innerValue, options)}}`;
        };
    }
}
catch (notNode) {
    /* ignore */
}
const inspectPromise = getPromiseValue$2;

function inspectObject$2(object, options) {
    const properties = Object.getOwnPropertyNames(object);
    const symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : [];
    if (properties.length === 0 && symbols.length === 0) {
        return '{}';
    }
    options.truncate -= 4;
    options.seen = options.seen || [];
    if (options.seen.includes(object)) {
        return '[Circular]';
    }
    options.seen.push(object);
    const propertyContents = inspectList$1(properties.map(key => [key, object[key]]), options, inspectProperty$1);
    const symbolContents = inspectList$1(symbols.map(key => [key, object[key]]), options, inspectProperty$1);
    options.seen.pop();
    let sep = '';
    if (propertyContents && symbolContents) {
        sep = ', ';
    }
    return `{ ${propertyContents}${sep}${symbolContents} }`;
}

const toStringTag$1 = typeof Symbol !== 'undefined' && Symbol.toStringTag ? Symbol.toStringTag : false;
function inspectClass$1(value, options) {
    let name = '';
    if (toStringTag$1 && toStringTag$1 in value) {
        name = value[toStringTag$1];
    }
    name = name || value.constructor.name;
    // Babel transforms anonymous classes to the name `_class`
    if (!name || name === '_class') {
        name = '<Anonymous Class>';
    }
    options.truncate -= name.length;
    return `${name}${inspectObject$2(value, options)}`;
}

function inspectArguments$1(args, options) {
    if (args.length === 0)
        return 'Arguments[]';
    options.truncate -= 13;
    return `Arguments[ ${inspectList$1(args, options)} ]`;
}

const errorKeys$1 = [
    'stack',
    'line',
    'column',
    'name',
    'message',
    'fileName',
    'lineNumber',
    'columnNumber',
    'number',
    'description',
    'cause',
];
function inspectObject$1(error, options) {
    const properties = Object.getOwnPropertyNames(error).filter(key => errorKeys$1.indexOf(key) === -1);
    const name = error.name;
    options.truncate -= name.length;
    let message = '';
    if (typeof error.message === 'string') {
        message = truncate$1(error.message, options.truncate);
    }
    else {
        properties.unshift('message');
    }
    message = message ? `: ${message}` : '';
    options.truncate -= message.length + 5;
    options.seen = options.seen || [];
    if (options.seen.includes(error)) {
        return '[Circular]';
    }
    options.seen.push(error);
    const propertyContents = inspectList$1(properties.map(key => [key, error[key]]), options, inspectProperty$1);
    return `${name}${message}${propertyContents ? ` { ${propertyContents} }` : ''}`;
}

function inspectAttribute$1([key, value], options) {
    options.truncate -= 3;
    if (!value) {
        return `${options.stylize(String(key), 'yellow')}`;
    }
    return `${options.stylize(String(key), 'yellow')}=${options.stylize(`"${value}"`, 'string')}`;
}
// @ts-ignore (Deno doesn't have Element)
function inspectHTMLCollection$1(collection, options) {
    // eslint-disable-next-line no-use-before-define
    return inspectList$1(collection, options, inspectHTML$1, '\n');
}
// @ts-ignore (Deno doesn't have Element)
function inspectHTML$1(element, options) {
    const properties = element.getAttributeNames();
    const name = element.tagName.toLowerCase();
    const head = options.stylize(`<${name}`, 'special');
    const headClose = options.stylize(`>`, 'special');
    const tail = options.stylize(`</${name}>`, 'special');
    options.truncate -= name.length * 2 + 5;
    let propertyContents = '';
    if (properties.length > 0) {
        propertyContents += ' ';
        propertyContents += inspectList$1(properties.map((key) => [key, element.getAttribute(key)]), options, inspectAttribute$1, ' ');
    }
    options.truncate -= propertyContents.length;
    const truncate = options.truncate;
    let children = inspectHTMLCollection$1(element.children, options);
    if (children && children.length > truncate) {
        children = `${truncator$1}(${element.children.length})`;
    }
    return `${head}${propertyContents}${headClose}${children}${tail}`;
}

/* !
 * loupe
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
const symbolsSupported$1 = typeof Symbol === 'function' && typeof Symbol.for === 'function';
const chaiInspect$1 = symbolsSupported$1 ? Symbol.for('chai/inspect') : '@@chai/inspect';
let nodeInspect$2 = false;
try {
    // eslint-disable-next-line global-require
    // @ts-ignore
    const nodeUtil = require('util');
    nodeInspect$2 = nodeUtil.inspect ? nodeUtil.inspect.custom : false;
}
catch (noNodeInspect) {
    nodeInspect$2 = false;
}
const constructorMap$1 = new WeakMap();
const stringTagMap$1 = {};
const baseTypesMap$1 = {
    undefined: (value, options) => options.stylize('undefined', 'undefined'),
    null: (value, options) => options.stylize('null', 'null'),
    boolean: (value, options) => options.stylize(String(value), 'boolean'),
    Boolean: (value, options) => options.stylize(String(value), 'boolean'),
    number: inspectNumber$1,
    Number: inspectNumber$1,
    bigint: inspectBigInt$1,
    BigInt: inspectBigInt$1,
    string: inspectString$1,
    String: inspectString$1,
    function: inspectFunction$1,
    Function: inspectFunction$1,
    symbol: inspectSymbol$1,
    // A Symbol polyfill will return `Symbol` not `symbol` from typedetect
    Symbol: inspectSymbol$1,
    Array: inspectArray$1,
    Date: inspectDate$1,
    Map: inspectMap$1,
    Set: inspectSet$1,
    RegExp: inspectRegExp$1,
    Promise: inspectPromise,
    // WeakSet, WeakMap are totally opaque to us
    WeakSet: (value, options) => options.stylize('WeakSet{…}', 'special'),
    WeakMap: (value, options) => options.stylize('WeakMap{…}', 'special'),
    Arguments: inspectArguments$1,
    Int8Array: inspectTypedArray$1,
    Uint8Array: inspectTypedArray$1,
    Uint8ClampedArray: inspectTypedArray$1,
    Int16Array: inspectTypedArray$1,
    Uint16Array: inspectTypedArray$1,
    Int32Array: inspectTypedArray$1,
    Uint32Array: inspectTypedArray$1,
    Float32Array: inspectTypedArray$1,
    Float64Array: inspectTypedArray$1,
    Generator: () => '',
    DataView: () => '',
    ArrayBuffer: () => '',
    Error: inspectObject$1,
    HTMLCollection: inspectHTMLCollection$1,
    NodeList: inspectHTMLCollection$1,
};
// eslint-disable-next-line complexity
const inspectCustom$1 = (value, options, type) => {
    if (chaiInspect$1 in value && typeof value[chaiInspect$1] === 'function') {
        return value[chaiInspect$1](options);
    }
    if (nodeInspect$2 && nodeInspect$2 in value && typeof value[nodeInspect$2] === 'function') {
        return value[nodeInspect$2](options.depth, options);
    }
    if ('inspect' in value && typeof value.inspect === 'function') {
        return value.inspect(options.depth, options);
    }
    if ('constructor' in value && constructorMap$1.has(value.constructor)) {
        return constructorMap$1.get(value.constructor)(value, options);
    }
    if (stringTagMap$1[type]) {
        return stringTagMap$1[type](value, options);
    }
    return '';
};
const toString$2 = Object.prototype.toString;
// eslint-disable-next-line complexity
function inspect$2(value, opts = {}) {
    const options = normaliseOptions$1(opts, inspect$2);
    const { customInspect } = options;
    let type = value === null ? 'null' : typeof value;
    if (type === 'object') {
        type = toString$2.call(value).slice(8, -1);
    }
    // If it is a base value that we already support, then use Loupe's inspector
    if (type in baseTypesMap$1) {
        return baseTypesMap$1[type](value, options);
    }
    // If `options.customInspect` is set to true then try to use the custom inspector
    if (customInspect && value) {
        const output = inspectCustom$1(value, options, type);
        if (output) {
            if (typeof output === 'string')
                return output;
            return inspect$2(output, options);
        }
    }
    const proto = value ? Object.getPrototypeOf(value) : false;
    // If it's a plain Object then use Loupe's inspector
    if (proto === Object.prototype || proto === null) {
        return inspectObject$2(value, options);
    }
    // Specifically account for HTMLElements
    // @ts-ignore
    if (value && typeof HTMLElement === 'function' && value instanceof HTMLElement) {
        return inspectHTML$1(value, options);
    }
    if ('constructor' in value) {
        // If it is a class, inspect it like an object but add the constructor name
        if (value.constructor !== Object) {
            return inspectClass$1(value, options);
        }
        // If it is an object with an anonymous prototype, display it as an object.
        return inspectObject$2(value, options);
    }
    // last chance to check if it's an object
    if (value === Object(value)) {
        return inspectObject$2(value, options);
    }
    // We have run out of options! Just stringify the value
    return options.stylize(String(value), type);
}
function registerConstructor(constructor, inspector) {
    if (constructorMap$1.has(constructor)) {
        return false;
    }
    constructorMap$1.set(constructor, inspector);
    return true;
}
function registerStringTag(stringTag, inspector) {
    if (stringTag in stringTagMap$1) {
        return false;
    }
    stringTagMap$1[stringTag] = inspector;
    return true;
}
const custom = chaiInspect$1;

const {
  AsymmetricMatcher: AsymmetricMatcher$3,
  DOMCollection: DOMCollection$2,
  DOMElement: DOMElement$2,
  Immutable: Immutable$2,
  ReactElement: ReactElement$2,
  ReactTestComponent: ReactTestComponent$2
} = plugins;
const PLUGINS$2 = [
  ReactTestComponent$2,
  ReactElement$2,
  DOMElement$2,
  DOMCollection$2,
  Immutable$2,
  AsymmetricMatcher$3
];
function stringify(object, maxDepth = 10, { maxLength, ...options } = {}) {
  const MAX_LENGTH = maxLength ?? 1e4;
  let result;
  try {
    result = format$2(object, {
      maxDepth,
      escapeString: false,
      // min: true,
      plugins: PLUGINS$2,
      ...options
    });
  } catch {
    result = format$2(object, {
      callToJSON: false,
      maxDepth,
      escapeString: false,
      // min: true,
      plugins: PLUGINS$2,
      ...options
    });
  }
  return result.length >= MAX_LENGTH && maxDepth > 1 ? stringify(object, Math.floor(Math.min(maxDepth, Number.MAX_SAFE_INTEGER) / 2), { maxLength, ...options }) : result;
}
const formatRegExp = /%[sdjifoOc%]/g;
function format$1(...args) {
  if (typeof args[0] !== "string") {
    const objects = [];
    for (let i2 = 0; i2 < args.length; i2++) {
      objects.push(inspect$1(args[i2], { depth: 0, colors: false }));
    }
    return objects.join(" ");
  }
  const len = args.length;
  let i = 1;
  const template = args[0];
  let str = String(template).replace(formatRegExp, (x) => {
    if (x === "%%") {
      return "%";
    }
    if (i >= len) {
      return x;
    }
    switch (x) {
      case "%s": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        if (typeof value === "number" && value === 0 && 1 / value < 0) {
          return "-0";
        }
        if (typeof value === "object" && value !== null) {
          return inspect$1(value, { depth: 0, colors: false });
        }
        return String(value);
      }
      case "%d": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        return Number(value).toString();
      }
      case "%i": {
        const value = args[i++];
        if (typeof value === "bigint") {
          return `${value.toString()}n`;
        }
        return Number.parseInt(String(value)).toString();
      }
      case "%f":
        return Number.parseFloat(String(args[i++])).toString();
      case "%o":
        return inspect$1(args[i++], { showHidden: true, showProxy: true });
      case "%O":
        return inspect$1(args[i++]);
      case "%c": {
        i++;
        return "";
      }
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (err) {
          const m = err.message;
          if (
            // chromium
            m.includes("circular structure") || m.includes("cyclic structures") || m.includes("cyclic object")
          ) {
            return "[Circular]";
          }
          throw err;
        }
      default:
        return x;
    }
  });
  for (let x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== "object") {
      str += ` ${x}`;
    } else {
      str += ` ${inspect$1(x)}`;
    }
  }
  return str;
}
function inspect$1(obj, options = {}) {
  if (options.truncate === 0) {
    options.truncate = Number.POSITIVE_INFINITY;
  }
  return inspect$2(obj, options);
}
function objDisplay$1(obj, options = {}) {
  if (typeof options.truncate === "undefined") {
    options.truncate = 40;
  }
  const str = inspect$1(obj, options);
  const type = Object.prototype.toString.call(obj);
  if (options.truncate && str.length >= options.truncate) {
    if (type === "[object Function]") {
      const fn = obj;
      return !fn.name ? "[Function]" : `[Function: ${fn.name}]`;
    } else if (type === "[object Array]") {
      return `[ Array(${obj.length}) ]`;
    } else if (type === "[object Object]") {
      const keys = Object.keys(obj);
      const kstr = keys.length > 2 ? `${keys.splice(0, 2).join(", ")}, ...` : keys.join(", ");
      return `{ Object (${kstr}) }`;
    } else {
      return str;
    }
  }
  return str;
}

function getDefaultExportFromCjs$3 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createSimpleStackTrace(options) {
  const { message = "$$stack trace error", stackTraceLimit = 1 } = options || {};
  const limit = Error.stackTraceLimit;
  const prepareStackTrace = Error.prepareStackTrace;
  Error.stackTraceLimit = stackTraceLimit;
  Error.prepareStackTrace = (e) => e.stack;
  const err = new Error(message);
  const stackTrace = err.stack || "";
  Error.prepareStackTrace = prepareStackTrace;
  Error.stackTraceLimit = limit;
  return stackTrace;
}
function notNullish$1(v) {
  return v != null;
}
function assertTypes(value, name, types) {
  const receivedType = typeof value;
  const pass = types.includes(receivedType);
  if (!pass) {
    throw new TypeError(
      `${name} value must be ${types.join(" or ")}, received "${receivedType}"`
    );
  }
}
function isPrimitive$2(value) {
  return value === null || typeof value !== "function" && typeof value !== "object";
}
function slash(path) {
  return path.replace(/\\/g, "/");
}
function parseRegexp(input) {
  const m = input.match(/(\/?)(.+)\1([a-z]*)/i);
  if (!m) {
    return /$^/;
  }
  if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
    return new RegExp(input);
  }
  return new RegExp(m[2], m[3]);
}
function toArray(array) {
  if (array === null || array === undefined) {
    array = [];
  }
  if (Array.isArray(array)) {
    return array;
  }
  return [array];
}
function isObject$1(item) {
  return item != null && typeof item === "object" && !Array.isArray(item);
}
function isFinalObj(obj) {
  return obj === Object.prototype || obj === Function.prototype || obj === RegExp.prototype;
}
function getType$1(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}
function collectOwnProperties(obj, collector) {
  const collect = typeof collector === "function" ? collector : (key) => collector.add(key);
  Object.getOwnPropertyNames(obj).forEach(collect);
  Object.getOwnPropertySymbols(obj).forEach(collect);
}
function getOwnProperties(obj) {
  const ownProps = /* @__PURE__ */ new Set();
  if (isFinalObj(obj)) {
    return [];
  }
  collectOwnProperties(obj, ownProps);
  return Array.from(ownProps);
}
const defaultCloneOptions = { forceWritable: false };
function deepClone(val, options = defaultCloneOptions) {
  const seen = /* @__PURE__ */ new WeakMap();
  return clone(val, seen, options);
}
function clone(val, seen, options = defaultCloneOptions) {
  let k, out;
  if (seen.has(val)) {
    return seen.get(val);
  }
  if (Array.isArray(val)) {
    out = Array.from({ length: k = val.length });
    seen.set(val, out);
    while (k--) {
      out[k] = clone(val[k], seen, options);
    }
    return out;
  }
  if (Object.prototype.toString.call(val) === "[object Object]") {
    out = Object.create(Object.getPrototypeOf(val));
    seen.set(val, out);
    const props = getOwnProperties(val);
    for (const k2 of props) {
      const descriptor = Object.getOwnPropertyDescriptor(val, k2);
      if (!descriptor) {
        continue;
      }
      const cloned = clone(val[k2], seen, options);
      if (options.forceWritable) {
        Object.defineProperty(out, k2, {
          enumerable: descriptor.enumerable,
          configurable: true,
          writable: true,
          value: cloned
        });
      } else if ("get" in descriptor) {
        Object.defineProperty(out, k2, {
          ...descriptor,
          get() {
            return cloned;
          }
        });
      } else {
        Object.defineProperty(out, k2, {
          ...descriptor,
          value: cloned
        });
      }
    }
    return out;
  }
  return val;
}
function noop() {
}
function objectAttr(source, path, defaultValue = undefined) {
  const paths = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let result = source;
  for (const p of paths) {
    result = new Object(result)[p];
    if (result === undefined) {
      return defaultValue;
    }
  }
  return result;
}
function createDefer() {
  let resolve = null;
  let reject = null;
  const p = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  p.resolve = resolve;
  p.reject = reject;
  return p;
}
function getCallLastIndex$1(code) {
  let charIndex = -1;
  let inString = null;
  let startedBracers = 0;
  let endedBracers = 0;
  let beforeChar = null;
  while (charIndex <= code.length) {
    beforeChar = code[charIndex];
    charIndex++;
    const char = code[charIndex];
    const isCharString = char === '"' || char === "'" || char === "`";
    if (isCharString && beforeChar !== "\\") {
      if (inString === char) {
        inString = null;
      } else if (!inString) {
        inString = char;
      }
    }
    if (!inString) {
      if (char === "(") {
        startedBracers++;
      }
      if (char === ")") {
        endedBracers++;
      }
    }
    if (startedBracers && endedBracers && startedBracers === endedBracers) {
      return charIndex;
    }
  }
  return null;
}
function isNegativeNaN(val) {
  if (!Number.isNaN(val)) {
    return false;
  }
  const f64 = new Float64Array(1);
  f64[0] = val;
  const u32 = new Uint32Array(f64.buffer);
  const isNegative = u32[1] >>> 31 === 1;
  return isNegative;
}
function toString$1(v) {
  return Object.prototype.toString.call(v);
}
function isPlainObject(val) {
  return toString$1(val) === "[object Object]" && (!val.constructor || val.constructor.name === "Object");
}
function isMergeableObject(item) {
  return isPlainObject(item) && !Array.isArray(item);
}
function deepMerge(target, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (source === undefined) {
    return target;
  }
  if (isMergeableObject(target) && isMergeableObject(source)) {
    Object.keys(source).forEach((key) => {
      const _source = source;
      if (isMergeableObject(_source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], _source[key]);
      } else {
        target[key] = _source[key];
      }
    });
  }
  return deepMerge(target, ...sources);
}

var jsTokens_1$1;
var hasRequiredJsTokens$1;

function requireJsTokens$1 () {
	if (hasRequiredJsTokens$1) return jsTokens_1$1;
	hasRequiredJsTokens$1 = 1;
	// Copyright 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023 Simon Lydell
	// License: MIT.
	var Identifier, JSXIdentifier, JSXPunctuator, JSXString, JSXText, KeywordsWithExpressionAfter, KeywordsWithNoLineTerminatorAfter, LineTerminatorSequence, MultiLineComment, Newline, NumericLiteral, Punctuator, RegularExpressionLiteral, SingleLineComment, StringLiteral, Template, TokensNotPrecedingObjectLiteral, TokensPrecedingExpression, WhiteSpace;
	RegularExpressionLiteral = /\/(?![*\/])(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\\]).|\\.)*(\/[$_\u200C\u200D\p{ID_Continue}]*|\\)?/yu;
	Punctuator = /--|\+\+|=>|\.{3}|\??\.(?!\d)|(?:&&|\|\||\?\?|[+\-%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![\/*]))=?|[?~,:;[\](){}]/y;
	Identifier = /(\x23?)(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/yu;
	StringLiteral = /(['"])(?:(?!\1)[^\\\n\r]|\\(?:\r\n|[^]))*(\1)?/y;
	NumericLiteral = /(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?|0[0-7]+/y;
	Template = /[`}](?:[^`\\$]|\\[^]|\$(?!\{))*(`|\$\{)?/y;
	WhiteSpace = /[\t\v\f\ufeff\p{Zs}]+/yu;
	LineTerminatorSequence = /\r?\n|[\r\u2028\u2029]/y;
	MultiLineComment = /\/\*(?:[^*]|\*(?!\/))*(\*\/)?/y;
	SingleLineComment = /\/\/.*/y;
	JSXPunctuator = /[<>.:={}]|\/(?![\/*])/y;
	JSXIdentifier = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}-]*/yu;
	JSXString = /(['"])(?:(?!\1)[^])*(\1)?/y;
	JSXText = /[^<>{}]+/y;
	TokensPrecedingExpression = /^(?:[\/+-]|\.{3}|\?(?:InterpolationIn(?:JSX|Template)|NoLineTerminatorHere|NonExpressionParenEnd|UnaryIncDec))?$|[{}([,;<>=*%&|^!~?:]$/;
	TokensNotPrecedingObjectLiteral = /^(?:=>|[;\]){}]|else|\?(?:NoLineTerminatorHere|NonExpressionParenEnd))?$/;
	KeywordsWithExpressionAfter = /^(?:await|case|default|delete|do|else|instanceof|new|return|throw|typeof|void|yield)$/;
	KeywordsWithNoLineTerminatorAfter = /^(?:return|throw|yield)$/;
	Newline = RegExp(LineTerminatorSequence.source);
	jsTokens_1$1 = function*(input, {jsx = false} = {}) {
		var braces, firstCodePoint, isExpression, lastIndex, lastSignificantToken, length, match, mode, nextLastIndex, nextLastSignificantToken, parenNesting, postfixIncDec, punctuator, stack;
		({length} = input);
		lastIndex = 0;
		lastSignificantToken = "";
		stack = [
			{tag: "JS"}
		];
		braces = [];
		parenNesting = 0;
		postfixIncDec = false;
		while (lastIndex < length) {
			mode = stack[stack.length - 1];
			switch (mode.tag) {
				case "JS":
				case "JSNonExpressionParen":
				case "InterpolationInTemplate":
				case "InterpolationInJSX":
					if (input[lastIndex] === "/" && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken))) {
						RegularExpressionLiteral.lastIndex = lastIndex;
						if (match = RegularExpressionLiteral.exec(input)) {
							lastIndex = RegularExpressionLiteral.lastIndex;
							lastSignificantToken = match[0];
							postfixIncDec = true;
							yield ({
								type: "RegularExpressionLiteral",
								value: match[0],
								closed: match[1] !== undefined && match[1] !== "\\"
							});
							continue;
						}
					}
					Punctuator.lastIndex = lastIndex;
					if (match = Punctuator.exec(input)) {
						punctuator = match[0];
						nextLastIndex = Punctuator.lastIndex;
						nextLastSignificantToken = punctuator;
						switch (punctuator) {
							case "(":
								if (lastSignificantToken === "?NonExpressionParenKeyword") {
									stack.push({
										tag: "JSNonExpressionParen",
										nesting: parenNesting
									});
								}
								parenNesting++;
								postfixIncDec = false;
								break;
							case ")":
								parenNesting--;
								postfixIncDec = true;
								if (mode.tag === "JSNonExpressionParen" && parenNesting === mode.nesting) {
									stack.pop();
									nextLastSignificantToken = "?NonExpressionParenEnd";
									postfixIncDec = false;
								}
								break;
							case "{":
								Punctuator.lastIndex = 0;
								isExpression = !TokensNotPrecedingObjectLiteral.test(lastSignificantToken) && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken));
								braces.push(isExpression);
								postfixIncDec = false;
								break;
							case "}":
								switch (mode.tag) {
									case "InterpolationInTemplate":
										if (braces.length === mode.nesting) {
											Template.lastIndex = lastIndex;
											match = Template.exec(input);
											lastIndex = Template.lastIndex;
											lastSignificantToken = match[0];
											if (match[1] === "${") {
												lastSignificantToken = "?InterpolationInTemplate";
												postfixIncDec = false;
												yield ({
													type: "TemplateMiddle",
													value: match[0]
												});
											} else {
												stack.pop();
												postfixIncDec = true;
												yield ({
													type: "TemplateTail",
													value: match[0],
													closed: match[1] === "`"
												});
											}
											continue;
										}
										break;
									case "InterpolationInJSX":
										if (braces.length === mode.nesting) {
											stack.pop();
											lastIndex += 1;
											lastSignificantToken = "}";
											yield ({
												type: "JSXPunctuator",
												value: "}"
											});
											continue;
										}
								}
								postfixIncDec = braces.pop();
								nextLastSignificantToken = postfixIncDec ? "?ExpressionBraceEnd" : "}";
								break;
							case "]":
								postfixIncDec = true;
								break;
							case "++":
							case "--":
								nextLastSignificantToken = postfixIncDec ? "?PostfixIncDec" : "?UnaryIncDec";
								break;
							case "<":
								if (jsx && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken))) {
									stack.push({tag: "JSXTag"});
									lastIndex += 1;
									lastSignificantToken = "<";
									yield ({
										type: "JSXPunctuator",
										value: punctuator
									});
									continue;
								}
								postfixIncDec = false;
								break;
							default:
								postfixIncDec = false;
						}
						lastIndex = nextLastIndex;
						lastSignificantToken = nextLastSignificantToken;
						yield ({
							type: "Punctuator",
							value: punctuator
						});
						continue;
					}
					Identifier.lastIndex = lastIndex;
					if (match = Identifier.exec(input)) {
						lastIndex = Identifier.lastIndex;
						nextLastSignificantToken = match[0];
						switch (match[0]) {
							case "for":
							case "if":
							case "while":
							case "with":
								if (lastSignificantToken !== "." && lastSignificantToken !== "?.") {
									nextLastSignificantToken = "?NonExpressionParenKeyword";
								}
						}
						lastSignificantToken = nextLastSignificantToken;
						postfixIncDec = !KeywordsWithExpressionAfter.test(match[0]);
						yield ({
							type: match[1] === "#" ? "PrivateIdentifier" : "IdentifierName",
							value: match[0]
						});
						continue;
					}
					StringLiteral.lastIndex = lastIndex;
					if (match = StringLiteral.exec(input)) {
						lastIndex = StringLiteral.lastIndex;
						lastSignificantToken = match[0];
						postfixIncDec = true;
						yield ({
							type: "StringLiteral",
							value: match[0],
							closed: match[2] !== undefined
						});
						continue;
					}
					NumericLiteral.lastIndex = lastIndex;
					if (match = NumericLiteral.exec(input)) {
						lastIndex = NumericLiteral.lastIndex;
						lastSignificantToken = match[0];
						postfixIncDec = true;
						yield ({
							type: "NumericLiteral",
							value: match[0]
						});
						continue;
					}
					Template.lastIndex = lastIndex;
					if (match = Template.exec(input)) {
						lastIndex = Template.lastIndex;
						lastSignificantToken = match[0];
						if (match[1] === "${") {
							lastSignificantToken = "?InterpolationInTemplate";
							stack.push({
								tag: "InterpolationInTemplate",
								nesting: braces.length
							});
							postfixIncDec = false;
							yield ({
								type: "TemplateHead",
								value: match[0]
							});
						} else {
							postfixIncDec = true;
							yield ({
								type: "NoSubstitutionTemplate",
								value: match[0],
								closed: match[1] === "`"
							});
						}
						continue;
					}
					break;
				case "JSXTag":
				case "JSXTagEnd":
					JSXPunctuator.lastIndex = lastIndex;
					if (match = JSXPunctuator.exec(input)) {
						lastIndex = JSXPunctuator.lastIndex;
						nextLastSignificantToken = match[0];
						switch (match[0]) {
							case "<":
								stack.push({tag: "JSXTag"});
								break;
							case ">":
								stack.pop();
								if (lastSignificantToken === "/" || mode.tag === "JSXTagEnd") {
									nextLastSignificantToken = "?JSX";
									postfixIncDec = true;
								} else {
									stack.push({tag: "JSXChildren"});
								}
								break;
							case "{":
								stack.push({
									tag: "InterpolationInJSX",
									nesting: braces.length
								});
								nextLastSignificantToken = "?InterpolationInJSX";
								postfixIncDec = false;
								break;
							case "/":
								if (lastSignificantToken === "<") {
									stack.pop();
									if (stack[stack.length - 1].tag === "JSXChildren") {
										stack.pop();
									}
									stack.push({tag: "JSXTagEnd"});
								}
						}
						lastSignificantToken = nextLastSignificantToken;
						yield ({
							type: "JSXPunctuator",
							value: match[0]
						});
						continue;
					}
					JSXIdentifier.lastIndex = lastIndex;
					if (match = JSXIdentifier.exec(input)) {
						lastIndex = JSXIdentifier.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXIdentifier",
							value: match[0]
						});
						continue;
					}
					JSXString.lastIndex = lastIndex;
					if (match = JSXString.exec(input)) {
						lastIndex = JSXString.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXString",
							value: match[0],
							closed: match[2] !== undefined
						});
						continue;
					}
					break;
				case "JSXChildren":
					JSXText.lastIndex = lastIndex;
					if (match = JSXText.exec(input)) {
						lastIndex = JSXText.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXText",
							value: match[0]
						});
						continue;
					}
					switch (input[lastIndex]) {
						case "<":
							stack.push({tag: "JSXTag"});
							lastIndex++;
							lastSignificantToken = "<";
							yield ({
								type: "JSXPunctuator",
								value: "<"
							});
							continue;
						case "{":
							stack.push({
								tag: "InterpolationInJSX",
								nesting: braces.length
							});
							lastIndex++;
							lastSignificantToken = "?InterpolationInJSX";
							postfixIncDec = false;
							yield ({
								type: "JSXPunctuator",
								value: "{"
							});
							continue;
					}
			}
			WhiteSpace.lastIndex = lastIndex;
			if (match = WhiteSpace.exec(input)) {
				lastIndex = WhiteSpace.lastIndex;
				yield ({
					type: "WhiteSpace",
					value: match[0]
				});
				continue;
			}
			LineTerminatorSequence.lastIndex = lastIndex;
			if (match = LineTerminatorSequence.exec(input)) {
				lastIndex = LineTerminatorSequence.lastIndex;
				postfixIncDec = false;
				if (KeywordsWithNoLineTerminatorAfter.test(lastSignificantToken)) {
					lastSignificantToken = "?NoLineTerminatorHere";
				}
				yield ({
					type: "LineTerminatorSequence",
					value: match[0]
				});
				continue;
			}
			MultiLineComment.lastIndex = lastIndex;
			if (match = MultiLineComment.exec(input)) {
				lastIndex = MultiLineComment.lastIndex;
				if (Newline.test(match[0])) {
					postfixIncDec = false;
					if (KeywordsWithNoLineTerminatorAfter.test(lastSignificantToken)) {
						lastSignificantToken = "?NoLineTerminatorHere";
					}
				}
				yield ({
					type: "MultiLineComment",
					value: match[0],
					closed: match[1] !== undefined
				});
				continue;
			}
			SingleLineComment.lastIndex = lastIndex;
			if (match = SingleLineComment.exec(input)) {
				lastIndex = SingleLineComment.lastIndex;
				postfixIncDec = false;
				yield ({
					type: "SingleLineComment",
					value: match[0]
				});
				continue;
			}
			firstCodePoint = String.fromCodePoint(input.codePointAt(lastIndex));
			lastIndex += firstCodePoint.length;
			lastSignificantToken = firstCodePoint;
			postfixIncDec = false;
			yield ({
				type: mode.tag.startsWith("JSX") ? "JSXInvalid" : "Invalid",
				value: firstCodePoint
			});
		}
		return undefined;
	};
	return jsTokens_1$1;
}

var jsTokensExports = requireJsTokens$1();
var jsTokens = /*@__PURE__*/getDefaultExportFromCjs$3(jsTokensExports);

// src/index.ts
var reservedWords$1 = {
  keyword: [
    "break",
    "case",
    "catch",
    "continue",
    "debugger",
    "default",
    "do",
    "else",
    "finally",
    "for",
    "function",
    "if",
    "return",
    "switch",
    "throw",
    "try",
    "var",
    "const",
    "while",
    "with",
    "new",
    "this",
    "super",
    "class",
    "extends",
    "export",
    "import",
    "null",
    "true",
    "false",
    "in",
    "instanceof",
    "typeof",
    "void",
    "delete"
  ],
  strict: [
    "implements",
    "interface",
    "let",
    "package",
    "private",
    "protected",
    "public",
    "static",
    "yield"
  ]
}, keywords = new Set(reservedWords$1.keyword), reservedWordsStrictSet = new Set(reservedWords$1.strict), sometimesKeywords = /* @__PURE__ */ new Set(["as", "async", "from", "get", "of", "set"]);
function isReservedWord(word) {
  return word === "await" || word === "enum";
}
function isStrictReservedWord(word) {
  return isReservedWord(word) || reservedWordsStrictSet.has(word);
}
function isKeyword(word) {
  return keywords.has(word);
}
var BRACKET = /^[()[\]{}]$/, getTokenType = function(token) {
  if (token.type === "IdentifierName") {
    if (isKeyword(token.value) || isStrictReservedWord(token.value) || sometimesKeywords.has(token.value))
      return "Keyword";
    if (token.value[0] && token.value[0] !== token.value[0].toLowerCase())
      return "IdentifierCapitalized";
  }
  return token.type === "Punctuator" && BRACKET.test(token.value) ? "Bracket" : token.type === "Invalid" && (token.value === "@" || token.value === "#") ? "Punctuator" : token.type;
};
function getCallableType(token) {
  if (token.type === "IdentifierName")
    return "IdentifierCallable";
  if (token.type === "PrivateIdentifier")
    return "PrivateIdentifierCallable";
  throw new Error("Not a callable token");
}
var colorize = (defs, type, value) => {
  let colorize2 = defs[type];
  return colorize2 ? colorize2(value) : value;
}, highlightTokens = (defs, text, jsx) => {
  let highlighted = "", lastPotentialCallable = null, stackedHighlight = "";
  for (let token of jsTokens(text, { jsx })) {
    let type = getTokenType(token);
    if (type === "IdentifierName" || type === "PrivateIdentifier") {
      lastPotentialCallable && (highlighted += colorize(defs, getTokenType(lastPotentialCallable), lastPotentialCallable.value) + stackedHighlight, stackedHighlight = ""), lastPotentialCallable = token;
      continue;
    }
    if (lastPotentialCallable && (token.type === "WhiteSpace" || token.type === "LineTerminatorSequence" || token.type === "Punctuator" && (token.value === "?." || token.value === "!"))) {
      stackedHighlight += colorize(defs, type, token.value);
      continue;
    }
    if (stackedHighlight && !lastPotentialCallable && (highlighted += stackedHighlight, stackedHighlight = ""), lastPotentialCallable) {
      let type2 = token.type === "Punctuator" && token.value === "(" ? getCallableType(lastPotentialCallable) : getTokenType(lastPotentialCallable);
      highlighted += colorize(defs, type2, lastPotentialCallable.value) + stackedHighlight, stackedHighlight = "", lastPotentialCallable = null;
    }
    highlighted += colorize(defs, type, token.value);
  }
  return highlighted;
};
function highlight$1(code, options = { jsx: false, colors: {} }) {
  return code && highlightTokens(options.colors || {}, code, options.jsx);
}

function getDefs(c2) {
  const Invalid = (text) => c2.white(c2.bgRed(c2.bold(text)));
  return {
    Keyword: c2.magenta,
    IdentifierCapitalized: c2.yellow,
    Punctuator: c2.yellow,
    StringLiteral: c2.green,
    NoSubstitutionTemplate: c2.green,
    MultiLineComment: c2.gray,
    SingleLineComment: c2.gray,
    RegularExpressionLiteral: c2.cyan,
    NumericLiteral: c2.blue,
    TemplateHead: (text) => c2.green(text.slice(0, text.length - 2)) + c2.cyan(text.slice(-2)),
    TemplateTail: (text) => c2.cyan(text.slice(0, 1)) + c2.green(text.slice(1)),
    TemplateMiddle: (text) => c2.cyan(text.slice(0, 1)) + c2.green(text.slice(1, text.length - 2)) + c2.cyan(text.slice(-2)),
    IdentifierCallable: c2.blue,
    PrivateIdentifierCallable: (text) => `#${c2.blue(text.slice(1))}`,
    Invalid,
    JSXString: c2.green,
    JSXIdentifier: c2.yellow,
    JSXInvalid: Invalid,
    JSXPunctuator: c2.yellow
  };
}
function highlight(code, options = { jsx: false }) {
  return highlight$1(code, {
    jsx: options.jsx,
    colors: getDefs(options.colors || s)
  });
}

const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
}

const lineSplitRE$1 = /\r?\n/;
function positionToOffset$1(source, lineNumber, columnNumber) {
  const lines = source.split(lineSplitRE$1);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let start = 0;
  if (lineNumber > lines.length) {
    return source.length;
  }
  for (let i = 0; i < lineNumber - 1; i++) {
    start += lines[i].length + nl;
  }
  return start + columnNumber;
}
function offsetToLineNumber$1(source, offset) {
  if (offset > source.length) {
    throw new Error(
      `offset is longer than source length! offset ${offset} > length ${source.length}`
    );
  }
  const lines = source.split(lineSplitRE$1);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let counted = 0;
  let line = 0;
  for (; line < lines.length; line++) {
    const lineLength = lines[line].length + nl;
    if (counted + lineLength >= offset) {
      break;
    }
    counted += lineLength;
  }
  return line + 1;
}

const RealDate$1 = Date;
function random(seed) {
  const x = Math.sin(seed++) * 1e4;
  return x - Math.floor(x);
}
function shuffle(array, seed = RealDate$1.now()) {
  let length = array.length;
  while (length) {
    const index = Math.floor(random(seed) * length--);
    const previous = array[length];
    array[length] = array[index];
    array[index] = previous;
    ++seed;
  }
  return array;
}

const SAFE_TIMERS_SYMBOL = Symbol("vitest:SAFE_TIMERS");
function getSafeTimers() {
  const {
    setTimeout: safeSetTimeout,
    setInterval: safeSetInterval,
    clearInterval: safeClearInterval,
    clearTimeout: safeClearTimeout,
    setImmediate: safeSetImmediate,
    clearImmediate: safeClearImmediate,
    queueMicrotask: safeQueueMicrotask
  } = globalThis[SAFE_TIMERS_SYMBOL] || globalThis;
  const { nextTick: safeNextTick } = globalThis[SAFE_TIMERS_SYMBOL] || globalThis.process || { nextTick: (cb) => cb() };
  return {
    nextTick: safeNextTick,
    setTimeout: safeSetTimeout,
    setInterval: safeSetInterval,
    clearInterval: safeClearInterval,
    clearTimeout: safeClearTimeout,
    setImmediate: safeSetImmediate,
    clearImmediate: safeClearImmediate,
    queueMicrotask: safeQueueMicrotask
  };
}
function setSafeTimers() {
  const {
    setTimeout: safeSetTimeout,
    setInterval: safeSetInterval,
    clearInterval: safeClearInterval,
    clearTimeout: safeClearTimeout,
    setImmediate: safeSetImmediate,
    clearImmediate: safeClearImmediate,
    queueMicrotask: safeQueueMicrotask
  } = globalThis;
  const { nextTick: safeNextTick } = globalThis.process || {
    nextTick: (cb) => cb()
  };
  const timers = {
    nextTick: safeNextTick,
    setTimeout: safeSetTimeout,
    setInterval: safeSetInterval,
    clearInterval: safeClearInterval,
    clearTimeout: safeClearTimeout,
    setImmediate: safeSetImmediate,
    clearImmediate: safeClearImmediate,
    queueMicrotask: safeQueueMicrotask
  };
  globalThis[SAFE_TIMERS_SYMBOL] = timers;
}

const DIFF_DELETE = -1;
const DIFF_INSERT = 1;
const DIFF_EQUAL = 0;
class Diff {
  0;
  1;
  constructor(op, text) {
    this[0] = op;
    this[1] = text;
  }
}
const diff_commonPrefix = function(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return 0;
  }
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};
const diff_commonSuffix = function(text1, text2) {
  if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
    return 0;
  }
  let pointermin = 0;
  let pointermax = Math.min(text1.length, text2.length);
  let pointermid = pointermax;
  let pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};
const diff_commonOverlap_ = function(text1, text2) {
  const text1_length = text1.length;
  const text2_length = text2.length;
  if (text1_length === 0 || text2_length === 0) {
    return 0;
  }
  if (text1_length > text2_length) {
    text1 = text1.substring(text1_length - text2_length);
  } else if (text1_length < text2_length) {
    text2 = text2.substring(0, text1_length);
  }
  const text_length = Math.min(text1_length, text2_length);
  if (text1 === text2) {
    return text_length;
  }
  let best = 0;
  let length = 1;
  while (true) {
    const pattern = text1.substring(text_length - length);
    const found = text2.indexOf(pattern);
    if (found === -1) {
      return best;
    }
    length += found;
    if (found === 0 || text1.substring(text_length - length) === text2.substring(0, length)) {
      best = length;
      length++;
    }
  }
};
const diff_cleanupSemantic = function(diffs) {
  let changes = false;
  const equalities = [];
  let equalitiesLength = 0;
  let lastEquality = null;
  let pointer = 0;
  let length_insertions1 = 0;
  let length_deletions1 = 0;
  let length_insertions2 = 0;
  let length_deletions2 = 0;
  while (pointer < diffs.length) {
    if (diffs[pointer][0] === DIFF_EQUAL) {
      equalities[equalitiesLength++] = pointer;
      length_insertions1 = length_insertions2;
      length_deletions1 = length_deletions2;
      length_insertions2 = 0;
      length_deletions2 = 0;
      lastEquality = diffs[pointer][1];
    } else {
      if (diffs[pointer][0] === DIFF_INSERT) {
        length_insertions2 += diffs[pointer][1].length;
      } else {
        length_deletions2 += diffs[pointer][1].length;
      }
      if (lastEquality && lastEquality.length <= Math.max(length_insertions1, length_deletions1) && lastEquality.length <= Math.max(length_insertions2, length_deletions2)) {
        diffs.splice(
          equalities[equalitiesLength - 1],
          0,
          new Diff(DIFF_DELETE, lastEquality)
        );
        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
        equalitiesLength--;
        equalitiesLength--;
        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
        length_insertions1 = 0;
        length_deletions1 = 0;
        length_insertions2 = 0;
        length_deletions2 = 0;
        lastEquality = null;
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) {
    diff_cleanupMerge(diffs);
  }
  diff_cleanupSemanticLossless(diffs);
  pointer = 1;
  while (pointer < diffs.length) {
    if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
      const deletion = diffs[pointer - 1][1];
      const insertion = diffs[pointer][1];
      const overlap_length1 = diff_commonOverlap_(deletion, insertion);
      const overlap_length2 = diff_commonOverlap_(insertion, deletion);
      if (overlap_length1 >= overlap_length2) {
        if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
          diffs.splice(
            pointer,
            0,
            new Diff(DIFF_EQUAL, insertion.substring(0, overlap_length1))
          );
          diffs[pointer - 1][1] = deletion.substring(
            0,
            deletion.length - overlap_length1
          );
          diffs[pointer + 1][1] = insertion.substring(overlap_length1);
          pointer++;
        }
      } else {
        if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
          diffs.splice(
            pointer,
            0,
            new Diff(DIFF_EQUAL, deletion.substring(0, overlap_length2))
          );
          diffs[pointer - 1][0] = DIFF_INSERT;
          diffs[pointer - 1][1] = insertion.substring(
            0,
            insertion.length - overlap_length2
          );
          diffs[pointer + 1][0] = DIFF_DELETE;
          diffs[pointer + 1][1] = deletion.substring(overlap_length2);
          pointer++;
        }
      }
      pointer++;
    }
    pointer++;
  }
};
const nonAlphaNumericRegex_ = /[^a-z0-9]/i;
const whitespaceRegex_ = /\s/;
const linebreakRegex_ = /[\r\n]/;
const blanklineEndRegex_ = /\n\r?\n$/;
const blanklineStartRegex_ = /^\r?\n\r?\n/;
function diff_cleanupSemanticLossless(diffs) {
  let pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      let equality1 = diffs[pointer - 1][1];
      let edit = diffs[pointer][1];
      let equality2 = diffs[pointer + 1][1];
      const commonOffset = diff_commonSuffix(equality1, edit);
      if (commonOffset) {
        const commonString = edit.substring(edit.length - commonOffset);
        equality1 = equality1.substring(0, equality1.length - commonOffset);
        edit = commonString + edit.substring(0, edit.length - commonOffset);
        equality2 = commonString + equality2;
      }
      let bestEquality1 = equality1;
      let bestEdit = edit;
      let bestEquality2 = equality2;
      let bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
      while (edit.charAt(0) === equality2.charAt(0)) {
        equality1 += edit.charAt(0);
        edit = edit.substring(1) + equality2.charAt(0);
        equality2 = equality2.substring(1);
        const score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
        if (score >= bestScore) {
          bestScore = score;
          bestEquality1 = equality1;
          bestEdit = edit;
          bestEquality2 = equality2;
        }
      }
      if (diffs[pointer - 1][1] !== bestEquality1) {
        if (bestEquality1) {
          diffs[pointer - 1][1] = bestEquality1;
        } else {
          diffs.splice(pointer - 1, 1);
          pointer--;
        }
        diffs[pointer][1] = bestEdit;
        if (bestEquality2) {
          diffs[pointer + 1][1] = bestEquality2;
        } else {
          diffs.splice(pointer + 1, 1);
          pointer--;
        }
      }
    }
    pointer++;
  }
}
function diff_cleanupMerge(diffs) {
  diffs.push(new Diff(DIFF_EQUAL, ""));
  let pointer = 0;
  let count_delete = 0;
  let count_insert = 0;
  let text_delete = "";
  let text_insert = "";
  let commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] === DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
              } else {
                diffs.splice(
                  0,
                  0,
                  new Diff(DIFF_EQUAL, text_insert.substring(0, commonlength))
                );
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(
                0,
                text_insert.length - commonlength
              );
              text_delete = text_delete.substring(
                0,
                text_delete.length - commonlength
              );
            }
          }
          pointer -= count_delete + count_insert;
          diffs.splice(pointer, count_delete + count_insert);
          if (text_delete.length) {
            diffs.splice(pointer, 0, new Diff(DIFF_DELETE, text_delete));
            pointer++;
          }
          if (text_insert.length) {
            diffs.splice(pointer, 0, new Diff(DIFF_INSERT, text_insert));
            pointer++;
          }
          pointer++;
        } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = "";
        text_insert = "";
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === "") {
    diffs.pop();
  }
  let changes = false;
  pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      if (diffs[pointer][1].substring(
        diffs[pointer][1].length - diffs[pointer - 1][1].length
      ) === diffs[pointer - 1][1]) {
        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(
          0,
          diffs[pointer][1].length - diffs[pointer - 1][1].length
        );
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) {
    diff_cleanupMerge(diffs);
  }
}
function diff_cleanupSemanticScore_(one, two) {
  if (!one || !two) {
    return 6;
  }
  const char1 = one.charAt(one.length - 1);
  const char2 = two.charAt(0);
  const nonAlphaNumeric1 = char1.match(nonAlphaNumericRegex_);
  const nonAlphaNumeric2 = char2.match(nonAlphaNumericRegex_);
  const whitespace1 = nonAlphaNumeric1 && char1.match(whitespaceRegex_);
  const whitespace2 = nonAlphaNumeric2 && char2.match(whitespaceRegex_);
  const lineBreak1 = whitespace1 && char1.match(linebreakRegex_);
  const lineBreak2 = whitespace2 && char2.match(linebreakRegex_);
  const blankLine1 = lineBreak1 && one.match(blanklineEndRegex_);
  const blankLine2 = lineBreak2 && two.match(blanklineStartRegex_);
  if (blankLine1 || blankLine2) {
    return 5;
  } else if (lineBreak1 || lineBreak2) {
    return 4;
  } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
    return 3;
  } else if (whitespace1 || whitespace2) {
    return 2;
  } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
    return 1;
  }
  return 0;
}

const NO_DIFF_MESSAGE = "Compared values have no visual difference.";
const SIMILAR_MESSAGE = "Compared values serialize to the same structure.\nPrinting internal object structure without calling `toJSON` instead.";

var build = {};

var hasRequiredBuild;

function requireBuild () {
	if (hasRequiredBuild) return build;
	hasRequiredBuild = 1;

	Object.defineProperty(build, '__esModule', {
	  value: true
	});
	build.default = diffSequence;
	/**
	 * Copyright (c) Meta Platforms, Inc. and affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 */

	// This diff-sequences package implements the linear space variation in
	// An O(ND) Difference Algorithm and Its Variations by Eugene W. Myers

	// Relationship in notation between Myers paper and this package:
	// A is a
	// N is aLength, aEnd - aStart, and so on
	// x is aIndex, aFirst, aLast, and so on
	// B is b
	// M is bLength, bEnd - bStart, and so on
	// y is bIndex, bFirst, bLast, and so on
	// Δ = N - M is negative of baDeltaLength = bLength - aLength
	// D is d
	// k is kF
	// k + Δ is kF = kR - baDeltaLength
	// V is aIndexesF or aIndexesR (see comment below about Indexes type)
	// index intervals [1, N] and [1, M] are [0, aLength) and [0, bLength)
	// starting point in forward direction (0, 0) is (-1, -1)
	// starting point in reverse direction (N + 1, M + 1) is (aLength, bLength)

	// The “edit graph” for sequences a and b corresponds to items:
	// in a on the horizontal axis
	// in b on the vertical axis
	//
	// Given a-coordinate of a point in a diagonal, you can compute b-coordinate.
	//
	// Forward diagonals kF:
	// zero diagonal intersects top left corner
	// positive diagonals intersect top edge
	// negative diagonals insersect left edge
	//
	// Reverse diagonals kR:
	// zero diagonal intersects bottom right corner
	// positive diagonals intersect right edge
	// negative diagonals intersect bottom edge

	// The graph contains a directed acyclic graph of edges:
	// horizontal: delete an item from a
	// vertical: insert an item from b
	// diagonal: common item in a and b
	//
	// The algorithm solves dual problems in the graph analogy:
	// Find longest common subsequence: path with maximum number of diagonal edges
	// Find shortest edit script: path with minimum number of non-diagonal edges

	// Input callback function compares items at indexes in the sequences.

	// Output callback function receives the number of adjacent items
	// and starting indexes of each common subsequence.
	// Either original functions or wrapped to swap indexes if graph is transposed.
	// Indexes in sequence a of last point of forward or reverse paths in graph.
	// Myers algorithm indexes by diagonal k which for negative is bad deopt in V8.
	// This package indexes by iF and iR which are greater than or equal to zero.
	// and also updates the index arrays in place to cut memory in half.
	// kF = 2 * iF - d
	// kR = d - 2 * iR
	// Division of index intervals in sequences a and b at the middle change.
	// Invariant: intervals do not have common items at the start or end.
	const pkg = 'diff-sequences'; // for error messages
	const NOT_YET_SET = 0; // small int instead of undefined to avoid deopt in V8

	// Return the number of common items that follow in forward direction.
	// The length of what Myers paper calls a “snake” in a forward path.
	const countCommonItemsF = (aIndex, aEnd, bIndex, bEnd, isCommon) => {
	  let nCommon = 0;
	  while (aIndex < aEnd && bIndex < bEnd && isCommon(aIndex, bIndex)) {
	    aIndex += 1;
	    bIndex += 1;
	    nCommon += 1;
	  }
	  return nCommon;
	};

	// Return the number of common items that precede in reverse direction.
	// The length of what Myers paper calls a “snake” in a reverse path.
	const countCommonItemsR = (aStart, aIndex, bStart, bIndex, isCommon) => {
	  let nCommon = 0;
	  while (aStart <= aIndex && bStart <= bIndex && isCommon(aIndex, bIndex)) {
	    aIndex -= 1;
	    bIndex -= 1;
	    nCommon += 1;
	  }
	  return nCommon;
	};

	// A simple function to extend forward paths from (d - 1) to d changes
	// when forward and reverse paths cannot yet overlap.
	const extendPathsF = (
	  d,
	  aEnd,
	  bEnd,
	  bF,
	  isCommon,
	  aIndexesF,
	  iMaxF // return the value because optimization might decrease it
	) => {
	  // Unroll the first iteration.
	  let iF = 0;
	  let kF = -d; // kF = 2 * iF - d
	  let aFirst = aIndexesF[iF]; // in first iteration always insert
	  let aIndexPrev1 = aFirst; // prev value of [iF - 1] in next iteration
	  aIndexesF[iF] += countCommonItemsF(
	    aFirst + 1,
	    aEnd,
	    bF + aFirst - kF + 1,
	    bEnd,
	    isCommon
	  );

	  // Optimization: skip diagonals in which paths cannot ever overlap.
	  const nF = d < iMaxF ? d : iMaxF;

	  // The diagonals kF are odd when d is odd and even when d is even.
	  for (iF += 1, kF += 2; iF <= nF; iF += 1, kF += 2) {
	    // To get first point of path segment, move one change in forward direction
	    // from last point of previous path segment in an adjacent diagonal.
	    // In last possible iteration when iF === d and kF === d always delete.
	    if (iF !== d && aIndexPrev1 < aIndexesF[iF]) {
	      aFirst = aIndexesF[iF]; // vertical to insert from b
	    } else {
	      aFirst = aIndexPrev1 + 1; // horizontal to delete from a

	      if (aEnd <= aFirst) {
	        // Optimization: delete moved past right of graph.
	        return iF - 1;
	      }
	    }

	    // To get last point of path segment, move along diagonal of common items.
	    aIndexPrev1 = aIndexesF[iF];
	    aIndexesF[iF] =
	      aFirst +
	      countCommonItemsF(aFirst + 1, aEnd, bF + aFirst - kF + 1, bEnd, isCommon);
	  }
	  return iMaxF;
	};

	// A simple function to extend reverse paths from (d - 1) to d changes
	// when reverse and forward paths cannot yet overlap.
	const extendPathsR = (
	  d,
	  aStart,
	  bStart,
	  bR,
	  isCommon,
	  aIndexesR,
	  iMaxR // return the value because optimization might decrease it
	) => {
	  // Unroll the first iteration.
	  let iR = 0;
	  let kR = d; // kR = d - 2 * iR
	  let aFirst = aIndexesR[iR]; // in first iteration always insert
	  let aIndexPrev1 = aFirst; // prev value of [iR - 1] in next iteration
	  aIndexesR[iR] -= countCommonItemsR(
	    aStart,
	    aFirst - 1,
	    bStart,
	    bR + aFirst - kR - 1,
	    isCommon
	  );

	  // Optimization: skip diagonals in which paths cannot ever overlap.
	  const nR = d < iMaxR ? d : iMaxR;

	  // The diagonals kR are odd when d is odd and even when d is even.
	  for (iR += 1, kR -= 2; iR <= nR; iR += 1, kR -= 2) {
	    // To get first point of path segment, move one change in reverse direction
	    // from last point of previous path segment in an adjacent diagonal.
	    // In last possible iteration when iR === d and kR === -d always delete.
	    if (iR !== d && aIndexesR[iR] < aIndexPrev1) {
	      aFirst = aIndexesR[iR]; // vertical to insert from b
	    } else {
	      aFirst = aIndexPrev1 - 1; // horizontal to delete from a

	      if (aFirst < aStart) {
	        // Optimization: delete moved past left of graph.
	        return iR - 1;
	      }
	    }

	    // To get last point of path segment, move along diagonal of common items.
	    aIndexPrev1 = aIndexesR[iR];
	    aIndexesR[iR] =
	      aFirst -
	      countCommonItemsR(
	        aStart,
	        aFirst - 1,
	        bStart,
	        bR + aFirst - kR - 1,
	        isCommon
	      );
	  }
	  return iMaxR;
	};

	// A complete function to extend forward paths from (d - 1) to d changes.
	// Return true if a path overlaps reverse path of (d - 1) changes in its diagonal.
	const extendOverlappablePathsF = (
	  d,
	  aStart,
	  aEnd,
	  bStart,
	  bEnd,
	  isCommon,
	  aIndexesF,
	  iMaxF,
	  aIndexesR,
	  iMaxR,
	  division // update prop values if return true
	) => {
	  const bF = bStart - aStart; // bIndex = bF + aIndex - kF
	  const aLength = aEnd - aStart;
	  const bLength = bEnd - bStart;
	  const baDeltaLength = bLength - aLength; // kF = kR - baDeltaLength

	  // Range of diagonals in which forward and reverse paths might overlap.
	  const kMinOverlapF = -baDeltaLength - (d - 1); // -(d - 1) <= kR
	  const kMaxOverlapF = -baDeltaLength + (d - 1); // kR <= (d - 1)

	  let aIndexPrev1 = NOT_YET_SET; // prev value of [iF - 1] in next iteration

	  // Optimization: skip diagonals in which paths cannot ever overlap.
	  const nF = d < iMaxF ? d : iMaxF;

	  // The diagonals kF = 2 * iF - d are odd when d is odd and even when d is even.
	  for (let iF = 0, kF = -d; iF <= nF; iF += 1, kF += 2) {
	    // To get first point of path segment, move one change in forward direction
	    // from last point of previous path segment in an adjacent diagonal.
	    // In first iteration when iF === 0 and kF === -d always insert.
	    // In last possible iteration when iF === d and kF === d always delete.
	    const insert = iF === 0 || (iF !== d && aIndexPrev1 < aIndexesF[iF]);
	    const aLastPrev = insert ? aIndexesF[iF] : aIndexPrev1;
	    const aFirst = insert
	      ? aLastPrev // vertical to insert from b
	      : aLastPrev + 1; // horizontal to delete from a

	    // To get last point of path segment, move along diagonal of common items.
	    const bFirst = bF + aFirst - kF;
	    const nCommonF = countCommonItemsF(
	      aFirst + 1,
	      aEnd,
	      bFirst + 1,
	      bEnd,
	      isCommon
	    );
	    const aLast = aFirst + nCommonF;
	    aIndexPrev1 = aIndexesF[iF];
	    aIndexesF[iF] = aLast;
	    if (kMinOverlapF <= kF && kF <= kMaxOverlapF) {
	      // Solve for iR of reverse path with (d - 1) changes in diagonal kF:
	      // kR = kF + baDeltaLength
	      // kR = (d - 1) - 2 * iR
	      const iR = (d - 1 - (kF + baDeltaLength)) / 2;

	      // If this forward path overlaps the reverse path in this diagonal,
	      // then this is the middle change of the index intervals.
	      if (iR <= iMaxR && aIndexesR[iR] - 1 <= aLast) {
	        // Unlike the Myers algorithm which finds only the middle “snake”
	        // this package can find two common subsequences per division.
	        // Last point of previous path segment is on an adjacent diagonal.
	        const bLastPrev = bF + aLastPrev - (insert ? kF + 1 : kF - 1);

	        // Because of invariant that intervals preceding the middle change
	        // cannot have common items at the end,
	        // move in reverse direction along a diagonal of common items.
	        const nCommonR = countCommonItemsR(
	          aStart,
	          aLastPrev,
	          bStart,
	          bLastPrev,
	          isCommon
	        );
	        const aIndexPrevFirst = aLastPrev - nCommonR;
	        const bIndexPrevFirst = bLastPrev - nCommonR;
	        const aEndPreceding = aIndexPrevFirst + 1;
	        const bEndPreceding = bIndexPrevFirst + 1;
	        division.nChangePreceding = d - 1;
	        if (d - 1 === aEndPreceding + bEndPreceding - aStart - bStart) {
	          // Optimization: number of preceding changes in forward direction
	          // is equal to number of items in preceding interval,
	          // therefore it cannot contain any common items.
	          division.aEndPreceding = aStart;
	          division.bEndPreceding = bStart;
	        } else {
	          division.aEndPreceding = aEndPreceding;
	          division.bEndPreceding = bEndPreceding;
	        }
	        division.nCommonPreceding = nCommonR;
	        if (nCommonR !== 0) {
	          division.aCommonPreceding = aEndPreceding;
	          division.bCommonPreceding = bEndPreceding;
	        }
	        division.nCommonFollowing = nCommonF;
	        if (nCommonF !== 0) {
	          division.aCommonFollowing = aFirst + 1;
	          division.bCommonFollowing = bFirst + 1;
	        }
	        const aStartFollowing = aLast + 1;
	        const bStartFollowing = bFirst + nCommonF + 1;
	        division.nChangeFollowing = d - 1;
	        if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
	          // Optimization: number of changes in reverse direction
	          // is equal to number of items in following interval,
	          // therefore it cannot contain any common items.
	          division.aStartFollowing = aEnd;
	          division.bStartFollowing = bEnd;
	        } else {
	          division.aStartFollowing = aStartFollowing;
	          division.bStartFollowing = bStartFollowing;
	        }
	        return true;
	      }
	    }
	  }
	  return false;
	};

	// A complete function to extend reverse paths from (d - 1) to d changes.
	// Return true if a path overlaps forward path of d changes in its diagonal.
	const extendOverlappablePathsR = (
	  d,
	  aStart,
	  aEnd,
	  bStart,
	  bEnd,
	  isCommon,
	  aIndexesF,
	  iMaxF,
	  aIndexesR,
	  iMaxR,
	  division // update prop values if return true
	) => {
	  const bR = bEnd - aEnd; // bIndex = bR + aIndex - kR
	  const aLength = aEnd - aStart;
	  const bLength = bEnd - bStart;
	  const baDeltaLength = bLength - aLength; // kR = kF + baDeltaLength

	  // Range of diagonals in which forward and reverse paths might overlap.
	  const kMinOverlapR = baDeltaLength - d; // -d <= kF
	  const kMaxOverlapR = baDeltaLength + d; // kF <= d

	  let aIndexPrev1 = NOT_YET_SET; // prev value of [iR - 1] in next iteration

	  // Optimization: skip diagonals in which paths cannot ever overlap.
	  const nR = d < iMaxR ? d : iMaxR;

	  // The diagonals kR = d - 2 * iR are odd when d is odd and even when d is even.
	  for (let iR = 0, kR = d; iR <= nR; iR += 1, kR -= 2) {
	    // To get first point of path segment, move one change in reverse direction
	    // from last point of previous path segment in an adjacent diagonal.
	    // In first iteration when iR === 0 and kR === d always insert.
	    // In last possible iteration when iR === d and kR === -d always delete.
	    const insert = iR === 0 || (iR !== d && aIndexesR[iR] < aIndexPrev1);
	    const aLastPrev = insert ? aIndexesR[iR] : aIndexPrev1;
	    const aFirst = insert
	      ? aLastPrev // vertical to insert from b
	      : aLastPrev - 1; // horizontal to delete from a

	    // To get last point of path segment, move along diagonal of common items.
	    const bFirst = bR + aFirst - kR;
	    const nCommonR = countCommonItemsR(
	      aStart,
	      aFirst - 1,
	      bStart,
	      bFirst - 1,
	      isCommon
	    );
	    const aLast = aFirst - nCommonR;
	    aIndexPrev1 = aIndexesR[iR];
	    aIndexesR[iR] = aLast;
	    if (kMinOverlapR <= kR && kR <= kMaxOverlapR) {
	      // Solve for iF of forward path with d changes in diagonal kR:
	      // kF = kR - baDeltaLength
	      // kF = 2 * iF - d
	      const iF = (d + (kR - baDeltaLength)) / 2;

	      // If this reverse path overlaps the forward path in this diagonal,
	      // then this is a middle change of the index intervals.
	      if (iF <= iMaxF && aLast - 1 <= aIndexesF[iF]) {
	        const bLast = bFirst - nCommonR;
	        division.nChangePreceding = d;
	        if (d === aLast + bLast - aStart - bStart) {
	          // Optimization: number of changes in reverse direction
	          // is equal to number of items in preceding interval,
	          // therefore it cannot contain any common items.
	          division.aEndPreceding = aStart;
	          division.bEndPreceding = bStart;
	        } else {
	          division.aEndPreceding = aLast;
	          division.bEndPreceding = bLast;
	        }
	        division.nCommonPreceding = nCommonR;
	        if (nCommonR !== 0) {
	          // The last point of reverse path segment is start of common subsequence.
	          division.aCommonPreceding = aLast;
	          division.bCommonPreceding = bLast;
	        }
	        division.nChangeFollowing = d - 1;
	        if (d === 1) {
	          // There is no previous path segment.
	          division.nCommonFollowing = 0;
	          division.aStartFollowing = aEnd;
	          division.bStartFollowing = bEnd;
	        } else {
	          // Unlike the Myers algorithm which finds only the middle “snake”
	          // this package can find two common subsequences per division.
	          // Last point of previous path segment is on an adjacent diagonal.
	          const bLastPrev = bR + aLastPrev - (insert ? kR - 1 : kR + 1);

	          // Because of invariant that intervals following the middle change
	          // cannot have common items at the start,
	          // move in forward direction along a diagonal of common items.
	          const nCommonF = countCommonItemsF(
	            aLastPrev,
	            aEnd,
	            bLastPrev,
	            bEnd,
	            isCommon
	          );
	          division.nCommonFollowing = nCommonF;
	          if (nCommonF !== 0) {
	            // The last point of reverse path segment is start of common subsequence.
	            division.aCommonFollowing = aLastPrev;
	            division.bCommonFollowing = bLastPrev;
	          }
	          const aStartFollowing = aLastPrev + nCommonF; // aFirstPrev
	          const bStartFollowing = bLastPrev + nCommonF; // bFirstPrev

	          if (d - 1 === aEnd + bEnd - aStartFollowing - bStartFollowing) {
	            // Optimization: number of changes in forward direction
	            // is equal to number of items in following interval,
	            // therefore it cannot contain any common items.
	            division.aStartFollowing = aEnd;
	            division.bStartFollowing = bEnd;
	          } else {
	            division.aStartFollowing = aStartFollowing;
	            division.bStartFollowing = bStartFollowing;
	          }
	        }
	        return true;
	      }
	    }
	  }
	  return false;
	};

	// Given index intervals and input function to compare items at indexes,
	// divide at the middle change.
	//
	// DO NOT CALL if start === end, because interval cannot contain common items
	// and because this function will throw the “no overlap” error.
	const divide = (
	  nChange,
	  aStart,
	  aEnd,
	  bStart,
	  bEnd,
	  isCommon,
	  aIndexesF,
	  aIndexesR,
	  division // output
	) => {
	  const bF = bStart - aStart; // bIndex = bF + aIndex - kF
	  const bR = bEnd - aEnd; // bIndex = bR + aIndex - kR
	  const aLength = aEnd - aStart;
	  const bLength = bEnd - bStart;

	  // Because graph has square or portrait orientation,
	  // length difference is minimum number of items to insert from b.
	  // Corresponding forward and reverse diagonals in graph
	  // depend on length difference of the sequences:
	  // kF = kR - baDeltaLength
	  // kR = kF + baDeltaLength
	  const baDeltaLength = bLength - aLength;

	  // Optimization: max diagonal in graph intersects corner of shorter side.
	  let iMaxF = aLength;
	  let iMaxR = aLength;

	  // Initialize no changes yet in forward or reverse direction:
	  aIndexesF[0] = aStart - 1; // at open start of interval, outside closed start
	  aIndexesR[0] = aEnd; // at open end of interval

	  if (baDeltaLength % 2 === 0) {
	    // The number of changes in paths is 2 * d if length difference is even.
	    const dMin = (nChange || baDeltaLength) / 2;
	    const dMax = (aLength + bLength) / 2;
	    for (let d = 1; d <= dMax; d += 1) {
	      iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
	      if (d < dMin) {
	        iMaxR = extendPathsR(d, aStart, bStart, bR, isCommon, aIndexesR, iMaxR);
	      } else if (
	        // If a reverse path overlaps a forward path in the same diagonal,
	        // return a division of the index intervals at the middle change.
	        extendOverlappablePathsR(
	          d,
	          aStart,
	          aEnd,
	          bStart,
	          bEnd,
	          isCommon,
	          aIndexesF,
	          iMaxF,
	          aIndexesR,
	          iMaxR,
	          division
	        )
	      ) {
	        return;
	      }
	    }
	  } else {
	    // The number of changes in paths is 2 * d - 1 if length difference is odd.
	    const dMin = ((nChange || baDeltaLength) + 1) / 2;
	    const dMax = (aLength + bLength + 1) / 2;

	    // Unroll first half iteration so loop extends the relevant pairs of paths.
	    // Because of invariant that intervals have no common items at start or end,
	    // and limitation not to call divide with empty intervals,
	    // therefore it cannot be called if a forward path with one change
	    // would overlap a reverse path with no changes, even if dMin === 1.
	    let d = 1;
	    iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
	    for (d += 1; d <= dMax; d += 1) {
	      iMaxR = extendPathsR(
	        d - 1,
	        aStart,
	        bStart,
	        bR,
	        isCommon,
	        aIndexesR,
	        iMaxR
	      );
	      if (d < dMin) {
	        iMaxF = extendPathsF(d, aEnd, bEnd, bF, isCommon, aIndexesF, iMaxF);
	      } else if (
	        // If a forward path overlaps a reverse path in the same diagonal,
	        // return a division of the index intervals at the middle change.
	        extendOverlappablePathsF(
	          d,
	          aStart,
	          aEnd,
	          bStart,
	          bEnd,
	          isCommon,
	          aIndexesF,
	          iMaxF,
	          aIndexesR,
	          iMaxR,
	          division
	        )
	      ) {
	        return;
	      }
	    }
	  }

	  /* istanbul ignore next */
	  throw new Error(
	    `${pkg}: no overlap aStart=${aStart} aEnd=${aEnd} bStart=${bStart} bEnd=${bEnd}`
	  );
	};

	// Given index intervals and input function to compare items at indexes,
	// return by output function the number of adjacent items and starting indexes
	// of each common subsequence. Divide and conquer with only linear space.
	//
	// The index intervals are half open [start, end) like array slice method.
	// DO NOT CALL if start === end, because interval cannot contain common items
	// and because divide function will throw the “no overlap” error.
	const findSubsequences = (
	  nChange,
	  aStart,
	  aEnd,
	  bStart,
	  bEnd,
	  transposed,
	  callbacks,
	  aIndexesF,
	  aIndexesR,
	  division // temporary memory, not input nor output
	) => {
	  if (bEnd - bStart < aEnd - aStart) {
	    // Transpose graph so it has portrait instead of landscape orientation.
	    // Always compare shorter to longer sequence for consistency and optimization.
	    transposed = !transposed;
	    if (transposed && callbacks.length === 1) {
	      // Lazily wrap callback functions to swap args if graph is transposed.
	      const {foundSubsequence, isCommon} = callbacks[0];
	      callbacks[1] = {
	        foundSubsequence: (nCommon, bCommon, aCommon) => {
	          foundSubsequence(nCommon, aCommon, bCommon);
	        },
	        isCommon: (bIndex, aIndex) => isCommon(aIndex, bIndex)
	      };
	    }
	    const tStart = aStart;
	    const tEnd = aEnd;
	    aStart = bStart;
	    aEnd = bEnd;
	    bStart = tStart;
	    bEnd = tEnd;
	  }
	  const {foundSubsequence, isCommon} = callbacks[transposed ? 1 : 0];

	  // Divide the index intervals at the middle change.
	  divide(
	    nChange,
	    aStart,
	    aEnd,
	    bStart,
	    bEnd,
	    isCommon,
	    aIndexesF,
	    aIndexesR,
	    division
	  );
	  const {
	    nChangePreceding,
	    aEndPreceding,
	    bEndPreceding,
	    nCommonPreceding,
	    aCommonPreceding,
	    bCommonPreceding,
	    nCommonFollowing,
	    aCommonFollowing,
	    bCommonFollowing,
	    nChangeFollowing,
	    aStartFollowing,
	    bStartFollowing
	  } = division;

	  // Unless either index interval is empty, they might contain common items.
	  if (aStart < aEndPreceding && bStart < bEndPreceding) {
	    // Recursely find and return common subsequences preceding the division.
	    findSubsequences(
	      nChangePreceding,
	      aStart,
	      aEndPreceding,
	      bStart,
	      bEndPreceding,
	      transposed,
	      callbacks,
	      aIndexesF,
	      aIndexesR,
	      division
	    );
	  }

	  // Return common subsequences that are adjacent to the middle change.
	  if (nCommonPreceding !== 0) {
	    foundSubsequence(nCommonPreceding, aCommonPreceding, bCommonPreceding);
	  }
	  if (nCommonFollowing !== 0) {
	    foundSubsequence(nCommonFollowing, aCommonFollowing, bCommonFollowing);
	  }

	  // Unless either index interval is empty, they might contain common items.
	  if (aStartFollowing < aEnd && bStartFollowing < bEnd) {
	    // Recursely find and return common subsequences following the division.
	    findSubsequences(
	      nChangeFollowing,
	      aStartFollowing,
	      aEnd,
	      bStartFollowing,
	      bEnd,
	      transposed,
	      callbacks,
	      aIndexesF,
	      aIndexesR,
	      division
	    );
	  }
	};
	const validateLength = (name, arg) => {
	  if (typeof arg !== 'number') {
	    throw new TypeError(`${pkg}: ${name} typeof ${typeof arg} is not a number`);
	  }
	  if (!Number.isSafeInteger(arg)) {
	    throw new RangeError(`${pkg}: ${name} value ${arg} is not a safe integer`);
	  }
	  if (arg < 0) {
	    throw new RangeError(`${pkg}: ${name} value ${arg} is a negative integer`);
	  }
	};
	const validateCallback = (name, arg) => {
	  const type = typeof arg;
	  if (type !== 'function') {
	    throw new TypeError(`${pkg}: ${name} typeof ${type} is not a function`);
	  }
	};

	// Compare items in two sequences to find a longest common subsequence.
	// Given lengths of sequences and input function to compare items at indexes,
	// return by output function the number of adjacent items and starting indexes
	// of each common subsequence.
	function diffSequence(aLength, bLength, isCommon, foundSubsequence) {
	  validateLength('aLength', aLength);
	  validateLength('bLength', bLength);
	  validateCallback('isCommon', isCommon);
	  validateCallback('foundSubsequence', foundSubsequence);

	  // Count common items from the start in the forward direction.
	  const nCommonF = countCommonItemsF(0, aLength, 0, bLength, isCommon);
	  if (nCommonF !== 0) {
	    foundSubsequence(nCommonF, 0, 0);
	  }

	  // Unless both sequences consist of common items only,
	  // find common items in the half-trimmed index intervals.
	  if (aLength !== nCommonF || bLength !== nCommonF) {
	    // Invariant: intervals do not have common items at the start.
	    // The start of an index interval is closed like array slice method.
	    const aStart = nCommonF;
	    const bStart = nCommonF;

	    // Count common items from the end in the reverse direction.
	    const nCommonR = countCommonItemsR(
	      aStart,
	      aLength - 1,
	      bStart,
	      bLength - 1,
	      isCommon
	    );

	    // Invariant: intervals do not have common items at the end.
	    // The end of an index interval is open like array slice method.
	    const aEnd = aLength - nCommonR;
	    const bEnd = bLength - nCommonR;

	    // Unless one sequence consists of common items only,
	    // therefore the other trimmed index interval consists of changes only,
	    // find common items in the trimmed index intervals.
	    const nCommonFR = nCommonF + nCommonR;
	    if (aLength !== nCommonFR && bLength !== nCommonFR) {
	      const nChange = 0; // number of change items is not yet known
	      const transposed = false; // call the original unwrapped functions
	      const callbacks = [
	        {
	          foundSubsequence,
	          isCommon
	        }
	      ];

	      // Indexes in sequence a of last points in furthest reaching paths
	      // from outside the start at top left in the forward direction:
	      const aIndexesF = [NOT_YET_SET];
	      // from the end at bottom right in the reverse direction:
	      const aIndexesR = [NOT_YET_SET];

	      // Initialize one object as output of all calls to divide function.
	      const division = {
	        aCommonFollowing: NOT_YET_SET,
	        aCommonPreceding: NOT_YET_SET,
	        aEndPreceding: NOT_YET_SET,
	        aStartFollowing: NOT_YET_SET,
	        bCommonFollowing: NOT_YET_SET,
	        bCommonPreceding: NOT_YET_SET,
	        bEndPreceding: NOT_YET_SET,
	        bStartFollowing: NOT_YET_SET,
	        nChangeFollowing: NOT_YET_SET,
	        nChangePreceding: NOT_YET_SET,
	        nCommonFollowing: NOT_YET_SET,
	        nCommonPreceding: NOT_YET_SET
	      };

	      // Find and return common subsequences in the trimmed index intervals.
	      findSubsequences(
	        nChange,
	        aStart,
	        aEnd,
	        bStart,
	        bEnd,
	        transposed,
	        callbacks,
	        aIndexesF,
	        aIndexesR,
	        division
	      );
	    }
	    if (nCommonR !== 0) {
	      foundSubsequence(nCommonR, aEnd, bEnd);
	    }
	  }
	}
	return build;
}

var buildExports = requireBuild();
var diffSequences = /*@__PURE__*/getDefaultExportFromCjs$3(buildExports);

function formatTrailingSpaces(line, trailingSpaceFormatter) {
  return line.replace(/\s+$/, (match) => trailingSpaceFormatter(match));
}
function printDiffLine(line, isFirstOrLast, color, indicator, trailingSpaceFormatter, emptyFirstOrLastLinePlaceholder) {
  return line.length !== 0 ? color(
    `${indicator} ${formatTrailingSpaces(line, trailingSpaceFormatter)}`
  ) : indicator !== " " ? color(indicator) : isFirstOrLast && emptyFirstOrLastLinePlaceholder.length !== 0 ? color(`${indicator} ${emptyFirstOrLastLinePlaceholder}`) : "";
}
function printDeleteLine(line, isFirstOrLast, {
  aColor,
  aIndicator,
  changeLineTrailingSpaceColor,
  emptyFirstOrLastLinePlaceholder
}) {
  return printDiffLine(
    line,
    isFirstOrLast,
    aColor,
    aIndicator,
    changeLineTrailingSpaceColor,
    emptyFirstOrLastLinePlaceholder
  );
}
function printInsertLine(line, isFirstOrLast, {
  bColor,
  bIndicator,
  changeLineTrailingSpaceColor,
  emptyFirstOrLastLinePlaceholder
}) {
  return printDiffLine(
    line,
    isFirstOrLast,
    bColor,
    bIndicator,
    changeLineTrailingSpaceColor,
    emptyFirstOrLastLinePlaceholder
  );
}
function printCommonLine(line, isFirstOrLast, {
  commonColor,
  commonIndicator,
  commonLineTrailingSpaceColor,
  emptyFirstOrLastLinePlaceholder
}) {
  return printDiffLine(
    line,
    isFirstOrLast,
    commonColor,
    commonIndicator,
    commonLineTrailingSpaceColor,
    emptyFirstOrLastLinePlaceholder
  );
}
function createPatchMark(aStart, aEnd, bStart, bEnd, { patchColor }) {
  return patchColor(
    `@@ -${aStart + 1},${aEnd - aStart} +${bStart + 1},${bEnd - bStart} @@`
  );
}
function joinAlignedDiffsNoExpand(diffs, options) {
  const iLength = diffs.length;
  const nContextLines = options.contextLines;
  const nContextLines2 = nContextLines + nContextLines;
  let jLength = iLength;
  let hasExcessAtStartOrEnd = false;
  let nExcessesBetweenChanges = 0;
  let i = 0;
  while (i !== iLength) {
    const iStart = i;
    while (i !== iLength && diffs[i][0] === DIFF_EQUAL) {
      i += 1;
    }
    if (iStart !== i) {
      if (iStart === 0) {
        if (i > nContextLines) {
          jLength -= i - nContextLines;
          hasExcessAtStartOrEnd = true;
        }
      } else if (i === iLength) {
        const n = i - iStart;
        if (n > nContextLines) {
          jLength -= n - nContextLines;
          hasExcessAtStartOrEnd = true;
        }
      } else {
        const n = i - iStart;
        if (n > nContextLines2) {
          jLength -= n - nContextLines2;
          nExcessesBetweenChanges += 1;
        }
      }
    }
    while (i !== iLength && diffs[i][0] !== DIFF_EQUAL) {
      i += 1;
    }
  }
  const hasPatch = nExcessesBetweenChanges !== 0 || hasExcessAtStartOrEnd;
  if (nExcessesBetweenChanges !== 0) {
    jLength += nExcessesBetweenChanges + 1;
  } else if (hasExcessAtStartOrEnd) {
    jLength += 1;
  }
  const jLast = jLength - 1;
  const lines = [];
  let jPatchMark = 0;
  if (hasPatch) {
    lines.push("");
  }
  let aStart = 0;
  let bStart = 0;
  let aEnd = 0;
  let bEnd = 0;
  const pushCommonLine = (line) => {
    const j = lines.length;
    lines.push(printCommonLine(line, j === 0 || j === jLast, options));
    aEnd += 1;
    bEnd += 1;
  };
  const pushDeleteLine = (line) => {
    const j = lines.length;
    lines.push(printDeleteLine(line, j === 0 || j === jLast, options));
    aEnd += 1;
  };
  const pushInsertLine = (line) => {
    const j = lines.length;
    lines.push(printInsertLine(line, j === 0 || j === jLast, options));
    bEnd += 1;
  };
  i = 0;
  while (i !== iLength) {
    let iStart = i;
    while (i !== iLength && diffs[i][0] === DIFF_EQUAL) {
      i += 1;
    }
    if (iStart !== i) {
      if (iStart === 0) {
        if (i > nContextLines) {
          iStart = i - nContextLines;
          aStart = iStart;
          bStart = iStart;
          aEnd = aStart;
          bEnd = bStart;
        }
        for (let iCommon = iStart; iCommon !== i; iCommon += 1) {
          pushCommonLine(diffs[iCommon][1]);
        }
      } else if (i === iLength) {
        const iEnd = i - iStart > nContextLines ? iStart + nContextLines : i;
        for (let iCommon = iStart; iCommon !== iEnd; iCommon += 1) {
          pushCommonLine(diffs[iCommon][1]);
        }
      } else {
        const nCommon = i - iStart;
        if (nCommon > nContextLines2) {
          const iEnd = iStart + nContextLines;
          for (let iCommon = iStart; iCommon !== iEnd; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
          lines[jPatchMark] = createPatchMark(
            aStart,
            aEnd,
            bStart,
            bEnd,
            options
          );
          jPatchMark = lines.length;
          lines.push("");
          const nOmit = nCommon - nContextLines2;
          aStart = aEnd + nOmit;
          bStart = bEnd + nOmit;
          aEnd = aStart;
          bEnd = bStart;
          for (let iCommon = i - nContextLines; iCommon !== i; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
        } else {
          for (let iCommon = iStart; iCommon !== i; iCommon += 1) {
            pushCommonLine(diffs[iCommon][1]);
          }
        }
      }
    }
    while (i !== iLength && diffs[i][0] === DIFF_DELETE) {
      pushDeleteLine(diffs[i][1]);
      i += 1;
    }
    while (i !== iLength && diffs[i][0] === DIFF_INSERT) {
      pushInsertLine(diffs[i][1]);
      i += 1;
    }
  }
  if (hasPatch) {
    lines[jPatchMark] = createPatchMark(aStart, aEnd, bStart, bEnd, options);
  }
  return lines.join("\n");
}
function joinAlignedDiffsExpand(diffs, options) {
  return diffs.map((diff, i, diffs2) => {
    const line = diff[1];
    const isFirstOrLast = i === 0 || i === diffs2.length - 1;
    switch (diff[0]) {
      case DIFF_DELETE:
        return printDeleteLine(line, isFirstOrLast, options);
      case DIFF_INSERT:
        return printInsertLine(line, isFirstOrLast, options);
      default:
        return printCommonLine(line, isFirstOrLast, options);
    }
  }).join("\n");
}

const noColor = (string) => string;
const DIFF_CONTEXT_DEFAULT = 5;
const DIFF_TRUNCATE_THRESHOLD_DEFAULT = 0;
function getDefaultOptions() {
  return {
    aAnnotation: "Expected",
    aColor: s.green,
    aIndicator: "-",
    bAnnotation: "Received",
    bColor: s.red,
    bIndicator: "+",
    changeColor: s.inverse,
    changeLineTrailingSpaceColor: noColor,
    commonColor: s.dim,
    commonIndicator: " ",
    commonLineTrailingSpaceColor: noColor,
    compareKeys: undefined,
    contextLines: DIFF_CONTEXT_DEFAULT,
    emptyFirstOrLastLinePlaceholder: "",
    expand: true,
    includeChangeCounts: false,
    omitAnnotationLines: false,
    patchColor: s.yellow,
    printBasicPrototype: false,
    truncateThreshold: DIFF_TRUNCATE_THRESHOLD_DEFAULT,
    truncateAnnotation: "... Diff result is truncated",
    truncateAnnotationColor: noColor
  };
}
function getCompareKeys(compareKeys) {
  return compareKeys && typeof compareKeys === "function" ? compareKeys : undefined;
}
function getContextLines(contextLines) {
  return typeof contextLines === "number" && Number.isSafeInteger(contextLines) && contextLines >= 0 ? contextLines : DIFF_CONTEXT_DEFAULT;
}
function normalizeDiffOptions(options = {}) {
  return {
    ...getDefaultOptions(),
    ...options,
    compareKeys: getCompareKeys(options.compareKeys),
    contextLines: getContextLines(options.contextLines)
  };
}

function isEmptyString(lines) {
  return lines.length === 1 && lines[0].length === 0;
}
function countChanges(diffs) {
  let a = 0;
  let b = 0;
  diffs.forEach((diff) => {
    switch (diff[0]) {
      case DIFF_DELETE:
        a += 1;
        break;
      case DIFF_INSERT:
        b += 1;
        break;
    }
  });
  return { a, b };
}
function printAnnotation({
  aAnnotation,
  aColor,
  aIndicator,
  bAnnotation,
  bColor,
  bIndicator,
  includeChangeCounts,
  omitAnnotationLines
}, changeCounts) {
  if (omitAnnotationLines) {
    return "";
  }
  let aRest = "";
  let bRest = "";
  if (includeChangeCounts) {
    const aCount = String(changeCounts.a);
    const bCount = String(changeCounts.b);
    const baAnnotationLengthDiff = bAnnotation.length - aAnnotation.length;
    const aAnnotationPadding = " ".repeat(Math.max(0, baAnnotationLengthDiff));
    const bAnnotationPadding = " ".repeat(Math.max(0, -baAnnotationLengthDiff));
    const baCountLengthDiff = bCount.length - aCount.length;
    const aCountPadding = " ".repeat(Math.max(0, baCountLengthDiff));
    const bCountPadding = " ".repeat(Math.max(0, -baCountLengthDiff));
    aRest = `${aAnnotationPadding}  ${aIndicator} ${aCountPadding}${aCount}`;
    bRest = `${bAnnotationPadding}  ${bIndicator} ${bCountPadding}${bCount}`;
  }
  const a = `${aIndicator} ${aAnnotation}${aRest}`;
  const b = `${bIndicator} ${bAnnotation}${bRest}`;
  return `${aColor(a)}
${bColor(b)}

`;
}
function printDiffLines(diffs, truncated, options) {
  return printAnnotation(options, countChanges(diffs)) + (options.expand ? joinAlignedDiffsExpand(diffs, options) : joinAlignedDiffsNoExpand(diffs, options)) + (truncated ? options.truncateAnnotationColor(`
${options.truncateAnnotation}`) : "");
}
function diffLinesUnified(aLines, bLines, options) {
  const normalizedOptions = normalizeDiffOptions(options);
  const [diffs, truncated] = diffLinesRaw(
    isEmptyString(aLines) ? [] : aLines,
    isEmptyString(bLines) ? [] : bLines,
    normalizedOptions
  );
  return printDiffLines(diffs, truncated, normalizedOptions);
}
function diffLinesUnified2(aLinesDisplay, bLinesDisplay, aLinesCompare, bLinesCompare, options) {
  if (isEmptyString(aLinesDisplay) && isEmptyString(aLinesCompare)) {
    aLinesDisplay = [];
    aLinesCompare = [];
  }
  if (isEmptyString(bLinesDisplay) && isEmptyString(bLinesCompare)) {
    bLinesDisplay = [];
    bLinesCompare = [];
  }
  if (aLinesDisplay.length !== aLinesCompare.length || bLinesDisplay.length !== bLinesCompare.length) {
    return diffLinesUnified(aLinesDisplay, bLinesDisplay, options);
  }
  const [diffs, truncated] = diffLinesRaw(
    aLinesCompare,
    bLinesCompare,
    options
  );
  let aIndex = 0;
  let bIndex = 0;
  diffs.forEach((diff) => {
    switch (diff[0]) {
      case DIFF_DELETE:
        diff[1] = aLinesDisplay[aIndex];
        aIndex += 1;
        break;
      case DIFF_INSERT:
        diff[1] = bLinesDisplay[bIndex];
        bIndex += 1;
        break;
      default:
        diff[1] = bLinesDisplay[bIndex];
        aIndex += 1;
        bIndex += 1;
    }
  });
  return printDiffLines(diffs, truncated, normalizeDiffOptions(options));
}
function diffLinesRaw(aLines, bLines, options) {
  const truncate = (options == null ? undefined : options.truncateThreshold) ?? false;
  const truncateThreshold = Math.max(
    Math.floor((options == null ? undefined : options.truncateThreshold) ?? 0),
    0
  );
  const aLength = truncate ? Math.min(aLines.length, truncateThreshold) : aLines.length;
  const bLength = truncate ? Math.min(bLines.length, truncateThreshold) : bLines.length;
  const truncated = aLength !== aLines.length || bLength !== bLines.length;
  const isCommon = (aIndex2, bIndex2) => aLines[aIndex2] === bLines[bIndex2];
  const diffs = [];
  let aIndex = 0;
  let bIndex = 0;
  const foundSubsequence = (nCommon, aCommon, bCommon) => {
    for (; aIndex !== aCommon; aIndex += 1) {
      diffs.push(new Diff(DIFF_DELETE, aLines[aIndex]));
    }
    for (; bIndex !== bCommon; bIndex += 1) {
      diffs.push(new Diff(DIFF_INSERT, bLines[bIndex]));
    }
    for (; nCommon !== 0; nCommon -= 1, aIndex += 1, bIndex += 1) {
      diffs.push(new Diff(DIFF_EQUAL, bLines[bIndex]));
    }
  };
  diffSequences(aLength, bLength, isCommon, foundSubsequence);
  for (; aIndex !== aLength; aIndex += 1) {
    diffs.push(new Diff(DIFF_DELETE, aLines[aIndex]));
  }
  for (; bIndex !== bLength; bIndex += 1) {
    diffs.push(new Diff(DIFF_INSERT, bLines[bIndex]));
  }
  return [diffs, truncated];
}

function getType(value) {
  if (value === undefined) {
    return "undefined";
  } else if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (typeof value === "function") {
    return "function";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "string") {
    return "string";
  } else if (typeof value === "bigint") {
    return "bigint";
  } else if (typeof value === "object") {
    if (value != null) {
      if (value.constructor === RegExp) {
        return "regexp";
      } else if (value.constructor === Map) {
        return "map";
      } else if (value.constructor === Set) {
        return "set";
      } else if (value.constructor === Date) {
        return "date";
      }
    }
    return "object";
  } else if (typeof value === "symbol") {
    return "symbol";
  }
  throw new Error(`value of unknown type: ${value}`);
}

function getNewLineSymbol(string) {
  return string.includes("\r\n") ? "\r\n" : "\n";
}
function diffStrings(a, b, options) {
  const truncate = (options == null ? undefined : options.truncateThreshold) ?? false;
  const truncateThreshold = Math.max(
    Math.floor((options == null ? undefined : options.truncateThreshold) ?? 0),
    0
  );
  let aLength = a.length;
  let bLength = b.length;
  if (truncate) {
    const aMultipleLines = a.includes("\n");
    const bMultipleLines = b.includes("\n");
    const aNewLineSymbol = getNewLineSymbol(a);
    const bNewLineSymbol = getNewLineSymbol(b);
    const _a = aMultipleLines ? `${a.split(aNewLineSymbol, truncateThreshold).join(aNewLineSymbol)}
` : a;
    const _b = bMultipleLines ? `${b.split(bNewLineSymbol, truncateThreshold).join(bNewLineSymbol)}
` : b;
    aLength = _a.length;
    bLength = _b.length;
  }
  const truncated = aLength !== a.length || bLength !== b.length;
  const isCommon = (aIndex2, bIndex2) => a[aIndex2] === b[bIndex2];
  let aIndex = 0;
  let bIndex = 0;
  const diffs = [];
  const foundSubsequence = (nCommon, aCommon, bCommon) => {
    if (aIndex !== aCommon) {
      diffs.push(new Diff(DIFF_DELETE, a.slice(aIndex, aCommon)));
    }
    if (bIndex !== bCommon) {
      diffs.push(new Diff(DIFF_INSERT, b.slice(bIndex, bCommon)));
    }
    aIndex = aCommon + nCommon;
    bIndex = bCommon + nCommon;
    diffs.push(new Diff(DIFF_EQUAL, b.slice(bCommon, bIndex)));
  };
  diffSequences(aLength, bLength, isCommon, foundSubsequence);
  if (aIndex !== aLength) {
    diffs.push(new Diff(DIFF_DELETE, a.slice(aIndex)));
  }
  if (bIndex !== bLength) {
    diffs.push(new Diff(DIFF_INSERT, b.slice(bIndex)));
  }
  return [diffs, truncated];
}

function concatenateRelevantDiffs(op, diffs, changeColor) {
  return diffs.reduce(
    (reduced, diff) => reduced + (diff[0] === DIFF_EQUAL ? diff[1] : diff[0] === op && diff[1].length !== 0 ? changeColor(diff[1]) : ""),
    ""
  );
}
class ChangeBuffer {
  op;
  line;
  // incomplete line
  lines;
  // complete lines
  changeColor;
  constructor(op, changeColor) {
    this.op = op;
    this.line = [];
    this.lines = [];
    this.changeColor = changeColor;
  }
  pushSubstring(substring) {
    this.pushDiff(new Diff(this.op, substring));
  }
  pushLine() {
    this.lines.push(
      this.line.length !== 1 ? new Diff(
        this.op,
        concatenateRelevantDiffs(this.op, this.line, this.changeColor)
      ) : this.line[0][0] === this.op ? this.line[0] : new Diff(this.op, this.line[0][1])
      // was common diff
    );
    this.line.length = 0;
  }
  isLineEmpty() {
    return this.line.length === 0;
  }
  // Minor input to buffer.
  pushDiff(diff) {
    this.line.push(diff);
  }
  // Main input to buffer.
  align(diff) {
    const string = diff[1];
    if (string.includes("\n")) {
      const substrings = string.split("\n");
      const iLast = substrings.length - 1;
      substrings.forEach((substring, i) => {
        if (i < iLast) {
          this.pushSubstring(substring);
          this.pushLine();
        } else if (substring.length !== 0) {
          this.pushSubstring(substring);
        }
      });
    } else {
      this.pushDiff(diff);
    }
  }
  // Output from buffer.
  moveLinesTo(lines) {
    if (!this.isLineEmpty()) {
      this.pushLine();
    }
    lines.push(...this.lines);
    this.lines.length = 0;
  }
}
class CommonBuffer {
  deleteBuffer;
  insertBuffer;
  lines;
  constructor(deleteBuffer, insertBuffer) {
    this.deleteBuffer = deleteBuffer;
    this.insertBuffer = insertBuffer;
    this.lines = [];
  }
  pushDiffCommonLine(diff) {
    this.lines.push(diff);
  }
  pushDiffChangeLines(diff) {
    const isDiffEmpty = diff[1].length === 0;
    if (!isDiffEmpty || this.deleteBuffer.isLineEmpty()) {
      this.deleteBuffer.pushDiff(diff);
    }
    if (!isDiffEmpty || this.insertBuffer.isLineEmpty()) {
      this.insertBuffer.pushDiff(diff);
    }
  }
  flushChangeLines() {
    this.deleteBuffer.moveLinesTo(this.lines);
    this.insertBuffer.moveLinesTo(this.lines);
  }
  // Input to buffer.
  align(diff) {
    const op = diff[0];
    const string = diff[1];
    if (string.includes("\n")) {
      const substrings = string.split("\n");
      const iLast = substrings.length - 1;
      substrings.forEach((substring, i) => {
        if (i === 0) {
          const subdiff = new Diff(op, substring);
          if (this.deleteBuffer.isLineEmpty() && this.insertBuffer.isLineEmpty()) {
            this.flushChangeLines();
            this.pushDiffCommonLine(subdiff);
          } else {
            this.pushDiffChangeLines(subdiff);
            this.flushChangeLines();
          }
        } else if (i < iLast) {
          this.pushDiffCommonLine(new Diff(op, substring));
        } else if (substring.length !== 0) {
          this.pushDiffChangeLines(new Diff(op, substring));
        }
      });
    } else {
      this.pushDiffChangeLines(diff);
    }
  }
  // Output from buffer.
  getLines() {
    this.flushChangeLines();
    return this.lines;
  }
}
function getAlignedDiffs(diffs, changeColor) {
  const deleteBuffer = new ChangeBuffer(DIFF_DELETE, changeColor);
  const insertBuffer = new ChangeBuffer(DIFF_INSERT, changeColor);
  const commonBuffer = new CommonBuffer(deleteBuffer, insertBuffer);
  diffs.forEach((diff) => {
    switch (diff[0]) {
      case DIFF_DELETE:
        deleteBuffer.align(diff);
        break;
      case DIFF_INSERT:
        insertBuffer.align(diff);
        break;
      default:
        commonBuffer.align(diff);
    }
  });
  return commonBuffer.getLines();
}

function hasCommonDiff(diffs, isMultiline) {
  if (isMultiline) {
    const iLast = diffs.length - 1;
    return diffs.some(
      (diff, i) => diff[0] === DIFF_EQUAL && (i !== iLast || diff[1] !== "\n")
    );
  }
  return diffs.some((diff) => diff[0] === DIFF_EQUAL);
}
function diffStringsUnified(a, b, options) {
  if (a !== b && a.length !== 0 && b.length !== 0) {
    const isMultiline = a.includes("\n") || b.includes("\n");
    const [diffs, truncated] = diffStringsRaw(
      isMultiline ? `${a}
` : a,
      isMultiline ? `${b}
` : b,
      true,
      // cleanupSemantic
      options
    );
    if (hasCommonDiff(diffs, isMultiline)) {
      const optionsNormalized = normalizeDiffOptions(options);
      const lines = getAlignedDiffs(diffs, optionsNormalized.changeColor);
      return printDiffLines(lines, truncated, optionsNormalized);
    }
  }
  return diffLinesUnified(a.split("\n"), b.split("\n"), options);
}
function diffStringsRaw(a, b, cleanup, options) {
  const [diffs, truncated] = diffStrings(a, b, options);
  if (cleanup) {
    diff_cleanupSemantic(diffs);
  }
  return [diffs, truncated];
}

function getCommonMessage(message, options) {
  const { commonColor } = normalizeDiffOptions(options);
  return commonColor(message);
}
const {
  AsymmetricMatcher: AsymmetricMatcher$2,
  DOMCollection: DOMCollection$1,
  DOMElement: DOMElement$1,
  Immutable: Immutable$1,
  ReactElement: ReactElement$1,
  ReactTestComponent: ReactTestComponent$1
} = plugins;
const PLUGINS$1 = [
  ReactTestComponent$1,
  ReactElement$1,
  DOMElement$1,
  DOMCollection$1,
  Immutable$1,
  AsymmetricMatcher$2,
  plugins.Error
];
const FORMAT_OPTIONS = {
  plugins: PLUGINS$1
};
const FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false,
  maxDepth: 8,
  plugins: PLUGINS$1
};
function diff(a, b, options) {
  if (Object.is(a, b)) {
    return "";
  }
  const aType = getType(a);
  let expectedType = aType;
  let omitDifference = false;
  if (aType === "object" && typeof a.asymmetricMatch === "function") {
    if (a.$$typeof !== Symbol.for("jest.asymmetricMatcher")) {
      return undefined;
    }
    if (typeof a.getExpectedType !== "function") {
      return undefined;
    }
    expectedType = a.getExpectedType();
    omitDifference = expectedType === "string";
  }
  if (expectedType !== getType(b)) {
    let truncate2 = function(s) {
      return s.length <= MAX_LENGTH ? s : `${s.slice(0, MAX_LENGTH)}...`;
    };
    const { aAnnotation, aColor, aIndicator, bAnnotation, bColor, bIndicator } = normalizeDiffOptions(options);
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    let aDisplay = format$2(a, formatOptions);
    let bDisplay = format$2(b, formatOptions);
    const MAX_LENGTH = 1e5;
    aDisplay = truncate2(aDisplay);
    bDisplay = truncate2(bDisplay);
    const aDiff = `${aColor(`${aIndicator} ${aAnnotation}:`)} 
${aDisplay}`;
    const bDiff = `${bColor(`${bIndicator} ${bAnnotation}:`)} 
${bDisplay}`;
    return `${aDiff}

${bDiff}`;
  }
  if (omitDifference) {
    return undefined;
  }
  switch (aType) {
    case "string":
      return diffLinesUnified(a.split("\n"), b.split("\n"), options);
    case "boolean":
    case "number":
      return comparePrimitive(a, b, options);
    case "map":
      return compareObjects(sortMap(a), sortMap(b), options);
    case "set":
      return compareObjects(sortSet(a), sortSet(b), options);
    default:
      return compareObjects(a, b, options);
  }
}
function comparePrimitive(a, b, options) {
  const aFormat = format$2(a, FORMAT_OPTIONS);
  const bFormat = format$2(b, FORMAT_OPTIONS);
  return aFormat === bFormat ? "" : diffLinesUnified(aFormat.split("\n"), bFormat.split("\n"), options);
}
function sortMap(map) {
  return new Map(Array.from(map.entries()).sort());
}
function sortSet(set) {
  return new Set(Array.from(set.values()).sort());
}
function compareObjects(a, b, options) {
  let difference;
  let hasThrown = false;
  try {
    const formatOptions = getFormatOptions(FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);
  } catch {
    hasThrown = true;
  }
  const noDiffMessage = getCommonMessage(NO_DIFF_MESSAGE, options);
  if (difference === undefined || difference === noDiffMessage) {
    const formatOptions = getFormatOptions(FALLBACK_FORMAT_OPTIONS, options);
    difference = getObjectsDifference(a, b, formatOptions, options);
    if (difference !== noDiffMessage && !hasThrown) {
      difference = `${getCommonMessage(
        SIMILAR_MESSAGE,
        options
      )}

${difference}`;
    }
  }
  return difference;
}
function getFormatOptions(formatOptions, options) {
  const { compareKeys, printBasicPrototype } = normalizeDiffOptions(options);
  return {
    ...formatOptions,
    compareKeys,
    printBasicPrototype
  };
}
function getObjectsDifference(a, b, formatOptions, options) {
  const formatOptionsZeroIndent = { ...formatOptions, indent: 0 };
  const aCompare = format$2(a, formatOptionsZeroIndent);
  const bCompare = format$2(b, formatOptionsZeroIndent);
  if (aCompare === bCompare) {
    return getCommonMessage(NO_DIFF_MESSAGE, options);
  } else {
    const aDisplay = format$2(a, formatOptions);
    const bDisplay = format$2(b, formatOptions);
    return diffLinesUnified2(
      aDisplay.split("\n"),
      bDisplay.split("\n"),
      aCompare.split("\n"),
      bCompare.split("\n"),
      options
    );
  }
}
const MAX_DIFF_STRING_LENGTH = 2e4;
function isAsymmetricMatcher(data) {
  const type = getType$1(data);
  return type === "Object" && typeof data.asymmetricMatch === "function";
}
function isReplaceable(obj1, obj2) {
  const obj1Type = getType$1(obj1);
  const obj2Type = getType$1(obj2);
  return obj1Type === obj2Type && (obj1Type === "Object" || obj1Type === "Array");
}
function printDiffOrStringify(received, expected, options) {
  const { aAnnotation, bAnnotation } = normalizeDiffOptions(options);
  if (typeof expected === "string" && typeof received === "string" && expected.length > 0 && received.length > 0 && expected.length <= MAX_DIFF_STRING_LENGTH && received.length <= MAX_DIFF_STRING_LENGTH && expected !== received) {
    if (expected.includes("\n") || received.includes("\n")) {
      return diffStringsUnified(expected, received, options);
    }
    const [diffs] = diffStringsRaw(expected, received, true);
    const hasCommonDiff = diffs.some((diff2) => diff2[0] === DIFF_EQUAL);
    const printLabel = getLabelPrinter(aAnnotation, bAnnotation);
    const expectedLine = printLabel(aAnnotation) + printExpected$1(
      getCommonAndChangedSubstrings(diffs, DIFF_DELETE, hasCommonDiff)
    );
    const receivedLine = printLabel(bAnnotation) + printReceived$1(
      getCommonAndChangedSubstrings(diffs, DIFF_INSERT, hasCommonDiff)
    );
    return `${expectedLine}
${receivedLine}`;
  }
  const clonedExpected = deepClone(expected, { forceWritable: true });
  const clonedReceived = deepClone(received, { forceWritable: true });
  const { replacedExpected, replacedActual } = replaceAsymmetricMatcher(clonedReceived, clonedExpected);
  const difference = diff(replacedExpected, replacedActual, options);
  return difference;
}
function replaceAsymmetricMatcher(actual, expected, actualReplaced = /* @__PURE__ */ new WeakSet(), expectedReplaced = /* @__PURE__ */ new WeakSet()) {
  if (actual instanceof Error && expected instanceof Error && typeof actual.cause !== "undefined" && typeof expected.cause === "undefined") {
    delete actual.cause;
    return {
      replacedActual: actual,
      replacedExpected: expected
    };
  }
  if (!isReplaceable(actual, expected)) {
    return { replacedActual: actual, replacedExpected: expected };
  }
  if (actualReplaced.has(actual) || expectedReplaced.has(expected)) {
    return { replacedActual: actual, replacedExpected: expected };
  }
  actualReplaced.add(actual);
  expectedReplaced.add(expected);
  getOwnProperties(expected).forEach((key) => {
    const expectedValue = expected[key];
    const actualValue = actual[key];
    if (isAsymmetricMatcher(expectedValue)) {
      if (expectedValue.asymmetricMatch(actualValue)) {
        actual[key] = expectedValue;
      }
    } else if (isAsymmetricMatcher(actualValue)) {
      if (actualValue.asymmetricMatch(expectedValue)) {
        expected[key] = actualValue;
      }
    } else if (isReplaceable(actualValue, expectedValue)) {
      const replaced = replaceAsymmetricMatcher(
        actualValue,
        expectedValue,
        actualReplaced,
        expectedReplaced
      );
      actual[key] = replaced.replacedActual;
      expected[key] = replaced.replacedExpected;
    }
  });
  return {
    replacedActual: actual,
    replacedExpected: expected
  };
}
function getLabelPrinter(...strings) {
  const maxLength = strings.reduce(
    (max, string) => string.length > max ? string.length : max,
    0
  );
  return (string) => `${string}: ${" ".repeat(maxLength - string.length)}`;
}
const SPACE_SYMBOL$1 = "\xB7";
function replaceTrailingSpaces$1(text) {
  return text.replace(/\s+$/gm, (spaces) => SPACE_SYMBOL$1.repeat(spaces.length));
}
function printReceived$1(object) {
  return s.red(replaceTrailingSpaces$1(stringify(object)));
}
function printExpected$1(value) {
  return s.green(replaceTrailingSpaces$1(stringify(value)));
}
function getCommonAndChangedSubstrings(diffs, op, hasCommonDiff) {
  return diffs.reduce(
    (reduced, diff2) => reduced + (diff2[0] === DIFF_EQUAL ? diff2[1] : diff2[0] === op ? hasCommonDiff ? s.inverse(diff2[1]) : diff2[1] : ""),
    ""
  );
}

// src/utils.ts
function d(e, t) {
  if (!e)
    throw new Error(t);
}
function y(e, t) {
  return typeof t === e;
}
function w(e) {
  return e instanceof Promise;
}
function f$1(e, t, n) {
  Object.defineProperty(e, t, n);
}
function l(e, t, n) {
  Object.defineProperty(e, t, { value: n });
}

// src/constants.ts
var u = Symbol.for("tinyspy:spy");

// src/internal.ts
var x = /* @__PURE__ */ new Set(), P = (e) => {
  e.called = !1, e.callCount = 0, e.calls = [], e.results = [], e.resolves = [], e.next = [];
}, K = (e) => (f$1(e, u, { value: { reset: () => P(e[u]) } }), e[u]), T = (e) => e[u] || K(e);
function m(e) {
  d(
    y("function", e) || y("undefined", e),
    "cannot spy on a non-function value"
  );
  let t = function(...s) {
    let r = T(t);
    r.called = !0, r.callCount++, r.calls.push(s);
    let S = r.next.shift();
    if (S) {
      r.results.push(S);
      let [o, g] = S;
      if (o === "ok")
        return g;
      throw g;
    }
    let p, c = "ok", a = r.results.length;
    if (r.impl)
      try {
        new.target ? p = Reflect.construct(r.impl, s, new.target) : p = r.impl.apply(this, s), c = "ok";
      } catch (o) {
        throw p = o, c = "error", r.results.push([c, o]), o;
      }
    let R = [c, p];
    return w(p) && p.then(
      (o) => r.resolves[a] = ["ok", o],
      (o) => r.resolves[a] = ["error", o]
    ), r.results.push(R), p;
  };
  l(t, "_isMockFunction", !0), l(t, "length", e ? e.length : 0), l(t, "name", e && e.name || "spy");
  let n = T(t);
  return n.reset(), n.impl = e, t;
}
function A(e) {
  let t = T(e);
  "returns" in e || (f$1(e, "returns", {
    get: () => t.results.map(([, n]) => n)
  }), [
    "called",
    "callCount",
    "results",
    "resolves",
    "calls",
    "reset",
    "impl"
  ].forEach(
    (n) => f$1(e, n, { get: () => t[n], set: (s) => t[n] = s })
  ), l(e, "nextError", (n) => (t.next.push(["error", n]), t)), l(e, "nextResult", (n) => (t.next.push(["ok", n]), t)));
}

// src/spy.ts
function L(e) {
  let t = m(e);
  return A(t), t;
}

// src/spyOn.ts
var k = (e, t) => Object.getOwnPropertyDescriptor(e, t), O = (e, t) => {
  t != null && typeof t == "function" && t.prototype != null && Object.setPrototypeOf(e.prototype, t.prototype);
};
function C$1(e, t, n) {
  d(
    !y("undefined", e),
    "spyOn could not find an object to spy upon"
  ), d(
    y("object", e) || y("function", e),
    "cannot spyOn on a primitive value"
  );
  let [s, r] = (() => {
    if (!y("object", t))
      return [t, "value"];
    if ("getter" in t && "setter" in t)
      throw new Error("cannot spy on both getter and setter");
    if ("getter" in t)
      return [t.getter, "get"];
    if ("setter" in t)
      return [t.setter, "set"];
    throw new Error("specify getter or setter to spy on");
  })(), S = k(e, s), p = Object.getPrototypeOf(e), c = p && k(p, s), a = S || c;
  d(
    a || s in e,
    `${String(s)} does not exist`
  );
  let R = !1;
  r === "value" && a && !a.value && a.get && (r = "get", R = !0, n = a.get());
  let o;
  a ? o = a[r] : r !== "value" ? o = () => e[s] : o = e[s];
  let g = (v) => {
    let { value: M, ...h } = a || {
      configurable: !0,
      writable: !0
    };
    r !== "value" && delete h.writable, h[r] = v, f$1(e, s, h);
  }, b = () => a ? f$1(e, s, a) : g(o);
  n || (n = o);
  let i = m(n);
  r === "value" && O(i, o);
  let I = i[u];
  return l(I, "restore", b), l(I, "getOriginal", () => R ? o() : o), l(I, "willCall", (v) => (I.impl = v, i)), g(
    R ? () => (O(i, n), i) : i
  ), x.add(i), i;
}
function U(e, t, n) {
  let s = C$1(e, t, n);
  return A(s), ["restore", "getOriginal", "willCall"].forEach((r) => {
    l(s, r, s[u][r]);
  }), s;
}

// src/restoreAll.ts
function Y() {
  for (let e of x)
    e.restore();
  x.clear();
}

const vitestSpy = Symbol.for("vitest.spy");
const mocks = /* @__PURE__ */ new Set();
function isMockFunction(fn2) {
  return typeof fn2 === "function" && "_isMockFunction" in fn2 && fn2._isMockFunction;
}
function getSpy(obj, method, accessType) {
  const desc = Object.getOwnPropertyDescriptor(obj, method);
  if (desc) {
    const fn2 = desc[accessType ?? "value"];
    if (typeof fn2 === "function" && vitestSpy in fn2) {
      return fn2;
    }
  }
}
function spyOn(obj, method, accessType) {
  const dictionary = {
    get: "getter",
    set: "setter"
  };
  const objMethod = accessType ? { [dictionary[accessType]]: method } : method;
  const currentStub = getSpy(obj, method, accessType);
  if (currentStub) {
    return currentStub;
  }
  const stub = C$1(obj, objMethod);
  return enhanceSpy(stub);
}
let callOrder = 0;
function enhanceSpy(spy) {
  const stub = spy;
  let implementation;
  let instances = [];
  let contexts = [];
  let invocations = [];
  const state = T(spy);
  const mockContext = {
    get calls() {
      return state.calls;
    },
    get contexts() {
      return contexts;
    },
    get instances() {
      return instances;
    },
    get invocationCallOrder() {
      return invocations;
    },
    get results() {
      return state.results.map(([callType, value]) => {
        const type = callType === "error" ? "throw" : "return";
        return { type, value };
      });
    },
    get settledResults() {
      return state.resolves.map(([callType, value]) => {
        const type = callType === "error" ? "rejected" : "fulfilled";
        return { type, value };
      });
    },
    get lastCall() {
      return state.calls[state.calls.length - 1];
    }
  };
  let onceImplementations = [];
  let implementationChangedTemporarily = false;
  function mockCall(...args) {
    instances.push(this);
    contexts.push(this);
    invocations.push(++callOrder);
    const impl = implementationChangedTemporarily ? implementation : onceImplementations.shift() || implementation || state.getOriginal() || (() => {
    });
    return impl.apply(this, args);
  }
  let name = stub.name;
  Object.defineProperty(stub, vitestSpy, {
    value: true,
    enumerable: false
  });
  stub.getMockName = () => name || "vi.fn()";
  stub.mockName = (n) => {
    name = n;
    return stub;
  };
  stub.mockClear = () => {
    state.reset();
    instances = [];
    contexts = [];
    invocations = [];
    return stub;
  };
  stub.mockReset = () => {
    stub.mockClear();
    implementation = undefined;
    onceImplementations = [];
    return stub;
  };
  stub.mockRestore = () => {
    stub.mockReset();
    state.restore();
    return stub;
  };
  stub.getMockImplementation = () => implementationChangedTemporarily ? implementation : onceImplementations.at(0) || implementation;
  stub.mockImplementation = (fn2) => {
    implementation = fn2;
    state.willCall(mockCall);
    return stub;
  };
  stub.mockImplementationOnce = (fn2) => {
    onceImplementations.push(fn2);
    return stub;
  };
  function withImplementation(fn2, cb) {
    const originalImplementation = implementation;
    implementation = fn2;
    state.willCall(mockCall);
    implementationChangedTemporarily = true;
    const reset = () => {
      implementation = originalImplementation;
      implementationChangedTemporarily = false;
    };
    const result = cb();
    if (result instanceof Promise) {
      return result.then(() => {
        reset();
        return stub;
      });
    }
    reset();
    return stub;
  }
  stub.withImplementation = withImplementation;
  stub.mockReturnThis = () => stub.mockImplementation(function() {
    return this;
  });
  stub.mockReturnValue = (val) => stub.mockImplementation(() => val);
  stub.mockReturnValueOnce = (val) => stub.mockImplementationOnce(() => val);
  stub.mockResolvedValue = (val) => stub.mockImplementation(() => Promise.resolve(val));
  stub.mockResolvedValueOnce = (val) => stub.mockImplementationOnce(() => Promise.resolve(val));
  stub.mockRejectedValue = (val) => stub.mockImplementation(() => Promise.reject(val));
  stub.mockRejectedValueOnce = (val) => stub.mockImplementationOnce(() => Promise.reject(val));
  Object.defineProperty(stub, "mock", {
    get: () => mockContext
  });
  state.willCall(mockCall);
  mocks.add(stub);
  return stub;
}
function fn(implementation) {
  const enhancedSpy = enhanceSpy(C$1({
    spy: implementation || function() {
    }
  }, "spy"));
  if (implementation) {
    enhancedSpy.mockImplementation(implementation);
  }
  return enhancedSpy;
}

const IS_RECORD_SYMBOL$1 = "@@__IMMUTABLE_RECORD__@@";
const IS_COLLECTION_SYMBOL = "@@__IMMUTABLE_ITERABLE__@@";
function isImmutable(v) {
  return v && (v[IS_COLLECTION_SYMBOL] || v[IS_RECORD_SYMBOL$1]);
}
const OBJECT_PROTO = Object.getPrototypeOf({});
function getUnserializableMessage(err) {
  if (err instanceof Error) {
    return `<unserializable>: ${err.message}`;
  }
  if (typeof err === "string") {
    return `<unserializable>: ${err}`;
  }
  return "<unserializable>";
}
function serializeValue(val, seen = /* @__PURE__ */ new WeakMap()) {
  if (!val || typeof val === "string") {
    return val;
  }
  if (typeof val === "function") {
    return `Function<${val.name || "anonymous"}>`;
  }
  if (typeof val === "symbol") {
    return val.toString();
  }
  if (typeof val !== "object") {
    return val;
  }
  if (isImmutable(val)) {
    return serializeValue(val.toJSON(), seen);
  }
  if (val instanceof Promise || val.constructor && val.constructor.prototype === "AsyncFunction") {
    return "Promise";
  }
  if (typeof Element !== "undefined" && val instanceof Element) {
    return val.tagName;
  }
  if (typeof val.asymmetricMatch === "function") {
    return `${val.toString()} ${format$1(val.sample)}`;
  }
  if (typeof val.toJSON === "function") {
    return serializeValue(val.toJSON(), seen);
  }
  if (seen.has(val)) {
    return seen.get(val);
  }
  if (Array.isArray(val)) {
    const clone = new Array(val.length);
    seen.set(val, clone);
    val.forEach((e, i) => {
      try {
        clone[i] = serializeValue(e, seen);
      } catch (err) {
        clone[i] = getUnserializableMessage(err);
      }
    });
    return clone;
  } else {
    const clone = /* @__PURE__ */ Object.create(null);
    seen.set(val, clone);
    let obj = val;
    while (obj && obj !== OBJECT_PROTO) {
      Object.getOwnPropertyNames(obj).forEach((key) => {
        if (key in clone) {
          return;
        }
        try {
          clone[key] = serializeValue(val[key], seen);
        } catch (err) {
          delete clone[key];
          clone[key] = getUnserializableMessage(err);
        }
      });
      obj = Object.getPrototypeOf(obj);
    }
    return clone;
  }
}
function normalizeErrorMessage(message) {
  return message.replace(/__(vite_ssr_import|vi_import)_\d+__\./g, "");
}
function processError(_err, diffOptions, seen = /* @__PURE__ */ new WeakSet()) {
  if (!_err || typeof _err !== "object") {
    return { message: String(_err) };
  }
  const err = _err;
  if (err.stack) {
    err.stackStr = String(err.stack);
  }
  if (err.name) {
    err.nameStr = String(err.name);
  }
  if (err.showDiff || err.showDiff === undefined && err.expected !== undefined && err.actual !== undefined) {
    err.diff = printDiffOrStringify(err.actual, err.expected, {
      ...diffOptions,
      ...err.diffOptions
    });
  }
  if (typeof err.expected !== "string") {
    err.expected = stringify(err.expected, 10);
  }
  if (typeof err.actual !== "string") {
    err.actual = stringify(err.actual, 10);
  }
  try {
    if (typeof err.message === "string") {
      err.message = normalizeErrorMessage(err.message);
    }
  } catch {
  }
  try {
    if (!seen.has(err) && typeof err.cause === "object") {
      seen.add(err);
      err.cause = processError(err.cause, diffOptions, seen);
    }
  } catch {
  }
  try {
    return serializeValue(err);
  } catch (e) {
    return serializeValue(
      new Error(
        `Failed to fully serialize error: ${e == null ? undefined : e.message}
Inner error message: ${err == null ? undefined : err.message}`
      )
    );
  }
}

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// (disabled):util
var require_util = __commonJS({
  "(disabled):util"() {
  }
});

// lib/chai/utils/index.js
var utils_exports = {};
__export(utils_exports, {
  addChainableMethod: () => addChainableMethod,
  addLengthGuard: () => addLengthGuard,
  addMethod: () => addMethod,
  addProperty: () => addProperty,
  checkError: () => check_error_exports,
  compareByInspect: () => compareByInspect,
  eql: () => deep_eql_default,
  expectTypes: () => expectTypes,
  flag: () => flag,
  getActual: () => getActual,
  getMessage: () => getMessage2,
  getName: () => getName,
  getOperator: () => getOperator,
  getOwnEnumerableProperties: () => getOwnEnumerableProperties,
  getOwnEnumerablePropertySymbols: () => getOwnEnumerablePropertySymbols,
  getPathInfo: () => getPathInfo,
  hasProperty: () => hasProperty$1,
  inspect: () => inspect2,
  isNaN: () => isNaN2,
  isNumeric: () => isNumeric,
  isProxyEnabled: () => isProxyEnabled,
  isRegExp: () => isRegExp2,
  objDisplay: () => objDisplay,
  overwriteChainableMethod: () => overwriteChainableMethod,
  overwriteMethod: () => overwriteMethod,
  overwriteProperty: () => overwriteProperty,
  proxify: () => proxify,
  test: () => test$2,
  transferFlags: () => transferFlags,
  type: () => type
});

// node_modules/check-error/index.js
var check_error_exports = {};
__export(check_error_exports, {
  compatibleConstructor: () => compatibleConstructor,
  compatibleInstance: () => compatibleInstance,
  compatibleMessage: () => compatibleMessage,
  getConstructorName: () => getConstructorName,
  getMessage: () => getMessage
});
function isErrorInstance(obj) {
  return obj instanceof Error || Object.prototype.toString.call(obj) === "[object Error]";
}
__name(isErrorInstance, "isErrorInstance");
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}
__name(isRegExp, "isRegExp");
function compatibleInstance(thrown, errorLike) {
  return isErrorInstance(errorLike) && thrown === errorLike;
}
__name(compatibleInstance, "compatibleInstance");
function compatibleConstructor(thrown, errorLike) {
  if (isErrorInstance(errorLike)) {
    return thrown.constructor === errorLike.constructor || thrown instanceof errorLike.constructor;
  } else if ((typeof errorLike === "object" || typeof errorLike === "function") && errorLike.prototype) {
    return thrown.constructor === errorLike || thrown instanceof errorLike;
  }
  return false;
}
__name(compatibleConstructor, "compatibleConstructor");
function compatibleMessage(thrown, errMatcher) {
  const comparisonString = typeof thrown === "string" ? thrown : thrown.message;
  if (isRegExp(errMatcher)) {
    return errMatcher.test(comparisonString);
  } else if (typeof errMatcher === "string") {
    return comparisonString.indexOf(errMatcher) !== -1;
  }
  return false;
}
__name(compatibleMessage, "compatibleMessage");
function getConstructorName(errorLike) {
  let constructorName = errorLike;
  if (isErrorInstance(errorLike)) {
    constructorName = errorLike.constructor.name;
  } else if (typeof errorLike === "function") {
    constructorName = errorLike.name;
    if (constructorName === "") {
      const newConstructorName = new errorLike().name;
      constructorName = newConstructorName || constructorName;
    }
  }
  return constructorName;
}
__name(getConstructorName, "getConstructorName");
function getMessage(errorLike) {
  let msg = "";
  if (errorLike && errorLike.message) {
    msg = errorLike.message;
  } else if (typeof errorLike === "string") {
    msg = errorLike;
  }
  return msg;
}
__name(getMessage, "getMessage");

// lib/chai/utils/flag.js
function flag(obj, key, value) {
  var flags = obj.__flags || (obj.__flags = /* @__PURE__ */ Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
}
__name(flag, "flag");

// lib/chai/utils/test.js
function test$2(obj, args) {
  var negate = flag(obj, "negate"), expr = args[0];
  return negate ? !expr : expr;
}
__name(test$2, "test");

// lib/chai/utils/type-detect.js
function type(obj) {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }
  const type3 = Object.prototype.toString.call(obj).slice(8, -1);
  return type3;
}
__name(type, "type");

// node_modules/assertion-error/index.js
var canElideFrames = "captureStackTrace" in Error;
var AssertionError = class _AssertionError extends Error {
  static {
    __name(this, "AssertionError");
  }
  message;
  get name() {
    return "AssertionError";
  }
  get ok() {
    return false;
  }
  constructor(message = "Unspecified AssertionError", props, ssf) {
    super(message);
    this.message = message;
    if (canElideFrames) {
      Error.captureStackTrace(this, ssf || _AssertionError);
    }
    for (const key in props) {
      if (!(key in this)) {
        this[key] = props[key];
      }
    }
  }
  toJSON(stack) {
    return {
      ...this,
      name: this.name,
      message: this.message,
      ok: false,
      stack: stack !== false ? this.stack : void 0
    };
  }
};

// lib/chai/utils/expectTypes.js
function expectTypes(obj, types) {
  var flagMsg = flag(obj, "message");
  var ssfi = flag(obj, "ssfi");
  flagMsg = flagMsg ? flagMsg + ": " : "";
  obj = flag(obj, "object");
  types = types.map(function(t) {
    return t.toLowerCase();
  });
  types.sort();
  var str = types.map(function(t, index) {
    var art = ~["a", "e", "i", "o", "u"].indexOf(t.charAt(0)) ? "an" : "a";
    var or = types.length > 1 && index === types.length - 1 ? "or " : "";
    return or + art + " " + t;
  }).join(", ");
  var objType = type(obj).toLowerCase();
  if (!types.some(function(expected) {
    return objType === expected;
  })) {
    throw new AssertionError(
      flagMsg + "object tested must be " + str + ", but " + objType + " given",
      void 0,
      ssfi
    );
  }
}
__name(expectTypes, "expectTypes");

// lib/chai/utils/getActual.js
function getActual(obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
}
__name(getActual, "getActual");

// node_modules/loupe/lib/helpers.js
var ansiColors = {
  bold: ["1", "22"],
  dim: ["2", "22"],
  italic: ["3", "23"],
  underline: ["4", "24"],
  // 5 & 6 are blinking
  inverse: ["7", "27"],
  hidden: ["8", "28"],
  strike: ["9", "29"],
  // 10-20 are fonts
  // 21-29 are resets for 1-9
  black: ["30", "39"],
  red: ["31", "39"],
  green: ["32", "39"],
  yellow: ["33", "39"],
  blue: ["34", "39"],
  magenta: ["35", "39"],
  cyan: ["36", "39"],
  white: ["37", "39"],
  brightblack: ["30;1", "39"],
  brightred: ["31;1", "39"],
  brightgreen: ["32;1", "39"],
  brightyellow: ["33;1", "39"],
  brightblue: ["34;1", "39"],
  brightmagenta: ["35;1", "39"],
  brightcyan: ["36;1", "39"],
  brightwhite: ["37;1", "39"],
  grey: ["90", "39"]
};
var styles = {
  special: "cyan",
  number: "yellow",
  bigint: "yellow",
  boolean: "yellow",
  undefined: "grey",
  null: "bold",
  string: "green",
  symbol: "green",
  date: "magenta",
  regexp: "red"
};
var truncator = "\u2026";
function colorise(value, styleType) {
  const color = ansiColors[styles[styleType]] || ansiColors[styleType] || "";
  if (!color) {
    return String(value);
  }
  return `\x1B[${color[0]}m${String(value)}\x1B[${color[1]}m`;
}
__name(colorise, "colorise");
function normaliseOptions({
  showHidden = false,
  depth = 2,
  colors = false,
  customInspect = true,
  showProxy = false,
  maxArrayLength = Infinity,
  breakLength = Infinity,
  seen = [],
  // eslint-disable-next-line no-shadow
  truncate: truncate2 = Infinity,
  stylize = String
} = {}, inspect3) {
  const options = {
    showHidden: Boolean(showHidden),
    depth: Number(depth),
    colors: Boolean(colors),
    customInspect: Boolean(customInspect),
    showProxy: Boolean(showProxy),
    maxArrayLength: Number(maxArrayLength),
    breakLength: Number(breakLength),
    truncate: Number(truncate2),
    seen,
    inspect: inspect3,
    stylize
  };
  if (options.colors) {
    options.stylize = colorise;
  }
  return options;
}
__name(normaliseOptions, "normaliseOptions");
function isHighSurrogate(char) {
  return char >= "\uD800" && char <= "\uDBFF";
}
__name(isHighSurrogate, "isHighSurrogate");
function truncate(string, length, tail = truncator) {
  string = String(string);
  const tailLength = tail.length;
  const stringLength = string.length;
  if (tailLength > length && stringLength > tailLength) {
    return tail;
  }
  if (stringLength > length && stringLength > tailLength) {
    let end = length - tailLength;
    if (end > 0 && isHighSurrogate(string[end - 1])) {
      end = end - 1;
    }
    return `${string.slice(0, end)}${tail}`;
  }
  return string;
}
__name(truncate, "truncate");
function inspectList(list, options, inspectItem, separator = ", ") {
  inspectItem = inspectItem || options.inspect;
  const size = list.length;
  if (size === 0)
    return "";
  const originalLength = options.truncate;
  let output = "";
  let peek = "";
  let truncated = "";
  for (let i = 0; i < size; i += 1) {
    const last = i + 1 === list.length;
    const secondToLast = i + 2 === list.length;
    truncated = `${truncator}(${list.length - i})`;
    const value = list[i];
    options.truncate = originalLength - output.length - (last ? 0 : separator.length);
    const string = peek || inspectItem(value, options) + (last ? "" : separator);
    const nextLength = output.length + string.length;
    const truncatedLength = nextLength + truncated.length;
    if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
      break;
    }
    if (!last && !secondToLast && truncatedLength > originalLength) {
      break;
    }
    peek = last ? "" : inspectItem(list[i + 1], options) + (secondToLast ? "" : separator);
    if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
      break;
    }
    output += string;
    if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
      truncated = `${truncator}(${list.length - i - 1})`;
      break;
    }
    truncated = "";
  }
  return `${output}${truncated}`;
}
__name(inspectList, "inspectList");
function quoteComplexKey(key) {
  if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
    return key;
  }
  return JSON.stringify(key).replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
}
__name(quoteComplexKey, "quoteComplexKey");
function inspectProperty([key, value], options) {
  options.truncate -= 2;
  if (typeof key === "string") {
    key = quoteComplexKey(key);
  } else if (typeof key !== "number") {
    key = `[${options.inspect(key, options)}]`;
  }
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key}: ${value}`;
}
__name(inspectProperty, "inspectProperty");

// node_modules/loupe/lib/array.js
function inspectArray(array, options) {
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return "[]";
  options.truncate -= 4;
  const listContents = inspectList(array, options);
  options.truncate -= listContents.length;
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `[ ${listContents}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectArray, "inspectArray");

// node_modules/loupe/lib/typedarray.js
var getArrayName = /* @__PURE__ */ __name((array) => {
  if (typeof Buffer === "function" && array instanceof Buffer) {
    return "Buffer";
  }
  if (array[Symbol.toStringTag]) {
    return array[Symbol.toStringTag];
  }
  return array.constructor.name;
}, "getArrayName");
function inspectTypedArray(array, options) {
  const name = getArrayName(array);
  options.truncate -= name.length + 4;
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return `${name}[]`;
  let output = "";
  for (let i = 0; i < array.length; i++) {
    const string = `${options.stylize(truncate(array[i], options.truncate), "number")}${i === array.length - 1 ? "" : ", "}`;
    options.truncate -= string.length;
    if (array[i] !== array.length && options.truncate <= 3) {
      output += `${truncator}(${array.length - array[i] + 1})`;
      break;
    }
    output += string;
  }
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `${name}[ ${output}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectTypedArray, "inspectTypedArray");

// node_modules/loupe/lib/date.js
function inspectDate(dateObject, options) {
  const stringRepresentation = dateObject.toJSON();
  if (stringRepresentation === null) {
    return "Invalid Date";
  }
  const split = stringRepresentation.split("T");
  const date = split[0];
  return options.stylize(`${date}T${truncate(split[1], options.truncate - date.length - 1)}`, "date");
}
__name(inspectDate, "inspectDate");

// node_modules/loupe/lib/function.js
function inspectFunction(func, options) {
  const functionType = func[Symbol.toStringTag] || "Function";
  const name = func.name;
  if (!name) {
    return options.stylize(`[${functionType}]`, "special");
  }
  return options.stylize(`[${functionType} ${truncate(name, options.truncate - 11)}]`, "special");
}
__name(inspectFunction, "inspectFunction");

// node_modules/loupe/lib/map.js
function inspectMapEntry([key, value], options) {
  options.truncate -= 4;
  key = options.inspect(key, options);
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key} => ${value}`;
}
__name(inspectMapEntry, "inspectMapEntry");
function mapToEntries(map) {
  const entries = [];
  map.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
}
__name(mapToEntries, "mapToEntries");
function inspectMap(map, options) {
  const size = map.size - 1;
  if (size <= 0) {
    return "Map{}";
  }
  options.truncate -= 7;
  return `Map{ ${inspectList(mapToEntries(map), options, inspectMapEntry)} }`;
}
__name(inspectMap, "inspectMap");

// node_modules/loupe/lib/number.js
var isNaN = Number.isNaN || ((i) => i !== i);
function inspectNumber(number, options) {
  if (isNaN(number)) {
    return options.stylize("NaN", "number");
  }
  if (number === Infinity) {
    return options.stylize("Infinity", "number");
  }
  if (number === -Infinity) {
    return options.stylize("-Infinity", "number");
  }
  if (number === 0) {
    return options.stylize(1 / number === Infinity ? "+0" : "-0", "number");
  }
  return options.stylize(truncate(String(number), options.truncate), "number");
}
__name(inspectNumber, "inspectNumber");

// node_modules/loupe/lib/bigint.js
function inspectBigInt(number, options) {
  let nums = truncate(number.toString(), options.truncate - 1);
  if (nums !== truncator)
    nums += "n";
  return options.stylize(nums, "bigint");
}
__name(inspectBigInt, "inspectBigInt");

// node_modules/loupe/lib/regexp.js
function inspectRegExp(value, options) {
  const flags = value.toString().split("/")[2];
  const sourceLength = options.truncate - (2 + flags.length);
  const source = value.source;
  return options.stylize(`/${truncate(source, sourceLength)}/${flags}`, "regexp");
}
__name(inspectRegExp, "inspectRegExp");

// node_modules/loupe/lib/set.js
function arrayFromSet(set2) {
  const values = [];
  set2.forEach((value) => {
    values.push(value);
  });
  return values;
}
__name(arrayFromSet, "arrayFromSet");
function inspectSet(set2, options) {
  if (set2.size === 0)
    return "Set{}";
  options.truncate -= 7;
  return `Set{ ${inspectList(arrayFromSet(set2), options)} }`;
}
__name(inspectSet, "inspectSet");

// node_modules/loupe/lib/string.js
var stringEscapeChars = new RegExp("['\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]", "g");
var escapeCharacters = {
  "\b": "\\b",
  "	": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  "'": "\\'",
  "\\": "\\\\"
};
var hex = 16;
var unicodeLength = 4;
function escape(char) {
  return escapeCharacters[char] || `\\u${`0000${char.charCodeAt(0).toString(hex)}`.slice(-unicodeLength)}`;
}
__name(escape, "escape");
function inspectString(string, options) {
  if (stringEscapeChars.test(string)) {
    string = string.replace(stringEscapeChars, escape);
  }
  return options.stylize(`'${truncate(string, options.truncate - 2)}'`, "string");
}
__name(inspectString, "inspectString");

// node_modules/loupe/lib/symbol.js
function inspectSymbol(value) {
  if ("description" in Symbol.prototype) {
    return value.description ? `Symbol(${value.description})` : "Symbol()";
  }
  return value.toString();
}
__name(inspectSymbol, "inspectSymbol");

// node_modules/loupe/lib/promise.js
var getPromiseValue$1 = /* @__PURE__ */ __name(() => "Promise{\u2026}", "getPromiseValue");
try {
  const { getPromiseDetails, kPending, kRejected } = process.binding("util");
  if (Array.isArray(getPromiseDetails(Promise.resolve()))) {
    getPromiseValue$1 = /* @__PURE__ */ __name((value, options) => {
      const [state, innerValue] = getPromiseDetails(value);
      if (state === kPending) {
        return "Promise{<pending>}";
      }
      return `Promise${state === kRejected ? "!" : ""}{${options.inspect(innerValue, options)}}`;
    }, "getPromiseValue");
  }
} catch (notNode) {
}
var promise_default = getPromiseValue$1;

// node_modules/loupe/lib/object.js
function inspectObject(object, options) {
  const properties = Object.getOwnPropertyNames(object);
  const symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : [];
  if (properties.length === 0 && symbols.length === 0) {
    return "{}";
  }
  options.truncate -= 4;
  options.seen = options.seen || [];
  if (options.seen.includes(object)) {
    return "[Circular]";
  }
  options.seen.push(object);
  const propertyContents = inspectList(properties.map((key) => [key, object[key]]), options, inspectProperty);
  const symbolContents = inspectList(symbols.map((key) => [key, object[key]]), options, inspectProperty);
  options.seen.pop();
  let sep = "";
  if (propertyContents && symbolContents) {
    sep = ", ";
  }
  return `{ ${propertyContents}${sep}${symbolContents} }`;
}
__name(inspectObject, "inspectObject");

// node_modules/loupe/lib/class.js
var toStringTag = typeof Symbol !== "undefined" && Symbol.toStringTag ? Symbol.toStringTag : false;
function inspectClass(value, options) {
  let name = "";
  if (toStringTag && toStringTag in value) {
    name = value[toStringTag];
  }
  name = name || value.constructor.name;
  if (!name || name === "_class") {
    name = "<Anonymous Class>";
  }
  options.truncate -= name.length;
  return `${name}${inspectObject(value, options)}`;
}
__name(inspectClass, "inspectClass");

// node_modules/loupe/lib/arguments.js
function inspectArguments(args, options) {
  if (args.length === 0)
    return "Arguments[]";
  options.truncate -= 13;
  return `Arguments[ ${inspectList(args, options)} ]`;
}
__name(inspectArguments, "inspectArguments");

// node_modules/loupe/lib/error.js
var errorKeys = [
  "stack",
  "line",
  "column",
  "name",
  "message",
  "fileName",
  "lineNumber",
  "columnNumber",
  "number",
  "description",
  "cause"
];
function inspectObject2(error, options) {
  const properties = Object.getOwnPropertyNames(error).filter((key) => errorKeys.indexOf(key) === -1);
  const name = error.name;
  options.truncate -= name.length;
  let message = "";
  if (typeof error.message === "string") {
    message = truncate(error.message, options.truncate);
  } else {
    properties.unshift("message");
  }
  message = message ? `: ${message}` : "";
  options.truncate -= message.length + 5;
  options.seen = options.seen || [];
  if (options.seen.includes(error)) {
    return "[Circular]";
  }
  options.seen.push(error);
  const propertyContents = inspectList(properties.map((key) => [key, error[key]]), options, inspectProperty);
  return `${name}${message}${propertyContents ? ` { ${propertyContents} }` : ""}`;
}
__name(inspectObject2, "inspectObject");

// node_modules/loupe/lib/html.js
function inspectAttribute([key, value], options) {
  options.truncate -= 3;
  if (!value) {
    return `${options.stylize(String(key), "yellow")}`;
  }
  return `${options.stylize(String(key), "yellow")}=${options.stylize(`"${value}"`, "string")}`;
}
__name(inspectAttribute, "inspectAttribute");
function inspectHTMLCollection(collection, options) {
  return inspectList(collection, options, inspectHTML, "\n");
}
__name(inspectHTMLCollection, "inspectHTMLCollection");
function inspectHTML(element, options) {
  const properties = element.getAttributeNames();
  const name = element.tagName.toLowerCase();
  const head = options.stylize(`<${name}`, "special");
  const headClose = options.stylize(`>`, "special");
  const tail = options.stylize(`</${name}>`, "special");
  options.truncate -= name.length * 2 + 5;
  let propertyContents = "";
  if (properties.length > 0) {
    propertyContents += " ";
    propertyContents += inspectList(properties.map((key) => [key, element.getAttribute(key)]), options, inspectAttribute, " ");
  }
  options.truncate -= propertyContents.length;
  const truncate2 = options.truncate;
  let children = inspectHTMLCollection(element.children, options);
  if (children && children.length > truncate2) {
    children = `${truncator}(${element.children.length})`;
  }
  return `${head}${propertyContents}${headClose}${children}${tail}`;
}
__name(inspectHTML, "inspectHTML");

// node_modules/loupe/lib/index.js
var symbolsSupported = typeof Symbol === "function" && typeof Symbol.for === "function";
var chaiInspect = symbolsSupported ? Symbol.for("chai/inspect") : "@@chai/inspect";
var nodeInspect$1 = false;
try {
  const nodeUtil = require_util();
  nodeInspect$1 = nodeUtil.inspect ? nodeUtil.inspect.custom : false;
} catch (noNodeInspect) {
  nodeInspect$1 = false;
}
var constructorMap = /* @__PURE__ */ new WeakMap();
var stringTagMap = {};
var baseTypesMap = {
  undefined: (value, options) => options.stylize("undefined", "undefined"),
  null: (value, options) => options.stylize("null", "null"),
  boolean: (value, options) => options.stylize(String(value), "boolean"),
  Boolean: (value, options) => options.stylize(String(value), "boolean"),
  number: inspectNumber,
  Number: inspectNumber,
  bigint: inspectBigInt,
  BigInt: inspectBigInt,
  string: inspectString,
  String: inspectString,
  function: inspectFunction,
  Function: inspectFunction,
  symbol: inspectSymbol,
  // A Symbol polyfill will return `Symbol` not `symbol` from typedetect
  Symbol: inspectSymbol,
  Array: inspectArray,
  Date: inspectDate,
  Map: inspectMap,
  Set: inspectSet,
  RegExp: inspectRegExp,
  Promise: promise_default,
  // WeakSet, WeakMap are totally opaque to us
  WeakSet: (value, options) => options.stylize("WeakSet{\u2026}", "special"),
  WeakMap: (value, options) => options.stylize("WeakMap{\u2026}", "special"),
  Arguments: inspectArguments,
  Int8Array: inspectTypedArray,
  Uint8Array: inspectTypedArray,
  Uint8ClampedArray: inspectTypedArray,
  Int16Array: inspectTypedArray,
  Uint16Array: inspectTypedArray,
  Int32Array: inspectTypedArray,
  Uint32Array: inspectTypedArray,
  Float32Array: inspectTypedArray,
  Float64Array: inspectTypedArray,
  Generator: () => "",
  DataView: () => "",
  ArrayBuffer: () => "",
  Error: inspectObject2,
  HTMLCollection: inspectHTMLCollection,
  NodeList: inspectHTMLCollection
};
var inspectCustom = /* @__PURE__ */ __name((value, options, type3) => {
  if (chaiInspect in value && typeof value[chaiInspect] === "function") {
    return value[chaiInspect](options);
  }
  if (nodeInspect$1 && nodeInspect$1 in value && typeof value[nodeInspect$1] === "function") {
    return value[nodeInspect$1](options.depth, options);
  }
  if ("inspect" in value && typeof value.inspect === "function") {
    return value.inspect(options.depth, options);
  }
  if ("constructor" in value && constructorMap.has(value.constructor)) {
    return constructorMap.get(value.constructor)(value, options);
  }
  if (stringTagMap[type3]) {
    return stringTagMap[type3](value, options);
  }
  return "";
}, "inspectCustom");
var toString = Object.prototype.toString;
function inspect(value, opts = {}) {
  const options = normaliseOptions(opts, inspect);
  const { customInspect } = options;
  let type3 = value === null ? "null" : typeof value;
  if (type3 === "object") {
    type3 = toString.call(value).slice(8, -1);
  }
  if (type3 in baseTypesMap) {
    return baseTypesMap[type3](value, options);
  }
  if (customInspect && value) {
    const output = inspectCustom(value, options, type3);
    if (output) {
      if (typeof output === "string")
        return output;
      return inspect(output, options);
    }
  }
  const proto = value ? Object.getPrototypeOf(value) : false;
  if (proto === Object.prototype || proto === null) {
    return inspectObject(value, options);
  }
  if (value && typeof HTMLElement === "function" && value instanceof HTMLElement) {
    return inspectHTML(value, options);
  }
  if ("constructor" in value) {
    if (value.constructor !== Object) {
      return inspectClass(value, options);
    }
    return inspectObject(value, options);
  }
  if (value === Object(value)) {
    return inspectObject(value, options);
  }
  return options.stylize(String(value), type3);
}
__name(inspect, "inspect");

// lib/chai/config.js
var config = {
  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {boolean}
   * @public
   */
  includeStack: false,
  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {boolean}
   * @public
   */
  showDiff: true,
  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {number}
   * @public
   */
  truncateThreshold: 40,
  /**
   * ### config.useProxy
   *
   * User configurable property, defines if chai will use a Proxy to throw
   * an error when a non-existent property is read, which protects users
   * from typos when using property-based assertions.
   *
   * Set it to false if you want to disable this feature.
   *
   *     chai.config.useProxy = false;  // disable use of Proxy
   *
   * This feature is automatically disabled regardless of this config value
   * in environments that don't support proxies.
   *
   * @param {boolean}
   * @public
   */
  useProxy: true,
  /**
   * ### config.proxyExcludedKeys
   *
   * User configurable property, defines which properties should be ignored
   * instead of throwing an error if they do not exist on the assertion.
   * This is only applied if the environment Chai is running in supports proxies and
   * if the `useProxy` configuration setting is enabled.
   * By default, `then` and `inspect` will not throw an error if they do not exist on the
   * assertion object because the `.inspect` property is read by `util.inspect` (for example, when
   * using `console.log` on the assertion object) and `.then` is necessary for promise type-checking.
   *
   *     // By default these keys will not throw an error if they do not exist on the assertion object
   *     chai.config.proxyExcludedKeys = ['then', 'inspect'];
   *
   * @param {Array}
   * @public
   */
  proxyExcludedKeys: ["then", "catch", "inspect", "toJSON"],
  /**
   * ### config.deepEqual
   *
   * User configurable property, defines which a custom function to use for deepEqual
   * comparisons.
   * By default, the function used is the one from the `deep-eql` package without custom comparator.
   *
   *     // use a custom comparator
   *     chai.config.deepEqual = (expected, actual) => {
   *         return chai.util.eql(expected, actual, {
   *             comparator: (expected, actual) => {
   *                 // for non number comparison, use the default behavior
   *                 if(typeof expected !== 'number') return null;
   *                 // allow a difference of 10 between compared numbers
   *                 return typeof actual === 'number' && Math.abs(actual - expected) < 10
   *             }
   *         })
   *     };
   *
   * @param {Function}
   * @public
   */
  deepEqual: null
};

// lib/chai/utils/inspect.js
function inspect2(obj, showHidden, depth, colors) {
  var options = {
    colors,
    depth: typeof depth === "undefined" ? 2 : depth,
    showHidden,
    truncate: config.truncateThreshold ? config.truncateThreshold : Infinity
  };
  return inspect(obj, options);
}
__name(inspect2, "inspect");

// lib/chai/utils/objDisplay.js
function objDisplay(obj) {
  var str = inspect2(obj), type3 = Object.prototype.toString.call(obj);
  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type3 === "[object Function]") {
      return !obj.name || obj.name === "" ? "[Function]" : "[Function: " + obj.name + "]";
    } else if (type3 === "[object Array]") {
      return "[ Array(" + obj.length + ") ]";
    } else if (type3 === "[object Object]") {
      var keys = Object.keys(obj), kstr = keys.length > 2 ? keys.splice(0, 2).join(", ") + ", ..." : keys.join(", ");
      return "{ Object (" + kstr + ") }";
    } else {
      return str;
    }
  } else {
    return str;
  }
}
__name(objDisplay, "objDisplay");

// lib/chai/utils/getMessage.js
function getMessage2(obj, args) {
  var negate = flag(obj, "negate"), val = flag(obj, "object"), expected = args[3], actual = getActual(obj, args), msg = negate ? args[2] : args[1], flagMsg = flag(obj, "message");
  if (typeof msg === "function")
    msg = msg();
  msg = msg || "";
  msg = msg.replace(/#\{this\}/g, function() {
    return objDisplay(val);
  }).replace(/#\{act\}/g, function() {
    return objDisplay(actual);
  }).replace(/#\{exp\}/g, function() {
    return objDisplay(expected);
  });
  return flagMsg ? flagMsg + ": " + msg : msg;
}
__name(getMessage2, "getMessage");

// lib/chai/utils/transferFlags.js
function transferFlags(assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = /* @__PURE__ */ Object.create(null));
  if (!object.__flags) {
    object.__flags = /* @__PURE__ */ Object.create(null);
  }
  includeAll = arguments.length === 3 ? includeAll : true;
  for (var flag3 in flags) {
    if (includeAll || flag3 !== "object" && flag3 !== "ssfi" && flag3 !== "lockSsfi" && flag3 != "message") {
      object.__flags[flag3] = flags[flag3];
    }
  }
}
__name(transferFlags, "transferFlags");

// node_modules/deep-eql/index.js
function type2(obj) {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }
  const sliceStart = 8;
  const sliceEnd = -1;
  return Object.prototype.toString.call(obj).slice(sliceStart, sliceEnd);
}
__name(type2, "type");
function FakeMap() {
  this._key = "chai/deep-eql__" + Math.random() + Date.now();
}
__name(FakeMap, "FakeMap");
FakeMap.prototype = {
  get: /* @__PURE__ */ __name(function get(key) {
    return key[this._key];
  }, "get"),
  set: /* @__PURE__ */ __name(function set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, {
        value,
        configurable: true
      });
    }
  }, "set")
};
var MemoizeMap = typeof WeakMap === "function" ? WeakMap : FakeMap;
function memoizeCompare(leftHandOperand, rightHandOperand, memoizeMap) {
  if (!memoizeMap || isPrimitive$1(leftHandOperand) || isPrimitive$1(rightHandOperand)) {
    return null;
  }
  var leftHandMap = memoizeMap.get(leftHandOperand);
  if (leftHandMap) {
    var result = leftHandMap.get(rightHandOperand);
    if (typeof result === "boolean") {
      return result;
    }
  }
  return null;
}
__name(memoizeCompare, "memoizeCompare");
function memoizeSet(leftHandOperand, rightHandOperand, memoizeMap, result) {
  if (!memoizeMap || isPrimitive$1(leftHandOperand) || isPrimitive$1(rightHandOperand)) {
    return;
  }
  var leftHandMap = memoizeMap.get(leftHandOperand);
  if (leftHandMap) {
    leftHandMap.set(rightHandOperand, result);
  } else {
    leftHandMap = new MemoizeMap();
    leftHandMap.set(rightHandOperand, result);
    memoizeMap.set(leftHandOperand, leftHandMap);
  }
}
__name(memoizeSet, "memoizeSet");
var deep_eql_default = deepEqual;
function deepEqual(leftHandOperand, rightHandOperand, options) {
  if (options && options.comparator) {
    return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
  }
  var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
  if (simpleResult !== null) {
    return simpleResult;
  }
  return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
}
__name(deepEqual, "deepEqual");
function simpleEqual(leftHandOperand, rightHandOperand) {
  if (leftHandOperand === rightHandOperand) {
    return leftHandOperand !== 0 || 1 / leftHandOperand === 1 / rightHandOperand;
  }
  if (leftHandOperand !== leftHandOperand && // eslint-disable-line no-self-compare
  rightHandOperand !== rightHandOperand) {
    return true;
  }
  if (isPrimitive$1(leftHandOperand) || isPrimitive$1(rightHandOperand)) {
    return false;
  }
  return null;
}
__name(simpleEqual, "simpleEqual");
function extensiveDeepEqual(leftHandOperand, rightHandOperand, options) {
  options = options || {};
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  var comparator = options && options.comparator;
  var memoizeResultLeft = memoizeCompare(leftHandOperand, rightHandOperand, options.memoize);
  if (memoizeResultLeft !== null) {
    return memoizeResultLeft;
  }
  var memoizeResultRight = memoizeCompare(rightHandOperand, leftHandOperand, options.memoize);
  if (memoizeResultRight !== null) {
    return memoizeResultRight;
  }
  if (comparator) {
    var comparatorResult = comparator(leftHandOperand, rightHandOperand);
    if (comparatorResult === false || comparatorResult === true) {
      memoizeSet(leftHandOperand, rightHandOperand, options.memoize, comparatorResult);
      return comparatorResult;
    }
    var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
    if (simpleResult !== null) {
      return simpleResult;
    }
  }
  var leftHandType = type2(leftHandOperand);
  if (leftHandType !== type2(rightHandOperand)) {
    memoizeSet(leftHandOperand, rightHandOperand, options.memoize, false);
    return false;
  }
  memoizeSet(leftHandOperand, rightHandOperand, options.memoize, true);
  var result = extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options);
  memoizeSet(leftHandOperand, rightHandOperand, options.memoize, result);
  return result;
}
__name(extensiveDeepEqual, "extensiveDeepEqual");
function extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options) {
  switch (leftHandType) {
    case "String":
    case "Number":
    case "Boolean":
    case "Date":
      return deepEqual(leftHandOperand.valueOf(), rightHandOperand.valueOf());
    case "Promise":
    case "Symbol":
    case "function":
    case "WeakMap":
    case "WeakSet":
      return leftHandOperand === rightHandOperand;
    case "Error":
      return keysEqual(leftHandOperand, rightHandOperand, ["name", "message", "code"], options);
    case "Arguments":
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "Array":
      return iterableEqual(leftHandOperand, rightHandOperand, options);
    case "RegExp":
      return regexpEqual(leftHandOperand, rightHandOperand);
    case "Generator":
      return generatorEqual(leftHandOperand, rightHandOperand, options);
    case "DataView":
      return iterableEqual(new Uint8Array(leftHandOperand.buffer), new Uint8Array(rightHandOperand.buffer), options);
    case "ArrayBuffer":
      return iterableEqual(new Uint8Array(leftHandOperand), new Uint8Array(rightHandOperand), options);
    case "Set":
      return entriesEqual(leftHandOperand, rightHandOperand, options);
    case "Map":
      return entriesEqual(leftHandOperand, rightHandOperand, options);
    case "Temporal.PlainDate":
    case "Temporal.PlainTime":
    case "Temporal.PlainDateTime":
    case "Temporal.Instant":
    case "Temporal.ZonedDateTime":
    case "Temporal.PlainYearMonth":
    case "Temporal.PlainMonthDay":
      return leftHandOperand.equals(rightHandOperand);
    case "Temporal.Duration":
      return leftHandOperand.total("nanoseconds") === rightHandOperand.total("nanoseconds");
    case "Temporal.TimeZone":
    case "Temporal.Calendar":
      return leftHandOperand.toString() === rightHandOperand.toString();
    default:
      return objectEqual(leftHandOperand, rightHandOperand, options);
  }
}
__name(extensiveDeepEqualByType, "extensiveDeepEqualByType");
function regexpEqual(leftHandOperand, rightHandOperand) {
  return leftHandOperand.toString() === rightHandOperand.toString();
}
__name(regexpEqual, "regexpEqual");
function entriesEqual(leftHandOperand, rightHandOperand, options) {
  try {
    if (leftHandOperand.size !== rightHandOperand.size) {
      return false;
    }
    if (leftHandOperand.size === 0) {
      return true;
    }
  } catch (sizeError) {
    return false;
  }
  var leftHandItems = [];
  var rightHandItems = [];
  leftHandOperand.forEach(/* @__PURE__ */ __name(function gatherEntries(key, value) {
    leftHandItems.push([key, value]);
  }, "gatherEntries"));
  rightHandOperand.forEach(/* @__PURE__ */ __name(function gatherEntries(key, value) {
    rightHandItems.push([key, value]);
  }, "gatherEntries"));
  return iterableEqual(leftHandItems.sort(), rightHandItems.sort(), options);
}
__name(entriesEqual, "entriesEqual");
function iterableEqual(leftHandOperand, rightHandOperand, options) {
  var length = leftHandOperand.length;
  if (length !== rightHandOperand.length) {
    return false;
  }
  if (length === 0) {
    return true;
  }
  var index = -1;
  while (++index < length) {
    if (deepEqual(leftHandOperand[index], rightHandOperand[index], options) === false) {
      return false;
    }
  }
  return true;
}
__name(iterableEqual, "iterableEqual");
function generatorEqual(leftHandOperand, rightHandOperand, options) {
  return iterableEqual(getGeneratorEntries(leftHandOperand), getGeneratorEntries(rightHandOperand), options);
}
__name(generatorEqual, "generatorEqual");
function hasIteratorFunction(target) {
  return typeof Symbol !== "undefined" && typeof target === "object" && typeof Symbol.iterator !== "undefined" && typeof target[Symbol.iterator] === "function";
}
__name(hasIteratorFunction, "hasIteratorFunction");
function getIteratorEntries(target) {
  if (hasIteratorFunction(target)) {
    try {
      return getGeneratorEntries(target[Symbol.iterator]());
    } catch (iteratorError) {
      return [];
    }
  }
  return [];
}
__name(getIteratorEntries, "getIteratorEntries");
function getGeneratorEntries(generator) {
  var generatorResult = generator.next();
  var accumulator = [generatorResult.value];
  while (generatorResult.done === false) {
    generatorResult = generator.next();
    accumulator.push(generatorResult.value);
  }
  return accumulator;
}
__name(getGeneratorEntries, "getGeneratorEntries");
function getEnumerableKeys(target) {
  var keys = [];
  for (var key in target) {
    keys.push(key);
  }
  return keys;
}
__name(getEnumerableKeys, "getEnumerableKeys");
function getEnumerableSymbols(target) {
  var keys = [];
  var allKeys = Object.getOwnPropertySymbols(target);
  for (var i = 0; i < allKeys.length; i += 1) {
    var key = allKeys[i];
    if (Object.getOwnPropertyDescriptor(target, key).enumerable) {
      keys.push(key);
    }
  }
  return keys;
}
__name(getEnumerableSymbols, "getEnumerableSymbols");
function keysEqual(leftHandOperand, rightHandOperand, keys, options) {
  var length = keys.length;
  if (length === 0) {
    return true;
  }
  for (var i = 0; i < length; i += 1) {
    if (deepEqual(leftHandOperand[keys[i]], rightHandOperand[keys[i]], options) === false) {
      return false;
    }
  }
  return true;
}
__name(keysEqual, "keysEqual");
function objectEqual(leftHandOperand, rightHandOperand, options) {
  var leftHandKeys = getEnumerableKeys(leftHandOperand);
  var rightHandKeys = getEnumerableKeys(rightHandOperand);
  var leftHandSymbols = getEnumerableSymbols(leftHandOperand);
  var rightHandSymbols = getEnumerableSymbols(rightHandOperand);
  leftHandKeys = leftHandKeys.concat(leftHandSymbols);
  rightHandKeys = rightHandKeys.concat(rightHandSymbols);
  if (leftHandKeys.length && leftHandKeys.length === rightHandKeys.length) {
    if (iterableEqual(mapSymbols(leftHandKeys).sort(), mapSymbols(rightHandKeys).sort()) === false) {
      return false;
    }
    return keysEqual(leftHandOperand, rightHandOperand, leftHandKeys, options);
  }
  var leftHandEntries = getIteratorEntries(leftHandOperand);
  var rightHandEntries = getIteratorEntries(rightHandOperand);
  if (leftHandEntries.length && leftHandEntries.length === rightHandEntries.length) {
    leftHandEntries.sort();
    rightHandEntries.sort();
    return iterableEqual(leftHandEntries, rightHandEntries, options);
  }
  if (leftHandKeys.length === 0 && leftHandEntries.length === 0 && rightHandKeys.length === 0 && rightHandEntries.length === 0) {
    return true;
  }
  return false;
}
__name(objectEqual, "objectEqual");
function isPrimitive$1(value) {
  return value === null || typeof value !== "object";
}
__name(isPrimitive$1, "isPrimitive");
function mapSymbols(arr) {
  return arr.map(/* @__PURE__ */ __name(function mapSymbol(entry) {
    if (typeof entry === "symbol") {
      return entry.toString();
    }
    return entry;
  }, "mapSymbol"));
}
__name(mapSymbols, "mapSymbols");

// node_modules/pathval/index.js
function hasProperty$1(obj, name) {
  if (typeof obj === "undefined" || obj === null) {
    return false;
  }
  return name in Object(obj);
}
__name(hasProperty$1, "hasProperty");
function parsePath(path) {
  const str = path.replace(/([^\\])\[/g, "$1.[");
  const parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map((value) => {
    if (value === "constructor" || value === "__proto__" || value === "prototype") {
      return {};
    }
    const regexp = /^\[(\d+)\]$/;
    const mArr = regexp.exec(value);
    let parsed = null;
    if (mArr) {
      parsed = { i: parseFloat(mArr[1]) };
    } else {
      parsed = { p: value.replace(/\\([.[\]])/g, "$1") };
    }
    return parsed;
  });
}
__name(parsePath, "parsePath");
function internalGetPathValue(obj, parsed, pathDepth) {
  let temporaryValue = obj;
  let res = null;
  pathDepth = typeof pathDepth === "undefined" ? parsed.length : pathDepth;
  for (let i = 0; i < pathDepth; i++) {
    const part = parsed[i];
    if (temporaryValue) {
      if (typeof part.p === "undefined") {
        temporaryValue = temporaryValue[part.i];
      } else {
        temporaryValue = temporaryValue[part.p];
      }
      if (i === pathDepth - 1) {
        res = temporaryValue;
      }
    }
  }
  return res;
}
__name(internalGetPathValue, "internalGetPathValue");
function getPathInfo(obj, path) {
  const parsed = parsePath(path);
  const last = parsed[parsed.length - 1];
  const info = {
    parent: parsed.length > 1 ? internalGetPathValue(obj, parsed, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: internalGetPathValue(obj, parsed)
  };
  info.exists = hasProperty$1(info.parent, info.name);
  return info;
}
__name(getPathInfo, "getPathInfo");

// lib/chai/assertion.js
function Assertion(obj, msg, ssfi, lockSsfi) {
  flag(this, "ssfi", ssfi || Assertion);
  flag(this, "lockSsfi", lockSsfi);
  flag(this, "object", obj);
  flag(this, "message", msg);
  flag(this, "eql", config.deepEqual || deep_eql_default);
  return proxify(this);
}
__name(Assertion, "Assertion");
Object.defineProperty(Assertion, "includeStack", {
  get: function() {
    console.warn("Assertion.includeStack is deprecated, use chai.config.includeStack instead.");
    return config.includeStack;
  },
  set: function(value) {
    console.warn("Assertion.includeStack is deprecated, use chai.config.includeStack instead.");
    config.includeStack = value;
  }
});
Object.defineProperty(Assertion, "showDiff", {
  get: function() {
    console.warn("Assertion.showDiff is deprecated, use chai.config.showDiff instead.");
    return config.showDiff;
  },
  set: function(value) {
    console.warn("Assertion.showDiff is deprecated, use chai.config.showDiff instead.");
    config.showDiff = value;
  }
});
Assertion.addProperty = function(name, fn) {
  addProperty(this.prototype, name, fn);
};
Assertion.addMethod = function(name, fn) {
  addMethod(this.prototype, name, fn);
};
Assertion.addChainableMethod = function(name, fn, chainingBehavior) {
  addChainableMethod(this.prototype, name, fn, chainingBehavior);
};
Assertion.overwriteProperty = function(name, fn) {
  overwriteProperty(this.prototype, name, fn);
};
Assertion.overwriteMethod = function(name, fn) {
  overwriteMethod(this.prototype, name, fn);
};
Assertion.overwriteChainableMethod = function(name, fn, chainingBehavior) {
  overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
};
Assertion.prototype.assert = function(expr, msg, negateMsg, expected, _actual, showDiff) {
  var ok = test$2(this, arguments);
  if (false !== showDiff)
    showDiff = true;
  if (void 0 === expected && void 0 === _actual)
    showDiff = false;
  if (true !== config.showDiff)
    showDiff = false;
  if (!ok) {
    msg = getMessage2(this, arguments);
    var actual = getActual(this, arguments);
    var assertionErrorObjectProperties = {
      actual,
      expected,
      showDiff
    };
    var operator = getOperator(this, arguments);
    if (operator) {
      assertionErrorObjectProperties.operator = operator;
    }
    throw new AssertionError(
      msg,
      assertionErrorObjectProperties,
      config.includeStack ? this.assert : flag(this, "ssfi")
    );
  }
};
Object.defineProperty(
  Assertion.prototype,
  "_obj",
  {
    get: function() {
      return flag(this, "object");
    },
    set: function(val) {
      flag(this, "object", val);
    }
  }
);

// lib/chai/utils/isProxyEnabled.js
function isProxyEnabled() {
  return config.useProxy && typeof Proxy !== "undefined" && typeof Reflect !== "undefined";
}
__name(isProxyEnabled, "isProxyEnabled");

// lib/chai/utils/addProperty.js
function addProperty(ctx, name, getter) {
  getter = getter === void 0 ? function() {
  } : getter;
  Object.defineProperty(
    ctx,
    name,
    {
      get: /* @__PURE__ */ __name(function propertyGetter() {
        if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
          flag(this, "ssfi", propertyGetter);
        }
        var result = getter.call(this);
        if (result !== void 0)
          return result;
        var newAssertion = new Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
      }, "propertyGetter"),
      configurable: true
    }
  );
}
__name(addProperty, "addProperty");

// lib/chai/utils/addLengthGuard.js
var fnLengthDesc = Object.getOwnPropertyDescriptor(function() {
}, "length");
function addLengthGuard(fn, assertionName, isChainable) {
  if (!fnLengthDesc.configurable)
    return fn;
  Object.defineProperty(fn, "length", {
    get: function() {
      if (isChainable) {
        throw Error("Invalid Chai property: " + assertionName + '.length. Due to a compatibility issue, "length" cannot directly follow "' + assertionName + '". Use "' + assertionName + '.lengthOf" instead.');
      }
      throw Error("Invalid Chai property: " + assertionName + '.length. See docs for proper usage of "' + assertionName + '".');
    }
  });
  return fn;
}
__name(addLengthGuard, "addLengthGuard");

// lib/chai/utils/getProperties.js
function getProperties(object) {
  var result = Object.getOwnPropertyNames(object);
  function addProperty2(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }
  __name(addProperty2, "addProperty");
  var proto = Object.getPrototypeOf(object);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty2);
    proto = Object.getPrototypeOf(proto);
  }
  return result;
}
__name(getProperties, "getProperties");

// lib/chai/utils/proxify.js
var builtins = ["__flags", "__methods", "_obj", "assert"];
function proxify(obj, nonChainableMethodName) {
  if (!isProxyEnabled())
    return obj;
  return new Proxy(obj, {
    get: /* @__PURE__ */ __name(function proxyGetter(target, property) {
      if (typeof property === "string" && config.proxyExcludedKeys.indexOf(property) === -1 && !Reflect.has(target, property)) {
        if (nonChainableMethodName) {
          throw Error("Invalid Chai property: " + nonChainableMethodName + "." + property + '. See docs for proper usage of "' + nonChainableMethodName + '".');
        }
        var suggestion = null;
        var suggestionDistance = 4;
        getProperties(target).forEach(function(prop) {
          if (!Object.prototype.hasOwnProperty(prop) && builtins.indexOf(prop) === -1) {
            var dist = stringDistanceCapped(
              property,
              prop,
              suggestionDistance
            );
            if (dist < suggestionDistance) {
              suggestion = prop;
              suggestionDistance = dist;
            }
          }
        });
        if (suggestion !== null) {
          throw Error("Invalid Chai property: " + property + '. Did you mean "' + suggestion + '"?');
        } else {
          throw Error("Invalid Chai property: " + property);
        }
      }
      if (builtins.indexOf(property) === -1 && !flag(target, "lockSsfi")) {
        flag(target, "ssfi", proxyGetter);
      }
      return Reflect.get(target, property);
    }, "proxyGetter")
  });
}
__name(proxify, "proxify");
function stringDistanceCapped(strA, strB, cap) {
  if (Math.abs(strA.length - strB.length) >= cap) {
    return cap;
  }
  var memo = [];
  for (var i = 0; i <= strA.length; i++) {
    memo[i] = Array(strB.length + 1).fill(0);
    memo[i][0] = i;
  }
  for (var j = 0; j < strB.length; j++) {
    memo[0][j] = j;
  }
  for (var i = 1; i <= strA.length; i++) {
    var ch = strA.charCodeAt(i - 1);
    for (var j = 1; j <= strB.length; j++) {
      if (Math.abs(i - j) >= cap) {
        memo[i][j] = cap;
        continue;
      }
      memo[i][j] = Math.min(
        memo[i - 1][j] + 1,
        memo[i][j - 1] + 1,
        memo[i - 1][j - 1] + (ch === strB.charCodeAt(j - 1) ? 0 : 1)
      );
    }
  }
  return memo[strA.length][strB.length];
}
__name(stringDistanceCapped, "stringDistanceCapped");

// lib/chai/utils/addMethod.js
function addMethod(ctx, name, method) {
  var methodWrapper = /* @__PURE__ */ __name(function() {
    if (!flag(this, "lockSsfi")) {
      flag(this, "ssfi", methodWrapper);
    }
    var result = method.apply(this, arguments);
    if (result !== void 0)
      return result;
    var newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "methodWrapper");
  addLengthGuard(methodWrapper, name, false);
  ctx[name] = proxify(methodWrapper, name);
}
__name(addMethod, "addMethod");

// lib/chai/utils/overwriteProperty.js
function overwriteProperty(ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name), _super = /* @__PURE__ */ __name(function() {
  }, "_super");
  if (_get && "function" === typeof _get.get)
    _super = _get.get;
  Object.defineProperty(
    ctx,
    name,
    {
      get: /* @__PURE__ */ __name(function overwritingPropertyGetter() {
        if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
          flag(this, "ssfi", overwritingPropertyGetter);
        }
        var origLockSsfi = flag(this, "lockSsfi");
        flag(this, "lockSsfi", true);
        var result = getter(_super).call(this);
        flag(this, "lockSsfi", origLockSsfi);
        if (result !== void 0) {
          return result;
        }
        var newAssertion = new Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
      }, "overwritingPropertyGetter"),
      configurable: true
    }
  );
}
__name(overwriteProperty, "overwriteProperty");

// lib/chai/utils/overwriteMethod.js
function overwriteMethod(ctx, name, method) {
  var _method = ctx[name], _super = /* @__PURE__ */ __name(function() {
    throw new Error(name + " is not a function");
  }, "_super");
  if (_method && "function" === typeof _method)
    _super = _method;
  var overwritingMethodWrapper = /* @__PURE__ */ __name(function() {
    if (!flag(this, "lockSsfi")) {
      flag(this, "ssfi", overwritingMethodWrapper);
    }
    var origLockSsfi = flag(this, "lockSsfi");
    flag(this, "lockSsfi", true);
    var result = method(_super).apply(this, arguments);
    flag(this, "lockSsfi", origLockSsfi);
    if (result !== void 0) {
      return result;
    }
    var newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingMethodWrapper");
  addLengthGuard(overwritingMethodWrapper, name, false);
  ctx[name] = proxify(overwritingMethodWrapper, name);
}
__name(overwriteMethod, "overwriteMethod");

// lib/chai/utils/addChainableMethod.js
var canSetPrototype = typeof Object.setPrototypeOf === "function";
var testFn = /* @__PURE__ */ __name(function() {
}, "testFn");
var excludeNames = Object.getOwnPropertyNames(testFn).filter(function(name) {
  var propDesc = Object.getOwnPropertyDescriptor(testFn, name);
  if (typeof propDesc !== "object")
    return true;
  return !propDesc.configurable;
});
var call = Function.prototype.call;
var apply = Function.prototype.apply;
function addChainableMethod(ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== "function") {
    chainingBehavior = /* @__PURE__ */ __name(function() {
    }, "chainingBehavior");
  }
  var chainableBehavior = {
    method,
    chainingBehavior
  };
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;
  Object.defineProperty(
    ctx,
    name,
    {
      get: /* @__PURE__ */ __name(function chainableMethodGetter() {
        chainableBehavior.chainingBehavior.call(this);
        var chainableMethodWrapper = /* @__PURE__ */ __name(function() {
          if (!flag(this, "lockSsfi")) {
            flag(this, "ssfi", chainableMethodWrapper);
          }
          var result = chainableBehavior.method.apply(this, arguments);
          if (result !== void 0) {
            return result;
          }
          var newAssertion = new Assertion();
          transferFlags(this, newAssertion);
          return newAssertion;
        }, "chainableMethodWrapper");
        addLengthGuard(chainableMethodWrapper, name, true);
        if (canSetPrototype) {
          var prototype = Object.create(this);
          prototype.call = call;
          prototype.apply = apply;
          Object.setPrototypeOf(chainableMethodWrapper, prototype);
        } else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function(asserterName) {
            if (excludeNames.indexOf(asserterName) !== -1) {
              return;
            }
            var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
            Object.defineProperty(chainableMethodWrapper, asserterName, pd);
          });
        }
        transferFlags(this, chainableMethodWrapper);
        return proxify(chainableMethodWrapper);
      }, "chainableMethodGetter"),
      configurable: true
    }
  );
}
__name(addChainableMethod, "addChainableMethod");

// lib/chai/utils/overwriteChainableMethod.js
function overwriteChainableMethod(ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];
  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = /* @__PURE__ */ __name(function overwritingChainableMethodGetter() {
    var result = chainingBehavior(_chainingBehavior).call(this);
    if (result !== void 0) {
      return result;
    }
    var newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingChainableMethodGetter");
  var _method = chainableBehavior.method;
  chainableBehavior.method = /* @__PURE__ */ __name(function overwritingChainableMethodWrapper() {
    var result = method(_method).apply(this, arguments);
    if (result !== void 0) {
      return result;
    }
    var newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingChainableMethodWrapper");
}
__name(overwriteChainableMethod, "overwriteChainableMethod");

// lib/chai/utils/compareByInspect.js
function compareByInspect(a, b) {
  return inspect2(a) < inspect2(b) ? -1 : 1;
}
__name(compareByInspect, "compareByInspect");

// lib/chai/utils/getOwnEnumerablePropertySymbols.js
function getOwnEnumerablePropertySymbols(obj) {
  if (typeof Object.getOwnPropertySymbols !== "function")
    return [];
  return Object.getOwnPropertySymbols(obj).filter(function(sym) {
    return Object.getOwnPropertyDescriptor(obj, sym).enumerable;
  });
}
__name(getOwnEnumerablePropertySymbols, "getOwnEnumerablePropertySymbols");

// lib/chai/utils/getOwnEnumerableProperties.js
function getOwnEnumerableProperties(obj) {
  return Object.keys(obj).concat(getOwnEnumerablePropertySymbols(obj));
}
__name(getOwnEnumerableProperties, "getOwnEnumerableProperties");

// lib/chai/utils/isNaN.js
function _isNaN(value) {
  return value !== value;
}
__name(_isNaN, "_isNaN");
var isNaN2 = Number.isNaN || _isNaN;

// lib/chai/utils/getOperator.js
function isObjectType(obj) {
  var objectType = type(obj);
  var objectTypes = ["Array", "Object", "Function"];
  return objectTypes.indexOf(objectType) !== -1;
}
__name(isObjectType, "isObjectType");
function getOperator(obj, args) {
  var operator = flag(obj, "operator");
  var negate = flag(obj, "negate");
  var expected = args[3];
  var msg = negate ? args[2] : args[1];
  if (operator) {
    return operator;
  }
  if (typeof msg === "function")
    msg = msg();
  msg = msg || "";
  if (!msg) {
    return void 0;
  }
  if (/\shave\s/.test(msg)) {
    return void 0;
  }
  var isObject = isObjectType(expected);
  if (/\snot\s/.test(msg)) {
    return isObject ? "notDeepStrictEqual" : "notStrictEqual";
  }
  return isObject ? "deepStrictEqual" : "strictEqual";
}
__name(getOperator, "getOperator");

// lib/chai/utils/index.js
function getName(fn) {
  return fn.name;
}
__name(getName, "getName");
function isRegExp2(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}
__name(isRegExp2, "isRegExp");
function isNumeric(obj) {
  return ["Number", "BigInt"].includes(type(obj));
}
__name(isNumeric, "isNumeric");

// lib/chai/core/assertions.js
var { flag: flag2 } = utils_exports;
[
  "to",
  "be",
  "been",
  "is",
  "and",
  "has",
  "have",
  "with",
  "that",
  "which",
  "at",
  "of",
  "same",
  "but",
  "does",
  "still",
  "also"
].forEach(function(chain) {
  Assertion.addProperty(chain);
});
Assertion.addProperty("not", function() {
  flag2(this, "negate", true);
});
Assertion.addProperty("deep", function() {
  flag2(this, "deep", true);
});
Assertion.addProperty("nested", function() {
  flag2(this, "nested", true);
});
Assertion.addProperty("own", function() {
  flag2(this, "own", true);
});
Assertion.addProperty("ordered", function() {
  flag2(this, "ordered", true);
});
Assertion.addProperty("any", function() {
  flag2(this, "any", true);
  flag2(this, "all", false);
});
Assertion.addProperty("all", function() {
  flag2(this, "all", true);
  flag2(this, "any", false);
});
var functionTypes = {
  "function": ["function", "asyncfunction", "generatorfunction", "asyncgeneratorfunction"],
  "asyncfunction": ["asyncfunction", "asyncgeneratorfunction"],
  "generatorfunction": ["generatorfunction", "asyncgeneratorfunction"],
  "asyncgeneratorfunction": ["asyncgeneratorfunction"]
};
function an(type3, msg) {
  if (msg)
    flag2(this, "message", msg);
  type3 = type3.toLowerCase();
  var obj = flag2(this, "object"), article = ~["a", "e", "i", "o", "u"].indexOf(type3.charAt(0)) ? "an " : "a ";
  const detectedType = type(obj).toLowerCase();
  if (functionTypes["function"].includes(type3)) {
    this.assert(
      functionTypes[type3].includes(detectedType),
      "expected #{this} to be " + article + type3,
      "expected #{this} not to be " + article + type3
    );
  } else {
    this.assert(
      type3 === detectedType,
      "expected #{this} to be " + article + type3,
      "expected #{this} not to be " + article + type3
    );
  }
}
__name(an, "an");
Assertion.addChainableMethod("an", an);
Assertion.addChainableMethod("a", an);
function SameValueZero(a, b) {
  return isNaN2(a) && isNaN2(b) || a === b;
}
__name(SameValueZero, "SameValueZero");
function includeChainingBehavior() {
  flag2(this, "contains", true);
}
__name(includeChainingBehavior, "includeChainingBehavior");
function include(val, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), objType = type(obj).toLowerCase(), flagMsg = flag2(this, "message"), negate = flag2(this, "negate"), ssfi = flag2(this, "ssfi"), isDeep = flag2(this, "deep"), descriptor = isDeep ? "deep " : "", isEql = isDeep ? flag2(this, "eql") : SameValueZero;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  var included = false;
  switch (objType) {
    case "string":
      included = obj.indexOf(val) !== -1;
      break;
    case "weakset":
      if (isDeep) {
        throw new AssertionError(
          flagMsg + "unable to use .deep.include with WeakSet",
          void 0,
          ssfi
        );
      }
      included = obj.has(val);
      break;
    case "map":
      obj.forEach(function(item) {
        included = included || isEql(item, val);
      });
      break;
    case "set":
      if (isDeep) {
        obj.forEach(function(item) {
          included = included || isEql(item, val);
        });
      } else {
        included = obj.has(val);
      }
      break;
    case "array":
      if (isDeep) {
        included = obj.some(function(item) {
          return isEql(item, val);
        });
      } else {
        included = obj.indexOf(val) !== -1;
      }
      break;
    default:
      if (val !== Object(val)) {
        throw new AssertionError(
          flagMsg + "the given combination of arguments (" + objType + " and " + type(val).toLowerCase() + ") is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a " + type(val).toLowerCase(),
          void 0,
          ssfi
        );
      }
      var props = Object.keys(val), firstErr = null, numErrs = 0;
      props.forEach(function(prop) {
        var propAssertion = new Assertion(obj);
        transferFlags(this, propAssertion, true);
        flag2(propAssertion, "lockSsfi", true);
        if (!negate || props.length === 1) {
          propAssertion.property(prop, val[prop]);
          return;
        }
        try {
          propAssertion.property(prop, val[prop]);
        } catch (err) {
          if (!check_error_exports.compatibleConstructor(err, AssertionError)) {
            throw err;
          }
          if (firstErr === null)
            firstErr = err;
          numErrs++;
        }
      }, this);
      if (negate && props.length > 1 && numErrs === props.length) {
        throw firstErr;
      }
      return;
  }
  this.assert(
    included,
    "expected #{this} to " + descriptor + "include " + inspect2(val),
    "expected #{this} to not " + descriptor + "include " + inspect2(val)
  );
}
__name(include, "include");
Assertion.addChainableMethod("include", include, includeChainingBehavior);
Assertion.addChainableMethod("contain", include, includeChainingBehavior);
Assertion.addChainableMethod("contains", include, includeChainingBehavior);
Assertion.addChainableMethod("includes", include, includeChainingBehavior);
Assertion.addProperty("ok", function() {
  this.assert(
    flag2(this, "object"),
    "expected #{this} to be truthy",
    "expected #{this} to be falsy"
  );
});
Assertion.addProperty("true", function() {
  this.assert(
    true === flag2(this, "object"),
    "expected #{this} to be true",
    "expected #{this} to be false",
    flag2(this, "negate") ? false : true
  );
});
Assertion.addProperty("numeric", function() {
  const object = flag2(this, "object");
  this.assert(
    ["Number", "BigInt"].includes(type(object)),
    "expected #{this} to be numeric",
    "expected #{this} to not be numeric",
    flag2(this, "negate") ? false : true
  );
});
Assertion.addProperty("callable", function() {
  const val = flag2(this, "object");
  const ssfi = flag2(this, "ssfi");
  const message = flag2(this, "message");
  const msg = message ? `${message}: ` : "";
  const negate = flag2(this, "negate");
  const assertionMessage = negate ? `${msg}expected ${inspect2(val)} not to be a callable function` : `${msg}expected ${inspect2(val)} to be a callable function`;
  const isCallable = ["Function", "AsyncFunction", "GeneratorFunction", "AsyncGeneratorFunction"].includes(type(val));
  if (isCallable && negate || !isCallable && !negate) {
    throw new AssertionError(
      assertionMessage,
      void 0,
      ssfi
    );
  }
});
Assertion.addProperty("false", function() {
  this.assert(
    false === flag2(this, "object"),
    "expected #{this} to be false",
    "expected #{this} to be true",
    flag2(this, "negate") ? true : false
  );
});
Assertion.addProperty("null", function() {
  this.assert(
    null === flag2(this, "object"),
    "expected #{this} to be null",
    "expected #{this} not to be null"
  );
});
Assertion.addProperty("undefined", function() {
  this.assert(
    void 0 === flag2(this, "object"),
    "expected #{this} to be undefined",
    "expected #{this} not to be undefined"
  );
});
Assertion.addProperty("NaN", function() {
  this.assert(
    isNaN2(flag2(this, "object")),
    "expected #{this} to be NaN",
    "expected #{this} not to be NaN"
  );
});
function assertExist() {
  var val = flag2(this, "object");
  this.assert(
    val !== null && val !== void 0,
    "expected #{this} to exist",
    "expected #{this} to not exist"
  );
}
__name(assertExist, "assertExist");
Assertion.addProperty("exist", assertExist);
Assertion.addProperty("exists", assertExist);
Assertion.addProperty("empty", function() {
  var val = flag2(this, "object"), ssfi = flag2(this, "ssfi"), flagMsg = flag2(this, "message"), itemsCount;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  switch (type(val).toLowerCase()) {
    case "array":
    case "string":
      itemsCount = val.length;
      break;
    case "map":
    case "set":
      itemsCount = val.size;
      break;
    case "weakmap":
    case "weakset":
      throw new AssertionError(
        flagMsg + ".empty was passed a weak collection",
        void 0,
        ssfi
      );
    case "function":
      var msg = flagMsg + ".empty was passed a function " + getName(val);
      throw new AssertionError(msg.trim(), void 0, ssfi);
    default:
      if (val !== Object(val)) {
        throw new AssertionError(
          flagMsg + ".empty was passed non-string primitive " + inspect2(val),
          void 0,
          ssfi
        );
      }
      itemsCount = Object.keys(val).length;
  }
  this.assert(
    0 === itemsCount,
    "expected #{this} to be empty",
    "expected #{this} not to be empty"
  );
});
function checkArguments() {
  var obj = flag2(this, "object"), type3 = type(obj);
  this.assert(
    "Arguments" === type3,
    "expected #{this} to be arguments but got " + type3,
    "expected #{this} to not be arguments"
  );
}
__name(checkArguments, "checkArguments");
Assertion.addProperty("arguments", checkArguments);
Assertion.addProperty("Arguments", checkArguments);
function assertEqual(val, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object");
  if (flag2(this, "deep")) {
    var prevLockSsfi = flag2(this, "lockSsfi");
    flag2(this, "lockSsfi", true);
    this.eql(val);
    flag2(this, "lockSsfi", prevLockSsfi);
  } else {
    this.assert(
      val === obj,
      "expected #{this} to equal #{exp}",
      "expected #{this} to not equal #{exp}",
      val,
      this._obj,
      true
    );
  }
}
__name(assertEqual, "assertEqual");
Assertion.addMethod("equal", assertEqual);
Assertion.addMethod("equals", assertEqual);
Assertion.addMethod("eq", assertEqual);
function assertEql(obj, msg) {
  if (msg)
    flag2(this, "message", msg);
  var eql = flag2(this, "eql");
  this.assert(
    eql(obj, flag2(this, "object")),
    "expected #{this} to deeply equal #{exp}",
    "expected #{this} to not deeply equal #{exp}",
    obj,
    this._obj,
    true
  );
}
__name(assertEql, "assertEql");
Assertion.addMethod("eql", assertEql);
Assertion.addMethod("eqls", assertEql);
function assertAbove(n, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase();
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && (objType === "date" && nType !== "date")) {
    throw new AssertionError(msgPrefix + "the argument to above must be a date", void 0, ssfi);
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    throw new AssertionError(msgPrefix + "the argument to above must be a number", void 0, ssfi);
  } else if (!doLength && (objType !== "date" && !isNumeric(obj))) {
    var printObj = objType === "string" ? "'" + obj + "'" : obj;
    throw new AssertionError(msgPrefix + "expected " + printObj + " to be a number or a date", void 0, ssfi);
  }
  if (doLength) {
    var descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount > n,
      "expected #{this} to have a " + descriptor + " above #{exp} but got #{act}",
      "expected #{this} to not have a " + descriptor + " above #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj > n,
      "expected #{this} to be above #{exp}",
      "expected #{this} to be at most #{exp}",
      n
    );
  }
}
__name(assertAbove, "assertAbove");
Assertion.addMethod("above", assertAbove);
Assertion.addMethod("gt", assertAbove);
Assertion.addMethod("greaterThan", assertAbove);
function assertLeast(n, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && (objType === "date" && nType !== "date")) {
    errorMessage = msgPrefix + "the argument to least must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to least must be a number";
  } else if (!doLength && (objType !== "date" && !isNumeric(obj))) {
    var printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    var descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount >= n,
      "expected #{this} to have a " + descriptor + " at least #{exp} but got #{act}",
      "expected #{this} to have a " + descriptor + " below #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj >= n,
      "expected #{this} to be at least #{exp}",
      "expected #{this} to be below #{exp}",
      n
    );
  }
}
__name(assertLeast, "assertLeast");
Assertion.addMethod("least", assertLeast);
Assertion.addMethod("gte", assertLeast);
Assertion.addMethod("greaterThanOrEqual", assertLeast);
function assertBelow(n, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && (objType === "date" && nType !== "date")) {
    errorMessage = msgPrefix + "the argument to below must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to below must be a number";
  } else if (!doLength && (objType !== "date" && !isNumeric(obj))) {
    var printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    var descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount < n,
      "expected #{this} to have a " + descriptor + " below #{exp} but got #{act}",
      "expected #{this} to not have a " + descriptor + " below #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj < n,
      "expected #{this} to be below #{exp}",
      "expected #{this} to be at least #{exp}",
      n
    );
  }
}
__name(assertBelow, "assertBelow");
Assertion.addMethod("below", assertBelow);
Assertion.addMethod("lt", assertBelow);
Assertion.addMethod("lessThan", assertBelow);
function assertMost(n, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && (objType === "date" && nType !== "date")) {
    errorMessage = msgPrefix + "the argument to most must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to most must be a number";
  } else if (!doLength && (objType !== "date" && !isNumeric(obj))) {
    var printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    var descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount <= n,
      "expected #{this} to have a " + descriptor + " at most #{exp} but got #{act}",
      "expected #{this} to have a " + descriptor + " above #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj <= n,
      "expected #{this} to be at most #{exp}",
      "expected #{this} to be above #{exp}",
      n
    );
  }
}
__name(assertMost, "assertMost");
Assertion.addMethod("most", assertMost);
Assertion.addMethod("lte", assertMost);
Assertion.addMethod("lessThanOrEqual", assertMost);
Assertion.addMethod("within", function(start, finish, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), startType = type(start).toLowerCase(), finishType = type(finish).toLowerCase(), errorMessage, shouldThrow = true, range = startType === "date" && finishType === "date" ? start.toISOString() + ".." + finish.toISOString() : start + ".." + finish;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && (objType === "date" && (startType !== "date" || finishType !== "date"))) {
    errorMessage = msgPrefix + "the arguments to within must be dates";
  } else if ((!isNumeric(start) || !isNumeric(finish)) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the arguments to within must be numbers";
  } else if (!doLength && (objType !== "date" && !isNumeric(obj))) {
    var printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    var descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount >= start && itemsCount <= finish,
      "expected #{this} to have a " + descriptor + " within " + range,
      "expected #{this} to not have a " + descriptor + " within " + range
    );
  } else {
    this.assert(
      obj >= start && obj <= finish,
      "expected #{this} to be within " + range,
      "expected #{this} to not be within " + range
    );
  }
});
function assertInstanceOf(constructor, msg) {
  if (msg)
    flag2(this, "message", msg);
  var target = flag2(this, "object");
  var ssfi = flag2(this, "ssfi");
  var flagMsg = flag2(this, "message");
  try {
    var isInstanceOf = target instanceof constructor;
  } catch (err) {
    if (err instanceof TypeError) {
      flagMsg = flagMsg ? flagMsg + ": " : "";
      throw new AssertionError(
        flagMsg + "The instanceof assertion needs a constructor but " + type(constructor) + " was given.",
        void 0,
        ssfi
      );
    }
    throw err;
  }
  var name = getName(constructor);
  if (name == null) {
    name = "an unnamed constructor";
  }
  this.assert(
    isInstanceOf,
    "expected #{this} to be an instance of " + name,
    "expected #{this} to not be an instance of " + name
  );
}
__name(assertInstanceOf, "assertInstanceOf");
Assertion.addMethod("instanceof", assertInstanceOf);
Assertion.addMethod("instanceOf", assertInstanceOf);
function assertProperty(name, val, msg) {
  if (msg)
    flag2(this, "message", msg);
  var isNested = flag2(this, "nested"), isOwn = flag2(this, "own"), flagMsg = flag2(this, "message"), obj = flag2(this, "object"), ssfi = flag2(this, "ssfi"), nameType = typeof name;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  if (isNested) {
    if (nameType !== "string") {
      throw new AssertionError(
        flagMsg + "the argument to property must be a string when using nested syntax",
        void 0,
        ssfi
      );
    }
  } else {
    if (nameType !== "string" && nameType !== "number" && nameType !== "symbol") {
      throw new AssertionError(
        flagMsg + "the argument to property must be a string, number, or symbol",
        void 0,
        ssfi
      );
    }
  }
  if (isNested && isOwn) {
    throw new AssertionError(
      flagMsg + 'The "nested" and "own" flags cannot be combined.',
      void 0,
      ssfi
    );
  }
  if (obj === null || obj === void 0) {
    throw new AssertionError(
      flagMsg + "Target cannot be null or undefined.",
      void 0,
      ssfi
    );
  }
  var isDeep = flag2(this, "deep"), negate = flag2(this, "negate"), pathInfo = isNested ? getPathInfo(obj, name) : null, value = isNested ? pathInfo.value : obj[name], isEql = isDeep ? flag2(this, "eql") : (val1, val2) => val1 === val2;
  var descriptor = "";
  if (isDeep)
    descriptor += "deep ";
  if (isOwn)
    descriptor += "own ";
  if (isNested)
    descriptor += "nested ";
  descriptor += "property ";
  var hasProperty2;
  if (isOwn)
    hasProperty2 = Object.prototype.hasOwnProperty.call(obj, name);
  else if (isNested)
    hasProperty2 = pathInfo.exists;
  else
    hasProperty2 = hasProperty$1(obj, name);
  if (!negate || arguments.length === 1) {
    this.assert(
      hasProperty2,
      "expected #{this} to have " + descriptor + inspect2(name),
      "expected #{this} to not have " + descriptor + inspect2(name)
    );
  }
  if (arguments.length > 1) {
    this.assert(
      hasProperty2 && isEql(val, value),
      "expected #{this} to have " + descriptor + inspect2(name) + " of #{exp}, but got #{act}",
      "expected #{this} to not have " + descriptor + inspect2(name) + " of #{act}",
      val,
      value
    );
  }
  flag2(this, "object", value);
}
__name(assertProperty, "assertProperty");
Assertion.addMethod("property", assertProperty);
function assertOwnProperty(name, value, msg) {
  flag2(this, "own", true);
  assertProperty.apply(this, arguments);
}
__name(assertOwnProperty, "assertOwnProperty");
Assertion.addMethod("ownProperty", assertOwnProperty);
Assertion.addMethod("haveOwnProperty", assertOwnProperty);
function assertOwnPropertyDescriptor(name, descriptor, msg) {
  if (typeof descriptor === "string") {
    msg = descriptor;
    descriptor = null;
  }
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object");
  var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
  var eql = flag2(this, "eql");
  if (actualDescriptor && descriptor) {
    this.assert(
      eql(descriptor, actualDescriptor),
      "expected the own property descriptor for " + inspect2(name) + " on #{this} to match " + inspect2(descriptor) + ", got " + inspect2(actualDescriptor),
      "expected the own property descriptor for " + inspect2(name) + " on #{this} to not match " + inspect2(descriptor),
      descriptor,
      actualDescriptor,
      true
    );
  } else {
    this.assert(
      actualDescriptor,
      "expected #{this} to have an own property descriptor for " + inspect2(name),
      "expected #{this} to not have an own property descriptor for " + inspect2(name)
    );
  }
  flag2(this, "object", actualDescriptor);
}
__name(assertOwnPropertyDescriptor, "assertOwnPropertyDescriptor");
Assertion.addMethod("ownPropertyDescriptor", assertOwnPropertyDescriptor);
Assertion.addMethod("haveOwnPropertyDescriptor", assertOwnPropertyDescriptor);
function assertLengthChain() {
  flag2(this, "doLength", true);
}
__name(assertLengthChain, "assertLengthChain");
function assertLength(n, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), objType = type(obj).toLowerCase(), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi"), descriptor = "length", itemsCount;
  switch (objType) {
    case "map":
    case "set":
      descriptor = "size";
      itemsCount = obj.size;
      break;
    default:
      new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
      itemsCount = obj.length;
  }
  this.assert(
    itemsCount == n,
    "expected #{this} to have a " + descriptor + " of #{exp} but got #{act}",
    "expected #{this} to not have a " + descriptor + " of #{act}",
    n,
    itemsCount
  );
}
__name(assertLength, "assertLength");
Assertion.addChainableMethod("length", assertLength, assertLengthChain);
Assertion.addChainableMethod("lengthOf", assertLength, assertLengthChain);
function assertMatch(re, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object");
  this.assert(
    re.exec(obj),
    "expected #{this} to match " + re,
    "expected #{this} not to match " + re
  );
}
__name(assertMatch, "assertMatch");
Assertion.addMethod("match", assertMatch);
Assertion.addMethod("matches", assertMatch);
Assertion.addMethod("string", function(str, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).is.a("string");
  this.assert(
    ~obj.indexOf(str),
    "expected #{this} to contain " + inspect2(str),
    "expected #{this} to not contain " + inspect2(str)
  );
});
function assertKeys(keys) {
  var obj = flag2(this, "object"), objType = type(obj), keysType = type(keys), ssfi = flag2(this, "ssfi"), isDeep = flag2(this, "deep"), str, deepStr = "", actual, ok = true, flagMsg = flag2(this, "message");
  flagMsg = flagMsg ? flagMsg + ": " : "";
  var mixedArgsMsg = flagMsg + "when testing keys against an object or an array you must give a single Array|Object|String argument or multiple String arguments";
  if (objType === "Map" || objType === "Set") {
    deepStr = isDeep ? "deeply " : "";
    actual = [];
    obj.forEach(function(val, key) {
      actual.push(key);
    });
    if (keysType !== "Array") {
      keys = Array.prototype.slice.call(arguments);
    }
  } else {
    actual = getOwnEnumerableProperties(obj);
    switch (keysType) {
      case "Array":
        if (arguments.length > 1) {
          throw new AssertionError(mixedArgsMsg, void 0, ssfi);
        }
        break;
      case "Object":
        if (arguments.length > 1) {
          throw new AssertionError(mixedArgsMsg, void 0, ssfi);
        }
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }
    keys = keys.map(function(val) {
      return typeof val === "symbol" ? val : String(val);
    });
  }
  if (!keys.length) {
    throw new AssertionError(flagMsg + "keys required", void 0, ssfi);
  }
  var len = keys.length, any = flag2(this, "any"), all = flag2(this, "all"), expected = keys, isEql = isDeep ? flag2(this, "eql") : (val1, val2) => val1 === val2;
  if (!any && !all) {
    all = true;
  }
  if (any) {
    ok = expected.some(function(expectedKey) {
      return actual.some(function(actualKey) {
        return isEql(expectedKey, actualKey);
      });
    });
  }
  if (all) {
    ok = expected.every(function(expectedKey) {
      return actual.some(function(actualKey) {
        return isEql(expectedKey, actualKey);
      });
    });
    if (!flag2(this, "contains")) {
      ok = ok && keys.length == actual.length;
    }
  }
  if (len > 1) {
    keys = keys.map(function(key) {
      return inspect2(key);
    });
    var last = keys.pop();
    if (all) {
      str = keys.join(", ") + ", and " + last;
    }
    if (any) {
      str = keys.join(", ") + ", or " + last;
    }
  } else {
    str = inspect2(keys[0]);
  }
  str = (len > 1 ? "keys " : "key ") + str;
  str = (flag2(this, "contains") ? "contain " : "have ") + str;
  this.assert(
    ok,
    "expected #{this} to " + deepStr + str,
    "expected #{this} to not " + deepStr + str,
    expected.slice(0).sort(compareByInspect),
    actual.sort(compareByInspect),
    true
  );
}
__name(assertKeys, "assertKeys");
Assertion.addMethod("keys", assertKeys);
Assertion.addMethod("key", assertKeys);
function assertThrows(errorLike, errMsgMatcher, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), ssfi = flag2(this, "ssfi"), flagMsg = flag2(this, "message"), negate = flag2(this, "negate") || false;
  new Assertion(obj, flagMsg, ssfi, true).is.a("function");
  if (isRegExp2(errorLike) || typeof errorLike === "string") {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  let caughtErr;
  let errorWasThrown = false;
  try {
    obj();
  } catch (err) {
    errorWasThrown = true;
    caughtErr = err;
  }
  var everyArgIsUndefined = errorLike === void 0 && errMsgMatcher === void 0;
  var everyArgIsDefined = Boolean(errorLike && errMsgMatcher);
  var errorLikeFail = false;
  var errMsgMatcherFail = false;
  if (everyArgIsUndefined || !everyArgIsUndefined && !negate) {
    var errorLikeString = "an error";
    if (errorLike instanceof Error) {
      errorLikeString = "#{exp}";
    } else if (errorLike) {
      errorLikeString = check_error_exports.getConstructorName(errorLike);
    }
    let actual = caughtErr;
    if (caughtErr instanceof Error) {
      actual = caughtErr.toString();
    } else if (typeof caughtErr === "string") {
      actual = caughtErr;
    } else if (caughtErr && (typeof caughtErr === "object" || typeof caughtErr === "function")) {
      try {
        actual = check_error_exports.getConstructorName(caughtErr);
      } catch (_err) {
      }
    }
    this.assert(
      errorWasThrown,
      "expected #{this} to throw " + errorLikeString,
      "expected #{this} to not throw an error but #{act} was thrown",
      errorLike && errorLike.toString(),
      actual
    );
  }
  if (errorLike && caughtErr) {
    if (errorLike instanceof Error) {
      var isCompatibleInstance = check_error_exports.compatibleInstance(caughtErr, errorLike);
      if (isCompatibleInstance === negate) {
        if (everyArgIsDefined && negate) {
          errorLikeFail = true;
        } else {
          this.assert(
            negate,
            "expected #{this} to throw #{exp} but #{act} was thrown",
            "expected #{this} to not throw #{exp}" + (caughtErr && !negate ? " but #{act} was thrown" : ""),
            errorLike.toString(),
            caughtErr.toString()
          );
        }
      }
    }
    var isCompatibleConstructor = check_error_exports.compatibleConstructor(caughtErr, errorLike);
    if (isCompatibleConstructor === negate) {
      if (everyArgIsDefined && negate) {
        errorLikeFail = true;
      } else {
        this.assert(
          negate,
          "expected #{this} to throw #{exp} but #{act} was thrown",
          "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""),
          errorLike instanceof Error ? errorLike.toString() : errorLike && check_error_exports.getConstructorName(errorLike),
          caughtErr instanceof Error ? caughtErr.toString() : caughtErr && check_error_exports.getConstructorName(caughtErr)
        );
      }
    }
  }
  if (caughtErr && errMsgMatcher !== void 0 && errMsgMatcher !== null) {
    var placeholder = "including";
    if (isRegExp2(errMsgMatcher)) {
      placeholder = "matching";
    }
    var isCompatibleMessage = check_error_exports.compatibleMessage(caughtErr, errMsgMatcher);
    if (isCompatibleMessage === negate) {
      if (everyArgIsDefined && negate) {
        errMsgMatcherFail = true;
      } else {
        this.assert(
          negate,
          "expected #{this} to throw error " + placeholder + " #{exp} but got #{act}",
          "expected #{this} to throw error not " + placeholder + " #{exp}",
          errMsgMatcher,
          check_error_exports.getMessage(caughtErr)
        );
      }
    }
  }
  if (errorLikeFail && errMsgMatcherFail) {
    this.assert(
      negate,
      "expected #{this} to throw #{exp} but #{act} was thrown",
      "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""),
      errorLike instanceof Error ? errorLike.toString() : errorLike && check_error_exports.getConstructorName(errorLike),
      caughtErr instanceof Error ? caughtErr.toString() : caughtErr && check_error_exports.getConstructorName(caughtErr)
    );
  }
  flag2(this, "object", caughtErr);
}
__name(assertThrows, "assertThrows");
Assertion.addMethod("throw", assertThrows);
Assertion.addMethod("throws", assertThrows);
Assertion.addMethod("Throw", assertThrows);
function respondTo(method, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), itself = flag2(this, "itself"), context = "function" === typeof obj && !itself ? obj.prototype[method] : obj[method];
  this.assert(
    "function" === typeof context,
    "expected #{this} to respond to " + inspect2(method),
    "expected #{this} to not respond to " + inspect2(method)
  );
}
__name(respondTo, "respondTo");
Assertion.addMethod("respondTo", respondTo);
Assertion.addMethod("respondsTo", respondTo);
Assertion.addProperty("itself", function() {
  flag2(this, "itself", true);
});
function satisfy(matcher, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object");
  var result = matcher(obj);
  this.assert(
    result,
    "expected #{this} to satisfy " + objDisplay(matcher),
    "expected #{this} to not satisfy" + objDisplay(matcher),
    flag2(this, "negate") ? false : true,
    result
  );
}
__name(satisfy, "satisfy");
Assertion.addMethod("satisfy", satisfy);
Assertion.addMethod("satisfies", satisfy);
function closeTo(expected, delta, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).is.numeric;
  let message = "A `delta` value is required for `closeTo`";
  if (delta == void 0)
    throw new AssertionError(flagMsg ? `${flagMsg}: ${message}` : message, void 0, ssfi);
  new Assertion(delta, flagMsg, ssfi, true).is.numeric;
  message = "A `expected` value is required for `closeTo`";
  if (expected == void 0)
    throw new AssertionError(flagMsg ? `${flagMsg}: ${message}` : message, void 0, ssfi);
  new Assertion(expected, flagMsg, ssfi, true).is.numeric;
  const abs = /* @__PURE__ */ __name((x) => x < 0n ? -x : x, "abs");
  this.assert(
    abs(obj - expected) <= delta,
    "expected #{this} to be close to " + expected + " +/- " + delta,
    "expected #{this} not to be close to " + expected + " +/- " + delta
  );
}
__name(closeTo, "closeTo");
Assertion.addMethod("closeTo", closeTo);
Assertion.addMethod("approximately", closeTo);
function isSubsetOf(_subset, _superset, cmp, contains, ordered) {
  let superset = Array.from(_superset);
  let subset = Array.from(_subset);
  if (!contains) {
    if (subset.length !== superset.length)
      return false;
    superset = superset.slice();
  }
  return subset.every(function(elem, idx) {
    if (ordered)
      return cmp ? cmp(elem, superset[idx]) : elem === superset[idx];
    if (!cmp) {
      var matchIdx = superset.indexOf(elem);
      if (matchIdx === -1)
        return false;
      if (!contains)
        superset.splice(matchIdx, 1);
      return true;
    }
    return superset.some(function(elem2, matchIdx2) {
      if (!cmp(elem, elem2))
        return false;
      if (!contains)
        superset.splice(matchIdx2, 1);
      return true;
    });
  });
}
__name(isSubsetOf, "isSubsetOf");
Assertion.addMethod("members", function(subset, msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).to.be.iterable;
  new Assertion(subset, flagMsg, ssfi, true).to.be.iterable;
  var contains = flag2(this, "contains");
  var ordered = flag2(this, "ordered");
  var subject, failMsg, failNegateMsg;
  if (contains) {
    subject = ordered ? "an ordered superset" : "a superset";
    failMsg = "expected #{this} to be " + subject + " of #{exp}";
    failNegateMsg = "expected #{this} to not be " + subject + " of #{exp}";
  } else {
    subject = ordered ? "ordered members" : "members";
    failMsg = "expected #{this} to have the same " + subject + " as #{exp}";
    failNegateMsg = "expected #{this} to not have the same " + subject + " as #{exp}";
  }
  var cmp = flag2(this, "deep") ? flag2(this, "eql") : void 0;
  this.assert(
    isSubsetOf(subset, obj, cmp, contains, ordered),
    failMsg,
    failNegateMsg,
    subset,
    obj,
    true
  );
});
Assertion.addProperty("iterable", function(msg) {
  if (msg)
    flag2(this, "message", msg);
  var obj = flag2(this, "object");
  this.assert(
    obj != void 0 && obj[Symbol.iterator],
    "expected #{this} to be an iterable",
    "expected #{this} to not be an iterable",
    obj
  );
});
function oneOf(list, msg) {
  if (msg)
    flag2(this, "message", msg);
  var expected = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi"), contains = flag2(this, "contains"), isDeep = flag2(this, "deep"), eql = flag2(this, "eql");
  new Assertion(list, flagMsg, ssfi, true).to.be.an("array");
  if (contains) {
    this.assert(
      list.some(function(possibility) {
        return expected.indexOf(possibility) > -1;
      }),
      "expected #{this} to contain one of #{exp}",
      "expected #{this} to not contain one of #{exp}",
      list,
      expected
    );
  } else {
    if (isDeep) {
      this.assert(
        list.some(function(possibility) {
          return eql(expected, possibility);
        }),
        "expected #{this} to deeply equal one of #{exp}",
        "expected #{this} to deeply equal one of #{exp}",
        list,
        expected
      );
    } else {
      this.assert(
        list.indexOf(expected) > -1,
        "expected #{this} to be one of #{exp}",
        "expected #{this} to not be one of #{exp}",
        list,
        expected
      );
    }
  }
}
__name(oneOf, "oneOf");
Assertion.addMethod("oneOf", oneOf);
function assertChanges(subject, prop, msg) {
  if (msg)
    flag2(this, "message", msg);
  var fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  var initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  fn();
  var final = prop === void 0 || prop === null ? subject() : subject[prop];
  var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "change");
  flag2(this, "realDelta", final !== initial);
  this.assert(
    initial !== final,
    "expected " + msgObj + " to change",
    "expected " + msgObj + " to not change"
  );
}
__name(assertChanges, "assertChanges");
Assertion.addMethod("change", assertChanges);
Assertion.addMethod("changes", assertChanges);
function assertIncreases(subject, prop, msg) {
  if (msg)
    flag2(this, "message", msg);
  var fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  var initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  new Assertion(initial, flagMsg, ssfi, true).is.a("number");
  fn();
  var final = prop === void 0 || prop === null ? subject() : subject[prop];
  var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "increase");
  flag2(this, "realDelta", final - initial);
  this.assert(
    final - initial > 0,
    "expected " + msgObj + " to increase",
    "expected " + msgObj + " to not increase"
  );
}
__name(assertIncreases, "assertIncreases");
Assertion.addMethod("increase", assertIncreases);
Assertion.addMethod("increases", assertIncreases);
function assertDecreases(subject, prop, msg) {
  if (msg)
    flag2(this, "message", msg);
  var fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  var initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  new Assertion(initial, flagMsg, ssfi, true).is.a("number");
  fn();
  var final = prop === void 0 || prop === null ? subject() : subject[prop];
  var msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "decrease");
  flag2(this, "realDelta", initial - final);
  this.assert(
    final - initial < 0,
    "expected " + msgObj + " to decrease",
    "expected " + msgObj + " to not decrease"
  );
}
__name(assertDecreases, "assertDecreases");
Assertion.addMethod("decrease", assertDecreases);
Assertion.addMethod("decreases", assertDecreases);
function assertDelta(delta, msg) {
  if (msg)
    flag2(this, "message", msg);
  var msgObj = flag2(this, "deltaMsgObj");
  var initial = flag2(this, "initialDeltaValue");
  var final = flag2(this, "finalDeltaValue");
  var behavior = flag2(this, "deltaBehavior");
  var realDelta = flag2(this, "realDelta");
  var expression;
  if (behavior === "change") {
    expression = Math.abs(final - initial) === Math.abs(delta);
  } else {
    expression = realDelta === Math.abs(delta);
  }
  this.assert(
    expression,
    "expected " + msgObj + " to " + behavior + " by " + delta,
    "expected " + msgObj + " to not " + behavior + " by " + delta
  );
}
__name(assertDelta, "assertDelta");
Assertion.addMethod("by", assertDelta);
Assertion.addProperty("extensible", function() {
  var obj = flag2(this, "object");
  var isExtensible = obj === Object(obj) && Object.isExtensible(obj);
  this.assert(
    isExtensible,
    "expected #{this} to be extensible",
    "expected #{this} to not be extensible"
  );
});
Assertion.addProperty("sealed", function() {
  var obj = flag2(this, "object");
  var isSealed = obj === Object(obj) ? Object.isSealed(obj) : true;
  this.assert(
    isSealed,
    "expected #{this} to be sealed",
    "expected #{this} to not be sealed"
  );
});
Assertion.addProperty("frozen", function() {
  var obj = flag2(this, "object");
  var isFrozen = obj === Object(obj) ? Object.isFrozen(obj) : true;
  this.assert(
    isFrozen,
    "expected #{this} to be frozen",
    "expected #{this} to not be frozen"
  );
});
Assertion.addProperty("finite", function(msg) {
  var obj = flag2(this, "object");
  this.assert(
    typeof obj === "number" && isFinite(obj),
    "expected #{this} to be a finite number",
    "expected #{this} to not be a finite number"
  );
});

// lib/chai/interface/expect.js
function expect(val, message) {
  return new Assertion(val, message);
}
__name(expect, "expect");
expect.fail = function(actual, expected, message, operator) {
  if (arguments.length < 2) {
    message = actual;
    actual = void 0;
  }
  message = message || "expect.fail()";
  throw new AssertionError(message, {
    actual,
    expected,
    operator
  }, expect.fail);
};

// lib/chai/interface/should.js
var should_exports = {};
__export(should_exports, {
  Should: () => Should,
  should: () => should
});
function loadShould() {
  function shouldGetter() {
    if (this instanceof String || this instanceof Number || this instanceof Boolean || typeof Symbol === "function" && this instanceof Symbol || typeof BigInt === "function" && this instanceof BigInt) {
      return new Assertion(this.valueOf(), null, shouldGetter);
    }
    return new Assertion(this, null, shouldGetter);
  }
  __name(shouldGetter, "shouldGetter");
  function shouldSetter(value) {
    Object.defineProperty(this, "should", {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  }
  __name(shouldSetter, "shouldSetter");
  Object.defineProperty(Object.prototype, "should", {
    set: shouldSetter,
    get: shouldGetter,
    configurable: true
  });
  var should2 = {};
  should2.fail = function(actual, expected, message, operator) {
    if (arguments.length < 2) {
      message = actual;
      actual = void 0;
    }
    message = message || "should.fail()";
    throw new AssertionError(message, {
      actual,
      expected,
      operator
    }, should2.fail);
  };
  should2.equal = function(actual, expected, message) {
    new Assertion(actual, message).to.equal(expected);
  };
  should2.Throw = function(fn, errt, errs, msg) {
    new Assertion(fn, msg).to.Throw(errt, errs);
  };
  should2.exist = function(val, msg) {
    new Assertion(val, msg).to.exist;
  };
  should2.not = {};
  should2.not.equal = function(actual, expected, msg) {
    new Assertion(actual, msg).to.not.equal(expected);
  };
  should2.not.Throw = function(fn, errt, errs, msg) {
    new Assertion(fn, msg).to.not.Throw(errt, errs);
  };
  should2.not.exist = function(val, msg) {
    new Assertion(val, msg).to.not.exist;
  };
  should2["throw"] = should2["Throw"];
  should2.not["throw"] = should2.not["Throw"];
  return should2;
}
__name(loadShould, "loadShould");
var should = loadShould;
var Should = loadShould;

// lib/chai/interface/assert.js
function assert$1(express, errmsg) {
  var test2 = new Assertion(null, null, assert$1, true);
  test2.assert(
    express,
    errmsg,
    "[ negation message unavailable ]"
  );
}
__name(assert$1, "assert");
assert$1.fail = function(actual, expected, message, operator) {
  if (arguments.length < 2) {
    message = actual;
    actual = void 0;
  }
  message = message || "assert.fail()";
  throw new AssertionError(message, {
    actual,
    expected,
    operator
  }, assert$1.fail);
};
assert$1.isOk = function(val, msg) {
  new Assertion(val, msg, assert$1.isOk, true).is.ok;
};
assert$1.isNotOk = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotOk, true).is.not.ok;
};
assert$1.equal = function(act, exp, msg) {
  var test2 = new Assertion(act, msg, assert$1.equal, true);
  test2.assert(
    exp == flag(test2, "object"),
    "expected #{this} to equal #{exp}",
    "expected #{this} to not equal #{act}",
    exp,
    act,
    true
  );
};
assert$1.notEqual = function(act, exp, msg) {
  var test2 = new Assertion(act, msg, assert$1.notEqual, true);
  test2.assert(
    exp != flag(test2, "object"),
    "expected #{this} to not equal #{exp}",
    "expected #{this} to equal #{act}",
    exp,
    act,
    true
  );
};
assert$1.strictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert$1.strictEqual, true).to.equal(exp);
};
assert$1.notStrictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert$1.notStrictEqual, true).to.not.equal(exp);
};
assert$1.deepEqual = assert$1.deepStrictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert$1.deepEqual, true).to.eql(exp);
};
assert$1.notDeepEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert$1.notDeepEqual, true).to.not.eql(exp);
};
assert$1.isAbove = function(val, abv, msg) {
  new Assertion(val, msg, assert$1.isAbove, true).to.be.above(abv);
};
assert$1.isAtLeast = function(val, atlst, msg) {
  new Assertion(val, msg, assert$1.isAtLeast, true).to.be.least(atlst);
};
assert$1.isBelow = function(val, blw, msg) {
  new Assertion(val, msg, assert$1.isBelow, true).to.be.below(blw);
};
assert$1.isAtMost = function(val, atmst, msg) {
  new Assertion(val, msg, assert$1.isAtMost, true).to.be.most(atmst);
};
assert$1.isTrue = function(val, msg) {
  new Assertion(val, msg, assert$1.isTrue, true).is["true"];
};
assert$1.isNotTrue = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotTrue, true).to.not.equal(true);
};
assert$1.isFalse = function(val, msg) {
  new Assertion(val, msg, assert$1.isFalse, true).is["false"];
};
assert$1.isNotFalse = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotFalse, true).to.not.equal(false);
};
assert$1.isNull = function(val, msg) {
  new Assertion(val, msg, assert$1.isNull, true).to.equal(null);
};
assert$1.isNotNull = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotNull, true).to.not.equal(null);
};
assert$1.isNaN = function(val, msg) {
  new Assertion(val, msg, assert$1.isNaN, true).to.be.NaN;
};
assert$1.isNotNaN = function(value, message) {
  new Assertion(value, message, assert$1.isNotNaN, true).not.to.be.NaN;
};
assert$1.exists = function(val, msg) {
  new Assertion(val, msg, assert$1.exists, true).to.exist;
};
assert$1.notExists = function(val, msg) {
  new Assertion(val, msg, assert$1.notExists, true).to.not.exist;
};
assert$1.isUndefined = function(val, msg) {
  new Assertion(val, msg, assert$1.isUndefined, true).to.equal(void 0);
};
assert$1.isDefined = function(val, msg) {
  new Assertion(val, msg, assert$1.isDefined, true).to.not.equal(void 0);
};
assert$1.isCallable = function(value, message) {
  new Assertion(value, message, assert$1.isCallable, true).is.callable;
};
assert$1.isNotCallable = function(value, message) {
  new Assertion(value, message, assert$1.isNotCallable, true).is.not.callable;
};
assert$1.isObject = function(val, msg) {
  new Assertion(val, msg, assert$1.isObject, true).to.be.a("object");
};
assert$1.isNotObject = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotObject, true).to.not.be.a("object");
};
assert$1.isArray = function(val, msg) {
  new Assertion(val, msg, assert$1.isArray, true).to.be.an("array");
};
assert$1.isNotArray = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotArray, true).to.not.be.an("array");
};
assert$1.isString = function(val, msg) {
  new Assertion(val, msg, assert$1.isString, true).to.be.a("string");
};
assert$1.isNotString = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotString, true).to.not.be.a("string");
};
assert$1.isNumber = function(val, msg) {
  new Assertion(val, msg, assert$1.isNumber, true).to.be.a("number");
};
assert$1.isNotNumber = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotNumber, true).to.not.be.a("number");
};
assert$1.isNumeric = function(val, msg) {
  new Assertion(val, msg, assert$1.isNumeric, true).is.numeric;
};
assert$1.isNotNumeric = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotNumeric, true).is.not.numeric;
};
assert$1.isFinite = function(val, msg) {
  new Assertion(val, msg, assert$1.isFinite, true).to.be.finite;
};
assert$1.isBoolean = function(val, msg) {
  new Assertion(val, msg, assert$1.isBoolean, true).to.be.a("boolean");
};
assert$1.isNotBoolean = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotBoolean, true).to.not.be.a("boolean");
};
assert$1.typeOf = function(val, type3, msg) {
  new Assertion(val, msg, assert$1.typeOf, true).to.be.a(type3);
};
assert$1.notTypeOf = function(value, type3, message) {
  new Assertion(value, message, assert$1.notTypeOf, true).to.not.be.a(type3);
};
assert$1.instanceOf = function(val, type3, msg) {
  new Assertion(val, msg, assert$1.instanceOf, true).to.be.instanceOf(type3);
};
assert$1.notInstanceOf = function(val, type3, msg) {
  new Assertion(val, msg, assert$1.notInstanceOf, true).to.not.be.instanceOf(type3);
};
assert$1.include = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.include, true).include(inc);
};
assert$1.notInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notInclude, true).not.include(inc);
};
assert$1.deepInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.deepInclude, true).deep.include(inc);
};
assert$1.notDeepInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notDeepInclude, true).not.deep.include(inc);
};
assert$1.nestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.nestedInclude, true).nested.include(inc);
};
assert$1.notNestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notNestedInclude, true).not.nested.include(inc);
};
assert$1.deepNestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.deepNestedInclude, true).deep.nested.include(inc);
};
assert$1.notDeepNestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notDeepNestedInclude, true).not.deep.nested.include(inc);
};
assert$1.ownInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.ownInclude, true).own.include(inc);
};
assert$1.notOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notOwnInclude, true).not.own.include(inc);
};
assert$1.deepOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.deepOwnInclude, true).deep.own.include(inc);
};
assert$1.notDeepOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert$1.notDeepOwnInclude, true).not.deep.own.include(inc);
};
assert$1.match = function(exp, re, msg) {
  new Assertion(exp, msg, assert$1.match, true).to.match(re);
};
assert$1.notMatch = function(exp, re, msg) {
  new Assertion(exp, msg, assert$1.notMatch, true).to.not.match(re);
};
assert$1.property = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.property, true).to.have.property(prop);
};
assert$1.notProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.notProperty, true).to.not.have.property(prop);
};
assert$1.propertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.propertyVal, true).to.have.property(prop, val);
};
assert$1.notPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.notPropertyVal, true).to.not.have.property(prop, val);
};
assert$1.deepPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.deepPropertyVal, true).to.have.deep.property(prop, val);
};
assert$1.notDeepPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.notDeepPropertyVal, true).to.not.have.deep.property(prop, val);
};
assert$1.ownProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.ownProperty, true).to.have.own.property(prop);
};
assert$1.notOwnProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.notOwnProperty, true).to.not.have.own.property(prop);
};
assert$1.ownPropertyVal = function(obj, prop, value, msg) {
  new Assertion(obj, msg, assert$1.ownPropertyVal, true).to.have.own.property(prop, value);
};
assert$1.notOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(obj, msg, assert$1.notOwnPropertyVal, true).to.not.have.own.property(prop, value);
};
assert$1.deepOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(obj, msg, assert$1.deepOwnPropertyVal, true).to.have.deep.own.property(prop, value);
};
assert$1.notDeepOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(obj, msg, assert$1.notDeepOwnPropertyVal, true).to.not.have.deep.own.property(prop, value);
};
assert$1.nestedProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.nestedProperty, true).to.have.nested.property(prop);
};
assert$1.notNestedProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert$1.notNestedProperty, true).to.not.have.nested.property(prop);
};
assert$1.nestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.nestedPropertyVal, true).to.have.nested.property(prop, val);
};
assert$1.notNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.notNestedPropertyVal, true).to.not.have.nested.property(prop, val);
};
assert$1.deepNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.deepNestedPropertyVal, true).to.have.deep.nested.property(prop, val);
};
assert$1.notDeepNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert$1.notDeepNestedPropertyVal, true).to.not.have.deep.nested.property(prop, val);
};
assert$1.lengthOf = function(exp, len, msg) {
  new Assertion(exp, msg, assert$1.lengthOf, true).to.have.lengthOf(len);
};
assert$1.hasAnyKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.hasAnyKeys, true).to.have.any.keys(keys);
};
assert$1.hasAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.hasAllKeys, true).to.have.all.keys(keys);
};
assert$1.containsAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.containsAllKeys, true).to.contain.all.keys(keys);
};
assert$1.doesNotHaveAnyKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.doesNotHaveAnyKeys, true).to.not.have.any.keys(keys);
};
assert$1.doesNotHaveAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.doesNotHaveAllKeys, true).to.not.have.all.keys(keys);
};
assert$1.hasAnyDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.hasAnyDeepKeys, true).to.have.any.deep.keys(keys);
};
assert$1.hasAllDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.hasAllDeepKeys, true).to.have.all.deep.keys(keys);
};
assert$1.containsAllDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.containsAllDeepKeys, true).to.contain.all.deep.keys(keys);
};
assert$1.doesNotHaveAnyDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.doesNotHaveAnyDeepKeys, true).to.not.have.any.deep.keys(keys);
};
assert$1.doesNotHaveAllDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert$1.doesNotHaveAllDeepKeys, true).to.not.have.all.deep.keys(keys);
};
assert$1.throws = function(fn, errorLike, errMsgMatcher, msg) {
  if ("string" === typeof errorLike || errorLike instanceof RegExp) {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  var assertErr = new Assertion(fn, msg, assert$1.throws, true).to.throw(errorLike, errMsgMatcher);
  return flag(assertErr, "object");
};
assert$1.doesNotThrow = function(fn, errorLike, errMsgMatcher, message) {
  if ("string" === typeof errorLike || errorLike instanceof RegExp) {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  new Assertion(fn, message, assert$1.doesNotThrow, true).to.not.throw(errorLike, errMsgMatcher);
};
assert$1.operator = function(val, operator, val2, msg) {
  var ok;
  switch (operator) {
    case "==":
      ok = val == val2;
      break;
    case "===":
      ok = val === val2;
      break;
    case ">":
      ok = val > val2;
      break;
    case ">=":
      ok = val >= val2;
      break;
    case "<":
      ok = val < val2;
      break;
    case "<=":
      ok = val <= val2;
      break;
    case "!=":
      ok = val != val2;
      break;
    case "!==":
      ok = val !== val2;
      break;
    default:
      msg = msg ? msg + ": " : msg;
      throw new AssertionError(
        msg + 'Invalid operator "' + operator + '"',
        void 0,
        assert$1.operator
      );
  }
  var test2 = new Assertion(ok, msg, assert$1.operator, true);
  test2.assert(
    true === flag(test2, "object"),
    "expected " + inspect2(val) + " to be " + operator + " " + inspect2(val2),
    "expected " + inspect2(val) + " to not be " + operator + " " + inspect2(val2)
  );
};
assert$1.closeTo = function(act, exp, delta, msg) {
  new Assertion(act, msg, assert$1.closeTo, true).to.be.closeTo(exp, delta);
};
assert$1.approximately = function(act, exp, delta, msg) {
  new Assertion(act, msg, assert$1.approximately, true).to.be.approximately(exp, delta);
};
assert$1.sameMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.sameMembers, true).to.have.same.members(set2);
};
assert$1.notSameMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.notSameMembers, true).to.not.have.same.members(set2);
};
assert$1.sameDeepMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.sameDeepMembers, true).to.have.same.deep.members(set2);
};
assert$1.notSameDeepMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.notSameDeepMembers, true).to.not.have.same.deep.members(set2);
};
assert$1.sameOrderedMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.sameOrderedMembers, true).to.have.same.ordered.members(set2);
};
assert$1.notSameOrderedMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.notSameOrderedMembers, true).to.not.have.same.ordered.members(set2);
};
assert$1.sameDeepOrderedMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.sameDeepOrderedMembers, true).to.have.same.deep.ordered.members(set2);
};
assert$1.notSameDeepOrderedMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert$1.notSameDeepOrderedMembers, true).to.not.have.same.deep.ordered.members(set2);
};
assert$1.includeMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.includeMembers, true).to.include.members(subset);
};
assert$1.notIncludeMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.notIncludeMembers, true).to.not.include.members(subset);
};
assert$1.includeDeepMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.includeDeepMembers, true).to.include.deep.members(subset);
};
assert$1.notIncludeDeepMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.notIncludeDeepMembers, true).to.not.include.deep.members(subset);
};
assert$1.includeOrderedMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.includeOrderedMembers, true).to.include.ordered.members(subset);
};
assert$1.notIncludeOrderedMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.notIncludeOrderedMembers, true).to.not.include.ordered.members(subset);
};
assert$1.includeDeepOrderedMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.includeDeepOrderedMembers, true).to.include.deep.ordered.members(subset);
};
assert$1.notIncludeDeepOrderedMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert$1.notIncludeDeepOrderedMembers, true).to.not.include.deep.ordered.members(subset);
};
assert$1.oneOf = function(inList, list, msg) {
  new Assertion(inList, msg, assert$1.oneOf, true).to.be.oneOf(list);
};
assert$1.isIterable = function(obj, msg) {
  if (obj == void 0 || !obj[Symbol.iterator]) {
    msg = msg ? `${msg} expected ${inspect2(obj)} to be an iterable` : `expected ${inspect2(obj)} to be an iterable`;
    throw new AssertionError(
      msg,
      void 0,
      assert$1.isIterable
    );
  }
};
assert$1.changes = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.changes, true).to.change(obj, prop);
};
assert$1.changesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.changesBy, true).to.change(obj, prop).by(delta);
};
assert$1.doesNotChange = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.doesNotChange, true).to.not.change(obj, prop);
};
assert$1.changesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.changesButNotBy, true).to.change(obj, prop).but.not.by(delta);
};
assert$1.increases = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.increases, true).to.increase(obj, prop);
};
assert$1.increasesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.increasesBy, true).to.increase(obj, prop).by(delta);
};
assert$1.doesNotIncrease = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.doesNotIncrease, true).to.not.increase(obj, prop);
};
assert$1.increasesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.increasesButNotBy, true).to.increase(obj, prop).but.not.by(delta);
};
assert$1.decreases = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.decreases, true).to.decrease(obj, prop);
};
assert$1.decreasesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.decreasesBy, true).to.decrease(obj, prop).by(delta);
};
assert$1.doesNotDecrease = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.doesNotDecrease, true).to.not.decrease(obj, prop);
};
assert$1.doesNotDecreaseBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert$1.doesNotDecreaseBy, true).to.not.decrease(obj, prop).by(delta);
};
assert$1.decreasesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    var tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert$1.decreasesButNotBy, true).to.decrease(obj, prop).but.not.by(delta);
};
assert$1.ifError = function(val) {
  if (val) {
    throw val;
  }
};
assert$1.isExtensible = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isExtensible, true).to.be.extensible;
};
assert$1.isNotExtensible = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isNotExtensible, true).to.not.be.extensible;
};
assert$1.isSealed = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isSealed, true).to.be.sealed;
};
assert$1.isNotSealed = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isNotSealed, true).to.not.be.sealed;
};
assert$1.isFrozen = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isFrozen, true).to.be.frozen;
};
assert$1.isNotFrozen = function(obj, msg) {
  new Assertion(obj, msg, assert$1.isNotFrozen, true).to.not.be.frozen;
};
assert$1.isEmpty = function(val, msg) {
  new Assertion(val, msg, assert$1.isEmpty, true).to.be.empty;
};
assert$1.isNotEmpty = function(val, msg) {
  new Assertion(val, msg, assert$1.isNotEmpty, true).to.not.be.empty;
};
(/* @__PURE__ */ __name(function alias(name, as) {
  assert$1[as] = assert$1[name];
  return alias;
}, "alias"))("isOk", "ok")("isNotOk", "notOk")("throws", "throw")("throws", "Throw")("isExtensible", "extensible")("isNotExtensible", "notExtensible")("isSealed", "sealed")("isNotSealed", "notSealed")("isFrozen", "frozen")("isNotFrozen", "notFrozen")("isEmpty", "empty")("isNotEmpty", "notEmpty")("isCallable", "isFunction")("isNotCallable", "isNotFunction");

// lib/chai.js
var used = [];
function use(fn) {
  const exports = {
    AssertionError,
    util: utils_exports,
    config,
    expect,
    assert: assert$1,
    Assertion,
    ...should_exports
  };
  if (!~used.indexOf(fn)) {
    fn(exports, utils_exports);
    used.push(fn);
  }
  return exports;
}
__name(use, "use");
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - expectTypes utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - isProxyEnabled helper
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - addLengthGuard utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - proxify utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - compareByInspect utility
 * Copyright(c) 2011-2016 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - getOwnEnumerablePropertySymbols utility
 * Copyright(c) 2011-2016 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - getOwnEnumerableProperties utility
 * Copyright(c) 2011-2016 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * Chai - isNaN utility
 * Copyright(c) 2012-2015 Sakthipriyan Vairamani <thechargingvolcano@gmail.com>
 * MIT Licensed
 */
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
/*! Bundled license information:

deep-eql/index.js:
  (*!
   * deep-eql
   * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
   * MIT Licensed
   *)
  (*!
   * Check to see if the MemoizeMap has recorded a result of the two operands
   *
   * @param {Mixed} leftHandOperand
   * @param {Mixed} rightHandOperand
   * @param {MemoizeMap} memoizeMap
   * @returns {Boolean|null} result
  *)
  (*!
   * Set the result of the equality into the MemoizeMap
   *
   * @param {Mixed} leftHandOperand
   * @param {Mixed} rightHandOperand
   * @param {MemoizeMap} memoizeMap
   * @param {Boolean} result
  *)
  (*!
   * Primary Export
   *)
  (*!
   * The main logic of the `deepEqual` function.
   *
   * @param {Mixed} leftHandOperand
   * @param {Mixed} rightHandOperand
   * @param {Object} [options] (optional) Additional options
   * @param {Array} [options.comparator] (optional) Override default algorithm, determining custom equality.
   * @param {Array} [options.memoize] (optional) Provide a custom memoization object which will cache the results of
      complex objects for a speed boost. By passing `false` you can disable memoization, but this will cause circular
      references to blow the stack.
   * @return {Boolean} equal match
  *)
  (*!
   * Compare two Regular Expressions for equality.
   *
   * @param {RegExp} leftHandOperand
   * @param {RegExp} rightHandOperand
   * @return {Boolean} result
   *)
  (*!
   * Compare two Sets/Maps for equality. Faster than other equality functions.
   *
   * @param {Set} leftHandOperand
   * @param {Set} rightHandOperand
   * @param {Object} [options] (Optional)
   * @return {Boolean} result
   *)
  (*!
   * Simple equality for flat iterable objects such as Arrays, TypedArrays or Node.js buffers.
   *
   * @param {Iterable} leftHandOperand
   * @param {Iterable} rightHandOperand
   * @param {Object} [options] (Optional)
   * @return {Boolean} result
   *)
  (*!
   * Simple equality for generator objects such as those returned by generator functions.
   *
   * @param {Iterable} leftHandOperand
   * @param {Iterable} rightHandOperand
   * @param {Object} [options] (Optional)
   * @return {Boolean} result
   *)
  (*!
   * Determine if the given object has an @@iterator function.
   *
   * @param {Object} target
   * @return {Boolean} `true` if the object has an @@iterator function.
   *)
  (*!
   * Gets all iterator entries from the given Object. If the Object has no @@iterator function, returns an empty array.
   * This will consume the iterator - which could have side effects depending on the @@iterator implementation.
   *
   * @param {Object} target
   * @returns {Array} an array of entries from the @@iterator function
   *)
  (*!
   * Gets all entries from a Generator. This will consume the generator - which could have side effects.
   *
   * @param {Generator} target
   * @returns {Array} an array of entries from the Generator.
   *)
  (*!
   * Gets all own and inherited enumerable keys from a target.
   *
   * @param {Object} target
   * @returns {Array} an array of own and inherited enumerable keys from the target.
   *)
  (*!
   * Determines if two objects have matching values, given a set of keys. Defers to deepEqual for the equality check of
   * each key. If any value of the given key is not equal, the function will return false (early).
   *
   * @param {Mixed} leftHandOperand
   * @param {Mixed} rightHandOperand
   * @param {Array} keys An array of keys to compare the values of leftHandOperand and rightHandOperand against
   * @param {Object} [options] (Optional)
   * @return {Boolean} result
   *)
  (*!
   * Recursively check the equality of two Objects. Once basic sameness has been established it will defer to `deepEqual`
   * for each enumerable key in the object.
   *
   * @param {Mixed} leftHandOperand
   * @param {Mixed} rightHandOperand
   * @param {Object} [options] (Optional)
   * @return {Boolean} result
   *)
  (*!
   * Returns true if the argument is a primitive.
   *
   * This intentionally returns true for all objects that can be compared by reference,
   * including functions and symbols.
   *
   * @param {Mixed} value
   * @return {Boolean} result
   *)
*/

const chai$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    Assertion,
    AssertionError,
    Should,
    assert: assert$1,
    config,
    expect,
    should,
    use,
    util: utils_exports
}, Symbol.toStringTag, { value: 'Module' }));

const MATCHERS_OBJECT = Symbol.for("matchers-object");
const JEST_MATCHERS_OBJECT = Symbol.for("$$jest-matchers-object");
const GLOBAL_EXPECT = Symbol.for("expect-global");
const ASYMMETRIC_MATCHERS_OBJECT = Symbol.for(
  "asymmetric-matchers-object"
);

const customMatchers = {
  toSatisfy(actual, expected, message) {
    const { printReceived, printExpected, matcherHint } = this.utils;
    const pass = expected(actual);
    return {
      pass,
      message: () => pass ? `${matcherHint(".not.toSatisfy", "received", "")}

Expected value to not satisfy:
${message || printExpected(expected)}
Received:
${printReceived(actual)}` : `${matcherHint(".toSatisfy", "received", "")}

Expected value to satisfy:
${message || printExpected(expected)}

Received:
${printReceived(actual)}`
    };
  },
  toBeOneOf(actual, expected) {
    const { equals, customTesters } = this;
    const { printReceived, printExpected, matcherHint } = this.utils;
    if (!Array.isArray(expected)) {
      throw new TypeError(
        `You must provide an array to ${matcherHint(".toBeOneOf")}, not '${typeof expected}'.`
      );
    }
    const pass = expected.length === 0 || expected.some(
      (item) => equals(item, actual, customTesters)
    );
    return {
      pass,
      message: () => pass ? `${matcherHint(".not.toBeOneOf", "received", "")}

Expected value to not be one of:
${printExpected(expected)}
Received:
${printReceived(actual)}` : `${matcherHint(".toBeOneOf", "received", "")}

Expected value to be one of:
${printExpected(expected)}

Received:
${printReceived(actual)}`
    };
  }
};

const EXPECTED_COLOR = s.green;
const RECEIVED_COLOR = s.red;
const INVERTED_COLOR = s.inverse;
const BOLD_WEIGHT = s.bold;
const DIM_COLOR = s.dim;
function matcherHint(matcherName, received = "received", expected = "expected", options = {}) {
  const {
    comment = "",
    isDirectExpectCall = false,
    // seems redundant with received === ''
    isNot = false,
    promise = "",
    secondArgument = "",
    expectedColor = EXPECTED_COLOR,
    receivedColor = RECEIVED_COLOR,
    secondArgumentColor = EXPECTED_COLOR
  } = options;
  let hint = "";
  let dimString = "expect";
  if (!isDirectExpectCall && received !== "") {
    hint += DIM_COLOR(`${dimString}(`) + receivedColor(received);
    dimString = ")";
  }
  if (promise !== "") {
    hint += DIM_COLOR(`${dimString}.`) + promise;
    dimString = "";
  }
  if (isNot) {
    hint += `${DIM_COLOR(`${dimString}.`)}not`;
    dimString = "";
  }
  if (matcherName.includes(".")) {
    dimString += matcherName;
  } else {
    hint += DIM_COLOR(`${dimString}.`) + matcherName;
    dimString = "";
  }
  if (expected === "") {
    dimString += "()";
  } else {
    hint += DIM_COLOR(`${dimString}(`) + expectedColor(expected);
    if (secondArgument) {
      hint += DIM_COLOR(", ") + secondArgumentColor(secondArgument);
    }
    dimString = ")";
  }
  if (comment !== "") {
    dimString += ` // ${comment}`;
  }
  if (dimString !== "") {
    hint += DIM_COLOR(dimString);
  }
  return hint;
}
const SPACE_SYMBOL = "\xB7";
function replaceTrailingSpaces(text) {
  return text.replace(/\s+$/gm, (spaces) => SPACE_SYMBOL.repeat(spaces.length));
}
function printReceived(object) {
  return RECEIVED_COLOR(replaceTrailingSpaces(stringify(object)));
}
function printExpected(value) {
  return EXPECTED_COLOR(replaceTrailingSpaces(stringify(value)));
}
function getMatcherUtils() {
  return {
    EXPECTED_COLOR,
    RECEIVED_COLOR,
    INVERTED_COLOR,
    BOLD_WEIGHT,
    DIM_COLOR,
    diff,
    matcherHint,
    printReceived,
    printExpected,
    printDiffOrStringify
  };
}
function addCustomEqualityTesters(newTesters) {
  if (!Array.isArray(newTesters)) {
    throw new TypeError(
      `expect.customEqualityTesters: Must be set to an array of Testers. Was given "${getType$1(
        newTesters
      )}"`
    );
  }
  globalThis[JEST_MATCHERS_OBJECT].customEqualityTesters.push(
    ...newTesters
  );
}
function getCustomEqualityTesters() {
  return globalThis[JEST_MATCHERS_OBJECT].customEqualityTesters;
}

function equals(a, b, customTesters, strictCheck) {
  customTesters = customTesters || [];
  return eq(a, b, [], [], customTesters, strictCheck ? hasKey : hasDefinedKey);
}
const functionToString = Function.prototype.toString;
function isAsymmetric(obj) {
  return !!obj && typeof obj === "object" && "asymmetricMatch" in obj && isA("Function", obj.asymmetricMatch);
}
function hasAsymmetric(obj, seen = /* @__PURE__ */ new Set()) {
  if (seen.has(obj)) {
    return false;
  }
  seen.add(obj);
  if (isAsymmetric(obj)) {
    return true;
  }
  if (Array.isArray(obj)) {
    return obj.some((i) => hasAsymmetric(i, seen));
  }
  if (obj instanceof Set) {
    return Array.from(obj).some((i) => hasAsymmetric(i, seen));
  }
  if (isObject$1(obj)) {
    return Object.values(obj).some((v) => hasAsymmetric(v, seen));
  }
  return false;
}
function asymmetricMatch(a, b) {
  const asymmetricA = isAsymmetric(a);
  const asymmetricB = isAsymmetric(b);
  if (asymmetricA && asymmetricB) {
    return undefined;
  }
  if (asymmetricA) {
    return a.asymmetricMatch(b);
  }
  if (asymmetricB) {
    return b.asymmetricMatch(a);
  }
}
function eq(a, b, aStack, bStack, customTesters, hasKey2) {
  let result = true;
  const asymmetricResult = asymmetricMatch(a, b);
  if (asymmetricResult !== undefined) {
    return asymmetricResult;
  }
  const testerContext = { equals };
  for (let i = 0; i < customTesters.length; i++) {
    const customTesterResult = customTesters[i].call(
      testerContext,
      a,
      b,
      customTesters
    );
    if (customTesterResult !== undefined) {
      return customTesterResult;
    }
  }
  if (typeof URL === "function" && a instanceof URL && b instanceof URL) {
    return a.href === b.href;
  }
  if (Object.is(a, b)) {
    return true;
  }
  if (a === null || b === null) {
    return a === b;
  }
  const className = Object.prototype.toString.call(a);
  if (className !== Object.prototype.toString.call(b)) {
    return false;
  }
  switch (className) {
    case "[object Boolean]":
    case "[object String]":
    case "[object Number]":
      if (typeof a !== typeof b) {
        return false;
      } else if (typeof a !== "object" && typeof b !== "object") {
        return Object.is(a, b);
      } else {
        return Object.is(a.valueOf(), b.valueOf());
      }
    case "[object Date]": {
      const numA = +a;
      const numB = +b;
      return numA === numB || Number.isNaN(numA) && Number.isNaN(numB);
    }
    // RegExps are compared by their source patterns and flags.
    case "[object RegExp]":
      return a.source === b.source && a.flags === b.flags;
  }
  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }
  if (isDomNode(a) && isDomNode(b)) {
    return a.isEqualNode(b);
  }
  let length = aStack.length;
  while (length--) {
    if (aStack[length] === a) {
      return bStack[length] === b;
    } else if (bStack[length] === b) {
      return false;
    }
  }
  aStack.push(a);
  bStack.push(b);
  if (className === "[object Array]" && a.length !== b.length) {
    return false;
  }
  if (a instanceof Error && b instanceof Error) {
    try {
      return isErrorEqual(a, b, aStack, bStack, customTesters, hasKey2);
    } finally {
      aStack.pop();
      bStack.pop();
    }
  }
  const aKeys = keys(a, hasKey2);
  let key;
  let size = aKeys.length;
  if (keys(b, hasKey2).length !== size) {
    return false;
  }
  while (size--) {
    key = aKeys[size];
    result = hasKey2(b, key) && eq(a[key], b[key], aStack, bStack, customTesters, hasKey2);
    if (!result) {
      return false;
    }
  }
  aStack.pop();
  bStack.pop();
  return result;
}
function isErrorEqual(a, b, aStack, bStack, customTesters, hasKey2) {
  let result = Object.getPrototypeOf(a) === Object.getPrototypeOf(b) && a.name === b.name && a.message === b.message;
  if (typeof b.cause !== "undefined") {
    result && (result = eq(a.cause, b.cause, aStack, bStack, customTesters, hasKey2));
  }
  if (a instanceof AggregateError && b instanceof AggregateError) {
    result && (result = eq(a.errors, b.errors, aStack, bStack, customTesters, hasKey2));
  }
  result && (result = eq({ ...a }, { ...b }, aStack, bStack, customTesters, hasKey2));
  return result;
}
function keys(obj, hasKey2) {
  const keys2 = [];
  for (const key in obj) {
    if (hasKey2(obj, key)) {
      keys2.push(key);
    }
  }
  return keys2.concat(
    Object.getOwnPropertySymbols(obj).filter(
      (symbol) => Object.getOwnPropertyDescriptor(obj, symbol).enumerable
    )
  );
}
function hasDefinedKey(obj, key) {
  return hasKey(obj, key) && obj[key] !== undefined;
}
function hasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isA(typeName, value) {
  return Object.prototype.toString.apply(value) === `[object ${typeName}]`;
}
function isDomNode(obj) {
  return obj !== null && typeof obj === "object" && "nodeType" in obj && typeof obj.nodeType === "number" && "nodeName" in obj && typeof obj.nodeName === "string" && "isEqualNode" in obj && typeof obj.isEqualNode === "function";
}
function fnNameFor(func) {
  if (func.name) {
    return func.name;
  }
  const matches = functionToString.call(func).match(/^(?:async)?\s*function\s*(?:\*\s*)?([\w$]+)\s*\(/);
  return matches ? matches[1] : "<anonymous>";
}
function getPrototype(obj) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(obj);
  }
  if (obj.constructor.prototype === obj) {
    return null;
  }
  return obj.constructor.prototype;
}
function hasProperty(obj, property) {
  if (!obj) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(obj, property)) {
    return true;
  }
  return hasProperty(getPrototype(obj), property);
}
const IS_KEYED_SENTINEL = "@@__IMMUTABLE_KEYED__@@";
const IS_SET_SENTINEL = "@@__IMMUTABLE_SET__@@";
const IS_LIST_SENTINEL = "@@__IMMUTABLE_LIST__@@";
const IS_ORDERED_SENTINEL = "@@__IMMUTABLE_ORDERED__@@";
const IS_RECORD_SYMBOL = "@@__IMMUTABLE_RECORD__@@";
function isImmutableUnorderedKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL] && !maybeKeyed[IS_ORDERED_SENTINEL]);
}
function isImmutableUnorderedSet(maybeSet) {
  return !!(maybeSet && maybeSet[IS_SET_SENTINEL] && !maybeSet[IS_ORDERED_SENTINEL]);
}
function isObjectLiteral(source) {
  return source != null && typeof source === "object" && !Array.isArray(source);
}
function isImmutableList(source) {
  return Boolean(source && isObjectLiteral(source) && source[IS_LIST_SENTINEL]);
}
function isImmutableOrderedKeyed(source) {
  return Boolean(
    source && isObjectLiteral(source) && source[IS_KEYED_SENTINEL] && source[IS_ORDERED_SENTINEL]
  );
}
function isImmutableOrderedSet(source) {
  return Boolean(
    source && isObjectLiteral(source) && source[IS_SET_SENTINEL] && source[IS_ORDERED_SENTINEL]
  );
}
function isImmutableRecord(source) {
  return Boolean(source && isObjectLiteral(source) && source[IS_RECORD_SYMBOL]);
}
const IteratorSymbol = Symbol.iterator;
function hasIterator(object) {
  return !!(object != null && object[IteratorSymbol]);
}
function iterableEquality(a, b, customTesters = [], aStack = [], bStack = []) {
  if (typeof a !== "object" || typeof b !== "object" || Array.isArray(a) || Array.isArray(b) || !hasIterator(a) || !hasIterator(b)) {
    return undefined;
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  let length = aStack.length;
  while (length--) {
    if (aStack[length] === a) {
      return bStack[length] === b;
    }
  }
  aStack.push(a);
  bStack.push(b);
  const filteredCustomTesters = [
    ...customTesters.filter((t) => t !== iterableEquality),
    iterableEqualityWithStack
  ];
  function iterableEqualityWithStack(a2, b2) {
    return iterableEquality(a2, b2, [...customTesters], [...aStack], [...bStack]);
  }
  if (a.size !== undefined) {
    if (a.size !== b.size) {
      return false;
    } else if (isA("Set", a) || isImmutableUnorderedSet(a)) {
      let allFound = true;
      for (const aValue of a) {
        if (!b.has(aValue)) {
          let has = false;
          for (const bValue of b) {
            const isEqual = equals(aValue, bValue, filteredCustomTesters);
            if (isEqual === true) {
              has = true;
            }
          }
          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      aStack.pop();
      bStack.pop();
      return allFound;
    } else if (isA("Map", a) || isImmutableUnorderedKeyed(a)) {
      let allFound = true;
      for (const aEntry of a) {
        if (!b.has(aEntry[0]) || !equals(aEntry[1], b.get(aEntry[0]), filteredCustomTesters)) {
          let has = false;
          for (const bEntry of b) {
            const matchedKey = equals(
              aEntry[0],
              bEntry[0],
              filteredCustomTesters
            );
            let matchedValue = false;
            if (matchedKey === true) {
              matchedValue = equals(
                aEntry[1],
                bEntry[1],
                filteredCustomTesters
              );
            }
            if (matchedValue === true) {
              has = true;
            }
          }
          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      aStack.pop();
      bStack.pop();
      return allFound;
    }
  }
  const bIterator = b[IteratorSymbol]();
  for (const aValue of a) {
    const nextB = bIterator.next();
    if (nextB.done || !equals(aValue, nextB.value, filteredCustomTesters)) {
      return false;
    }
  }
  if (!bIterator.next().done) {
    return false;
  }
  if (!isImmutableList(a) && !isImmutableOrderedKeyed(a) && !isImmutableOrderedSet(a) && !isImmutableRecord(a)) {
    const aEntries = Object.entries(a);
    const bEntries = Object.entries(b);
    if (!equals(aEntries, bEntries)) {
      return false;
    }
  }
  aStack.pop();
  bStack.pop();
  return true;
}
function hasPropertyInObject(object, key) {
  const shouldTerminate = !object || typeof object !== "object" || object === Object.prototype;
  if (shouldTerminate) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(object, key) || hasPropertyInObject(Object.getPrototypeOf(object), key);
}
function isObjectWithKeys(a) {
  return isObject$1(a) && !(a instanceof Error) && !Array.isArray(a) && !(a instanceof Date);
}
function subsetEquality(object, subset, customTesters = []) {
  const filteredCustomTesters = customTesters.filter(
    (t) => t !== subsetEquality
  );
  const subsetEqualityWithContext = (seenReferences = /* @__PURE__ */ new WeakMap()) => (object2, subset2) => {
    if (!isObjectWithKeys(subset2)) {
      return undefined;
    }
    return Object.keys(subset2).every((key) => {
      if (subset2[key] != null && typeof subset2[key] === "object") {
        if (seenReferences.has(subset2[key])) {
          return equals(object2[key], subset2[key], filteredCustomTesters);
        }
        seenReferences.set(subset2[key], true);
      }
      const result = object2 != null && hasPropertyInObject(object2, key) && equals(object2[key], subset2[key], [
        ...filteredCustomTesters,
        subsetEqualityWithContext(seenReferences)
      ]);
      seenReferences.delete(subset2[key]);
      return result;
    });
  };
  return subsetEqualityWithContext()(object, subset);
}
function typeEquality(a, b) {
  if (a == null || b == null || a.constructor === b.constructor) {
    return undefined;
  }
  return false;
}
function arrayBufferEquality(a, b) {
  let dataViewA = a;
  let dataViewB = b;
  if (!(a instanceof DataView && b instanceof DataView)) {
    if (!(a instanceof ArrayBuffer) || !(b instanceof ArrayBuffer)) {
      return undefined;
    }
    try {
      dataViewA = new DataView(a);
      dataViewB = new DataView(b);
    } catch {
      return undefined;
    }
  }
  if (dataViewA.byteLength !== dataViewB.byteLength) {
    return false;
  }
  for (let i = 0; i < dataViewA.byteLength; i++) {
    if (dataViewA.getUint8(i) !== dataViewB.getUint8(i)) {
      return false;
    }
  }
  return true;
}
function sparseArrayEquality(a, b, customTesters = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return undefined;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const filteredCustomTesters = customTesters.filter(
    (t) => t !== sparseArrayEquality
  );
  return equals(a, b, filteredCustomTesters, true) && equals(aKeys, bKeys);
}
function generateToBeMessage(deepEqualityName, expected = "#{this}", actual = "#{exp}") {
  const toBeMessage = `expected ${expected} to be ${actual} // Object.is equality`;
  if (["toStrictEqual", "toEqual"].includes(deepEqualityName)) {
    return `${toBeMessage}

If it should pass with deep equality, replace "toBe" with "${deepEqualityName}"

Expected: ${expected}
Received: serializes to the same string
`;
  }
  return toBeMessage;
}
function pluralize(word, count) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
function getObjectKeys(object) {
  return [
    ...Object.keys(object),
    ...Object.getOwnPropertySymbols(object).filter(
      (s) => {
        var _a;
        return (_a = Object.getOwnPropertyDescriptor(object, s)) == null ? undefined : _a.enumerable;
      }
    )
  ];
}
function getObjectSubset(object, subset, customTesters) {
  let stripped = 0;
  const getObjectSubsetWithContext = (seenReferences = /* @__PURE__ */ new WeakMap()) => (object2, subset2) => {
    if (Array.isArray(object2)) {
      if (Array.isArray(subset2) && subset2.length === object2.length) {
        return subset2.map(
          (sub, i) => getObjectSubsetWithContext(seenReferences)(object2[i], sub)
        );
      }
    } else if (object2 instanceof Date) {
      return object2;
    } else if (isObject$1(object2) && isObject$1(subset2)) {
      if (equals(object2, subset2, [
        ...customTesters,
        iterableEquality,
        subsetEquality
      ])) {
        return subset2;
      }
      const trimmed = {};
      seenReferences.set(object2, trimmed);
      if (typeof object2.constructor === "function" && typeof object2.constructor.name === "string") {
        Object.defineProperty(trimmed, "constructor", {
          enumerable: false,
          value: object2.constructor
        });
      }
      for (const key of getObjectKeys(object2)) {
        if (hasPropertyInObject(subset2, key)) {
          trimmed[key] = seenReferences.has(object2[key]) ? seenReferences.get(object2[key]) : getObjectSubsetWithContext(seenReferences)(
            object2[key],
            subset2[key]
          );
        } else {
          if (!seenReferences.has(object2[key])) {
            stripped += 1;
            if (isObject$1(object2[key])) {
              stripped += getObjectKeys(object2[key]).length;
            }
            getObjectSubsetWithContext(seenReferences)(
              object2[key],
              subset2[key]
            );
          }
        }
      }
      if (getObjectKeys(trimmed).length > 0) {
        return trimmed;
      }
    }
    return object2;
  };
  return { subset: getObjectSubsetWithContext()(object, subset), stripped };
}

if (!Object.prototype.hasOwnProperty.call(globalThis, MATCHERS_OBJECT)) {
  const globalState = /* @__PURE__ */ new WeakMap();
  const matchers = /* @__PURE__ */ Object.create(null);
  const customEqualityTesters = [];
  const asymmetricMatchers = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(globalThis, MATCHERS_OBJECT, {
    get: () => globalState
  });
  Object.defineProperty(globalThis, JEST_MATCHERS_OBJECT, {
    configurable: true,
    get: () => ({
      state: globalState.get(globalThis[GLOBAL_EXPECT]),
      matchers,
      customEqualityTesters
    })
  });
  Object.defineProperty(globalThis, ASYMMETRIC_MATCHERS_OBJECT, {
    get: () => asymmetricMatchers
  });
}
function getState(expect) {
  return globalThis[MATCHERS_OBJECT].get(expect);
}
function setState(state, expect) {
  const map = globalThis[MATCHERS_OBJECT];
  const current = map.get(expect) || {};
  const results = Object.defineProperties(current, {
    ...Object.getOwnPropertyDescriptors(current),
    ...Object.getOwnPropertyDescriptors(state)
  });
  map.set(expect, results);
}

let AsymmetricMatcher$1 = class AsymmetricMatcher {
  constructor(sample, inverse = false) {
    this.sample = sample;
    this.inverse = inverse;
  }
  // should have "jest" to be compatible with its ecosystem
  $$typeof = Symbol.for("jest.asymmetricMatcher");
  getMatcherContext(expect) {
    return {
      ...getState(expect || globalThis[GLOBAL_EXPECT]),
      equals,
      isNot: this.inverse,
      customTesters: getCustomEqualityTesters(),
      utils: {
        ...getMatcherUtils(),
        diff,
        stringify,
        iterableEquality,
        subsetEquality
      }
    };
  }
  // implement custom chai/loupe inspect for better AssertionError.message formatting
  // https://github.com/chaijs/loupe/blob/9b8a6deabcd50adc056a64fb705896194710c5c6/src/index.ts#L29
  [Symbol.for("chai/inspect")](options) {
    const result = stringify(this, options.depth, { min: true });
    if (result.length <= options.truncate) {
      return result;
    }
    return `${this.toString()}{\u2026}`;
  }
};
class StringContaining extends AsymmetricMatcher$1 {
  constructor(sample, inverse = false) {
    if (!isA("String", sample)) {
      throw new Error("Expected is not a string");
    }
    super(sample, inverse);
  }
  asymmetricMatch(other) {
    const result = isA("String", other) && other.includes(this.sample);
    return this.inverse ? !result : result;
  }
  toString() {
    return `String${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "string";
  }
}
class Anything extends AsymmetricMatcher$1 {
  asymmetricMatch(other) {
    return other != null;
  }
  toString() {
    return "Anything";
  }
  toAsymmetricMatcher() {
    return "Anything";
  }
}
class ObjectContaining extends AsymmetricMatcher$1 {
  constructor(sample, inverse = false) {
    super(sample, inverse);
  }
  getPrototype(obj) {
    if (Object.getPrototypeOf) {
      return Object.getPrototypeOf(obj);
    }
    if (obj.constructor.prototype === obj) {
      return null;
    }
    return obj.constructor.prototype;
  }
  hasProperty(obj, property) {
    if (!obj) {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(obj, property)) {
      return true;
    }
    return this.hasProperty(this.getPrototype(obj), property);
  }
  asymmetricMatch(other) {
    if (typeof this.sample !== "object") {
      throw new TypeError(
        `You must provide an object to ${this.toString()}, not '${typeof this.sample}'.`
      );
    }
    let result = true;
    const matcherContext = this.getMatcherContext();
    for (const property in this.sample) {
      if (!this.hasProperty(other, property) || !equals(
        this.sample[property],
        other[property],
        matcherContext.customTesters
      )) {
        result = false;
        break;
      }
    }
    return this.inverse ? !result : result;
  }
  toString() {
    return `Object${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "object";
  }
}
class ArrayContaining extends AsymmetricMatcher$1 {
  constructor(sample, inverse = false) {
    super(sample, inverse);
  }
  asymmetricMatch(other) {
    if (!Array.isArray(this.sample)) {
      throw new TypeError(
        `You must provide an array to ${this.toString()}, not '${typeof this.sample}'.`
      );
    }
    const matcherContext = this.getMatcherContext();
    const result = this.sample.length === 0 || Array.isArray(other) && this.sample.every(
      (item) => other.some(
        (another) => equals(item, another, matcherContext.customTesters)
      )
    );
    return this.inverse ? !result : result;
  }
  toString() {
    return `Array${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "array";
  }
}
class Any extends AsymmetricMatcher$1 {
  constructor(sample) {
    if (typeof sample === "undefined") {
      throw new TypeError(
        "any() expects to be passed a constructor function. Please pass one or use anything() to match any object."
      );
    }
    super(sample);
  }
  fnNameFor(func) {
    if (func.name) {
      return func.name;
    }
    const functionToString = Function.prototype.toString;
    const matches = functionToString.call(func).match(/^(?:async)?\s*function\s*(?:\*\s*)?([\w$]+)\s*\(/);
    return matches ? matches[1] : "<anonymous>";
  }
  asymmetricMatch(other) {
    if (this.sample === String) {
      return typeof other == "string" || other instanceof String;
    }
    if (this.sample === Number) {
      return typeof other == "number" || other instanceof Number;
    }
    if (this.sample === Function) {
      return typeof other == "function" || other instanceof Function;
    }
    if (this.sample === Boolean) {
      return typeof other == "boolean" || other instanceof Boolean;
    }
    if (this.sample === BigInt) {
      return typeof other == "bigint" || other instanceof BigInt;
    }
    if (this.sample === Symbol) {
      return typeof other == "symbol" || other instanceof Symbol;
    }
    if (this.sample === Object) {
      return typeof other == "object";
    }
    return other instanceof this.sample;
  }
  toString() {
    return "Any";
  }
  getExpectedType() {
    if (this.sample === String) {
      return "string";
    }
    if (this.sample === Number) {
      return "number";
    }
    if (this.sample === Function) {
      return "function";
    }
    if (this.sample === Object) {
      return "object";
    }
    if (this.sample === Boolean) {
      return "boolean";
    }
    return this.fnNameFor(this.sample);
  }
  toAsymmetricMatcher() {
    return `Any<${this.fnNameFor(this.sample)}>`;
  }
}
class StringMatching extends AsymmetricMatcher$1 {
  constructor(sample, inverse = false) {
    if (!isA("String", sample) && !isA("RegExp", sample)) {
      throw new Error("Expected is not a String or a RegExp");
    }
    super(new RegExp(sample), inverse);
  }
  asymmetricMatch(other) {
    const result = isA("String", other) && this.sample.test(other);
    return this.inverse ? !result : result;
  }
  toString() {
    return `String${this.inverse ? "Not" : ""}Matching`;
  }
  getExpectedType() {
    return "string";
  }
}
class CloseTo extends AsymmetricMatcher$1 {
  precision;
  constructor(sample, precision = 2, inverse = false) {
    if (!isA("Number", sample)) {
      throw new Error("Expected is not a Number");
    }
    if (!isA("Number", precision)) {
      throw new Error("Precision is not a Number");
    }
    super(sample);
    this.inverse = inverse;
    this.precision = precision;
  }
  asymmetricMatch(other) {
    if (!isA("Number", other)) {
      return false;
    }
    let result = false;
    if (other === Number.POSITIVE_INFINITY && this.sample === Number.POSITIVE_INFINITY) {
      result = true;
    } else if (other === Number.NEGATIVE_INFINITY && this.sample === Number.NEGATIVE_INFINITY) {
      result = true;
    } else {
      result = Math.abs(this.sample - other) < 10 ** -this.precision / 2;
    }
    return this.inverse ? !result : result;
  }
  toString() {
    return `Number${this.inverse ? "Not" : ""}CloseTo`;
  }
  getExpectedType() {
    return "number";
  }
  toAsymmetricMatcher() {
    return [
      this.toString(),
      this.sample,
      `(${pluralize("digit", this.precision)})`
    ].join(" ");
  }
}
const JestAsymmetricMatchers = (chai, utils) => {
  utils.addMethod(chai.expect, "anything", () => new Anything());
  utils.addMethod(chai.expect, "any", (expected) => new Any(expected));
  utils.addMethod(
    chai.expect,
    "stringContaining",
    (expected) => new StringContaining(expected)
  );
  utils.addMethod(
    chai.expect,
    "objectContaining",
    (expected) => new ObjectContaining(expected)
  );
  utils.addMethod(
    chai.expect,
    "arrayContaining",
    (expected) => new ArrayContaining(expected)
  );
  utils.addMethod(
    chai.expect,
    "stringMatching",
    (expected) => new StringMatching(expected)
  );
  utils.addMethod(
    chai.expect,
    "closeTo",
    (expected, precision) => new CloseTo(expected, precision)
  );
  chai.expect.not = {
    stringContaining: (expected) => new StringContaining(expected, true),
    objectContaining: (expected) => new ObjectContaining(expected, true),
    arrayContaining: (expected) => new ArrayContaining(expected, true),
    stringMatching: (expected) => new StringMatching(expected, true),
    closeTo: (expected, precision) => new CloseTo(expected, precision, true)
  };
};

function createAssertionMessage$1(util, assertion, hasArgs) {
  const not = util.flag(assertion, "negate") ? "not." : "";
  const name = `${util.flag(assertion, "_name")}(${hasArgs ? "expected" : ""})`;
  const promiseName = util.flag(assertion, "promise");
  const promise = promiseName ? `.${promiseName}` : "";
  return `expect(actual)${promise}.${not}${name}`;
}
function recordAsyncExpect$1(_test, promise, assertion, error) {
  const test = _test;
  if (test && promise instanceof Promise) {
    promise = promise.finally(() => {
      if (!test.promises) {
        return;
      }
      const index = test.promises.indexOf(promise);
      if (index !== -1) {
        test.promises.splice(index, 1);
      }
    });
    if (!test.promises) {
      test.promises = [];
    }
    test.promises.push(promise);
    let resolved = false;
    test.onFinished ?? (test.onFinished = []);
    test.onFinished.push(() => {
      var _a;
      if (!resolved) {
        const processor = ((_a = globalThis.__vitest_worker__) == null ? undefined : _a.onFilterStackTrace) || ((s) => s || "");
        const stack = processor(error.stack);
        console.warn([
          `Promise returned by \`${assertion}\` was not awaited. `,
          "Vitest currently auto-awaits hanging assertions at the end of the test, but this will cause the test to fail in Vitest 3. ",
          "Please remember to await the assertion.\n",
          stack
        ].join(""));
      }
    });
    return {
      then(onFulfilled, onRejected) {
        resolved = true;
        return promise.then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return promise.catch(onRejected);
      },
      finally(onFinally) {
        return promise.finally(onFinally);
      },
      [Symbol.toStringTag]: "Promise"
    };
  }
  return promise;
}
function wrapAssertion(utils, name, fn) {
  return function(...args) {
    var _a;
    if (name !== "withTest") {
      utils.flag(this, "_name", name);
    }
    if (!utils.flag(this, "soft")) {
      return fn.apply(this, args);
    }
    const test = utils.flag(this, "vitest-test");
    if (!test) {
      throw new Error("expect.soft() can only be used inside a test");
    }
    try {
      return fn.apply(this, args);
    } catch (err) {
      test.result || (test.result = { state: "fail" });
      test.result.state = "fail";
      (_a = test.result).errors || (_a.errors = []);
      test.result.errors.push(processError(err));
    }
  };
}

const JestChaiExpect = (chai, utils) => {
  const { AssertionError } = chai;
  const customTesters = getCustomEqualityTesters();
  function def(name, fn) {
    const addMethod = (n) => {
      const softWrapper = wrapAssertion(utils, n, fn);
      utils.addMethod(chai.Assertion.prototype, n, softWrapper);
      utils.addMethod(
        globalThis[JEST_MATCHERS_OBJECT].matchers,
        n,
        softWrapper
      );
    };
    if (Array.isArray(name)) {
      name.forEach((n) => addMethod(n));
    } else {
      addMethod(name);
    }
  }
  ["throw", "throws", "Throw"].forEach((m) => {
    utils.overwriteMethod(chai.Assertion.prototype, m, (_super) => {
      return function(...args) {
        const promise = utils.flag(this, "promise");
        const object = utils.flag(this, "object");
        const isNot = utils.flag(this, "negate");
        if (promise === "rejects") {
          utils.flag(this, "object", () => {
            throw object;
          });
        } else if (promise === "resolves" && typeof object !== "function") {
          if (!isNot) {
            const message = utils.flag(this, "message") || "expected promise to throw an error, but it didn't";
            const error = {
              showDiff: false
            };
            throw new AssertionError(message, error, utils.flag(this, "ssfi"));
          } else {
            return;
          }
        }
        _super.apply(this, args);
      };
    });
  });
  def("withTest", function(test) {
    utils.flag(this, "vitest-test", test);
    return this;
  });
  def("toEqual", function(expected) {
    const actual = utils.flag(this, "object");
    const equal = equals(actual, expected, [
      ...customTesters,
      iterableEquality
    ]);
    return this.assert(
      equal,
      "expected #{this} to deeply equal #{exp}",
      "expected #{this} to not deeply equal #{exp}",
      expected,
      actual
    );
  });
  def("toStrictEqual", function(expected) {
    const obj = utils.flag(this, "object");
    const equal = equals(
      obj,
      expected,
      [
        ...customTesters,
        iterableEquality,
        typeEquality,
        sparseArrayEquality,
        arrayBufferEquality
      ],
      true
    );
    return this.assert(
      equal,
      "expected #{this} to strictly equal #{exp}",
      "expected #{this} to not strictly equal #{exp}",
      expected,
      obj
    );
  });
  def("toBe", function(expected) {
    const actual = this._obj;
    const pass = Object.is(actual, expected);
    let deepEqualityName = "";
    if (!pass) {
      const toStrictEqualPass = equals(
        actual,
        expected,
        [
          ...customTesters,
          iterableEquality,
          typeEquality,
          sparseArrayEquality,
          arrayBufferEquality
        ],
        true
      );
      if (toStrictEqualPass) {
        deepEqualityName = "toStrictEqual";
      } else {
        const toEqualPass = equals(actual, expected, [
          ...customTesters,
          iterableEquality
        ]);
        if (toEqualPass) {
          deepEqualityName = "toEqual";
        }
      }
    }
    return this.assert(
      pass,
      generateToBeMessage(deepEqualityName),
      "expected #{this} not to be #{exp} // Object.is equality",
      expected,
      actual
    );
  });
  def("toMatchObject", function(expected) {
    const actual = this._obj;
    const pass = equals(actual, expected, [
      ...customTesters,
      iterableEquality,
      subsetEquality
    ]);
    const isNot = utils.flag(this, "negate");
    const { subset: actualSubset, stripped } = getObjectSubset(
      actual,
      expected,
      customTesters
    );
    if (pass && isNot || !pass && !isNot) {
      const msg = utils.getMessage(this, [
        pass,
        "expected #{this} to match object #{exp}",
        "expected #{this} to not match object #{exp}",
        expected,
        actualSubset,
        false
      ]);
      const message = stripped === 0 ? msg : `${msg}
(${stripped} matching ${stripped === 1 ? "property" : "properties"} omitted from actual)`;
      throw new AssertionError(message, {
        showDiff: true,
        expected,
        actual: actualSubset
      });
    }
  });
  def("toMatch", function(expected) {
    const actual = this._obj;
    if (typeof actual !== "string") {
      throw new TypeError(
        `.toMatch() expects to receive a string, but got ${typeof actual}`
      );
    }
    return this.assert(
      typeof expected === "string" ? actual.includes(expected) : actual.match(expected),
      `expected #{this} to match #{exp}`,
      `expected #{this} not to match #{exp}`,
      expected,
      actual
    );
  });
  def("toContain", function(item) {
    const actual = this._obj;
    if (typeof Node !== "undefined" && actual instanceof Node) {
      if (!(item instanceof Node)) {
        throw new TypeError(
          `toContain() expected a DOM node as the argument, but got ${typeof item}`
        );
      }
      return this.assert(
        actual.contains(item),
        "expected #{this} to contain element #{exp}",
        "expected #{this} not to contain element #{exp}",
        item,
        actual
      );
    }
    if (typeof DOMTokenList !== "undefined" && actual instanceof DOMTokenList) {
      assertTypes(item, "class name", ["string"]);
      const isNot = utils.flag(this, "negate");
      const expectedClassList = isNot ? actual.value.replace(item, "").trim() : `${actual.value} ${item}`;
      return this.assert(
        actual.contains(item),
        `expected "${actual.value}" to contain "${item}"`,
        `expected "${actual.value}" not to contain "${item}"`,
        expectedClassList,
        actual.value
      );
    }
    if (typeof actual === "string" && typeof item === "string") {
      return this.assert(
        actual.includes(item),
        `expected #{this} to contain #{exp}`,
        `expected #{this} not to contain #{exp}`,
        item,
        actual
      );
    }
    if (actual != null && typeof actual !== "string") {
      utils.flag(this, "object", Array.from(actual));
    }
    return this.contain(item);
  });
  def("toContainEqual", function(expected) {
    const obj = utils.flag(this, "object");
    const index = Array.from(obj).findIndex((item) => {
      return equals(item, expected, customTesters);
    });
    this.assert(
      index !== -1,
      "expected #{this} to deep equally contain #{exp}",
      "expected #{this} to not deep equally contain #{exp}",
      expected
    );
  });
  def("toBeTruthy", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      Boolean(obj),
      "expected #{this} to be truthy",
      "expected #{this} to not be truthy",
      true,
      obj
    );
  });
  def("toBeFalsy", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      !obj,
      "expected #{this} to be falsy",
      "expected #{this} to not be falsy",
      false,
      obj
    );
  });
  def("toBeGreaterThan", function(expected) {
    const actual = this._obj;
    assertTypes(actual, "actual", ["number", "bigint"]);
    assertTypes(expected, "expected", ["number", "bigint"]);
    return this.assert(
      actual > expected,
      `expected ${actual} to be greater than ${expected}`,
      `expected ${actual} to be not greater than ${expected}`,
      expected,
      actual,
      false
    );
  });
  def("toBeGreaterThanOrEqual", function(expected) {
    const actual = this._obj;
    assertTypes(actual, "actual", ["number", "bigint"]);
    assertTypes(expected, "expected", ["number", "bigint"]);
    return this.assert(
      actual >= expected,
      `expected ${actual} to be greater than or equal to ${expected}`,
      `expected ${actual} to be not greater than or equal to ${expected}`,
      expected,
      actual,
      false
    );
  });
  def("toBeLessThan", function(expected) {
    const actual = this._obj;
    assertTypes(actual, "actual", ["number", "bigint"]);
    assertTypes(expected, "expected", ["number", "bigint"]);
    return this.assert(
      actual < expected,
      `expected ${actual} to be less than ${expected}`,
      `expected ${actual} to be not less than ${expected}`,
      expected,
      actual,
      false
    );
  });
  def("toBeLessThanOrEqual", function(expected) {
    const actual = this._obj;
    assertTypes(actual, "actual", ["number", "bigint"]);
    assertTypes(expected, "expected", ["number", "bigint"]);
    return this.assert(
      actual <= expected,
      `expected ${actual} to be less than or equal to ${expected}`,
      `expected ${actual} to be not less than or equal to ${expected}`,
      expected,
      actual,
      false
    );
  });
  def("toBeNaN", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      Number.isNaN(obj),
      "expected #{this} to be NaN",
      "expected #{this} not to be NaN",
      Number.NaN,
      obj
    );
  });
  def("toBeUndefined", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      undefined === obj,
      "expected #{this} to be undefined",
      "expected #{this} not to be undefined",
      undefined,
      obj
    );
  });
  def("toBeNull", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      obj === null,
      "expected #{this} to be null",
      "expected #{this} not to be null",
      null,
      obj
    );
  });
  def("toBeDefined", function() {
    const obj = utils.flag(this, "object");
    this.assert(
      typeof obj !== "undefined",
      "expected #{this} to be defined",
      "expected #{this} to be undefined",
      obj
    );
  });
  def(
    "toBeTypeOf",
    function(expected) {
      const actual = typeof this._obj;
      const equal = expected === actual;
      return this.assert(
        equal,
        "expected #{this} to be type of #{exp}",
        "expected #{this} not to be type of #{exp}",
        expected,
        actual
      );
    }
  );
  def("toBeInstanceOf", function(obj) {
    return this.instanceOf(obj);
  });
  def("toHaveLength", function(length) {
    return this.have.length(length);
  });
  def(
    "toHaveProperty",
    function(...args) {
      if (Array.isArray(args[0])) {
        args[0] = args[0].map((key) => String(key).replace(/([.[\]])/g, "\\$1")).join(".");
      }
      const actual = this._obj;
      const [propertyName, expected] = args;
      const getValue = () => {
        const hasOwn = Object.prototype.hasOwnProperty.call(
          actual,
          propertyName
        );
        if (hasOwn) {
          return { value: actual[propertyName], exists: true };
        }
        return utils.getPathInfo(actual, propertyName);
      };
      const { value, exists } = getValue();
      const pass = exists && (args.length === 1 || equals(expected, value, customTesters));
      const valueString = args.length === 1 ? "" : ` with value ${utils.objDisplay(expected)}`;
      return this.assert(
        pass,
        `expected #{this} to have property "${propertyName}"${valueString}`,
        `expected #{this} to not have property "${propertyName}"${valueString}`,
        expected,
        exists ? value : undefined
      );
    }
  );
  def("toBeCloseTo", function(received, precision = 2) {
    const expected = this._obj;
    let pass = false;
    let expectedDiff = 0;
    let receivedDiff = 0;
    if (received === Number.POSITIVE_INFINITY && expected === Number.POSITIVE_INFINITY) {
      pass = true;
    } else if (received === Number.NEGATIVE_INFINITY && expected === Number.NEGATIVE_INFINITY) {
      pass = true;
    } else {
      expectedDiff = 10 ** -precision / 2;
      receivedDiff = Math.abs(expected - received);
      pass = receivedDiff < expectedDiff;
    }
    return this.assert(
      pass,
      `expected #{this} to be close to #{exp}, received difference is ${receivedDiff}, but expected ${expectedDiff}`,
      `expected #{this} to not be close to #{exp}, received difference is ${receivedDiff}, but expected ${expectedDiff}`,
      received,
      expected,
      false
    );
  });
  function assertIsMock(assertion) {
    if (!isMockFunction(assertion._obj)) {
      throw new TypeError(
        `${utils.inspect(assertion._obj)} is not a spy or a call to a spy!`
      );
    }
  }
  function getSpy(assertion) {
    assertIsMock(assertion);
    return assertion._obj;
  }
  def(["toHaveBeenCalledTimes", "toBeCalledTimes"], function(number) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    return this.assert(
      callCount === number,
      `expected "${spyName}" to be called #{exp} times, but got ${callCount} times`,
      `expected "${spyName}" to not be called #{exp} times`,
      number,
      callCount,
      false
    );
  });
  def("toHaveBeenCalledOnce", function() {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    return this.assert(
      callCount === 1,
      `expected "${spyName}" to be called once, but got ${callCount} times`,
      `expected "${spyName}" to not be called once`,
      1,
      callCount,
      false
    );
  });
  def(["toHaveBeenCalled", "toBeCalled"], function() {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    const called = callCount > 0;
    const isNot = utils.flag(this, "negate");
    let msg = utils.getMessage(this, [
      called,
      `expected "${spyName}" to be called at least once`,
      `expected "${spyName}" to not be called at all, but actually been called ${callCount} times`,
      true,
      called
    ]);
    if (called && isNot) {
      msg = formatCalls(spy, msg);
    }
    if (called && isNot || !called && !isNot) {
      throw new AssertionError(msg);
    }
  });
  def(["toHaveBeenCalledWith", "toBeCalledWith"], function(...args) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const pass = spy.mock.calls.some(
      (callArg) => equals(callArg, args, [...customTesters, iterableEquality])
    );
    const isNot = utils.flag(this, "negate");
    const msg = utils.getMessage(this, [
      pass,
      `expected "${spyName}" to be called with arguments: #{exp}`,
      `expected "${spyName}" to not be called with arguments: #{exp}`,
      args
    ]);
    if (pass && isNot || !pass && !isNot) {
      throw new AssertionError(formatCalls(spy, msg, args));
    }
  });
  def("toHaveBeenCalledExactlyOnceWith", function(...args) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    const hasCallWithArgs = spy.mock.calls.some(
      (callArg) => equals(callArg, args, [...customTesters, iterableEquality])
    );
    const pass = hasCallWithArgs && callCount === 1;
    const isNot = utils.flag(this, "negate");
    const msg = utils.getMessage(this, [
      pass,
      `expected "${spyName}" to be called once with arguments: #{exp}`,
      `expected "${spyName}" to not be called once with arguments: #{exp}`,
      args
    ]);
    if (pass && isNot || !pass && !isNot) {
      throw new AssertionError(formatCalls(spy, msg, args));
    }
  });
  def(
    ["toHaveBeenNthCalledWith", "nthCalledWith"],
    function(times, ...args) {
      const spy = getSpy(this);
      const spyName = spy.getMockName();
      const nthCall = spy.mock.calls[times - 1];
      const callCount = spy.mock.calls.length;
      const isCalled = times <= callCount;
      this.assert(
        equals(nthCall, args, [...customTesters, iterableEquality]),
        `expected ${ordinalOf(
          times
        )} "${spyName}" call to have been called with #{exp}${isCalled ? `` : `, but called only ${callCount} times`}`,
        `expected ${ordinalOf(
          times
        )} "${spyName}" call to not have been called with #{exp}`,
        args,
        nthCall,
        isCalled
      );
    }
  );
  def(
    ["toHaveBeenLastCalledWith", "lastCalledWith"],
    function(...args) {
      const spy = getSpy(this);
      const spyName = spy.getMockName();
      const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
      this.assert(
        equals(lastCall, args, [...customTesters, iterableEquality]),
        `expected last "${spyName}" call to have been called with #{exp}`,
        `expected last "${spyName}" call to not have been called with #{exp}`,
        args,
        lastCall
      );
    }
  );
  function isSpyCalledBeforeAnotherSpy(beforeSpy, afterSpy, failIfNoFirstInvocation) {
    const beforeInvocationCallOrder = beforeSpy.mock.invocationCallOrder;
    const afterInvocationCallOrder = afterSpy.mock.invocationCallOrder;
    if (beforeInvocationCallOrder.length === 0) {
      return !failIfNoFirstInvocation;
    }
    if (afterInvocationCallOrder.length === 0) {
      return false;
    }
    return beforeInvocationCallOrder[0] < afterInvocationCallOrder[0];
  }
  def(
    ["toHaveBeenCalledBefore"],
    function(resultSpy, failIfNoFirstInvocation = true) {
      const expectSpy = getSpy(this);
      if (!isMockFunction(resultSpy)) {
        throw new TypeError(
          `${utils.inspect(resultSpy)} is not a spy or a call to a spy`
        );
      }
      this.assert(
        isSpyCalledBeforeAnotherSpy(
          expectSpy,
          resultSpy,
          failIfNoFirstInvocation
        ),
        `expected "${expectSpy.getMockName()}" to have been called before "${resultSpy.getMockName()}"`,
        `expected "${expectSpy.getMockName()}" to not have been called before "${resultSpy.getMockName()}"`,
        resultSpy,
        expectSpy
      );
    }
  );
  def(
    ["toHaveBeenCalledAfter"],
    function(resultSpy, failIfNoFirstInvocation = true) {
      const expectSpy = getSpy(this);
      if (!isMockFunction(resultSpy)) {
        throw new TypeError(
          `${utils.inspect(resultSpy)} is not a spy or a call to a spy`
        );
      }
      this.assert(
        isSpyCalledBeforeAnotherSpy(
          resultSpy,
          expectSpy,
          failIfNoFirstInvocation
        ),
        `expected "${expectSpy.getMockName()}" to have been called after "${resultSpy.getMockName()}"`,
        `expected "${expectSpy.getMockName()}" to not have been called after "${resultSpy.getMockName()}"`,
        resultSpy,
        expectSpy
      );
    }
  );
  def(
    ["toThrow", "toThrowError"],
    function(expected) {
      if (typeof expected === "string" || typeof expected === "undefined" || expected instanceof RegExp) {
        return this.throws(expected === "" ? /^$/ : expected);
      }
      const obj = this._obj;
      const promise = utils.flag(this, "promise");
      const isNot = utils.flag(this, "negate");
      let thrown = null;
      if (promise === "rejects") {
        thrown = obj;
      } else if (promise === "resolves" && typeof obj !== "function") {
        if (!isNot) {
          const message = utils.flag(this, "message") || "expected promise to throw an error, but it didn't";
          const error = {
            showDiff: false
          };
          throw new AssertionError(message, error, utils.flag(this, "ssfi"));
        } else {
          return;
        }
      } else {
        let isThrow = false;
        try {
          obj();
        } catch (err) {
          isThrow = true;
          thrown = err;
        }
        if (!isThrow && !isNot) {
          const message = utils.flag(this, "message") || "expected function to throw an error, but it didn't";
          const error = {
            showDiff: false
          };
          throw new AssertionError(message, error, utils.flag(this, "ssfi"));
        }
      }
      if (typeof expected === "function") {
        const name = expected.name || expected.prototype.constructor.name;
        return this.assert(
          thrown && thrown instanceof expected,
          `expected error to be instance of ${name}`,
          `expected error not to be instance of ${name}`,
          expected,
          thrown
        );
      }
      if (expected instanceof Error) {
        const equal = equals(thrown, expected, [
          ...customTesters,
          iterableEquality
        ]);
        return this.assert(
          equal,
          "expected a thrown error to be #{exp}",
          "expected a thrown error not to be #{exp}",
          expected,
          thrown
        );
      }
      if (typeof expected === "object" && "asymmetricMatch" in expected && typeof expected.asymmetricMatch === "function") {
        const matcher = expected;
        return this.assert(
          thrown && matcher.asymmetricMatch(thrown),
          "expected error to match asymmetric matcher",
          "expected error not to match asymmetric matcher",
          matcher,
          thrown
        );
      }
      throw new Error(
        `"toThrow" expects string, RegExp, function, Error instance or asymmetric matcher, got "${typeof expected}"`
      );
    }
  );
  [
    {
      name: "toHaveResolved",
      condition: (spy) => spy.mock.settledResults.length > 0 && spy.mock.settledResults.some(({ type }) => type === "fulfilled"),
      action: "resolved"
    },
    {
      name: ["toHaveReturned", "toReturn"],
      condition: (spy) => spy.mock.calls.length > 0 && spy.mock.results.some(({ type }) => type !== "throw"),
      action: "called"
    }
  ].forEach(({ name, condition, action }) => {
    def(name, function() {
      const spy = getSpy(this);
      const spyName = spy.getMockName();
      const pass = condition(spy);
      this.assert(
        pass,
        `expected "${spyName}" to be successfully ${action} at least once`,
        `expected "${spyName}" to not be successfully ${action}`,
        pass,
        !pass,
        false
      );
    });
  });
  [
    {
      name: "toHaveResolvedTimes",
      condition: (spy, times) => spy.mock.settledResults.reduce(
        (s, { type }) => type === "fulfilled" ? ++s : s,
        0
      ) === times,
      action: "resolved"
    },
    {
      name: ["toHaveReturnedTimes", "toReturnTimes"],
      condition: (spy, times) => spy.mock.results.reduce(
        (s, { type }) => type === "throw" ? s : ++s,
        0
      ) === times,
      action: "called"
    }
  ].forEach(({ name, condition, action }) => {
    def(name, function(times) {
      const spy = getSpy(this);
      const spyName = spy.getMockName();
      const pass = condition(spy, times);
      this.assert(
        pass,
        `expected "${spyName}" to be successfully ${action} ${times} times`,
        `expected "${spyName}" to not be successfully ${action} ${times} times`,
        `expected resolved times: ${times}`,
        `received resolved times: ${pass}`,
        false
      );
    });
  });
  [
    {
      name: "toHaveResolvedWith",
      condition: (spy, value) => spy.mock.settledResults.some(
        ({ type, value: result }) => type === "fulfilled" && equals(value, result)
      ),
      action: "resolve"
    },
    {
      name: ["toHaveReturnedWith", "toReturnWith"],
      condition: (spy, value) => spy.mock.results.some(
        ({ type, value: result }) => type === "return" && equals(value, result)
      ),
      action: "return"
    }
  ].forEach(({ name, condition, action }) => {
    def(name, function(value) {
      const spy = getSpy(this);
      const pass = condition(spy, value);
      const isNot = utils.flag(this, "negate");
      if (pass && isNot || !pass && !isNot) {
        const spyName = spy.getMockName();
        const msg = utils.getMessage(this, [
          pass,
          `expected "${spyName}" to ${action} with: #{exp} at least once`,
          `expected "${spyName}" to not ${action} with: #{exp}`,
          value
        ]);
        const results = action === "return" ? spy.mock.results : spy.mock.settledResults;
        throw new AssertionError(formatReturns(spy, results, msg, value));
      }
    });
  });
  [
    {
      name: "toHaveLastResolvedWith",
      condition: (spy, value) => {
        const result = spy.mock.settledResults[spy.mock.settledResults.length - 1];
        return result && result.type === "fulfilled" && equals(result.value, value);
      },
      action: "resolve"
    },
    {
      name: ["toHaveLastReturnedWith", "lastReturnedWith"],
      condition: (spy, value) => {
        const result = spy.mock.results[spy.mock.results.length - 1];
        return result && result.type === "return" && equals(result.value, value);
      },
      action: "return"
    }
  ].forEach(({ name, condition, action }) => {
    def(name, function(value) {
      const spy = getSpy(this);
      const results = action === "return" ? spy.mock.results : spy.mock.settledResults;
      const result = results[results.length - 1];
      const spyName = spy.getMockName();
      this.assert(
        condition(spy, value),
        `expected last "${spyName}" call to ${action} #{exp}`,
        `expected last "${spyName}" call to not ${action} #{exp}`,
        value,
        result == null ? undefined : result.value
      );
    });
  });
  [
    {
      name: "toHaveNthResolvedWith",
      condition: (spy, index, value) => {
        const result = spy.mock.settledResults[index - 1];
        return result && result.type === "fulfilled" && equals(result.value, value);
      },
      action: "resolve"
    },
    {
      name: ["toHaveNthReturnedWith", "nthReturnedWith"],
      condition: (spy, index, value) => {
        const result = spy.mock.results[index - 1];
        return result && result.type === "return" && equals(result.value, value);
      },
      action: "return"
    }
  ].forEach(({ name, condition, action }) => {
    def(name, function(nthCall, value) {
      const spy = getSpy(this);
      const spyName = spy.getMockName();
      const results = action === "return" ? spy.mock.results : spy.mock.settledResults;
      const result = results[nthCall - 1];
      const ordinalCall = `${ordinalOf(nthCall)} call`;
      this.assert(
        condition(spy, nthCall, value),
        `expected ${ordinalCall} "${spyName}" call to ${action} #{exp}`,
        `expected ${ordinalCall} "${spyName}" call to not ${action} #{exp}`,
        value,
        result == null ? undefined : result.value
      );
    });
  });
  def("withContext", function(context) {
    for (const key in context) {
      utils.flag(this, key, context[key]);
    }
    return this;
  });
  utils.addProperty(
    chai.Assertion.prototype,
    "resolves",
    function __VITEST_RESOLVES__() {
      const error = new Error("resolves");
      utils.flag(this, "promise", "resolves");
      utils.flag(this, "error", error);
      const test = utils.flag(this, "vitest-test");
      const obj = utils.flag(this, "object");
      if (utils.flag(this, "poll")) {
        throw new SyntaxError(
          `expect.poll() is not supported in combination with .resolves`
        );
      }
      if (typeof (obj == null ? undefined : obj.then) !== "function") {
        throw new TypeError(
          `You must provide a Promise to expect() when using .resolves, not '${typeof obj}'.`
        );
      }
      const proxy = new Proxy(this, {
        get: (target, key, receiver) => {
          const result = Reflect.get(target, key, receiver);
          if (typeof result !== "function") {
            return result instanceof chai.Assertion ? proxy : result;
          }
          return (...args) => {
            utils.flag(this, "_name", key);
            const promise = obj.then(
              (value) => {
                utils.flag(this, "object", value);
                return result.call(this, ...args);
              },
              (err) => {
                const _error = new AssertionError(
                  `promise rejected "${utils.inspect(
                    err
                  )}" instead of resolving`,
                  { showDiff: false }
                );
                _error.cause = err;
                _error.stack = error.stack.replace(
                  error.message,
                  _error.message
                );
                throw _error;
              }
            );
            return recordAsyncExpect$1(
              test,
              promise,
              createAssertionMessage$1(utils, this, !!args.length),
              error
            );
          };
        }
      });
      return proxy;
    }
  );
  utils.addProperty(
    chai.Assertion.prototype,
    "rejects",
    function __VITEST_REJECTS__() {
      const error = new Error("rejects");
      utils.flag(this, "promise", "rejects");
      utils.flag(this, "error", error);
      const test = utils.flag(this, "vitest-test");
      const obj = utils.flag(this, "object");
      const wrapper = typeof obj === "function" ? obj() : obj;
      if (utils.flag(this, "poll")) {
        throw new SyntaxError(
          `expect.poll() is not supported in combination with .rejects`
        );
      }
      if (typeof (wrapper == null ? undefined : wrapper.then) !== "function") {
        throw new TypeError(
          `You must provide a Promise to expect() when using .rejects, not '${typeof wrapper}'.`
        );
      }
      const proxy = new Proxy(this, {
        get: (target, key, receiver) => {
          const result = Reflect.get(target, key, receiver);
          if (typeof result !== "function") {
            return result instanceof chai.Assertion ? proxy : result;
          }
          return (...args) => {
            utils.flag(this, "_name", key);
            const promise = wrapper.then(
              (value) => {
                const _error = new AssertionError(
                  `promise resolved "${utils.inspect(
                    value
                  )}" instead of rejecting`,
                  {
                    showDiff: true,
                    expected: new Error("rejected promise"),
                    actual: value
                  }
                );
                _error.stack = error.stack.replace(
                  error.message,
                  _error.message
                );
                throw _error;
              },
              (err) => {
                utils.flag(this, "object", err);
                return result.call(this, ...args);
              }
            );
            return recordAsyncExpect$1(
              test,
              promise,
              createAssertionMessage$1(utils, this, !!args.length),
              error
            );
          };
        }
      });
      return proxy;
    }
  );
};
function ordinalOf(i) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
}
function formatCalls(spy, msg, showActualCall) {
  if (spy.mock.calls) {
    msg += s.gray(
      `

Received: 

${spy.mock.calls.map((callArg, i) => {
        let methodCall = s.bold(
          `  ${ordinalOf(i + 1)} ${spy.getMockName()} call:

`
        );
        if (showActualCall) {
          methodCall += diff(showActualCall, callArg, {
            omitAnnotationLines: true
          });
        } else {
          methodCall += stringify(callArg).split("\n").map((line) => `    ${line}`).join("\n");
        }
        methodCall += "\n";
        return methodCall;
      }).join("\n")}`
    );
  }
  msg += s.gray(
    `

Number of calls: ${s.bold(spy.mock.calls.length)}
`
  );
  return msg;
}
function formatReturns(spy, results, msg, showActualReturn) {
  msg += s.gray(
    `

Received: 

${results.map((callReturn, i) => {
      let methodCall = s.bold(
        `  ${ordinalOf(i + 1)} ${spy.getMockName()} call return:

`
      );
      if (showActualReturn) {
        methodCall += diff(showActualReturn, callReturn.value, {
          omitAnnotationLines: true
        });
      } else {
        methodCall += stringify(callReturn).split("\n").map((line) => `    ${line}`).join("\n");
      }
      methodCall += "\n";
      return methodCall;
    }).join("\n")}`
  );
  msg += s.gray(
    `

Number of calls: ${s.bold(spy.mock.calls.length)}
`
  );
  return msg;
}

function getMatcherState(assertion, expect) {
  const obj = assertion._obj;
  const isNot = utils_exports.flag(assertion, "negate");
  const promise = utils_exports.flag(assertion, "promise") || "";
  const jestUtils = {
    ...getMatcherUtils(),
    diff,
    stringify,
    iterableEquality,
    subsetEquality
  };
  const matcherState = {
    ...getState(expect),
    customTesters: getCustomEqualityTesters(),
    isNot,
    utils: jestUtils,
    promise,
    equals,
    // needed for built-in jest-snapshots, but we don't use it
    suppressedErrors: [],
    soft: utils_exports.flag(assertion, "soft"),
    poll: utils_exports.flag(assertion, "poll")
  };
  return {
    state: matcherState,
    isNot,
    obj
  };
}
class JestExtendError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.actual = actual;
    this.expected = expected;
  }
}
function JestExtendPlugin(c, expect, matchers) {
  return (_, utils) => {
    Object.entries(matchers).forEach(
      ([expectAssertionName, expectAssertion]) => {
        function expectWrapper(...args) {
          const { state, isNot, obj } = getMatcherState(this, expect);
          const result = expectAssertion.call(state, obj, ...args);
          if (result && typeof result === "object" && result instanceof Promise) {
            return result.then(({ pass: pass2, message: message2, actual: actual2, expected: expected2 }) => {
              if (pass2 && isNot || !pass2 && !isNot) {
                throw new JestExtendError(message2(), actual2, expected2);
              }
            });
          }
          const { pass, message, actual, expected } = result;
          if (pass && isNot || !pass && !isNot) {
            throw new JestExtendError(message(), actual, expected);
          }
        }
        const softWrapper = wrapAssertion(utils, expectAssertionName, expectWrapper);
        utils.addMethod(
          globalThis[JEST_MATCHERS_OBJECT].matchers,
          expectAssertionName,
          softWrapper
        );
        utils.addMethod(
          c.Assertion.prototype,
          expectAssertionName,
          softWrapper
        );
        class CustomMatcher extends AsymmetricMatcher$1 {
          constructor(inverse = false, ...sample) {
            super(sample, inverse);
          }
          asymmetricMatch(other) {
            const { pass } = expectAssertion.call(
              this.getMatcherContext(expect),
              other,
              ...this.sample
            );
            return this.inverse ? !pass : pass;
          }
          toString() {
            return `${this.inverse ? "not." : ""}${expectAssertionName}`;
          }
          getExpectedType() {
            return "any";
          }
          toAsymmetricMatcher() {
            return `${this.toString()}<${this.sample.map((item) => stringify(item)).join(", ")}>`;
          }
        }
        const customMatcher = (...sample) => new CustomMatcher(false, ...sample);
        Object.defineProperty(expect, expectAssertionName, {
          configurable: true,
          enumerable: true,
          value: customMatcher,
          writable: true
        });
        Object.defineProperty(expect.not, expectAssertionName, {
          configurable: true,
          enumerable: true,
          value: (...sample) => new CustomMatcher(true, ...sample),
          writable: true
        });
        Object.defineProperty(
          globalThis[ASYMMETRIC_MATCHERS_OBJECT],
          expectAssertionName,
          {
            configurable: true,
            enumerable: true,
            value: customMatcher,
            writable: true
          }
        );
      }
    );
  };
}
const JestExtend = (chai, utils) => {
  utils.addMethod(
    chai.expect,
    "extend",
    (expect, expects) => {
      use(JestExtendPlugin(chai, expect, expects));
    }
  );
};

const comma$1 = ','.charCodeAt(0);
const chars$1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const intToChar$1 = new Uint8Array(64); // 64 possible chars.
const charToInt$1 = new Uint8Array(128); // z is 122 in ASCII
for (let i = 0; i < chars$1.length; i++) {
    const c = chars$1.charCodeAt(i);
    intToChar$1[i] = c;
    charToInt$1[c] = i;
}
function decodeInteger$1(reader, relative) {
    let value = 0;
    let shift = 0;
    let integer = 0;
    do {
        const c = reader.next();
        integer = charToInt$1[c];
        value |= (integer & 31) << shift;
        shift += 5;
    } while (integer & 32);
    const shouldNegate = value & 1;
    value >>>= 1;
    if (shouldNegate) {
        value = -2147483648 | -value;
    }
    return relative + value;
}
function hasMoreVlq$1(reader, max) {
    if (reader.pos >= max)
        return false;
    return reader.peek() !== comma$1;
}
let StringReader$1 = class StringReader {
    constructor(buffer) {
        this.pos = 0;
        this.buffer = buffer;
    }
    next() {
        return this.buffer.charCodeAt(this.pos++);
    }
    peek() {
        return this.buffer.charCodeAt(this.pos);
    }
    indexOf(char) {
        const { buffer, pos } = this;
        const idx = buffer.indexOf(char, pos);
        return idx === -1 ? buffer.length : idx;
    }
};

function decode$1(mappings) {
    const { length } = mappings;
    const reader = new StringReader$1(mappings);
    const decoded = [];
    let genColumn = 0;
    let sourcesIndex = 0;
    let sourceLine = 0;
    let sourceColumn = 0;
    let namesIndex = 0;
    do {
        const semi = reader.indexOf(';');
        const line = [];
        let sorted = true;
        let lastCol = 0;
        genColumn = 0;
        while (reader.pos < semi) {
            let seg;
            genColumn = decodeInteger$1(reader, genColumn);
            if (genColumn < lastCol)
                sorted = false;
            lastCol = genColumn;
            if (hasMoreVlq$1(reader, semi)) {
                sourcesIndex = decodeInteger$1(reader, sourcesIndex);
                sourceLine = decodeInteger$1(reader, sourceLine);
                sourceColumn = decodeInteger$1(reader, sourceColumn);
                if (hasMoreVlq$1(reader, semi)) {
                    namesIndex = decodeInteger$1(reader, namesIndex);
                    seg = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex];
                }
                else {
                    seg = [genColumn, sourcesIndex, sourceLine, sourceColumn];
                }
            }
            else {
                seg = [genColumn];
            }
            line.push(seg);
            reader.pos++;
        }
        if (!sorted)
            sort$1(line);
        decoded.push(line);
        reader.pos = semi + 1;
    } while (reader.pos <= length);
    return decoded;
}
function sort$1(line) {
    line.sort(sortComparator$1$1);
}
function sortComparator$1$1(a, b) {
    return a[0] - b[0];
}

// Matches the scheme of a URL, eg "http://"
const schemeRegex$1 = /^[\w+.-]+:\/\//;
/**
 * Matches the parts of a URL:
 * 1. Scheme, including ":", guaranteed.
 * 2. User/password, including "@", optional.
 * 3. Host, guaranteed.
 * 4. Port, including ":", optional.
 * 5. Path, including "/", optional.
 * 6. Query, including "?", optional.
 * 7. Hash, including "#", optional.
 */
const urlRegex$1 = /^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/;
/**
 * File URLs are weird. They dont' need the regular `//` in the scheme, they may or may not start
 * with a leading `/`, they can have a domain (but only if they don't start with a Windows drive).
 *
 * 1. Host, optional.
 * 2. Path, which may include "/", guaranteed.
 * 3. Query, including "?", optional.
 * 4. Hash, including "#", optional.
 */
const fileRegex$1 = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
var UrlType$1;
(function (UrlType) {
    UrlType[UrlType["Empty"] = 1] = "Empty";
    UrlType[UrlType["Hash"] = 2] = "Hash";
    UrlType[UrlType["Query"] = 3] = "Query";
    UrlType[UrlType["RelativePath"] = 4] = "RelativePath";
    UrlType[UrlType["AbsolutePath"] = 5] = "AbsolutePath";
    UrlType[UrlType["SchemeRelative"] = 6] = "SchemeRelative";
    UrlType[UrlType["Absolute"] = 7] = "Absolute";
})(UrlType$1 || (UrlType$1 = {}));
function isAbsoluteUrl$1(input) {
    return schemeRegex$1.test(input);
}
function isSchemeRelativeUrl$1(input) {
    return input.startsWith('//');
}
function isAbsolutePath$1(input) {
    return input.startsWith('/');
}
function isFileUrl$1(input) {
    return input.startsWith('file:');
}
function isRelative$1(input) {
    return /^[.?#]/.test(input);
}
function parseAbsoluteUrl$1(input) {
    const match = urlRegex$1.exec(input);
    return makeUrl$1(match[1], match[2] || '', match[3], match[4] || '', match[5] || '/', match[6] || '', match[7] || '');
}
function parseFileUrl$1(input) {
    const match = fileRegex$1.exec(input);
    const path = match[2];
    return makeUrl$1('file:', '', match[1] || '', '', isAbsolutePath$1(path) ? path : '/' + path, match[3] || '', match[4] || '');
}
function makeUrl$1(scheme, user, host, port, path, query, hash) {
    return {
        scheme,
        user,
        host,
        port,
        path,
        query,
        hash,
        type: UrlType$1.Absolute,
    };
}
function parseUrl$1(input) {
    if (isSchemeRelativeUrl$1(input)) {
        const url = parseAbsoluteUrl$1('http:' + input);
        url.scheme = '';
        url.type = UrlType$1.SchemeRelative;
        return url;
    }
    if (isAbsolutePath$1(input)) {
        const url = parseAbsoluteUrl$1('http://foo.com' + input);
        url.scheme = '';
        url.host = '';
        url.type = UrlType$1.AbsolutePath;
        return url;
    }
    if (isFileUrl$1(input))
        return parseFileUrl$1(input);
    if (isAbsoluteUrl$1(input))
        return parseAbsoluteUrl$1(input);
    const url = parseAbsoluteUrl$1('http://foo.com/' + input);
    url.scheme = '';
    url.host = '';
    url.type = input
        ? input.startsWith('?')
            ? UrlType$1.Query
            : input.startsWith('#')
                ? UrlType$1.Hash
                : UrlType$1.RelativePath
        : UrlType$1.Empty;
    return url;
}
function stripPathFilename$1(path) {
    // If a path ends with a parent directory "..", then it's a relative path with excess parent
    // paths. It's not a file, so we can't strip it.
    if (path.endsWith('/..'))
        return path;
    const index = path.lastIndexOf('/');
    return path.slice(0, index + 1);
}
function mergePaths$1(url, base) {
    normalizePath$1(base, base.type);
    // If the path is just a "/", then it was an empty path to begin with (remember, we're a relative
    // path).
    if (url.path === '/') {
        url.path = base.path;
    }
    else {
        // Resolution happens relative to the base path's directory, not the file.
        url.path = stripPathFilename$1(base.path) + url.path;
    }
}
/**
 * The path can have empty directories "//", unneeded parents "foo/..", or current directory
 * "foo/.". We need to normalize to a standard representation.
 */
function normalizePath$1(url, type) {
    const rel = type <= UrlType$1.RelativePath;
    const pieces = url.path.split('/');
    // We need to preserve the first piece always, so that we output a leading slash. The item at
    // pieces[0] is an empty string.
    let pointer = 1;
    // Positive is the number of real directories we've output, used for popping a parent directory.
    // Eg, "foo/bar/.." will have a positive 2, and we can decrement to be left with just "foo".
    let positive = 0;
    // We need to keep a trailing slash if we encounter an empty directory (eg, splitting "foo/" will
    // generate `["foo", ""]` pieces). And, if we pop a parent directory. But once we encounter a
    // real directory, we won't need to append, unless the other conditions happen again.
    let addTrailingSlash = false;
    for (let i = 1; i < pieces.length; i++) {
        const piece = pieces[i];
        // An empty directory, could be a trailing slash, or just a double "//" in the path.
        if (!piece) {
            addTrailingSlash = true;
            continue;
        }
        // If we encounter a real directory, then we don't need to append anymore.
        addTrailingSlash = false;
        // A current directory, which we can always drop.
        if (piece === '.')
            continue;
        // A parent directory, we need to see if there are any real directories we can pop. Else, we
        // have an excess of parents, and we'll need to keep the "..".
        if (piece === '..') {
            if (positive) {
                addTrailingSlash = true;
                positive--;
                pointer--;
            }
            else if (rel) {
                // If we're in a relativePath, then we need to keep the excess parents. Else, in an absolute
                // URL, protocol relative URL, or an absolute path, we don't need to keep excess.
                pieces[pointer++] = piece;
            }
            continue;
        }
        // We've encountered a real directory. Move it to the next insertion pointer, which accounts for
        // any popped or dropped directories.
        pieces[pointer++] = piece;
        positive++;
    }
    let path = '';
    for (let i = 1; i < pointer; i++) {
        path += '/' + pieces[i];
    }
    if (!path || (addTrailingSlash && !path.endsWith('/..'))) {
        path += '/';
    }
    url.path = path;
}
/**
 * Attempts to resolve `input` URL/path relative to `base`.
 */
function resolve$2$1(input, base) {
    if (!input && !base)
        return '';
    const url = parseUrl$1(input);
    let inputType = url.type;
    if (base && inputType !== UrlType$1.Absolute) {
        const baseUrl = parseUrl$1(base);
        const baseType = baseUrl.type;
        switch (inputType) {
            case UrlType$1.Empty:
                url.hash = baseUrl.hash;
            // fall through
            case UrlType$1.Hash:
                url.query = baseUrl.query;
            // fall through
            case UrlType$1.Query:
            case UrlType$1.RelativePath:
                mergePaths$1(url, baseUrl);
            // fall through
            case UrlType$1.AbsolutePath:
                // The host, user, and port are joined, you can't copy one without the others.
                url.user = baseUrl.user;
                url.host = baseUrl.host;
                url.port = baseUrl.port;
            // fall through
            case UrlType$1.SchemeRelative:
                // The input doesn't have a schema at least, so we need to copy at least that over.
                url.scheme = baseUrl.scheme;
        }
        if (baseType > inputType)
            inputType = baseType;
    }
    normalizePath$1(url, inputType);
    const queryHash = url.query + url.hash;
    switch (inputType) {
        // This is impossible, because of the empty checks at the start of the function.
        // case UrlType.Empty:
        case UrlType$1.Hash:
        case UrlType$1.Query:
            return queryHash;
        case UrlType$1.RelativePath: {
            // The first char is always a "/", and we need it to be relative.
            const path = url.path.slice(1);
            if (!path)
                return queryHash || '.';
            if (isRelative$1(base || input) && !isRelative$1(path)) {
                // If base started with a leading ".", or there is no base and input started with a ".",
                // then we need to ensure that the relative path starts with a ".". We don't know if
                // relative starts with a "..", though, so check before prepending.
                return './' + path + queryHash;
            }
            return path + queryHash;
        }
        case UrlType$1.AbsolutePath:
            return url.path + queryHash;
        default:
            return url.scheme + '//' + url.user + url.host + url.port + url.path + queryHash;
    }
}

function resolve$1$1(input, base) {
    // The base is always treated as a directory, if it's not empty.
    // https://github.com/mozilla/source-map/blob/8cb3ee57/lib/util.js#L327
    // https://github.com/chromium/chromium/blob/da4adbb3/third_party/blink/renderer/devtools/front_end/sdk/SourceMap.js#L400-L401
    if (base && !base.endsWith('/'))
        base += '/';
    return resolve$2$1(input, base);
}

/**
 * Removes everything after the last "/", but leaves the slash.
 */
function stripFilename$1(path) {
    if (!path)
        return '';
    const index = path.lastIndexOf('/');
    return path.slice(0, index + 1);
}

const COLUMN$1 = 0;
const SOURCES_INDEX$1 = 1;
const SOURCE_LINE$1 = 2;
const SOURCE_COLUMN$1 = 3;
const NAMES_INDEX$1 = 4;
const REV_GENERATED_LINE = 1;
const REV_GENERATED_COLUMN = 2;

function maybeSort$1(mappings, owned) {
    const unsortedIndex = nextUnsortedSegmentLine$1(mappings, 0);
    if (unsortedIndex === mappings.length)
        return mappings;
    // If we own the array (meaning we parsed it from JSON), then we're free to directly mutate it. If
    // not, we do not want to modify the consumer's input array.
    if (!owned)
        mappings = mappings.slice();
    for (let i = unsortedIndex; i < mappings.length; i = nextUnsortedSegmentLine$1(mappings, i + 1)) {
        mappings[i] = sortSegments$1(mappings[i], owned);
    }
    return mappings;
}
function nextUnsortedSegmentLine$1(mappings, start) {
    for (let i = start; i < mappings.length; i++) {
        if (!isSorted$1(mappings[i]))
            return i;
    }
    return mappings.length;
}
function isSorted$1(line) {
    for (let j = 1; j < line.length; j++) {
        if (line[j][COLUMN$1] < line[j - 1][COLUMN$1]) {
            return false;
        }
    }
    return true;
}
function sortSegments$1(line, owned) {
    if (!owned)
        line = line.slice();
    return line.sort(sortComparator$2);
}
function sortComparator$2(a, b) {
    return a[COLUMN$1] - b[COLUMN$1];
}

let found$1 = false;
/**
 * A binary search implementation that returns the index if a match is found.
 * If no match is found, then the left-index (the index associated with the item that comes just
 * before the desired index) is returned. To maintain proper sort order, a splice would happen at
 * the next index:
 *
 * ```js
 * const array = [1, 3];
 * const needle = 2;
 * const index = binarySearch(array, needle, (item, needle) => item - needle);
 *
 * assert.equal(index, 0);
 * array.splice(index + 1, 0, needle);
 * assert.deepEqual(array, [1, 2, 3]);
 * ```
 */
function binarySearch$1(haystack, needle, low, high) {
    while (low <= high) {
        const mid = low + ((high - low) >> 1);
        const cmp = haystack[mid][COLUMN$1] - needle;
        if (cmp === 0) {
            found$1 = true;
            return mid;
        }
        if (cmp < 0) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    found$1 = false;
    return low - 1;
}
function upperBound$1(haystack, needle, index) {
    for (let i = index + 1; i < haystack.length; index = i++) {
        if (haystack[i][COLUMN$1] !== needle)
            break;
    }
    return index;
}
function lowerBound$1(haystack, needle, index) {
    for (let i = index - 1; i >= 0; index = i--) {
        if (haystack[i][COLUMN$1] !== needle)
            break;
    }
    return index;
}
function memoizedState$1() {
    return {
        lastKey: -1,
        lastNeedle: -1,
        lastIndex: -1,
    };
}
/**
 * This overly complicated beast is just to record the last tested line/column and the resulting
 * index, allowing us to skip a few tests if mappings are monotonically increasing.
 */
function memoizedBinarySearch$1(haystack, needle, state, key) {
    const { lastKey, lastNeedle, lastIndex } = state;
    let low = 0;
    let high = haystack.length - 1;
    if (key === lastKey) {
        if (needle === lastNeedle) {
            found$1 = lastIndex !== -1 && haystack[lastIndex][COLUMN$1] === needle;
            return lastIndex;
        }
        if (needle >= lastNeedle) {
            // lastIndex may be -1 if the previous needle was not found.
            low = lastIndex === -1 ? 0 : lastIndex;
        }
        else {
            high = lastIndex;
        }
    }
    state.lastKey = key;
    state.lastNeedle = needle;
    return (state.lastIndex = binarySearch$1(haystack, needle, low, high));
}

// Rebuilds the original source files, with mappings that are ordered by source line/column instead
// of generated line/column.
function buildBySources(decoded, memos) {
    const sources = memos.map(buildNullArray);
    for (let i = 0; i < decoded.length; i++) {
        const line = decoded[i];
        for (let j = 0; j < line.length; j++) {
            const seg = line[j];
            if (seg.length === 1)
                continue;
            const sourceIndex = seg[SOURCES_INDEX$1];
            const sourceLine = seg[SOURCE_LINE$1];
            const sourceColumn = seg[SOURCE_COLUMN$1];
            const originalSource = sources[sourceIndex];
            const originalLine = (originalSource[sourceLine] || (originalSource[sourceLine] = []));
            const memo = memos[sourceIndex];
            // The binary search either found a match, or it found the left-index just before where the
            // segment should go. Either way, we want to insert after that. And there may be multiple
            // generated segments associated with an original location, so there may need to move several
            // indexes before we find where we need to insert.
            let index = upperBound$1(originalLine, sourceColumn, memoizedBinarySearch$1(originalLine, sourceColumn, memo, sourceLine));
            memo.lastIndex = ++index;
            insert(originalLine, index, [sourceColumn, i, seg[COLUMN$1]]);
        }
    }
    return sources;
}
function insert(array, index, value) {
    for (let i = array.length; i > index; i--) {
        array[i] = array[i - 1];
    }
    array[index] = value;
}
// Null arrays allow us to use ordered index keys without actually allocating contiguous memory like
// a real array. We use a null-prototype object to avoid prototype pollution and deoptimizations.
// Numeric properties on objects are magically sorted in ascending order by the engine regardless of
// the insertion order. So, by setting any numeric keys, even out of order, we'll get ascending
// order when iterating with for-in.
function buildNullArray() {
    return { __proto__: null };
}

const LINE_GTR_ZERO$1 = '`line` must be greater than 0 (lines start at line 1)';
const COL_GTR_EQ_ZERO$1 = '`column` must be greater than or equal to 0 (columns start at column 0)';
const LEAST_UPPER_BOUND$1 = -1;
const GREATEST_LOWER_BOUND$1 = 1;
let TraceMap$1 = class TraceMap {
    constructor(map, mapUrl) {
        const isString = typeof map === 'string';
        if (!isString && map._decodedMemo)
            return map;
        const parsed = (isString ? JSON.parse(map) : map);
        const { version, file, names, sourceRoot, sources, sourcesContent } = parsed;
        this.version = version;
        this.file = file;
        this.names = names || [];
        this.sourceRoot = sourceRoot;
        this.sources = sources;
        this.sourcesContent = sourcesContent;
        this.ignoreList = parsed.ignoreList || parsed.x_google_ignoreList || undefined;
        const from = resolve$1$1(sourceRoot || '', stripFilename$1(mapUrl));
        this.resolvedSources = sources.map((s) => resolve$1$1(s || '', from));
        const { mappings } = parsed;
        if (typeof mappings === 'string') {
            this._encoded = mappings;
            this._decoded = undefined;
        }
        else {
            this._encoded = undefined;
            this._decoded = maybeSort$1(mappings, isString);
        }
        this._decodedMemo = memoizedState$1();
        this._bySources = undefined;
        this._bySourceMemos = undefined;
    }
};
/**
 * Typescript doesn't allow friend access to private fields, so this just casts the map into a type
 * with public access modifiers.
 */
function cast$1(map) {
    return map;
}
/**
 * Returns the decoded (array of lines of segments) form of the SourceMap's mappings field.
 */
function decodedMappings$1(map) {
    var _a;
    return ((_a = cast$1(map))._decoded || (_a._decoded = decode$1(cast$1(map)._encoded)));
}
/**
 * A higher-level API to find the source/line/column associated with a generated line/column
 * (think, from a stack trace). Line is 1-based, but column is 0-based, due to legacy behavior in
 * `source-map` library.
 */
function originalPositionFor$1(map, needle) {
    let { line, column, bias } = needle;
    line--;
    if (line < 0)
        throw new Error(LINE_GTR_ZERO$1);
    if (column < 0)
        throw new Error(COL_GTR_EQ_ZERO$1);
    const decoded = decodedMappings$1(map);
    // It's common for parent source maps to have pointers to lines that have no
    // mapping (like a "//# sourceMappingURL=") at the end of the child file.
    if (line >= decoded.length)
        return OMapping$1(null, null, null, null);
    const segments = decoded[line];
    const index = traceSegmentInternal$1(segments, cast$1(map)._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND$1);
    if (index === -1)
        return OMapping$1(null, null, null, null);
    const segment = segments[index];
    if (segment.length === 1)
        return OMapping$1(null, null, null, null);
    const { names, resolvedSources } = map;
    return OMapping$1(resolvedSources[segment[SOURCES_INDEX$1]], segment[SOURCE_LINE$1] + 1, segment[SOURCE_COLUMN$1], segment.length === 5 ? names[segment[NAMES_INDEX$1]] : null);
}
/**
 * Finds the generated line/column position of the provided source/line/column source position.
 */
function generatedPositionFor(map, needle) {
    const { source, line, column, bias } = needle;
    return generatedPosition(map, source, line, column, bias || GREATEST_LOWER_BOUND$1, false);
}
/**
 * Iterates each mapping in generated position order.
 */
function eachMapping(map, cb) {
    const decoded = decodedMappings$1(map);
    const { names, resolvedSources } = map;
    for (let i = 0; i < decoded.length; i++) {
        const line = decoded[i];
        for (let j = 0; j < line.length; j++) {
            const seg = line[j];
            const generatedLine = i + 1;
            const generatedColumn = seg[0];
            let source = null;
            let originalLine = null;
            let originalColumn = null;
            let name = null;
            if (seg.length !== 1) {
                source = resolvedSources[seg[1]];
                originalLine = seg[2] + 1;
                originalColumn = seg[3];
            }
            if (seg.length === 5)
                name = names[seg[4]];
            cb({
                generatedLine,
                generatedColumn,
                source,
                originalLine,
                originalColumn,
                name,
            });
        }
    }
}
function OMapping$1(source, line, column, name) {
    return { source, line, column, name };
}
function GMapping(line, column) {
    return { line, column };
}
function traceSegmentInternal$1(segments, memo, line, column, bias) {
    let index = memoizedBinarySearch$1(segments, column, memo, line);
    if (found$1) {
        index = (bias === LEAST_UPPER_BOUND$1 ? upperBound$1 : lowerBound$1)(segments, column, index);
    }
    else if (bias === LEAST_UPPER_BOUND$1)
        index++;
    if (index === -1 || index === segments.length)
        return -1;
    return index;
}
function sliceGeneratedPositions(segments, memo, line, column, bias) {
    let min = traceSegmentInternal$1(segments, memo, line, column, GREATEST_LOWER_BOUND$1);
    // We ignored the bias when tracing the segment so that we're guarnateed to find the first (in
    // insertion order) segment that matched. Even if we did respect the bias when tracing, we would
    // still need to call `lowerBound()` to find the first segment, which is slower than just looking
    // for the GREATEST_LOWER_BOUND to begin with. The only difference that matters for us is when the
    // binary search didn't match, in which case GREATEST_LOWER_BOUND just needs to increment to
    // match LEAST_UPPER_BOUND.
    if (!found$1 && bias === LEAST_UPPER_BOUND$1)
        min++;
    if (min === -1 || min === segments.length)
        return [];
    // We may have found the segment that started at an earlier column. If this is the case, then we
    // need to slice all generated segments that match _that_ column, because all such segments span
    // to our desired column.
    const matchedColumn = found$1 ? column : segments[min][COLUMN$1];
    // The binary search is not guaranteed to find the lower bound when a match wasn't found.
    if (!found$1)
        min = lowerBound$1(segments, matchedColumn, min);
    const max = upperBound$1(segments, matchedColumn, min);
    const result = [];
    for (; min <= max; min++) {
        const segment = segments[min];
        result.push(GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]));
    }
    return result;
}
function generatedPosition(map, source, line, column, bias, all) {
    var _a;
    line--;
    if (line < 0)
        throw new Error(LINE_GTR_ZERO$1);
    if (column < 0)
        throw new Error(COL_GTR_EQ_ZERO$1);
    const { sources, resolvedSources } = map;
    let sourceIndex = sources.indexOf(source);
    if (sourceIndex === -1)
        sourceIndex = resolvedSources.indexOf(source);
    if (sourceIndex === -1)
        return all ? [] : GMapping(null, null);
    const generated = ((_a = cast$1(map))._bySources || (_a._bySources = buildBySources(decodedMappings$1(map), (cast$1(map)._bySourceMemos = sources.map(memoizedState$1)))));
    const segments = generated[sourceIndex][line];
    if (segments == null)
        return all ? [] : GMapping(null, null);
    const memo = cast$1(map)._bySourceMemos[sourceIndex];
    if (all)
        return sliceGeneratedPositions(segments, memo, line, column, bias);
    const index = traceSegmentInternal$1(segments, memo, line, column, bias);
    if (index === -1)
        return GMapping(null, null);
    const segment = segments[index];
    return GMapping(segment[REV_GENERATED_LINE] + 1, segment[REV_GENERATED_COLUMN]);
}

const _DRIVE_LETTER_START_RE$1 = /^[A-Za-z]:\//;
function normalizeWindowsPath$1(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE$1, (r) => r.toUpperCase());
}
const _IS_ABSOLUTE_RE$1 = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
function cwd$1() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$3 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath$1(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd$1();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute$1(path);
  }
  resolvedPath = normalizeString$1(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute$1(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString$1(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute$1 = function(p) {
  return _IS_ABSOLUTE_RE$1.test(p);
};

const CHROME_IE_STACK_REGEXP$1 = /^\s*at .*(?:\S:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP$1 = /^(?:eval@)?(?:\[native code\])?$/;
const stackIgnorePatterns$1 = [
  "node:internal",
  /\/packages\/\w+\/dist\//,
  /\/@vitest\/\w+\/dist\//,
  "/vitest/dist/",
  "/vitest/src/",
  "/vite-node/dist/",
  "/vite-node/src/",
  "/node_modules/chai/",
  "/node_modules/tinypool/",
  "/node_modules/tinyspy/",
  // browser related deps
  "/deps/chunk-",
  "/deps/@vitest",
  "/deps/loupe",
  "/deps/chai",
  /node:\w+/,
  /__vitest_test__/,
  /__vitest_browser__/,
  /\/deps\/vitest_/
];
function extractLocation$1(urlLike) {
  if (!urlLike.includes(":")) {
    return [urlLike];
  }
  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/^\(|\)$/g, ""));
  if (!parts) {
    return [urlLike];
  }
  let url = parts[1];
  if (url.startsWith("async ")) {
    url = url.slice(6);
  }
  if (url.startsWith("http:") || url.startsWith("https:")) {
    const urlObj = new URL(url);
    url = urlObj.pathname;
  }
  if (url.startsWith("/@fs/")) {
    const isWindows = /^\/@fs\/[a-zA-Z]:\//.test(url);
    url = url.slice(isWindows ? 5 : 4);
  }
  return [url, parts[2] || undefined, parts[3] || undefined];
}
function parseSingleFFOrSafariStack$1(raw) {
  let line = raw.trim();
  if (SAFARI_NATIVE_CODE_REGEXP$1.test(line)) {
    return null;
  }
  if (line.includes(" > eval")) {
    line = line.replace(
      / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
      ":$1"
    );
  }
  if (!line.includes("@") && !line.includes(":")) {
    return null;
  }
  const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(@)/;
  const matches = line.match(functionNameRegex);
  const functionName = matches && matches[1] ? matches[1] : undefined;
  const [url, lineNumber, columnNumber] = extractLocation$1(
    line.replace(functionNameRegex, "")
  );
  if (!url || !lineNumber || !columnNumber) {
    return null;
  }
  return {
    file: url,
    method: functionName || "",
    line: Number.parseInt(lineNumber),
    column: Number.parseInt(columnNumber)
  };
}
function parseSingleStack(raw) {
  const line = raw.trim();
  if (!CHROME_IE_STACK_REGEXP$1.test(line)) {
    return parseSingleFFOrSafariStack$1(line);
  }
  return parseSingleV8Stack$1(line);
}
function parseSingleV8Stack$1(raw) {
  let line = raw.trim();
  if (!CHROME_IE_STACK_REGEXP$1.test(line)) {
    return null;
  }
  if (line.includes("(eval ")) {
    line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
  }
  let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
  const location = sanitizedLine.match(/ (\(.+\)$)/);
  sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
  const [url, lineNumber, columnNumber] = extractLocation$1(
    location ? location[1] : sanitizedLine
  );
  let method = location && sanitizedLine || "";
  let file = url && ["eval", "<anonymous>"].includes(url) ? undefined : url;
  if (!file || !lineNumber || !columnNumber) {
    return null;
  }
  if (method.startsWith("async ")) {
    method = method.slice(6);
  }
  if (file.startsWith("file://")) {
    file = file.slice(7);
  }
  file = file.startsWith("node:") || file.startsWith("internal:") ? file : resolve$3(file);
  if (method) {
    method = method.replace(/__vite_ssr_import_\d+__\./g, "");
  }
  return {
    method,
    file,
    line: Number.parseInt(lineNumber),
    column: Number.parseInt(columnNumber)
  };
}
function createStackString(stacks) {
  return stacks.map((stack) => {
    const line = `${stack.file}:${stack.line}:${stack.column}`;
    if (stack.method) {
      return `    at ${stack.method}(${line})`;
    }
    return `    at ${line}`;
  }).join("\n");
}
function parseStacktrace$1(stack, options = {}) {
  const { ignoreStackEntries = stackIgnorePatterns$1 } = options;
  let stacks = !CHROME_IE_STACK_REGEXP$1.test(stack) ? parseFFOrSafariStackTrace$1(stack) : parseV8Stacktrace$1(stack);
  if (ignoreStackEntries.length) {
    stacks = stacks.filter(
      (stack2) => !ignoreStackEntries.some((p) => stack2.file.match(p))
    );
  }
  return stacks.map((stack2) => {
    var _a;
    if (options.getFileName) {
      stack2.file = options.getFileName(stack2.file);
    }
    const map = (_a = options.getSourceMap) == null ? undefined : _a.call(options, stack2.file);
    if (!map || typeof map !== "object" || !map.version) {
      return stack2;
    }
    const traceMap = new TraceMap$1(map);
    const { line, column } = originalPositionFor$1(traceMap, stack2);
    if (line != null && column != null) {
      return { ...stack2, line, column };
    }
    return stack2;
  });
}
function parseFFOrSafariStackTrace$1(stack) {
  return stack.split("\n").map((line) => parseSingleFFOrSafariStack$1(line)).filter(notNullish$1);
}
function parseV8Stacktrace$1(stack) {
  return stack.split("\n").map((line) => parseSingleV8Stack$1(line)).filter(notNullish$1);
}
function parseErrorStacktrace$1(e, options = {}) {
  if (!e || isPrimitive$2(e)) {
    return [];
  }
  if (e.stacks) {
    return e.stacks;
  }
  const stackStr = e.stack || e.stackStr || "";
  let stackFrames = parseStacktrace$1(stackStr, options);
  if (options.frameFilter) {
    stackFrames = stackFrames.filter(
      (f) => options.frameFilter(e, f) !== false
    );
  }
  e.stacks = stackFrames;
  return stackFrames;
}

let _lazyMatch = () => { var __lib__=(()=>{var m=Object.defineProperty,V=Object.getOwnPropertyDescriptor,G=Object.getOwnPropertyNames,T=Object.prototype.hasOwnProperty,q=(r,e)=>{for(var n in e)m(r,n,{get:e[n],enumerable:true});},H=(r,e,n,t)=>{if(typeof e=="object"||typeof e=="function")for(let a of G(e))!T.call(r,a)&&a!==n&&m(r,a,{get:()=>e[a],enumerable:!(t=V(e,a))||t.enumerable});return r},J=r=>H(m({},"__esModule",{value:true}),r),w={};q(w,{zeptomatch:()=>re});var A=r=>Array.isArray(r),d=r=>typeof r=="function",Q=r=>r.length===0,W=r=>typeof r=="number",K=r=>typeof r=="object"&&r!==null,X=r=>r instanceof RegExp,b=r=>typeof r=="string",h=r=>r===undefined,Y=r=>{const e=new Map;return n=>{const t=e.get(n);if(t)return t;const a=r(n);return e.set(n,a),a}},rr=(r,e,n={})=>{const t={cache:{},input:r,index:0,indexMax:0,options:n,output:[]};if(v(e)(t)&&t.index===r.length)return t.output;throw new Error(`Failed to parse at index ${t.indexMax}`)},i=(r,e)=>A(r)?er(r,e):b(r)?tr(r,e):nr(r,e),er=(r,e)=>{const n={};for(const t of r){if(t.length!==1)throw new Error(`Invalid character: "${t}"`);const a=t.charCodeAt(0);n[a]=true;}return t=>{const a=t.index,o=t.input;for(;t.index<o.length&&o.charCodeAt(t.index)in n;)t.index+=1;const u=t.index;if(u>a){if(!h(e)&&!t.options.silent){const s=t.input.slice(a,u),c=d(e)?e(s,o,String(a)):e;h(c)||t.output.push(c);}t.indexMax=Math.max(t.indexMax,t.index);}return  true}},nr=(r,e)=>{const n=r.source,t=r.flags.replace(/y|$/,"y"),a=new RegExp(n,t);return g(o=>{a.lastIndex=o.index;const u=a.exec(o.input);if(u){if(!h(e)&&!o.options.silent){const s=d(e)?e(...u,o.input,String(o.index)):e;h(s)||o.output.push(s);}return o.index+=u[0].length,o.indexMax=Math.max(o.indexMax,o.index),true}else return  false})},tr=(r,e)=>n=>{if(n.input.startsWith(r,n.index)){if(!h(e)&&!n.options.silent){const a=d(e)?e(r,n.input,String(n.index)):e;h(a)||n.output.push(a);}return n.index+=r.length,n.indexMax=Math.max(n.indexMax,n.index),true}else return  false},C=(r,e,n,t)=>{const a=v(r);return g(_(M(o=>{let u=0;for(;u<n;){const s=o.index;if(!a(o)||(u+=1,o.index===s))break}return u>=e})))},ar=(r,e)=>C(r,0,1),f=(r,e)=>C(r,0,1/0),x=(r,e)=>{const n=r.map(v);return g(_(M(t=>{for(let a=0,o=n.length;a<o;a++)if(!n[a](t))return  false;return  true})))},l=(r,e)=>{const n=r.map(v);return g(_(t=>{for(let a=0,o=n.length;a<o;a++)if(n[a](t))return  true;return  false}))},M=(r,e=false)=>{const n=v(r);return t=>{const a=t.index,o=t.output.length,u=n(t);return (!u||e)&&(t.index=a,t.output.length!==o&&(t.output.length=o)),u}},_=(r,e)=>{const n=v(r);return n},g=(()=>{let r=0;return e=>{const n=v(e),t=r+=1;return a=>{var o;if(a.options.memoization===false)return n(a);const u=a.index,s=(o=a.cache)[t]||(o[t]=new Map),c=s.get(u);if(c===false)return  false;if(W(c))return a.index=c,true;if(c)return a.index=c.index,c.output?.length&&a.output.push(...c.output),true;{const Z=a.output.length;if(n(a)){const D=a.index,U=a.output.length;if(U>Z){const ee=a.output.slice(Z,U);s.set(u,{index:D,output:ee});}else s.set(u,D);return  true}else return s.set(u,false),false}}}})(),E=r=>{let e;return n=>(e||(e=v(r())),e(n))},v=Y(r=>{if(d(r))return Q(r)?E(r):r;if(b(r)||X(r))return i(r);if(A(r))return x(r);if(K(r))return l(Object.values(r));throw new Error("Invalid rule")}),P="abcdefghijklmnopqrstuvwxyz",ir=r=>{let e="";for(;r>0;){const n=(r-1)%26;e=P[n]+e,r=Math.floor((r-1)/26);}return e},z=r=>{let e=0;for(let n=0,t=r.length;n<t;n++)e=e*26+P.indexOf(r[n])+1;return e},S=(r,e)=>{if(e<r)return S(e,r);const n=[];for(;r<=e;)n.push(r++);return n},or=(r,e,n)=>S(r,e).map(t=>String(t).padStart(n,"0")),O=(r,e)=>S(z(r),z(e)).map(ir),p=r=>r,R=r=>ur(e=>rr(e,r,{memoization:false}).join("")),ur=r=>{const e={};return n=>e[n]??(e[n]=r(n))},sr=i(/^\*\*\/\*$/,".*"),cr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]+)$/,(r,e,n)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}`),lr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]*)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}$/,(r,e,n,t)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}(?:${t.replaceAll(",","|").replaceAll(".","\\.")})`),y=i(/\\./,p),pr=i(/[$.*+?^(){}[\]\|]/,r=>`\\${r}`),vr=i(/./,p),hr=i(/^(?:!!)*!(.*)$/,(r,e)=>`(?!^${L(e)}$).*?`),dr=i(/^(!!)+/,""),fr=l([hr,dr]),xr=i(/\/(\*\*\/)+/,"(?:/.+/|/)"),gr=i(/^(\*\*\/)+/,"(?:^|.*/)"),mr=i(/\/(\*\*)$/,"(?:/.*|$)"),_r=i(/\*\*/,".*"),j=l([xr,gr,mr,_r]),Sr=i(/\*\/(?!\*\*\/)/,"[^/]*/"),yr=i(/\*/,"[^/]*"),N=l([Sr,yr]),k=i("?","[^/]"),$r=i("[",p),wr=i("]",p),Ar=i(/[!^]/,"^/"),br=i(/[a-z]-[a-z]|[0-9]-[0-9]/i,p),Cr=i(/[$.*+?^(){}[\|]/,r=>`\\${r}`),Mr=i(/[^\]]/,p),Er=l([y,Cr,br,Mr]),B=x([$r,ar(Ar),f(Er),wr]),Pr=i("{","(?:"),zr=i("}",")"),Or=i(/(\d+)\.\.(\d+)/,(r,e,n)=>or(+e,+n,Math.min(e.length,n.length)).join("|")),Rr=i(/([a-z]+)\.\.([a-z]+)/,(r,e,n)=>O(e,n).join("|")),jr=i(/([A-Z]+)\.\.([A-Z]+)/,(r,e,n)=>O(e.toLowerCase(),n.toLowerCase()).join("|").toUpperCase()),Nr=l([Or,Rr,jr]),I=x([Pr,Nr,zr]),kr=i("{","(?:"),Br=i("}",")"),Ir=i(",","|"),Fr=i(/[$.*+?^(){[\]\|]/,r=>`\\${r}`),Lr=i(/[^}]/,p),Zr=E(()=>F),Dr=l([j,N,k,B,I,Zr,y,Fr,Ir,Lr]),F=x([kr,f(Dr),Br]),Ur=f(l([sr,cr,lr,fr,j,N,k,B,I,F,y,pr,vr])),Vr=Ur,Gr=R(Vr),L=Gr,Tr=i(/\\./,p),qr=i(/./,p),Hr=i(/\*\*\*+/,"*"),Jr=i(/([^/{[(!])\*\*/,(r,e)=>`${e}*`),Qr=i(/(^|.)\*\*(?=[^*/)\]}])/,(r,e)=>`${e}*`),Wr=f(l([Tr,Hr,Jr,Qr,qr])),Kr=Wr,Xr=R(Kr),Yr=Xr,$=(r,e)=>{const n=Array.isArray(r)?r:[r];if(!n.length)return  false;const t=n.map($.compile),a=n.every(s=>/(\/(?:\*\*)?|\[\/\])$/.test(s)),o=e.replace(/[\\\/]+/g,"/").replace(/\/$/,a?"/":"");return t.some(s=>s.test(o))};$.compile=r=>new RegExp(`^${L(Yr(r))}$`,"s");var re=$;return J(w)})();
 return __lib__.default || __lib__; };
let _match;
const zeptomatch = (path, pattern) => {
  if (!_match) {
    _match = _lazyMatch();
    _lazyMatch = null;
  }
  return _match(path, pattern);
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}

const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const _EXTNAME_RE = /.(\.[^./]+|\.)$/;
const _PATH_ROOT_RE = /^[/\\]|^[a-zA-Z]:[/\\]/;
const sep = "/";
const normalize = function(path) {
  if (path.length === 0) {
    return ".";
  }
  path = normalizeWindowsPath(path);
  const isUNCPath = path.match(_UNC_REGEX);
  const isPathAbsolute = isAbsolute(path);
  const trailingSeparator = path[path.length - 1] === "/";
  path = normalizeString(path, !isPathAbsolute);
  if (path.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path += "/";
  }
  if (_DRIVE_LETTER_RE.test(path)) {
    path += "/";
  }
  if (isUNCPath) {
    if (!isPathAbsolute) {
      return `//./${path}`;
    }
    return `//${path}`;
  }
  return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};
const join = function(...segments) {
  let path = "";
  for (const seg of segments) {
    if (!seg) {
      continue;
    }
    if (path.length > 0) {
      const pathTrailing = path[path.length - 1] === "/";
      const segLeading = seg[0] === "/";
      const both = pathTrailing && segLeading;
      if (both) {
        path += seg.slice(1);
      } else {
        path += pathTrailing || segLeading ? seg : `/${seg}`;
      }
    } else {
      path += seg;
    }
  }
  return normalize(path);
};
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve$2 = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
  return normalizeWindowsPath(p);
};
const extname = function(p) {
  if (p === "..") return "";
  const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
  return match && match[1] || "";
};
const relative = function(from, to) {
  const _from = resolve$2(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
  const _to = resolve$2(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
  if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) {
    return _to.join("/");
  }
  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const format = function(p) {
  const ext = p.ext ? p.ext.startsWith(".") ? p.ext : `.${p.ext}` : "";
  const segments = [p.root, p.dir, p.base ?? (p.name ?? "") + ext].filter(
    Boolean
  );
  return normalizeWindowsPath(
    p.root ? resolve$2(...segments) : segments.join("/")
  );
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse = function(p) {
  const root = _PATH_ROOT_RE.exec(p)?.[0]?.replace(/\\/g, "/") || "";
  const base = basename(p);
  const extension = extname(base);
  return {
    root,
    dir: dirname(p),
    base,
    ext: extension,
    name: base.slice(0, base.length - extension.length)
  };
};
const matchesGlob = (path, pattern) => {
  return zeptomatch(pattern, normalize(path));
};

const _path = {
  __proto__: null,
  basename: basename,
  dirname: dirname,
  extname: extname,
  format: format,
  isAbsolute: isAbsolute,
  join: join,
  matchesGlob: matchesGlob,
  normalize: normalize,
  normalizeString: normalizeString,
  parse: parse,
  relative: relative,
  resolve: resolve$2,
  sep: sep,
  toNamespacedPath: toNamespacedPath
};

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: undefined, win32: undefined };
const mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

function createChainable(keys, fn) {
  function create(context) {
    const chain2 = function(...args) {
      return fn.apply(context, args);
    };
    Object.assign(chain2, fn);
    chain2.withContext = () => chain2.bind(context);
    chain2.setContext = (key, value) => {
      context[key] = value;
    };
    chain2.mergeContext = (ctx) => {
      Object.assign(context, ctx);
    };
    for (const key of keys) {
      Object.defineProperty(chain2, key, {
        get() {
          return create({ ...context, [key]: true });
        }
      });
    }
    return chain2;
  }
  const chain = create({});
  chain.fn = fn;
  return chain;
}

function interpretTaskModes(file, namePattern, testLocations, onlyMode, parentIsOnly, allowOnly) {
  const matchedLocations = [];
  const traverseSuite = (suite, parentIsOnly2, parentMatchedWithLocation) => {
    const suiteIsOnly = parentIsOnly2 || suite.mode === "only";
    suite.tasks.forEach((t) => {
      const includeTask = suiteIsOnly || t.mode === "only";
      if (onlyMode) {
        if (t.type === "suite" && (includeTask || someTasksAreOnly(t))) {
          if (t.mode === "only") {
            checkAllowOnly(t, allowOnly);
            t.mode = "run";
          }
        } else if (t.mode === "run" && !includeTask) {
          t.mode = "skip";
        } else if (t.mode === "only") {
          checkAllowOnly(t, allowOnly);
          t.mode = "run";
        }
      }
      let hasLocationMatch = parentMatchedWithLocation;
      if (testLocations !== undefined && testLocations.length !== 0) {
        if (t.location && (testLocations == null ? undefined : testLocations.includes(t.location.line))) {
          t.mode = "run";
          matchedLocations.push(t.location.line);
          hasLocationMatch = true;
        } else if (parentMatchedWithLocation) {
          t.mode = "run";
        } else if (t.type === "test") {
          t.mode = "skip";
        }
      }
      if (t.type === "test") {
        if (namePattern && !getTaskFullName(t).match(namePattern)) {
          t.mode = "skip";
        }
      } else if (t.type === "suite") {
        if (t.mode === "skip") {
          skipAllTasks(t);
        } else if (t.mode === "todo") {
          todoAllTasks(t);
        } else {
          traverseSuite(t, includeTask, hasLocationMatch);
        }
      }
    });
    if (suite.mode === "run" || suite.mode === "queued") {
      if (suite.tasks.length && suite.tasks.every((i) => i.mode !== "run" && i.mode !== "queued")) {
        suite.mode = "skip";
      }
    }
  };
  traverseSuite(file, parentIsOnly, false);
  const nonMatching = testLocations == null ? undefined : testLocations.filter((loc) => !matchedLocations.includes(loc));
  if (nonMatching && nonMatching.length !== 0) {
    const message = nonMatching.length === 1 ? `line ${nonMatching[0]}` : `lines ${nonMatching.join(", ")}`;
    if (file.result === undefined) {
      file.result = {
        state: "fail",
        errors: []
      };
    }
    if (file.result.errors === undefined) {
      file.result.errors = [];
    }
    file.result.errors.push(
      processError(new Error(`No test found in ${file.name} in ${message}`))
    );
  }
}
function getTaskFullName(task) {
  return `${task.suite ? `${getTaskFullName(task.suite)} ` : ""}${task.name}`;
}
function someTasksAreOnly(suite) {
  return suite.tasks.some(
    (t) => t.mode === "only" || t.type === "suite" && someTasksAreOnly(t)
  );
}
function skipAllTasks(suite) {
  suite.tasks.forEach((t) => {
    if (t.mode === "run" || t.mode === "queued") {
      t.mode = "skip";
      if (t.type === "suite") {
        skipAllTasks(t);
      }
    }
  });
}
function todoAllTasks(suite) {
  suite.tasks.forEach((t) => {
    if (t.mode === "run" || t.mode === "queued") {
      t.mode = "todo";
      if (t.type === "suite") {
        todoAllTasks(t);
      }
    }
  });
}
function checkAllowOnly(task, allowOnly) {
  if (allowOnly) {
    return;
  }
  const error = processError(
    new Error(
      "[Vitest] Unexpected .only modifier. Remove it or pass --allowOnly argument to bypass this error"
    )
  );
  task.result = {
    state: "fail",
    errors: [error]
  };
}
function generateHash(str) {
  let hash = 0;
  if (str.length === 0) {
    return `${hash}`;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${hash}`;
}
function calculateSuiteHash(parent) {
  parent.tasks.forEach((t, idx) => {
    t.id = `${parent.id}_${idx}`;
    if (t.type === "suite") {
      calculateSuiteHash(t);
    }
  });
}
function createFileTask(filepath, root, projectName, pool) {
  const path = relative(root, filepath);
  const file = {
    id: generateFileHash(path, projectName),
    name: path,
    type: "suite",
    mode: "queued",
    filepath,
    tasks: [],
    meta: /* @__PURE__ */ Object.create(null),
    projectName,
    file: undefined,
    pool
  };
  file.file = file;
  return file;
}
function generateFileHash(file, projectName) {
  return generateHash(`${file}${projectName || ""}`);
}

function limitConcurrency(concurrency = Infinity) {
  let count = 0;
  let head;
  let tail;
  const finish = () => {
    count--;
    if (head) {
      head[0]();
      head = head[1];
      tail = head && tail;
    }
  };
  return (func, ...args) => {
    return new Promise((resolve) => {
      if (count++ < concurrency) {
        resolve();
      } else if (tail) {
        tail = tail[1] = [resolve];
      } else {
        head = tail = [resolve];
      }
    }).then(() => {
      return func(...args);
    }).finally(finish);
  };
}

function partitionSuiteChildren(suite) {
  let tasksGroup = [];
  const tasksGroups = [];
  for (const c of suite.tasks) {
    if (tasksGroup.length === 0 || c.concurrent === tasksGroup[0].concurrent) {
      tasksGroup.push(c);
    } else {
      tasksGroups.push(tasksGroup);
      tasksGroup = [c];
    }
  }
  if (tasksGroup.length > 0) {
    tasksGroups.push(tasksGroup);
  }
  return tasksGroups;
}

function isAtomTest(s) {
  return isTestCase(s);
}
function isTestCase(s) {
  return s.type === "test";
}
function getTests(suite) {
  const tests = [];
  const arraySuites = toArray(suite);
  for (const s of arraySuites) {
    if (isTestCase(s)) {
      tests.push(s);
    } else {
      for (const task of s.tasks) {
        if (isTestCase(task)) {
          tests.push(task);
        } else {
          const taskTests = getTests(task);
          for (const test of taskTests) {
            tests.push(test);
          }
        }
      }
    }
  }
  return tests;
}
function getTasks(tasks = []) {
  return toArray(tasks).flatMap(
    (s) => isTestCase(s) ? [s] : [s, ...getTasks(s.tasks)]
  );
}
function getSuites(suite) {
  return toArray(suite).flatMap(
    (s) => s.type === "suite" ? [s, ...getSuites(s.tasks)] : []
  );
}
function hasTests(suite) {
  return toArray(suite).some(
    (s) => s.tasks.some((c) => isTestCase(c) || hasTests(c))
  );
}
function hasFailed(suite) {
  return toArray(suite).some(
    (s) => {
      var _a;
      return ((_a = s.result) == null ? undefined : _a.state) === "fail" || s.type === "suite" && hasFailed(s.tasks);
    }
  );
}
function getNames(task) {
  const names = [task.name];
  let current = task;
  while (current == null ? undefined : current.suite) {
    current = current.suite;
    if (current == null ? undefined : current.name) {
      names.unshift(current.name);
    }
  }
  if (current !== task.file) {
    names.unshift(task.file.name);
  }
  return names;
}
function getFullName(task, separator = " > ") {
  return getNames(task).join(separator);
}
function getTestName(task, separator = " > ") {
  return getNames(task).slice(1).join(separator);
}

class PendingError extends Error {
  constructor(message, task, note) {
    super(message);
    this.message = message;
    this.note = note;
    this.taskId = task.id;
  }
  code = "VITEST_PENDING";
  taskId;
}

const now$2 = Date.now;
const collectorContext = {
  tasks: [],
  currentSuite: null
};
function collectTask(task) {
  var _a;
  (_a = collectorContext.currentSuite) == null ? undefined : _a.tasks.push(task);
}
async function runWithSuite(suite, fn) {
  const prev = collectorContext.currentSuite;
  collectorContext.currentSuite = suite;
  await fn();
  collectorContext.currentSuite = prev;
}
function withTimeout(fn, timeout, isHook = false) {
  if (timeout <= 0 || timeout === Number.POSITIVE_INFINITY) {
    return fn;
  }
  const { setTimeout, clearTimeout } = getSafeTimers();
  return function runWithTimeout(...args) {
    const startTime = now$2();
    return new Promise((resolve_, reject_) => {
      var _a;
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(makeTimeoutMsg(isHook, timeout)));
      }, timeout);
      (_a = timer.unref) == null ? undefined : _a.call(timer);
      function resolve(result) {
        clearTimeout(timer);
        if (now$2() - startTime >= timeout) {
          reject_(new Error(makeTimeoutMsg(isHook, timeout)));
          return;
        }
        resolve_(result);
      }
      function reject(error) {
        clearTimeout(timer);
        reject_(error);
      }
      try {
        const result = fn(...args);
        if (typeof result === "object" && result != null && typeof result.then === "function") {
          result.then(resolve, reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
}
function createTestContext(test, runner) {
  var _a;
  const context = function() {
    throw new Error("done() callback is deprecated, use promise instead");
  };
  context.task = test;
  context.skip = (note) => {
    test.result ?? (test.result = { state: "skip" });
    test.result.pending = true;
    throw new PendingError("test is skipped; abort execution", test, note);
  };
  context.onTestFailed = (handler, timeout) => {
    test.onFailed || (test.onFailed = []);
    test.onFailed.push(
      withTimeout(handler, timeout ?? runner.config.hookTimeout, true)
    );
  };
  context.onTestFinished = (handler, timeout) => {
    test.onFinished || (test.onFinished = []);
    test.onFinished.push(
      withTimeout(handler, timeout ?? runner.config.hookTimeout, true)
    );
  };
  return ((_a = runner.extendTaskContext) == null ? undefined : _a.call(runner, context)) || context;
}
function makeTimeoutMsg(isHook, timeout) {
  return `${isHook ? "Hook" : "Test"} timed out in ${timeout}ms.
If this is a long-running ${isHook ? "hook" : "test"}, pass a timeout value as the last argument or configure it globally with "${isHook ? "hookTimeout" : "testTimeout"}".`;
}

const fnMap = /* @__PURE__ */ new WeakMap();
const fixtureMap = /* @__PURE__ */ new WeakMap();
const hooksMap = /* @__PURE__ */ new WeakMap();
function setFn(key, fn) {
  fnMap.set(key, fn);
}
function getFn(key) {
  return fnMap.get(key);
}
function setFixture(key, fixture) {
  fixtureMap.set(key, fixture);
}
function getFixture(key) {
  return fixtureMap.get(key);
}
function setHooks(key, hooks) {
  hooksMap.set(key, hooks);
}
function getHooks(key) {
  return hooksMap.get(key);
}

function mergeContextFixtures(fixtures, context, inject) {
  const fixtureOptionKeys = ["auto", "injected"];
  const fixtureArray = Object.entries(fixtures).map(
    ([prop, value]) => {
      const fixtureItem = { value };
      if (Array.isArray(value) && value.length >= 2 && isObject$1(value[1]) && Object.keys(value[1]).some((key) => fixtureOptionKeys.includes(key))) {
        Object.assign(fixtureItem, value[1]);
        const userValue = value[0];
        fixtureItem.value = fixtureItem.injected ? inject(prop) ?? userValue : userValue;
      }
      fixtureItem.prop = prop;
      fixtureItem.isFn = typeof fixtureItem.value === "function";
      return fixtureItem;
    }
  );
  if (Array.isArray(context.fixtures)) {
    context.fixtures = context.fixtures.concat(fixtureArray);
  } else {
    context.fixtures = fixtureArray;
  }
  fixtureArray.forEach((fixture) => {
    if (fixture.isFn) {
      const usedProps = getUsedProps(fixture.value);
      if (usedProps.length) {
        fixture.deps = context.fixtures.filter(
          ({ prop }) => prop !== fixture.prop && usedProps.includes(prop)
        );
      }
    }
  });
  return context;
}
const fixtureValueMaps = /* @__PURE__ */ new Map();
const cleanupFnArrayMap = /* @__PURE__ */ new Map();
async function callFixtureCleanup(context) {
  const cleanupFnArray = cleanupFnArrayMap.get(context) ?? [];
  for (const cleanup of cleanupFnArray.reverse()) {
    await cleanup();
  }
  cleanupFnArrayMap.delete(context);
}
function withFixtures(fn, testContext) {
  return (hookContext) => {
    const context = hookContext || testContext;
    if (!context) {
      return fn({});
    }
    const fixtures = getFixture(context);
    if (!(fixtures == null ? undefined : fixtures.length)) {
      return fn(context);
    }
    const usedProps = getUsedProps(fn);
    const hasAutoFixture = fixtures.some(({ auto }) => auto);
    if (!usedProps.length && !hasAutoFixture) {
      return fn(context);
    }
    if (!fixtureValueMaps.get(context)) {
      fixtureValueMaps.set(context, /* @__PURE__ */ new Map());
    }
    const fixtureValueMap = fixtureValueMaps.get(context);
    if (!cleanupFnArrayMap.has(context)) {
      cleanupFnArrayMap.set(context, []);
    }
    const cleanupFnArray = cleanupFnArrayMap.get(context);
    const usedFixtures = fixtures.filter(
      ({ prop, auto }) => auto || usedProps.includes(prop)
    );
    const pendingFixtures = resolveDeps(usedFixtures);
    if (!pendingFixtures.length) {
      return fn(context);
    }
    async function resolveFixtures() {
      for (const fixture of pendingFixtures) {
        if (fixtureValueMap.has(fixture)) {
          continue;
        }
        const resolvedValue = fixture.isFn ? await resolveFixtureFunction(fixture.value, context, cleanupFnArray) : fixture.value;
        context[fixture.prop] = resolvedValue;
        fixtureValueMap.set(fixture, resolvedValue);
        cleanupFnArray.unshift(() => {
          fixtureValueMap.delete(fixture);
        });
      }
    }
    return resolveFixtures().then(() => fn(context));
  };
}
async function resolveFixtureFunction(fixtureFn, context, cleanupFnArray) {
  const useFnArgPromise = createDefer();
  let isUseFnArgResolved = false;
  const fixtureReturn = fixtureFn(context, async (useFnArg) => {
    isUseFnArgResolved = true;
    useFnArgPromise.resolve(useFnArg);
    const useReturnPromise = createDefer();
    cleanupFnArray.push(async () => {
      useReturnPromise.resolve();
      await fixtureReturn;
    });
    await useReturnPromise;
  }).catch((e) => {
    if (!isUseFnArgResolved) {
      useFnArgPromise.reject(e);
      return;
    }
    throw e;
  });
  return useFnArgPromise;
}
function resolveDeps(fixtures, depSet = /* @__PURE__ */ new Set(), pendingFixtures = []) {
  fixtures.forEach((fixture) => {
    if (pendingFixtures.includes(fixture)) {
      return;
    }
    if (!fixture.isFn || !fixture.deps) {
      pendingFixtures.push(fixture);
      return;
    }
    if (depSet.has(fixture)) {
      throw new Error(
        `Circular fixture dependency detected: ${fixture.prop} <- ${[...depSet].reverse().map((d) => d.prop).join(" <- ")}`
      );
    }
    depSet.add(fixture);
    resolveDeps(fixture.deps, depSet, pendingFixtures);
    pendingFixtures.push(fixture);
    depSet.clear();
  });
  return pendingFixtures;
}
function getUsedProps(fn) {
  let fnString = fn.toString();
  if (/__async\(this, (?:null|arguments|\[[_0-9, ]*\]), function\*/.test(fnString)) {
    fnString = fnString.split("__async(this,")[1];
  }
  const match = fnString.match(/[^(]*\(([^)]*)/);
  if (!match) {
    return [];
  }
  const args = splitByComma(match[1]);
  if (!args.length) {
    return [];
  }
  let first = args[0];
  if ("__VITEST_FIXTURE_INDEX__" in fn) {
    first = args[fn.__VITEST_FIXTURE_INDEX__];
    if (!first) {
      return [];
    }
  }
  if (!(first.startsWith("{") && first.endsWith("}"))) {
    throw new Error(
      `The first argument inside a fixture must use object destructuring pattern, e.g. ({ test } => {}). Instead, received "${first}".`
    );
  }
  const _first = first.slice(1, -1).replace(/\s/g, "");
  const props = splitByComma(_first).map((prop) => {
    return prop.replace(/:.*|=.*/g, "");
  });
  const last = props.at(-1);
  if (last && last.startsWith("...")) {
    throw new Error(
      `Rest parameters are not supported in fixtures, received "${last}".`
    );
  }
  return props;
}
function splitByComma(s) {
  const result = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "{" || s[i] === "[") {
      stack.push(s[i] === "{" ? "}" : "]");
    } else if (s[i] === stack[stack.length - 1]) {
      stack.pop();
    } else if (!stack.length && s[i] === ",") {
      const token = s.substring(start, i).trim();
      if (token) {
        result.push(token);
      }
      start = i + 1;
    }
  }
  const lastToken = s.substring(start).trim();
  if (lastToken) {
    result.push(lastToken);
  }
  return result;
}

let _test;
function setCurrentTest(test) {
  _test = test;
}
function getCurrentTest() {
  return _test;
}

const suite = createSuite();
const test$1 = createTest(function(name, optionsOrFn, optionsOrTest) {
  if (getCurrentTest()) {
    throw new Error(
      'Calling the test function inside another test function is not allowed. Please put it inside "describe" or "suite" so it can be properly collected.'
    );
  }
  getCurrentSuite().test.fn.call(
    this,
    formatName$1(name),
    optionsOrFn,
    optionsOrTest
  );
});
const describe = suite;
const it = test$1;
let runner;
let defaultSuite;
let currentTestFilepath;
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Vitest failed to find ${message}. This is a bug in Vitest. Please, open an issue with reproduction.`);
  }
}
function getDefaultSuite() {
  assert(defaultSuite, "the default suite");
  return defaultSuite;
}
function getTestFilepath() {
  return currentTestFilepath;
}
function getRunner() {
  assert(runner, "the runner");
  return runner;
}
function createDefaultSuite(runner2) {
  const config = runner2.config.sequence;
  return suite("", { concurrent: config.concurrent }, () => {
  });
}
function clearCollectorContext(filepath, currentRunner) {
  if (!defaultSuite) {
    defaultSuite = createDefaultSuite(currentRunner);
  }
  runner = currentRunner;
  currentTestFilepath = filepath;
  collectorContext.tasks.length = 0;
  defaultSuite.clear();
  collectorContext.currentSuite = defaultSuite;
}
function getCurrentSuite() {
  const currentSuite = collectorContext.currentSuite || defaultSuite;
  assert(currentSuite, "the current suite");
  return currentSuite;
}
function createSuiteHooks() {
  return {
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: []
  };
}
function parseArguments(optionsOrFn, optionsOrTest) {
  let options = {};
  let fn = () => {
  };
  if (typeof optionsOrTest === "object") {
    if (typeof optionsOrFn === "object") {
      throw new TypeError(
        "Cannot use two objects as arguments. Please provide options and a function callback in that order."
      );
    }
    console.warn(
      "Using an object as a third argument is deprecated. Vitest 4 will throw an error if the third argument is not a timeout number. Please use the second argument for options. See more at https://vitest.dev/guide/migration"
    );
    options = optionsOrTest;
  } else if (typeof optionsOrTest === "number") {
    options = { timeout: optionsOrTest };
  } else if (typeof optionsOrFn === "object") {
    options = optionsOrFn;
  }
  if (typeof optionsOrFn === "function") {
    if (typeof optionsOrTest === "function") {
      throw new TypeError(
        "Cannot use two functions as arguments. Please use the second argument for options."
      );
    }
    fn = optionsOrFn;
  } else if (typeof optionsOrTest === "function") {
    fn = optionsOrTest;
  }
  return {
    options,
    handler: fn
  };
}
function createSuiteCollector(name, factory = () => {
}, mode, each, suiteOptions) {
  const tasks = [];
  const factoryQueue = [];
  let suite2;
  initSuite(true);
  const task = function(name2 = "", options = {}) {
    const task2 = {
      id: "",
      name: name2,
      suite: undefined,
      each: options.each,
      fails: options.fails,
      context: undefined,
      type: "test",
      file: undefined,
      retry: options.retry ?? runner.config.retry,
      repeats: options.repeats,
      mode: options.only ? "only" : options.skip ? "skip" : options.todo ? "todo" : "run",
      meta: options.meta ?? /* @__PURE__ */ Object.create(null)
    };
    const handler = options.handler;
    if (options.concurrent || !options.sequential && runner.config.sequence.concurrent) {
      task2.concurrent = true;
    }
    task2.shuffle = suiteOptions == null ? undefined : suiteOptions.shuffle;
    const context = createTestContext(task2, runner);
    Object.defineProperty(task2, "context", {
      value: context,
      enumerable: false
    });
    setFixture(context, options.fixtures);
    if (handler) {
      setFn(
        task2,
        withTimeout(
          withAwaitAsyncAssertions(withFixtures(handler, context), task2),
          (options == null ? undefined : options.timeout) ?? runner.config.testTimeout
        )
      );
    }
    if (runner.config.includeTaskLocation) {
      const limit = Error.stackTraceLimit;
      Error.stackTraceLimit = 15;
      const error = new Error("stacktrace").stack;
      Error.stackTraceLimit = limit;
      const stack = findTestFileStackTrace(error, task2.each ?? false);
      if (stack) {
        task2.location = stack;
      }
    }
    tasks.push(task2);
    return task2;
  };
  const test2 = createTest(function(name2, optionsOrFn, optionsOrTest) {
    let { options, handler } = parseArguments(optionsOrFn, optionsOrTest);
    if (typeof suiteOptions === "object") {
      options = Object.assign({}, suiteOptions, options);
    }
    options.concurrent = this.concurrent || !this.sequential && (options == null ? undefined : options.concurrent);
    options.sequential = this.sequential || !this.concurrent && (options == null ? undefined : options.sequential);
    const test3 = task(formatName$1(name2), {
      ...this,
      ...options,
      handler
    });
    test3.type = "test";
  });
  const collector = {
    type: "collector",
    name,
    mode,
    options: suiteOptions,
    test: test2,
    tasks,
    collect,
    task,
    clear,
    on: addHook
  };
  function addHook(name2, ...fn) {
    getHooks(suite2)[name2].push(...fn);
  }
  function initSuite(includeLocation) {
    if (typeof suiteOptions === "number") {
      suiteOptions = { timeout: suiteOptions };
    }
    suite2 = {
      id: "",
      type: "suite",
      name,
      mode,
      each,
      file: undefined,
      shuffle: suiteOptions == null ? undefined : suiteOptions.shuffle,
      tasks: [],
      meta: /* @__PURE__ */ Object.create(null),
      concurrent: suiteOptions == null ? undefined : suiteOptions.concurrent
    };
    if (runner && includeLocation && runner.config.includeTaskLocation) {
      const limit = Error.stackTraceLimit;
      Error.stackTraceLimit = 15;
      const error = new Error("stacktrace").stack;
      Error.stackTraceLimit = limit;
      const stack = findTestFileStackTrace(error, suite2.each ?? false);
      if (stack) {
        suite2.location = stack;
      }
    }
    setHooks(suite2, createSuiteHooks());
  }
  function clear() {
    tasks.length = 0;
    factoryQueue.length = 0;
    initSuite(false);
  }
  async function collect(file) {
    if (!file) {
      throw new TypeError("File is required to collect tasks.");
    }
    factoryQueue.length = 0;
    if (factory) {
      await runWithSuite(collector, () => factory(test2));
    }
    const allChildren = [];
    for (const i of [...factoryQueue, ...tasks]) {
      allChildren.push(i.type === "collector" ? await i.collect(file) : i);
    }
    suite2.file = file;
    suite2.tasks = allChildren;
    allChildren.forEach((task2) => {
      task2.suite = suite2;
      task2.file = file;
    });
    return suite2;
  }
  collectTask(collector);
  return collector;
}
function withAwaitAsyncAssertions(fn, task) {
  return async (...args) => {
    const fnResult = await fn(...args);
    if (task.promises) {
      const result = await Promise.allSettled(task.promises);
      const errors = result.map((r) => r.status === "rejected" ? r.reason : undefined).filter(Boolean);
      if (errors.length) {
        throw errors;
      }
    }
    return fnResult;
  };
}
function createSuite() {
  function suiteFn(name, factoryOrOptions, optionsOrFactory) {
    var _a;
    const mode = this.only ? "only" : this.skip ? "skip" : this.todo ? "todo" : "run";
    const currentSuite = collectorContext.currentSuite || defaultSuite;
    let { options, handler: factory } = parseArguments(
      factoryOrOptions,
      optionsOrFactory
    );
    const isConcurrentSpecified = options.concurrent || this.concurrent || options.sequential === false;
    const isSequentialSpecified = options.sequential || this.sequential || options.concurrent === false;
    options = {
      ...currentSuite == null ? undefined : currentSuite.options,
      ...options,
      shuffle: this.shuffle ?? options.shuffle ?? ((_a = currentSuite == null ? undefined : currentSuite.options) == null ? undefined : _a.shuffle) ?? (runner == null ? undefined : runner.config.sequence.shuffle)
    };
    const isConcurrent = isConcurrentSpecified || options.concurrent && !isSequentialSpecified;
    const isSequential = isSequentialSpecified || options.sequential && !isConcurrentSpecified;
    options.concurrent = isConcurrent && !isSequential;
    options.sequential = isSequential && !isConcurrent;
    return createSuiteCollector(
      formatName$1(name),
      factory,
      mode,
      this.each,
      options
    );
  }
  suiteFn.each = function(cases, ...args) {
    const suite2 = this.withContext();
    this.setContext("each", true);
    if (Array.isArray(cases) && args.length) {
      cases = formatTemplateString(cases, args);
    }
    return (name, optionsOrFn, fnOrOptions) => {
      const _name = formatName$1(name);
      const arrayOnlyCases = cases.every(Array.isArray);
      const { options, handler } = parseArguments(optionsOrFn, fnOrOptions);
      const fnFirst = typeof optionsOrFn === "function" && typeof fnOrOptions === "object";
      cases.forEach((i, idx) => {
        const items = Array.isArray(i) ? i : [i];
        if (fnFirst) {
          if (arrayOnlyCases) {
            suite2(
              formatTitle(_name, items, idx),
              () => handler(...items),
              options
            );
          } else {
            suite2(formatTitle(_name, items, idx), () => handler(i), options);
          }
        } else {
          if (arrayOnlyCases) {
            suite2(formatTitle(_name, items, idx), options, () => handler(...items));
          } else {
            suite2(formatTitle(_name, items, idx), options, () => handler(i));
          }
        }
      });
      this.setContext("each", undefined);
    };
  };
  suiteFn.for = function(cases, ...args) {
    if (Array.isArray(cases) && args.length) {
      cases = formatTemplateString(cases, args);
    }
    return (name, optionsOrFn, fnOrOptions) => {
      const name_ = formatName$1(name);
      const { options, handler } = parseArguments(optionsOrFn, fnOrOptions);
      cases.forEach((item, idx) => {
        suite(formatTitle(name_, toArray(item), idx), options, () => handler(item));
      });
    };
  };
  suiteFn.skipIf = (condition) => condition ? suite.skip : suite;
  suiteFn.runIf = (condition) => condition ? suite : suite.skip;
  return createChainable(
    ["concurrent", "sequential", "shuffle", "skip", "only", "todo"],
    suiteFn
  );
}
function createTaskCollector(fn, context) {
  const taskFn = fn;
  taskFn.each = function(cases, ...args) {
    const test2 = this.withContext();
    this.setContext("each", true);
    if (Array.isArray(cases) && args.length) {
      cases = formatTemplateString(cases, args);
    }
    return (name, optionsOrFn, fnOrOptions) => {
      const _name = formatName$1(name);
      const arrayOnlyCases = cases.every(Array.isArray);
      const { options, handler } = parseArguments(optionsOrFn, fnOrOptions);
      const fnFirst = typeof optionsOrFn === "function" && typeof fnOrOptions === "object";
      cases.forEach((i, idx) => {
        const items = Array.isArray(i) ? i : [i];
        if (fnFirst) {
          if (arrayOnlyCases) {
            test2(
              formatTitle(_name, items, idx),
              () => handler(...items),
              options
            );
          } else {
            test2(formatTitle(_name, items, idx), () => handler(i), options);
          }
        } else {
          if (arrayOnlyCases) {
            test2(formatTitle(_name, items, idx), options, () => handler(...items));
          } else {
            test2(formatTitle(_name, items, idx), options, () => handler(i));
          }
        }
      });
      this.setContext("each", undefined);
    };
  };
  taskFn.for = function(cases, ...args) {
    const test2 = this.withContext();
    if (Array.isArray(cases) && args.length) {
      cases = formatTemplateString(cases, args);
    }
    return (name, optionsOrFn, fnOrOptions) => {
      const _name = formatName$1(name);
      const { options, handler } = parseArguments(optionsOrFn, fnOrOptions);
      cases.forEach((item, idx) => {
        const handlerWrapper = (ctx) => handler(item, ctx);
        handlerWrapper.__VITEST_FIXTURE_INDEX__ = 1;
        handlerWrapper.toString = () => handler.toString();
        test2(formatTitle(_name, toArray(item), idx), options, handlerWrapper);
      });
    };
  };
  taskFn.skipIf = function(condition) {
    return condition ? this.skip : this;
  };
  taskFn.runIf = function(condition) {
    return condition ? this : this.skip;
  };
  taskFn.extend = function(fixtures) {
    const _context = mergeContextFixtures(
      fixtures,
      context || {},
      (key) => {
        var _a, _b;
        return (_b = (_a = getRunner()).injectValue) == null ? undefined : _b.call(_a, key);
      }
    );
    return createTest(function fn2(name, optionsOrFn, optionsOrTest) {
      getCurrentSuite().test.fn.call(
        this,
        formatName$1(name),
        optionsOrFn,
        optionsOrTest
      );
    }, _context);
  };
  const _test = createChainable(
    ["concurrent", "sequential", "skip", "only", "todo", "fails"],
    taskFn
  );
  if (context) {
    _test.mergeContext(context);
  }
  return _test;
}
function createTest(fn, context) {
  return createTaskCollector(fn, context);
}
function formatName$1(name) {
  return typeof name === "string" ? name : name instanceof Function ? name.name || "<anonymous>" : String(name);
}
function formatTitle(template, items, idx) {
  if (template.includes("%#")) {
    template = template.replace(/%%/g, "__vitest_escaped_%__").replace(/%#/g, `${idx}`).replace(/__vitest_escaped_%__/g, "%%");
  }
  const count = template.split("%").length - 1;
  if (template.includes("%f")) {
    const placeholders = template.match(/%f/g) || [];
    placeholders.forEach((_, i) => {
      if (isNegativeNaN(items[i]) || Object.is(items[i], -0)) {
        let occurrence = 0;
        template = template.replace(/%f/g, (match) => {
          occurrence++;
          return occurrence === i + 1 ? "-%f" : match;
        });
      }
    });
  }
  let formatted = format$1(template, ...items.slice(0, count));
  if (isObject$1(items[0])) {
    formatted = formatted.replace(
      /\$([$\w.]+)/g,
      // https://github.com/chaijs/chai/pull/1490
      (_, key) => {
        var _a, _b;
        return objDisplay$1(objectAttr(items[0], key), {
          truncate: (_b = (_a = runner == null ? undefined : runner.config) == null ? undefined : _a.chaiConfig) == null ? undefined : _b.truncateThreshold
        });
      }
    );
  }
  return formatted;
}
function formatTemplateString(cases, args) {
  const header = cases.join("").trim().replace(/ /g, "").split("\n").map((i) => i.split("|"))[0];
  const res = [];
  for (let i = 0; i < Math.floor(args.length / header.length); i++) {
    const oneCase = {};
    for (let j = 0; j < header.length; j++) {
      oneCase[header[j]] = args[i * header.length + j];
    }
    res.push(oneCase);
  }
  return res;
}
function findTestFileStackTrace(error, each) {
  const lines = error.split("\n").slice(1);
  for (const line of lines) {
    const stack = parseSingleStack(line);
    if (stack && stack.file === getTestFilepath()) {
      return {
        line: stack.line,
        /**
         * test.each([1, 2])('name')
         *                 ^ leads here, but should
         *                  ^ lead here
         * in source maps it's the same boundary, so it just points to the start of it
         */
        column: each ? stack.column + 1 : stack.column
      };
    }
  }
}

function getDefaultHookTimeout() {
  return getRunner().config.hookTimeout;
}
function beforeAll(fn, timeout) {
  assertTypes(fn, '"beforeAll" callback', ["function"]);
  return getCurrentSuite().on(
    "beforeAll",
    withTimeout(fn, timeout ?? getDefaultHookTimeout(), true)
  );
}
function afterAll(fn, timeout) {
  assertTypes(fn, '"afterAll" callback', ["function"]);
  return getCurrentSuite().on(
    "afterAll",
    withTimeout(fn, timeout ?? getDefaultHookTimeout(), true)
  );
}
function beforeEach(fn, timeout) {
  assertTypes(fn, '"beforeEach" callback', ["function"]);
  return getCurrentSuite().on(
    "beforeEach",
    withTimeout(withFixtures(fn), timeout ?? getDefaultHookTimeout(), true)
  );
}
function afterEach(fn, timeout) {
  assertTypes(fn, '"afterEach" callback', ["function"]);
  return getCurrentSuite().on(
    "afterEach",
    withTimeout(withFixtures(fn), timeout ?? getDefaultHookTimeout(), true)
  );
}
const onTestFailed = createTestHook(
  "onTestFailed",
  (test, handler, timeout) => {
    test.onFailed || (test.onFailed = []);
    test.onFailed.push(
      withTimeout(handler, timeout ?? getDefaultHookTimeout(), true)
    );
  }
);
const onTestFinished = createTestHook(
  "onTestFinished",
  (test, handler, timeout) => {
    test.onFinished || (test.onFinished = []);
    test.onFinished.push(
      withTimeout(handler, timeout ?? getDefaultHookTimeout(), true)
    );
  }
);
function createTestHook(name, handler) {
  return (fn, timeout) => {
    assertTypes(fn, `"${name}" callback`, ["function"]);
    const current = getCurrentTest();
    if (!current) {
      throw new Error(`Hook ${name}() can only be called inside a test`);
    }
    return handler(current, fn, timeout);
  };
}

async function runSetupFiles(config, files, runner) {
  if (config.sequence.setupFiles === "parallel") {
    await Promise.all(
      files.map(async (fsPath) => {
        await runner.importFile(fsPath, "setup");
      })
    );
  } else {
    for (const fsPath of files) {
      await runner.importFile(fsPath, "setup");
    }
  }
}

const now$1 = globalThis.performance ? globalThis.performance.now.bind(globalThis.performance) : Date.now;
async function collectTests(specs, runner) {
  var _a;
  const files = [];
  const config = runner.config;
  for (const spec of specs) {
    const filepath = typeof spec === "string" ? spec : spec.filepath;
    const testLocations = typeof spec === "string" ? undefined : spec.testLocations;
    const file = createFileTask(filepath, config.root, config.name, runner.pool);
    file.shuffle = config.sequence.shuffle;
    (_a = runner.onCollectStart) == null ? undefined : _a.call(runner, file);
    clearCollectorContext(filepath, runner);
    try {
      const setupFiles = toArray(config.setupFiles);
      if (setupFiles.length) {
        const setupStart = now$1();
        await runSetupFiles(config, setupFiles, runner);
        const setupEnd = now$1();
        file.setupDuration = setupEnd - setupStart;
      } else {
        file.setupDuration = 0;
      }
      const collectStart = now$1();
      await runner.importFile(filepath, "collect");
      const defaultTasks = await getDefaultSuite().collect(file);
      const fileHooks = createSuiteHooks();
      mergeHooks(fileHooks, getHooks(defaultTasks));
      for (const c of [...defaultTasks.tasks, ...collectorContext.tasks]) {
        if (c.type === "test" || c.type === "suite") {
          file.tasks.push(c);
        } else if (c.type === "collector") {
          const suite = await c.collect(file);
          if (suite.name || suite.tasks.length) {
            mergeHooks(fileHooks, getHooks(suite));
            file.tasks.push(suite);
          }
        } else {
          c;
        }
      }
      setHooks(file, fileHooks);
      file.collectDuration = now$1() - collectStart;
    } catch (e) {
      const error = processError(e);
      file.result = {
        state: "fail",
        errors: [error]
      };
    }
    calculateSuiteHash(file);
    file.tasks.forEach((task) => {
      var _a2;
      if (((_a2 = task.suite) == null ? undefined : _a2.id) === "") {
        delete task.suite;
      }
    });
    const hasOnlyTasks = someTasksAreOnly(file);
    interpretTaskModes(
      file,
      config.testNamePattern,
      testLocations,
      hasOnlyTasks,
      false,
      config.allowOnly
    );
    if (file.mode === "queued") {
      file.mode = "run";
    }
    files.push(file);
  }
  return files;
}
function mergeHooks(baseHooks, hooks) {
  for (const _key in hooks) {
    const key = _key;
    baseHooks[key].push(...hooks[key]);
  }
  return baseHooks;
}

const now$3 = globalThis.performance ? globalThis.performance.now.bind(globalThis.performance) : Date.now;
const unixNow = Date.now;
function updateSuiteHookState(task, name, state, runner) {
  if (!task.result) {
    task.result = { state: "run" };
  }
  if (!task.result.hooks) {
    task.result.hooks = {};
  }
  const suiteHooks = task.result.hooks;
  if (suiteHooks) {
    suiteHooks[name] = state;
    let event = state === "run" ? "before-hook-start" : "before-hook-end";
    if (name === "afterAll" || name === "afterEach") {
      event = state === "run" ? "after-hook-start" : "after-hook-end";
    }
    updateTask(
      event,
      task,
      runner
    );
  }
}
function getSuiteHooks(suite, name, sequence) {
  const hooks = getHooks(suite)[name];
  if (sequence === "stack" && (name === "afterAll" || name === "afterEach")) {
    return hooks.slice().reverse();
  }
  return hooks;
}
async function callTestHooks(runner, test, hooks, sequence) {
  if (sequence === "stack") {
    hooks = hooks.slice().reverse();
  }
  if (!hooks.length) {
    return;
  }
  const onTestFailed = test.context.onTestFailed;
  const onTestFinished = test.context.onTestFinished;
  test.context.onTestFailed = () => {
    throw new Error(`Cannot call "onTestFailed" inside a test hook.`);
  };
  test.context.onTestFinished = () => {
    throw new Error(`Cannot call "onTestFinished" inside a test hook.`);
  };
  if (sequence === "parallel") {
    try {
      await Promise.all(hooks.map((fn) => fn(test.context)));
    } catch (e) {
      failTask(test.result, e, runner.config.diffOptions);
    }
  } else {
    for (const fn of hooks) {
      try {
        await fn(test.context);
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
    }
  }
  test.context.onTestFailed = onTestFailed;
  test.context.onTestFinished = onTestFinished;
}
async function callSuiteHook(suite, currentTask, name, runner, args) {
  const sequence = runner.config.sequence.hooks;
  const callbacks = [];
  const parentSuite = "filepath" in suite ? null : suite.suite || suite.file;
  if (name === "beforeEach" && parentSuite) {
    callbacks.push(
      ...await callSuiteHook(parentSuite, currentTask, name, runner, args)
    );
  }
  const hooks = getSuiteHooks(suite, name, sequence);
  if (hooks.length > 0) {
    updateSuiteHookState(currentTask, name, "run", runner);
  }
  if (sequence === "parallel") {
    callbacks.push(
      ...await Promise.all(hooks.map((hook) => hook(...args)))
    );
  } else {
    for (const hook of hooks) {
      callbacks.push(await hook(...args));
    }
  }
  if (hooks.length > 0) {
    updateSuiteHookState(currentTask, name, "pass", runner);
  }
  if (name === "afterEach" && parentSuite) {
    callbacks.push(
      ...await callSuiteHook(parentSuite, currentTask, name, runner, args)
    );
  }
  return callbacks;
}
const packs = /* @__PURE__ */ new Map();
const eventsPacks = [];
let updateTimer;
let previousUpdate;
function updateTask(event, task, runner) {
  eventsPacks.push([task.id, event]);
  packs.set(task.id, [task.result, task.meta]);
  const { clearTimeout, setTimeout } = getSafeTimers();
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    previousUpdate = sendTasksUpdate(runner);
  }, 10);
}
async function sendTasksUpdate(runner) {
  var _a;
  const { clearTimeout } = getSafeTimers();
  clearTimeout(updateTimer);
  await previousUpdate;
  if (packs.size) {
    const taskPacks = Array.from(packs).map(([id, task]) => {
      return [id, task[0], task[1]];
    });
    const p = (_a = runner.onTaskUpdate) == null ? undefined : _a.call(runner, taskPacks, eventsPacks);
    eventsPacks.length = 0;
    packs.clear();
    return p;
  }
}
async function callCleanupHooks(cleanups) {
  await Promise.all(
    cleanups.map(async (fn) => {
      if (typeof fn !== "function") {
        return;
      }
      await fn();
    })
  );
}
async function runTest(test, runner) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  await ((_a = runner.onBeforeRunTask) == null ? undefined : _a.call(runner, test));
  if (test.mode !== "run" && test.mode !== "queued") {
    return;
  }
  if (((_b = test.result) == null ? undefined : _b.state) === "fail") {
    updateTask("test-failed-early", test, runner);
    return;
  }
  const start = now$3();
  test.result = {
    state: "run",
    startTime: unixNow(),
    retryCount: 0
  };
  updateTask("test-prepare", test, runner);
  setCurrentTest(test);
  const suite = test.suite || test.file;
  const repeats = test.repeats ?? 0;
  for (let repeatCount = 0; repeatCount <= repeats; repeatCount++) {
    const retry = test.retry ?? 0;
    for (let retryCount = 0; retryCount <= retry; retryCount++) {
      let beforeEachCleanups = [];
      try {
        await ((_c = runner.onBeforeTryTask) == null ? void 0 : _c.call(runner, test, {
          retry: retryCount,
          repeats: repeatCount
        }));
        test.result.repeatCount = repeatCount;
        beforeEachCleanups = await callSuiteHook(
          suite,
          test,
          "beforeEach",
          runner,
          [test.context, suite]
        );
        if (runner.runTask) {
          await runner.runTask(test);
        } else {
          const fn = getFn(test);
          if (!fn) {
            throw new Error(
              "Test function is not found. Did you add it using `setFn`?"
            );
          }
          await fn();
        }
        await ((_d = runner.onAfterTryTask) == null ? void 0 : _d.call(runner, test, {
          retry: retryCount,
          repeats: repeatCount
        }));
        if (test.result.state !== "fail") {
          if (!test.repeats) {
            test.result.state = "pass";
          } else if (test.repeats && retry === retryCount) {
            test.result.state = "pass";
          }
        }
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
      if (((_e = test.result) == null ? undefined : _e.pending) || ((_f = test.result) == null ? undefined : _f.state) === "skip") {
        test.mode = "skip";
        test.result = { state: "skip", note: (_g = test.result) == null ? undefined : _g.note, pending: true };
        updateTask("test-finished", test, runner);
        setCurrentTest(undefined);
        return;
      }
      try {
        await ((_h = runner.onTaskFinished) == null ? void 0 : _h.call(runner, test));
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
      try {
        await callSuiteHook(suite, test, "afterEach", runner, [
          test.context,
          suite
        ]);
        await callCleanupHooks(beforeEachCleanups);
        await callFixtureCleanup(test.context);
      } catch (e) {
        failTask(test.result, e, runner.config.diffOptions);
      }
      await callTestHooks(runner, test, test.onFinished || [], "stack");
      if (test.result.state === "fail") {
        await callTestHooks(
          runner,
          test,
          test.onFailed || [],
          runner.config.sequence.hooks
        );
      }
      test.onFailed = undefined;
      test.onFinished = undefined;
      if (test.result.state === "pass") {
        break;
      }
      if (retryCount < retry) {
        test.result.state = "run";
        test.result.retryCount = (test.result.retryCount ?? 0) + 1;
      }
      updateTask("test-retried", test, runner);
    }
  }
  if (test.fails) {
    if (test.result.state === "pass") {
      const error = processError(new Error("Expect test to fail"));
      test.result.state = "fail";
      test.result.errors = [error];
    } else {
      test.result.state = "pass";
      test.result.errors = undefined;
    }
  }
  setCurrentTest(undefined);
  test.result.duration = now$3() - start;
  await ((_i = runner.onAfterRunTask) == null ? undefined : _i.call(runner, test));
  updateTask("test-finished", test, runner);
}
function failTask(result, err, diffOptions) {
  if (err instanceof PendingError) {
    result.state = "skip";
    result.note = err.note;
    result.pending = true;
    return;
  }
  result.state = "fail";
  const errors = Array.isArray(err) ? err : [err];
  for (const e of errors) {
    const error = processError(e, diffOptions);
    result.errors ?? (result.errors = []);
    result.errors.push(error);
  }
}
function markTasksAsSkipped(suite, runner) {
  suite.tasks.forEach((t) => {
    t.mode = "skip";
    t.result = { ...t.result, state: "skip" };
    updateTask("test-finished", t, runner);
    if (t.type === "suite") {
      markTasksAsSkipped(t, runner);
    }
  });
}
async function runSuite(suite, runner) {
  var _a, _b, _c, _d;
  await ((_a = runner.onBeforeRunSuite) == null ? undefined : _a.call(runner, suite));
  if (((_b = suite.result) == null ? undefined : _b.state) === "fail") {
    markTasksAsSkipped(suite, runner);
    updateTask("suite-failed-early", suite, runner);
    return;
  }
  const start = now$3();
  const mode = suite.mode;
  suite.result = {
    state: mode === "skip" || mode === "todo" ? mode : "run",
    startTime: unixNow()
  };
  updateTask("suite-prepare", suite, runner);
  let beforeAllCleanups = [];
  if (suite.mode === "skip") {
    suite.result.state = "skip";
    updateTask("suite-finished", suite, runner);
  } else if (suite.mode === "todo") {
    suite.result.state = "todo";
    updateTask("suite-finished", suite, runner);
  } else {
    try {
      try {
        beforeAllCleanups = await callSuiteHook(
          suite,
          suite,
          "beforeAll",
          runner,
          [suite]
        );
      } catch (e) {
        markTasksAsSkipped(suite, runner);
        throw e;
      }
      if (runner.runSuite) {
        await runner.runSuite(suite);
      } else {
        for (let tasksGroup of partitionSuiteChildren(suite)) {
          if (tasksGroup[0].concurrent === true) {
            await Promise.all(tasksGroup.map((c) => runSuiteChild(c, runner)));
          } else {
            const { sequence } = runner.config;
            if (suite.shuffle) {
              const suites = tasksGroup.filter(
                (group) => group.type === "suite"
              );
              const tests = tasksGroup.filter((group) => group.type === "test");
              const groups = shuffle([suites, tests], sequence.seed);
              tasksGroup = groups.flatMap(
                (group) => shuffle(group, sequence.seed)
              );
            }
            for (const c of tasksGroup) {
              await runSuiteChild(c, runner);
            }
          }
        }
      }
    } catch (e) {
      failTask(suite.result, e, runner.config.diffOptions);
    }
    try {
      await callSuiteHook(suite, suite, "afterAll", runner, [suite]);
      await callCleanupHooks(beforeAllCleanups);
    } catch (e) {
      failTask(suite.result, e, runner.config.diffOptions);
    }
    if (suite.mode === "run" || suite.mode === "queued") {
      if (!runner.config.passWithNoTests && !hasTests(suite)) {
        suite.result.state = "fail";
        if (!((_c = suite.result.errors) == null ? undefined : _c.length)) {
          const error = processError(
            new Error(`No test found in suite ${suite.name}`)
          );
          suite.result.errors = [error];
        }
      } else if (hasFailed(suite)) {
        suite.result.state = "fail";
      } else {
        suite.result.state = "pass";
      }
    }
    suite.result.duration = now$3() - start;
    updateTask("suite-finished", suite, runner);
    await ((_d = runner.onAfterRunSuite) == null ? undefined : _d.call(runner, suite));
  }
}
let limitMaxConcurrency;
async function runSuiteChild(c, runner) {
  if (c.type === "test") {
    return limitMaxConcurrency(() => runTest(c, runner));
  } else if (c.type === "suite") {
    return runSuite(c, runner);
  }
}
async function runFiles(files, runner) {
  var _a, _b;
  limitMaxConcurrency ?? (limitMaxConcurrency = limitConcurrency(runner.config.maxConcurrency));
  for (const file of files) {
    if (!file.tasks.length && !runner.config.passWithNoTests) {
      if (!((_b = (_a = file.result) == null ? undefined : _a.errors) == null ? undefined : _b.length)) {
        const error = processError(
          new Error(`No test suite found in file ${file.filepath}`)
        );
        file.result = {
          state: "fail",
          errors: [error]
        };
      }
    }
    await runSuite(file, runner);
  }
}
async function startTests(specs, runner) {
  var _a, _b, _c, _d;
  const paths = specs.map((f) => typeof f === "string" ? f : f.filepath);
  await ((_a = runner.onBeforeCollect) == null ? undefined : _a.call(runner, paths));
  const files = await collectTests(specs, runner);
  await ((_b = runner.onCollected) == null ? undefined : _b.call(runner, files));
  await ((_c = runner.onBeforeRunFiles) == null ? undefined : _c.call(runner, files));
  await runFiles(files, runner);
  await ((_d = runner.onAfterRunFiles) == null ? undefined : _d.call(runner, files));
  await sendTasksUpdate(runner);
  return files;
}
async function publicCollect(specs, runner) {
  var _a, _b;
  const paths = specs.map((f) => typeof f === "string" ? f : f.filepath);
  await ((_a = runner.onBeforeCollect) == null ? undefined : _a.call(runner, paths));
  const files = await collectTests(specs, runner);
  await ((_b = runner.onCollected) == null ? undefined : _b.call(runner, files));
  return files;
}

const NAME_WORKER_STATE = "__vitest_worker__";
function getWorkerState() {
  const workerState = globalThis[NAME_WORKER_STATE];
  if (!workerState) {
    const errorMsg = 'Vitest failed to access its internal state.\n\nOne of the following is possible:\n- "vitest" is imported directly without running "vitest" command\n- "vitest" is imported inside "globalSetup" (to fix this, use "setupFiles" instead, because "globalSetup" runs in a different context)\n- Otherwise, it might be a Vitest bug. Please report it to https://github.com/vitest-dev/vitest/issues\n';
    throw new Error(errorMsg);
  }
  return workerState;
}
function provideWorkerState(context, state) {
  Object.defineProperty(context, NAME_WORKER_STATE, {
    value: state,
    configurable: true,
    writable: true,
    enumerable: false
  });
  return state;
}
function getCurrentEnvironment() {
  const state = getWorkerState();
  return state?.environment.name;
}
function isChildProcess() {
  return typeof process !== "undefined" && !!process.send;
}
function setProcessTitle(title) {
  try {
    process.title = `node (${title})`;
  } catch {
  }
}
function resetModules(modules, resetMocks = false) {
  const skipPaths = [
    // Vitest
    /\/vitest\/dist\//,
    /\/vite-node\/dist\//,
    // yarn's .store folder
    /vitest-virtual-\w+\/dist/,
    // cnpm
    /@vitest\/dist/,
    // don't clear mocks
    ...!resetMocks ? [/^mock:/] : []
  ];
  modules.forEach((mod, path) => {
    if (skipPaths.some((re) => re.test(path))) {
      return;
    }
    modules.invalidateModule(mod);
  });
}
function waitNextTick() {
  const { setTimeout } = getSafeTimers();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
async function waitForImportsToResolve() {
  await waitNextTick();
  const state = getWorkerState();
  const promises = [];
  let resolvingCount = 0;
  for (const mod of state.moduleCache.values()) {
    if (mod.promise && !mod.evaluated) {
      promises.push(mod.promise);
    }
    if (mod.resolving) {
      resolvingCount++;
    }
  }
  if (!promises.length && !resolvingCount) {
    return;
  }
  await Promise.allSettled(promises);
  await waitForImportsToResolve();
}

var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs$2 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

const scriptRel = 'modulepreload';const assetsURL = function(dep) { return "/"+dep };const seen = {};const __vitePreload = function preload(baseModule, deps, importerUrl) {
    let promise = Promise.resolve();
    // @ts-expect-error true will be replaced with boolean later
    if (true && deps && deps.length > 0) {
        const links = document.getElementsByTagName('link');
        promise = Promise.all(deps.map((dep) => {
            // @ts-expect-error assetsURL is declared before preload.toString()
            dep = assetsURL(dep, importerUrl);
            if (dep in seen)
                return;
            seen[dep] = true;
            const isCss = dep.endsWith('.css');
            const cssSelector = isCss ? '[rel="stylesheet"]' : '';
            const isBaseRelative = !!importerUrl;
            // check if the file is already preloaded by SSR markup
            if (isBaseRelative) {
                // When isBaseRelative is true then we have `importerUrl` and `dep` is
                // already converted to an absolute URL by the `assetsURL` function
                for (let i = links.length - 1; i >= 0; i--) {
                    const link = links[i];
                    // The `links[i].href` is an absolute URL thanks to browser doing the work
                    // for us. See https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes:idl-domstring-5
                    if (link.href === dep && (!isCss || link.rel === 'stylesheet')) {
                        return;
                    }
                }
            }
            else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
                return;
            }
            const link = document.createElement('link');
            link.rel = isCss ? 'stylesheet' : scriptRel;
            if (!isCss) {
                link.as = 'script';
                link.crossOrigin = '';
            }
            link.href = dep;
            document.head.appendChild(link);
            if (isCss) {
                return new Promise((res, rej) => {
                    link.addEventListener('load', res);
                    link.addEventListener('error', () => rej(new Error(`Unable to preload CSS for ${dep}`)));
                });
            }
        }));
    }
    return promise
        .then(() => baseModule())
        .catch((err) => {
        const e = new Event('vite:preloadError', { cancelable: true });
        // @ts-expect-error custom payload
        e.payload = err;
        window.dispatchEvent(e);
        if (!e.defaultPrevented) {
            throw err;
        }
    });
};

const comma = ','.charCodeAt(0);
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const intToChar = new Uint8Array(64); // 64 possible chars.
const charToInt = new Uint8Array(128); // z is 122 in ASCII
for (let i = 0; i < chars.length; i++) {
    const c = chars.charCodeAt(i);
    intToChar[i] = c;
    charToInt[c] = i;
}
function decodeInteger(reader, relative) {
    let value = 0;
    let shift = 0;
    let integer = 0;
    do {
        const c = reader.next();
        integer = charToInt[c];
        value |= (integer & 31) << shift;
        shift += 5;
    } while (integer & 32);
    const shouldNegate = value & 1;
    value >>>= 1;
    if (shouldNegate) {
        value = -2147483648 | -value;
    }
    return relative + value;
}
function hasMoreVlq(reader, max) {
    if (reader.pos >= max)
        return false;
    return reader.peek() !== comma;
}
class StringReader {
    constructor(buffer) {
        this.pos = 0;
        this.buffer = buffer;
    }
    next() {
        return this.buffer.charCodeAt(this.pos++);
    }
    peek() {
        return this.buffer.charCodeAt(this.pos);
    }
    indexOf(char) {
        const { buffer, pos } = this;
        const idx = buffer.indexOf(char, pos);
        return idx === -1 ? buffer.length : idx;
    }
}

function decode(mappings) {
    const { length } = mappings;
    const reader = new StringReader(mappings);
    const decoded = [];
    let genColumn = 0;
    let sourcesIndex = 0;
    let sourceLine = 0;
    let sourceColumn = 0;
    let namesIndex = 0;
    do {
        const semi = reader.indexOf(';');
        const line = [];
        let sorted = true;
        let lastCol = 0;
        genColumn = 0;
        while (reader.pos < semi) {
            let seg;
            genColumn = decodeInteger(reader, genColumn);
            if (genColumn < lastCol)
                sorted = false;
            lastCol = genColumn;
            if (hasMoreVlq(reader, semi)) {
                sourcesIndex = decodeInteger(reader, sourcesIndex);
                sourceLine = decodeInteger(reader, sourceLine);
                sourceColumn = decodeInteger(reader, sourceColumn);
                if (hasMoreVlq(reader, semi)) {
                    namesIndex = decodeInteger(reader, namesIndex);
                    seg = [genColumn, sourcesIndex, sourceLine, sourceColumn, namesIndex];
                }
                else {
                    seg = [genColumn, sourcesIndex, sourceLine, sourceColumn];
                }
            }
            else {
                seg = [genColumn];
            }
            line.push(seg);
            reader.pos++;
        }
        if (!sorted)
            sort(line);
        decoded.push(line);
        reader.pos = semi + 1;
    } while (reader.pos <= length);
    return decoded;
}
function sort(line) {
    line.sort(sortComparator$1);
}
function sortComparator$1(a, b) {
    return a[0] - b[0];
}

// Matches the scheme of a URL, eg "http://"
const schemeRegex = /^[\w+.-]+:\/\//;
/**
 * Matches the parts of a URL:
 * 1. Scheme, including ":", guaranteed.
 * 2. User/password, including "@", optional.
 * 3. Host, guaranteed.
 * 4. Port, including ":", optional.
 * 5. Path, including "/", optional.
 * 6. Query, including "?", optional.
 * 7. Hash, including "#", optional.
 */
const urlRegex = /^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/;
/**
 * File URLs are weird. They dont' need the regular `//` in the scheme, they may or may not start
 * with a leading `/`, they can have a domain (but only if they don't start with a Windows drive).
 *
 * 1. Host, optional.
 * 2. Path, which may include "/", guaranteed.
 * 3. Query, including "?", optional.
 * 4. Hash, including "#", optional.
 */
const fileRegex = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
var UrlType;
(function (UrlType) {
    UrlType[UrlType["Empty"] = 1] = "Empty";
    UrlType[UrlType["Hash"] = 2] = "Hash";
    UrlType[UrlType["Query"] = 3] = "Query";
    UrlType[UrlType["RelativePath"] = 4] = "RelativePath";
    UrlType[UrlType["AbsolutePath"] = 5] = "AbsolutePath";
    UrlType[UrlType["SchemeRelative"] = 6] = "SchemeRelative";
    UrlType[UrlType["Absolute"] = 7] = "Absolute";
})(UrlType || (UrlType = {}));
function isAbsoluteUrl(input) {
    return schemeRegex.test(input);
}
function isSchemeRelativeUrl(input) {
    return input.startsWith('//');
}
function isAbsolutePath(input) {
    return input.startsWith('/');
}
function isFileUrl(input) {
    return input.startsWith('file:');
}
function isRelative(input) {
    return /^[.?#]/.test(input);
}
function parseAbsoluteUrl(input) {
    const match = urlRegex.exec(input);
    return makeUrl(match[1], match[2] || '', match[3], match[4] || '', match[5] || '/', match[6] || '', match[7] || '');
}
function parseFileUrl(input) {
    const match = fileRegex.exec(input);
    const path = match[2];
    return makeUrl('file:', '', match[1] || '', '', isAbsolutePath(path) ? path : '/' + path, match[3] || '', match[4] || '');
}
function makeUrl(scheme, user, host, port, path, query, hash) {
    return {
        scheme,
        user,
        host,
        port,
        path,
        query,
        hash,
        type: UrlType.Absolute,
    };
}
function parseUrl(input) {
    if (isSchemeRelativeUrl(input)) {
        const url = parseAbsoluteUrl('http:' + input);
        url.scheme = '';
        url.type = UrlType.SchemeRelative;
        return url;
    }
    if (isAbsolutePath(input)) {
        const url = parseAbsoluteUrl('http://foo.com' + input);
        url.scheme = '';
        url.host = '';
        url.type = UrlType.AbsolutePath;
        return url;
    }
    if (isFileUrl(input))
        return parseFileUrl(input);
    if (isAbsoluteUrl(input))
        return parseAbsoluteUrl(input);
    const url = parseAbsoluteUrl('http://foo.com/' + input);
    url.scheme = '';
    url.host = '';
    url.type = input
        ? input.startsWith('?')
            ? UrlType.Query
            : input.startsWith('#')
                ? UrlType.Hash
                : UrlType.RelativePath
        : UrlType.Empty;
    return url;
}
function stripPathFilename(path) {
    // If a path ends with a parent directory "..", then it's a relative path with excess parent
    // paths. It's not a file, so we can't strip it.
    if (path.endsWith('/..'))
        return path;
    const index = path.lastIndexOf('/');
    return path.slice(0, index + 1);
}
function mergePaths(url, base) {
    normalizePath(base, base.type);
    // If the path is just a "/", then it was an empty path to begin with (remember, we're a relative
    // path).
    if (url.path === '/') {
        url.path = base.path;
    }
    else {
        // Resolution happens relative to the base path's directory, not the file.
        url.path = stripPathFilename(base.path) + url.path;
    }
}
/**
 * The path can have empty directories "//", unneeded parents "foo/..", or current directory
 * "foo/.". We need to normalize to a standard representation.
 */
function normalizePath(url, type) {
    const rel = type <= UrlType.RelativePath;
    const pieces = url.path.split('/');
    // We need to preserve the first piece always, so that we output a leading slash. The item at
    // pieces[0] is an empty string.
    let pointer = 1;
    // Positive is the number of real directories we've output, used for popping a parent directory.
    // Eg, "foo/bar/.." will have a positive 2, and we can decrement to be left with just "foo".
    let positive = 0;
    // We need to keep a trailing slash if we encounter an empty directory (eg, splitting "foo/" will
    // generate `["foo", ""]` pieces). And, if we pop a parent directory. But once we encounter a
    // real directory, we won't need to append, unless the other conditions happen again.
    let addTrailingSlash = false;
    for (let i = 1; i < pieces.length; i++) {
        const piece = pieces[i];
        // An empty directory, could be a trailing slash, or just a double "//" in the path.
        if (!piece) {
            addTrailingSlash = true;
            continue;
        }
        // If we encounter a real directory, then we don't need to append anymore.
        addTrailingSlash = false;
        // A current directory, which we can always drop.
        if (piece === '.')
            continue;
        // A parent directory, we need to see if there are any real directories we can pop. Else, we
        // have an excess of parents, and we'll need to keep the "..".
        if (piece === '..') {
            if (positive) {
                addTrailingSlash = true;
                positive--;
                pointer--;
            }
            else if (rel) {
                // If we're in a relativePath, then we need to keep the excess parents. Else, in an absolute
                // URL, protocol relative URL, or an absolute path, we don't need to keep excess.
                pieces[pointer++] = piece;
            }
            continue;
        }
        // We've encountered a real directory. Move it to the next insertion pointer, which accounts for
        // any popped or dropped directories.
        pieces[pointer++] = piece;
        positive++;
    }
    let path = '';
    for (let i = 1; i < pointer; i++) {
        path += '/' + pieces[i];
    }
    if (!path || (addTrailingSlash && !path.endsWith('/..'))) {
        path += '/';
    }
    url.path = path;
}
/**
 * Attempts to resolve `input` URL/path relative to `base`.
 */
function resolve$1(input, base) {
    if (!input && !base)
        return '';
    const url = parseUrl(input);
    let inputType = url.type;
    if (base && inputType !== UrlType.Absolute) {
        const baseUrl = parseUrl(base);
        const baseType = baseUrl.type;
        switch (inputType) {
            case UrlType.Empty:
                url.hash = baseUrl.hash;
            // fall through
            case UrlType.Hash:
                url.query = baseUrl.query;
            // fall through
            case UrlType.Query:
            case UrlType.RelativePath:
                mergePaths(url, baseUrl);
            // fall through
            case UrlType.AbsolutePath:
                // The host, user, and port are joined, you can't copy one without the others.
                url.user = baseUrl.user;
                url.host = baseUrl.host;
                url.port = baseUrl.port;
            // fall through
            case UrlType.SchemeRelative:
                // The input doesn't have a schema at least, so we need to copy at least that over.
                url.scheme = baseUrl.scheme;
        }
        if (baseType > inputType)
            inputType = baseType;
    }
    normalizePath(url, inputType);
    const queryHash = url.query + url.hash;
    switch (inputType) {
        // This is impossible, because of the empty checks at the start of the function.
        // case UrlType.Empty:
        case UrlType.Hash:
        case UrlType.Query:
            return queryHash;
        case UrlType.RelativePath: {
            // The first char is always a "/", and we need it to be relative.
            const path = url.path.slice(1);
            if (!path)
                return queryHash || '.';
            if (isRelative(base || input) && !isRelative(path)) {
                // If base started with a leading ".", or there is no base and input started with a ".",
                // then we need to ensure that the relative path starts with a ".". We don't know if
                // relative starts with a "..", though, so check before prepending.
                return './' + path + queryHash;
            }
            return path + queryHash;
        }
        case UrlType.AbsolutePath:
            return url.path + queryHash;
        default:
            return url.scheme + '//' + url.user + url.host + url.port + url.path + queryHash;
    }
}

function resolve(input, base) {
    // The base is always treated as a directory, if it's not empty.
    // https://github.com/mozilla/source-map/blob/8cb3ee57/lib/util.js#L327
    // https://github.com/chromium/chromium/blob/da4adbb3/third_party/blink/renderer/devtools/front_end/sdk/SourceMap.js#L400-L401
    if (base && !base.endsWith('/'))
        base += '/';
    return resolve$1(input, base);
}

/**
 * Removes everything after the last "/", but leaves the slash.
 */
function stripFilename(path) {
    if (!path)
        return '';
    const index = path.lastIndexOf('/');
    return path.slice(0, index + 1);
}

const COLUMN = 0;
const SOURCES_INDEX = 1;
const SOURCE_LINE = 2;
const SOURCE_COLUMN = 3;
const NAMES_INDEX = 4;

function maybeSort(mappings, owned) {
    const unsortedIndex = nextUnsortedSegmentLine(mappings, 0);
    if (unsortedIndex === mappings.length)
        return mappings;
    // If we own the array (meaning we parsed it from JSON), then we're free to directly mutate it. If
    // not, we do not want to modify the consumer's input array.
    if (!owned)
        mappings = mappings.slice();
    for (let i = unsortedIndex; i < mappings.length; i = nextUnsortedSegmentLine(mappings, i + 1)) {
        mappings[i] = sortSegments(mappings[i], owned);
    }
    return mappings;
}
function nextUnsortedSegmentLine(mappings, start) {
    for (let i = start; i < mappings.length; i++) {
        if (!isSorted(mappings[i]))
            return i;
    }
    return mappings.length;
}
function isSorted(line) {
    for (let j = 1; j < line.length; j++) {
        if (line[j][COLUMN] < line[j - 1][COLUMN]) {
            return false;
        }
    }
    return true;
}
function sortSegments(line, owned) {
    if (!owned)
        line = line.slice();
    return line.sort(sortComparator);
}
function sortComparator(a, b) {
    return a[COLUMN] - b[COLUMN];
}

let found = false;
/**
 * A binary search implementation that returns the index if a match is found.
 * If no match is found, then the left-index (the index associated with the item that comes just
 * before the desired index) is returned. To maintain proper sort order, a splice would happen at
 * the next index:
 *
 * ```js
 * const array = [1, 3];
 * const needle = 2;
 * const index = binarySearch(array, needle, (item, needle) => item - needle);
 *
 * assert.equal(index, 0);
 * array.splice(index + 1, 0, needle);
 * assert.deepEqual(array, [1, 2, 3]);
 * ```
 */
function binarySearch(haystack, needle, low, high) {
    while (low <= high) {
        const mid = low + ((high - low) >> 1);
        const cmp = haystack[mid][COLUMN] - needle;
        if (cmp === 0) {
            found = true;
            return mid;
        }
        if (cmp < 0) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    found = false;
    return low - 1;
}
function upperBound(haystack, needle, index) {
    for (let i = index + 1; i < haystack.length; index = i++) {
        if (haystack[i][COLUMN] !== needle)
            break;
    }
    return index;
}
function lowerBound(haystack, needle, index) {
    for (let i = index - 1; i >= 0; index = i--) {
        if (haystack[i][COLUMN] !== needle)
            break;
    }
    return index;
}
function memoizedState() {
    return {
        lastKey: -1,
        lastNeedle: -1,
        lastIndex: -1,
    };
}
/**
 * This overly complicated beast is just to record the last tested line/column and the resulting
 * index, allowing us to skip a few tests if mappings are monotonically increasing.
 */
function memoizedBinarySearch(haystack, needle, state, key) {
    const { lastKey, lastNeedle, lastIndex } = state;
    let low = 0;
    let high = haystack.length - 1;
    if (key === lastKey) {
        if (needle === lastNeedle) {
            found = lastIndex !== -1 && haystack[lastIndex][COLUMN] === needle;
            return lastIndex;
        }
        if (needle >= lastNeedle) {
            // lastIndex may be -1 if the previous needle was not found.
            low = lastIndex === -1 ? 0 : lastIndex;
        }
        else {
            high = lastIndex;
        }
    }
    state.lastKey = key;
    state.lastNeedle = needle;
    return (state.lastIndex = binarySearch(haystack, needle, low, high));
}

const LINE_GTR_ZERO = '`line` must be greater than 0 (lines start at line 1)';
const COL_GTR_EQ_ZERO = '`column` must be greater than or equal to 0 (columns start at column 0)';
const LEAST_UPPER_BOUND = -1;
const GREATEST_LOWER_BOUND = 1;
class TraceMap {
    constructor(map, mapUrl) {
        const isString = typeof map === 'string';
        if (!isString && map._decodedMemo)
            return map;
        const parsed = (isString ? JSON.parse(map) : map);
        const { version, file, names, sourceRoot, sources, sourcesContent } = parsed;
        this.version = version;
        this.file = file;
        this.names = names || [];
        this.sourceRoot = sourceRoot;
        this.sources = sources;
        this.sourcesContent = sourcesContent;
        this.ignoreList = parsed.ignoreList || parsed.x_google_ignoreList || undefined;
        const from = resolve(sourceRoot || '', stripFilename(mapUrl));
        this.resolvedSources = sources.map((s) => resolve(s || '', from));
        const { mappings } = parsed;
        if (typeof mappings === 'string') {
            this._encoded = mappings;
            this._decoded = undefined;
        }
        else {
            this._encoded = undefined;
            this._decoded = maybeSort(mappings, isString);
        }
        this._decodedMemo = memoizedState();
        this._bySources = undefined;
        this._bySourceMemos = undefined;
    }
}
/**
 * Typescript doesn't allow friend access to private fields, so this just casts the map into a type
 * with public access modifiers.
 */
function cast(map) {
    return map;
}
/**
 * Returns the decoded (array of lines of segments) form of the SourceMap's mappings field.
 */
function decodedMappings(map) {
    var _a;
    return ((_a = cast(map))._decoded || (_a._decoded = decode(cast(map)._encoded)));
}
/**
 * A higher-level API to find the source/line/column associated with a generated line/column
 * (think, from a stack trace). Line is 1-based, but column is 0-based, due to legacy behavior in
 * `source-map` library.
 */
function originalPositionFor(map, needle) {
    let { line, column, bias } = needle;
    line--;
    if (line < 0)
        throw new Error(LINE_GTR_ZERO);
    if (column < 0)
        throw new Error(COL_GTR_EQ_ZERO);
    const decoded = decodedMappings(map);
    // It's common for parent source maps to have pointers to lines that have no
    // mapping (like a "//# sourceMappingURL=") at the end of the child file.
    if (line >= decoded.length)
        return OMapping(null, null, null, null);
    const segments = decoded[line];
    const index = traceSegmentInternal(segments, cast(map)._decodedMemo, line, column, bias || GREATEST_LOWER_BOUND);
    if (index === -1)
        return OMapping(null, null, null, null);
    const segment = segments[index];
    if (segment.length === 1)
        return OMapping(null, null, null, null);
    const { names, resolvedSources } = map;
    return OMapping(resolvedSources[segment[SOURCES_INDEX]], segment[SOURCE_LINE] + 1, segment[SOURCE_COLUMN], segment.length === 5 ? names[segment[NAMES_INDEX]] : null);
}
function OMapping(source, line, column, name) {
    return { source, line, column, name };
}
function traceSegmentInternal(segments, memo, line, column, bias) {
    let index = memoizedBinarySearch(segments, column, memo, line);
    if (found) {
        index = (bias === LEAST_UPPER_BOUND ? upperBound : lowerBound)(segments, column, index);
    }
    else if (bias === LEAST_UPPER_BOUND)
        index++;
    if (index === -1 || index === segments.length)
        return -1;
    return index;
}

function notNullish(v) {
  return v != null;
}
function isPrimitive(value) {
  return value === null || typeof value !== "function" && typeof value !== "object";
}
function isObject(item) {
  return item != null && typeof item === "object" && !Array.isArray(item);
}
function getCallLastIndex(code) {
  let charIndex = -1;
  let inString = null;
  let startedBracers = 0;
  let endedBracers = 0;
  let beforeChar = null;
  while (charIndex <= code.length) {
    beforeChar = code[charIndex];
    charIndex++;
    const char = code[charIndex];
    const isCharString = char === '"' || char === "'" || char === "`";
    if (isCharString && beforeChar !== "\\") {
      if (inString === char) {
        inString = null;
      } else if (!inString) {
        inString = char;
      }
    }
    if (!inString) {
      if (char === "(") {
        startedBracers++;
      }
      if (char === ")") {
        endedBracers++;
      }
    }
    if (startedBracers && endedBracers && startedBracers === endedBracers) {
      return charIndex;
    }
  }
  return null;
}

const CHROME_IE_STACK_REGEXP = /^\s*at .*(?:\S:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(?:eval@)?(?:\[native code\])?$/;
const stackIgnorePatterns = [
  "node:internal",
  /\/packages\/\w+\/dist\//,
  /\/@vitest\/\w+\/dist\//,
  "/vitest/dist/",
  "/vitest/src/",
  "/vite-node/dist/",
  "/vite-node/src/",
  "/node_modules/chai/",
  "/node_modules/tinypool/",
  "/node_modules/tinyspy/",
  // browser related deps
  "/deps/chunk-",
  "/deps/@vitest",
  "/deps/loupe",
  "/deps/chai",
  /node:\w+/,
  /__vitest_test__/,
  /__vitest_browser__/,
  /\/deps\/vitest_/
];
function extractLocation(urlLike) {
  if (!urlLike.includes(":")) {
    return [urlLike];
  }
  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/^\(|\)$/g, ""));
  if (!parts) {
    return [urlLike];
  }
  let url = parts[1];
  if (url.startsWith("async ")) {
    url = url.slice(6);
  }
  if (url.startsWith("http:") || url.startsWith("https:")) {
    const urlObj = new URL(url);
    url = urlObj.pathname;
  }
  if (url.startsWith("/@fs/")) {
    const isWindows = /^\/@fs\/[a-zA-Z]:\//.test(url);
    url = url.slice(isWindows ? 5 : 4);
  }
  return [url, parts[2] || undefined, parts[3] || undefined];
}
function parseSingleFFOrSafariStack(raw) {
  let line = raw.trim();
  if (SAFARI_NATIVE_CODE_REGEXP.test(line)) {
    return null;
  }
  if (line.includes(" > eval")) {
    line = line.replace(
      / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
      ":$1"
    );
  }
  if (!line.includes("@") && !line.includes(":")) {
    return null;
  }
  const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(@)/;
  const matches = line.match(functionNameRegex);
  const functionName = matches && matches[1] ? matches[1] : undefined;
  const [url, lineNumber, columnNumber] = extractLocation(
    line.replace(functionNameRegex, "")
  );
  if (!url || !lineNumber || !columnNumber) {
    return null;
  }
  return {
    file: url,
    method: functionName || "",
    line: Number.parseInt(lineNumber),
    column: Number.parseInt(columnNumber)
  };
}
function parseSingleV8Stack(raw) {
  let line = raw.trim();
  if (!CHROME_IE_STACK_REGEXP.test(line)) {
    return null;
  }
  if (line.includes("(eval ")) {
    line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
  }
  let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
  const location = sanitizedLine.match(/ (\(.+\)$)/);
  sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
  const [url, lineNumber, columnNumber] = extractLocation(
    location ? location[1] : sanitizedLine
  );
  let method = location && sanitizedLine || "";
  let file = url && ["eval", "<anonymous>"].includes(url) ? undefined : url;
  if (!file || !lineNumber || !columnNumber) {
    return null;
  }
  if (method.startsWith("async ")) {
    method = method.slice(6);
  }
  if (file.startsWith("file://")) {
    file = file.slice(7);
  }
  file = file.startsWith("node:") || file.startsWith("internal:") ? file : resolve$2(file);
  if (method) {
    method = method.replace(/__vite_ssr_import_\d+__\./g, "");
  }
  return {
    method,
    file,
    line: Number.parseInt(lineNumber),
    column: Number.parseInt(columnNumber)
  };
}
function parseStacktrace(stack, options = {}) {
  const { ignoreStackEntries = stackIgnorePatterns } = options;
  let stacks = !CHROME_IE_STACK_REGEXP.test(stack) ? parseFFOrSafariStackTrace(stack) : parseV8Stacktrace(stack);
  if (ignoreStackEntries.length) {
    stacks = stacks.filter(
      (stack2) => !ignoreStackEntries.some((p) => stack2.file.match(p))
    );
  }
  return stacks.map((stack2) => {
    var _a;
    if (options.getFileName) {
      stack2.file = options.getFileName(stack2.file);
    }
    const map = (_a = options.getSourceMap) == null ? undefined : _a.call(options, stack2.file);
    if (!map || typeof map !== "object" || !map.version) {
      return stack2;
    }
    const traceMap = new TraceMap(map);
    const { line, column } = originalPositionFor(traceMap, stack2);
    if (line != null && column != null) {
      return { ...stack2, line, column };
    }
    return stack2;
  });
}
function parseFFOrSafariStackTrace(stack) {
  return stack.split("\n").map((line) => parseSingleFFOrSafariStack(line)).filter(notNullish);
}
function parseV8Stacktrace(stack) {
  return stack.split("\n").map((line) => parseSingleV8Stack(line)).filter(notNullish);
}
function parseErrorStacktrace(e, options = {}) {
  if (!e || isPrimitive(e)) {
    return [];
  }
  if (e.stacks) {
    return e.stacks;
  }
  const stackStr = e.stack || e.stackStr || "";
  let stackFrames = parseStacktrace(stackStr, options);
  if (options.frameFilter) {
    stackFrames = stackFrames.filter(
      (f) => options.frameFilter(e, f) !== false
    );
  }
  e.stacks = stackFrames;
  return stackFrames;
}

let getPromiseValue = () => 'Promise{…}';
try {
    // @ts-ignore
    const { getPromiseDetails, kPending, kRejected } = process.binding('util');
    if (Array.isArray(getPromiseDetails(Promise.resolve()))) {
        getPromiseValue = (value, options) => {
            const [state, innerValue] = getPromiseDetails(value);
            if (state === kPending) {
                return 'Promise{<pending>}';
            }
            return `Promise${state === kRejected ? '!' : ''}{${options.inspect(innerValue, options)}}`;
        };
    }
}
catch (notNode) {
    /* ignore */
}

/* !
 * loupe
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */
let nodeInspect = false;
try {
    // eslint-disable-next-line global-require
    // @ts-ignore
    const nodeUtil = require('util');
    nodeInspect = nodeUtil.inspect ? nodeUtil.inspect.custom : false;
}
catch (noNodeInspect) {
    nodeInspect = false;
}

function getDefaultExportFromCjs$1 (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var jsTokens_1;
var hasRequiredJsTokens;

function requireJsTokens () {
	if (hasRequiredJsTokens) return jsTokens_1;
	hasRequiredJsTokens = 1;
	// Copyright 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023 Simon Lydell
	// License: MIT.
	var Identifier, JSXIdentifier, JSXPunctuator, JSXString, JSXText, KeywordsWithExpressionAfter, KeywordsWithNoLineTerminatorAfter, LineTerminatorSequence, MultiLineComment, Newline, NumericLiteral, Punctuator, RegularExpressionLiteral, SingleLineComment, StringLiteral, Template, TokensNotPrecedingObjectLiteral, TokensPrecedingExpression, WhiteSpace;
	RegularExpressionLiteral = /\/(?![*\/])(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\\]).|\\.)*(\/[$_\u200C\u200D\p{ID_Continue}]*|\\)?/yu;
	Punctuator = /--|\+\+|=>|\.{3}|\??\.(?!\d)|(?:&&|\|\||\?\?|[+\-%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![\/*]))=?|[?~,:;[\](){}]/y;
	Identifier = /(\x23?)(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/yu;
	StringLiteral = /(['"])(?:(?!\1)[^\\\n\r]|\\(?:\r\n|[^]))*(\1)?/y;
	NumericLiteral = /(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?|0[0-7]+/y;
	Template = /[`}](?:[^`\\$]|\\[^]|\$(?!\{))*(`|\$\{)?/y;
	WhiteSpace = /[\t\v\f\ufeff\p{Zs}]+/yu;
	LineTerminatorSequence = /\r?\n|[\r\u2028\u2029]/y;
	MultiLineComment = /\/\*(?:[^*]|\*(?!\/))*(\*\/)?/y;
	SingleLineComment = /\/\/.*/y;
	JSXPunctuator = /[<>.:={}]|\/(?![\/*])/y;
	JSXIdentifier = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}-]*/yu;
	JSXString = /(['"])(?:(?!\1)[^])*(\1)?/y;
	JSXText = /[^<>{}]+/y;
	TokensPrecedingExpression = /^(?:[\/+-]|\.{3}|\?(?:InterpolationIn(?:JSX|Template)|NoLineTerminatorHere|NonExpressionParenEnd|UnaryIncDec))?$|[{}([,;<>=*%&|^!~?:]$/;
	TokensNotPrecedingObjectLiteral = /^(?:=>|[;\]){}]|else|\?(?:NoLineTerminatorHere|NonExpressionParenEnd))?$/;
	KeywordsWithExpressionAfter = /^(?:await|case|default|delete|do|else|instanceof|new|return|throw|typeof|void|yield)$/;
	KeywordsWithNoLineTerminatorAfter = /^(?:return|throw|yield)$/;
	Newline = RegExp(LineTerminatorSequence.source);
	jsTokens_1 = function*(input, {jsx = false} = {}) {
		var braces, firstCodePoint, isExpression, lastIndex, lastSignificantToken, length, match, mode, nextLastIndex, nextLastSignificantToken, parenNesting, postfixIncDec, punctuator, stack;
		({length} = input);
		lastIndex = 0;
		lastSignificantToken = "";
		stack = [
			{tag: "JS"}
		];
		braces = [];
		parenNesting = 0;
		postfixIncDec = false;
		while (lastIndex < length) {
			mode = stack[stack.length - 1];
			switch (mode.tag) {
				case "JS":
				case "JSNonExpressionParen":
				case "InterpolationInTemplate":
				case "InterpolationInJSX":
					if (input[lastIndex] === "/" && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken))) {
						RegularExpressionLiteral.lastIndex = lastIndex;
						if (match = RegularExpressionLiteral.exec(input)) {
							lastIndex = RegularExpressionLiteral.lastIndex;
							lastSignificantToken = match[0];
							postfixIncDec = true;
							yield ({
								type: "RegularExpressionLiteral",
								value: match[0],
								closed: match[1] !== undefined && match[1] !== "\\"
							});
							continue;
						}
					}
					Punctuator.lastIndex = lastIndex;
					if (match = Punctuator.exec(input)) {
						punctuator = match[0];
						nextLastIndex = Punctuator.lastIndex;
						nextLastSignificantToken = punctuator;
						switch (punctuator) {
							case "(":
								if (lastSignificantToken === "?NonExpressionParenKeyword") {
									stack.push({
										tag: "JSNonExpressionParen",
										nesting: parenNesting
									});
								}
								parenNesting++;
								postfixIncDec = false;
								break;
							case ")":
								parenNesting--;
								postfixIncDec = true;
								if (mode.tag === "JSNonExpressionParen" && parenNesting === mode.nesting) {
									stack.pop();
									nextLastSignificantToken = "?NonExpressionParenEnd";
									postfixIncDec = false;
								}
								break;
							case "{":
								Punctuator.lastIndex = 0;
								isExpression = !TokensNotPrecedingObjectLiteral.test(lastSignificantToken) && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken));
								braces.push(isExpression);
								postfixIncDec = false;
								break;
							case "}":
								switch (mode.tag) {
									case "InterpolationInTemplate":
										if (braces.length === mode.nesting) {
											Template.lastIndex = lastIndex;
											match = Template.exec(input);
											lastIndex = Template.lastIndex;
											lastSignificantToken = match[0];
											if (match[1] === "${") {
												lastSignificantToken = "?InterpolationInTemplate";
												postfixIncDec = false;
												yield ({
													type: "TemplateMiddle",
													value: match[0]
												});
											} else {
												stack.pop();
												postfixIncDec = true;
												yield ({
													type: "TemplateTail",
													value: match[0],
													closed: match[1] === "`"
												});
											}
											continue;
										}
										break;
									case "InterpolationInJSX":
										if (braces.length === mode.nesting) {
											stack.pop();
											lastIndex += 1;
											lastSignificantToken = "}";
											yield ({
												type: "JSXPunctuator",
												value: "}"
											});
											continue;
										}
								}
								postfixIncDec = braces.pop();
								nextLastSignificantToken = postfixIncDec ? "?ExpressionBraceEnd" : "}";
								break;
							case "]":
								postfixIncDec = true;
								break;
							case "++":
							case "--":
								nextLastSignificantToken = postfixIncDec ? "?PostfixIncDec" : "?UnaryIncDec";
								break;
							case "<":
								if (jsx && (TokensPrecedingExpression.test(lastSignificantToken) || KeywordsWithExpressionAfter.test(lastSignificantToken))) {
									stack.push({tag: "JSXTag"});
									lastIndex += 1;
									lastSignificantToken = "<";
									yield ({
										type: "JSXPunctuator",
										value: punctuator
									});
									continue;
								}
								postfixIncDec = false;
								break;
							default:
								postfixIncDec = false;
						}
						lastIndex = nextLastIndex;
						lastSignificantToken = nextLastSignificantToken;
						yield ({
							type: "Punctuator",
							value: punctuator
						});
						continue;
					}
					Identifier.lastIndex = lastIndex;
					if (match = Identifier.exec(input)) {
						lastIndex = Identifier.lastIndex;
						nextLastSignificantToken = match[0];
						switch (match[0]) {
							case "for":
							case "if":
							case "while":
							case "with":
								if (lastSignificantToken !== "." && lastSignificantToken !== "?.") {
									nextLastSignificantToken = "?NonExpressionParenKeyword";
								}
						}
						lastSignificantToken = nextLastSignificantToken;
						postfixIncDec = !KeywordsWithExpressionAfter.test(match[0]);
						yield ({
							type: match[1] === "#" ? "PrivateIdentifier" : "IdentifierName",
							value: match[0]
						});
						continue;
					}
					StringLiteral.lastIndex = lastIndex;
					if (match = StringLiteral.exec(input)) {
						lastIndex = StringLiteral.lastIndex;
						lastSignificantToken = match[0];
						postfixIncDec = true;
						yield ({
							type: "StringLiteral",
							value: match[0],
							closed: match[2] !== undefined
						});
						continue;
					}
					NumericLiteral.lastIndex = lastIndex;
					if (match = NumericLiteral.exec(input)) {
						lastIndex = NumericLiteral.lastIndex;
						lastSignificantToken = match[0];
						postfixIncDec = true;
						yield ({
							type: "NumericLiteral",
							value: match[0]
						});
						continue;
					}
					Template.lastIndex = lastIndex;
					if (match = Template.exec(input)) {
						lastIndex = Template.lastIndex;
						lastSignificantToken = match[0];
						if (match[1] === "${") {
							lastSignificantToken = "?InterpolationInTemplate";
							stack.push({
								tag: "InterpolationInTemplate",
								nesting: braces.length
							});
							postfixIncDec = false;
							yield ({
								type: "TemplateHead",
								value: match[0]
							});
						} else {
							postfixIncDec = true;
							yield ({
								type: "NoSubstitutionTemplate",
								value: match[0],
								closed: match[1] === "`"
							});
						}
						continue;
					}
					break;
				case "JSXTag":
				case "JSXTagEnd":
					JSXPunctuator.lastIndex = lastIndex;
					if (match = JSXPunctuator.exec(input)) {
						lastIndex = JSXPunctuator.lastIndex;
						nextLastSignificantToken = match[0];
						switch (match[0]) {
							case "<":
								stack.push({tag: "JSXTag"});
								break;
							case ">":
								stack.pop();
								if (lastSignificantToken === "/" || mode.tag === "JSXTagEnd") {
									nextLastSignificantToken = "?JSX";
									postfixIncDec = true;
								} else {
									stack.push({tag: "JSXChildren"});
								}
								break;
							case "{":
								stack.push({
									tag: "InterpolationInJSX",
									nesting: braces.length
								});
								nextLastSignificantToken = "?InterpolationInJSX";
								postfixIncDec = false;
								break;
							case "/":
								if (lastSignificantToken === "<") {
									stack.pop();
									if (stack[stack.length - 1].tag === "JSXChildren") {
										stack.pop();
									}
									stack.push({tag: "JSXTagEnd"});
								}
						}
						lastSignificantToken = nextLastSignificantToken;
						yield ({
							type: "JSXPunctuator",
							value: match[0]
						});
						continue;
					}
					JSXIdentifier.lastIndex = lastIndex;
					if (match = JSXIdentifier.exec(input)) {
						lastIndex = JSXIdentifier.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXIdentifier",
							value: match[0]
						});
						continue;
					}
					JSXString.lastIndex = lastIndex;
					if (match = JSXString.exec(input)) {
						lastIndex = JSXString.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXString",
							value: match[0],
							closed: match[2] !== undefined
						});
						continue;
					}
					break;
				case "JSXChildren":
					JSXText.lastIndex = lastIndex;
					if (match = JSXText.exec(input)) {
						lastIndex = JSXText.lastIndex;
						lastSignificantToken = match[0];
						yield ({
							type: "JSXText",
							value: match[0]
						});
						continue;
					}
					switch (input[lastIndex]) {
						case "<":
							stack.push({tag: "JSXTag"});
							lastIndex++;
							lastSignificantToken = "<";
							yield ({
								type: "JSXPunctuator",
								value: "<"
							});
							continue;
						case "{":
							stack.push({
								tag: "InterpolationInJSX",
								nesting: braces.length
							});
							lastIndex++;
							lastSignificantToken = "?InterpolationInJSX";
							postfixIncDec = false;
							yield ({
								type: "JSXPunctuator",
								value: "{"
							});
							continue;
					}
			}
			WhiteSpace.lastIndex = lastIndex;
			if (match = WhiteSpace.exec(input)) {
				lastIndex = WhiteSpace.lastIndex;
				yield ({
					type: "WhiteSpace",
					value: match[0]
				});
				continue;
			}
			LineTerminatorSequence.lastIndex = lastIndex;
			if (match = LineTerminatorSequence.exec(input)) {
				lastIndex = LineTerminatorSequence.lastIndex;
				postfixIncDec = false;
				if (KeywordsWithNoLineTerminatorAfter.test(lastSignificantToken)) {
					lastSignificantToken = "?NoLineTerminatorHere";
				}
				yield ({
					type: "LineTerminatorSequence",
					value: match[0]
				});
				continue;
			}
			MultiLineComment.lastIndex = lastIndex;
			if (match = MultiLineComment.exec(input)) {
				lastIndex = MultiLineComment.lastIndex;
				if (Newline.test(match[0])) {
					postfixIncDec = false;
					if (KeywordsWithNoLineTerminatorAfter.test(lastSignificantToken)) {
						lastSignificantToken = "?NoLineTerminatorHere";
					}
				}
				yield ({
					type: "MultiLineComment",
					value: match[0],
					closed: match[1] !== undefined
				});
				continue;
			}
			SingleLineComment.lastIndex = lastIndex;
			if (match = SingleLineComment.exec(input)) {
				lastIndex = SingleLineComment.lastIndex;
				postfixIncDec = false;
				yield ({
					type: "SingleLineComment",
					value: match[0]
				});
				continue;
			}
			firstCodePoint = String.fromCodePoint(input.codePointAt(lastIndex));
			lastIndex += firstCodePoint.length;
			lastSignificantToken = firstCodePoint;
			postfixIncDec = false;
			yield ({
				type: mode.tag.startsWith("JSX") ? "JSXInvalid" : "Invalid",
				value: firstCodePoint
			});
		}
		return undefined;
	};
	return jsTokens_1;
}

requireJsTokens();

// src/index.ts
var reservedWords = {
  keyword: [
    "break",
    "case",
    "catch",
    "continue",
    "debugger",
    "default",
    "do",
    "else",
    "finally",
    "for",
    "function",
    "if",
    "return",
    "switch",
    "throw",
    "try",
    "var",
    "const",
    "while",
    "with",
    "new",
    "this",
    "super",
    "class",
    "extends",
    "export",
    "import",
    "null",
    "true",
    "false",
    "in",
    "instanceof",
    "typeof",
    "void",
    "delete"
  ],
  strict: [
    "implements",
    "interface",
    "let",
    "package",
    "private",
    "protected",
    "public",
    "static",
    "yield"
  ]
}; new Set(reservedWords.keyword); new Set(reservedWords.strict);

// src/index.ts
var f = {
  reset: [0, 0],
  bold: [1, 22, "\x1B[22m\x1B[1m"],
  dim: [2, 22, "\x1B[22m\x1B[2m"],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
}, h = Object.entries(f);
function a(n) {
  return String(n);
}
a.open = "";
a.close = "";
function C(n = false) {
  let e = typeof process != "undefined" ? process : undefined, i = (e == null ? undefined : e.env) || {}, g = (e == null ? undefined : e.argv) || [];
  return !("NO_COLOR" in i || g.includes("--no-color")) && ("FORCE_COLOR" in i || g.includes("--color") || (e == null ? undefined : e.platform) === "win32" || n && i.TERM !== "dumb" || "CI" in i) || typeof window != "undefined" && !!window.chrome;
}
function p(n = false) {
  let e = C(n), i = (r, t, c, o) => {
    let l = "", s = 0;
    do
      l += r.substring(s, o) + c, s = o + t.length, o = r.indexOf(t, s);
    while (~o);
    return l + r.substring(s);
  }, g = (r, t, c = r) => {
    let o = (l) => {
      let s = String(l), b = s.indexOf(t, r.length);
      return ~b ? r + i(s, t, c, b) + t : r + s + t;
    };
    return o.open = r, o.close = t, o;
  }, u = {
    isColorSupported: e
  }, d = (r) => `\x1B[${r}m`;
  for (let [r, t] of h)
    u[r] = e ? g(
      d(t[0]),
      d(t[1]),
      t[2]
    ) : a;
  return u;
}

p();

const lineSplitRE = /\r?\n/;
function positionToOffset(source, lineNumber, columnNumber) {
  const lines = source.split(lineSplitRE);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let start = 0;
  if (lineNumber > lines.length) {
    return source.length;
  }
  for (let i = 0; i < lineNumber - 1; i++) {
    start += lines[i].length + nl;
  }
  return start + columnNumber;
}
function offsetToLineNumber(source, offset) {
  if (offset > source.length) {
    throw new Error(
      `offset is longer than source length! offset ${offset} > length ${source.length}`
    );
  }
  const lines = source.split(lineSplitRE);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let counted = 0;
  let line = 0;
  for (; line < lines.length; line++) {
    const lineLength = lines[line].length + nl;
    if (counted + lineLength >= offset) {
      break;
    }
    counted += lineLength;
  }
  return line + 1;
}

async function saveInlineSnapshots(environment, snapshots) {
  const MagicString = (await __vitePreload(() => import('./assets/magic-string.es-pzDmsgl1.js'),true?__vite__mapDeps([]):void 0)).default;
  const files = new Set(snapshots.map((i) => i.file));
  await Promise.all(
    Array.from(files).map(async (file) => {
      const snaps = snapshots.filter((i) => i.file === file);
      const code = await environment.readSnapshotFile(file);
      const s = new MagicString(code);
      for (const snap of snaps) {
        const index = positionToOffset(code, snap.line, snap.column);
        replaceInlineSnap(code, s, index, snap.snapshot);
      }
      const transformed = s.toString();
      if (transformed !== code) {
        await environment.saveSnapshotFile(file, transformed);
      }
    })
  );
}
const startObjectRegex = /(?:toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot)\s*\(\s*(?:\/\*[\s\S]*\*\/\s*|\/\/.*(?:[\n\r\u2028\u2029]\s*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]))*\{/;
function replaceObjectSnap(code, s, index, newSnap) {
  let _code = code.slice(index);
  const startMatch = startObjectRegex.exec(_code);
  if (!startMatch) {
    return false;
  }
  _code = _code.slice(startMatch.index);
  let callEnd = getCallLastIndex(_code);
  if (callEnd === null) {
    return false;
  }
  callEnd += index + startMatch.index;
  const shapeStart = index + startMatch.index + startMatch[0].length;
  const shapeEnd = getObjectShapeEndIndex(code, shapeStart);
  const snap = `, ${prepareSnapString(newSnap, code, index)}`;
  if (shapeEnd === callEnd) {
    s.appendLeft(callEnd, snap);
  } else {
    s.overwrite(shapeEnd, callEnd, snap);
  }
  return true;
}
function getObjectShapeEndIndex(code, index) {
  let startBraces = 1;
  let endBraces = 0;
  while (startBraces !== endBraces && index < code.length) {
    const s = code[index++];
    if (s === "{") {
      startBraces++;
    } else if (s === "}") {
      endBraces++;
    }
  }
  return index;
}
function prepareSnapString(snap, source, index) {
  const lineNumber = offsetToLineNumber(source, index);
  const line = source.split(lineSplitRE)[lineNumber - 1];
  const indent = line.match(/^\s*/)[0] || "";
  const indentNext = indent.includes("	") ? `${indent}	` : `${indent}  `;
  const lines = snap.trim().replace(/\\/g, "\\\\").split(/\n/g);
  const isOneline = lines.length <= 1;
  const quote = "`";
  if (isOneline) {
    return `${quote}${lines.join("\n").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}${quote}`;
  }
  return `${quote}
${lines.map((i) => i ? indentNext + i : "").join("\n").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")}
${indent}${quote}`;
}
const toMatchInlineName = "toMatchInlineSnapshot";
const toThrowErrorMatchingInlineName = "toThrowErrorMatchingInlineSnapshot";
function getCodeStartingAtIndex(code, index) {
  const indexInline = index - toMatchInlineName.length;
  if (code.slice(indexInline, index) === toMatchInlineName) {
    return {
      code: code.slice(indexInline),
      index: indexInline
    };
  }
  const indexThrowInline = index - toThrowErrorMatchingInlineName.length;
  if (code.slice(index - indexThrowInline, index) === toThrowErrorMatchingInlineName) {
    return {
      code: code.slice(index - indexThrowInline),
      index: index - indexThrowInline
    };
  }
  return {
    code: code.slice(index),
    index
  };
}
const startRegex = /(?:toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot)\s*\(\s*(?:\/\*[\s\S]*\*\/\s*|\/\/.*(?:[\n\r\u2028\u2029]\s*|[\t\v\f \xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF]))*[\w$]*(['"`)])/;
function replaceInlineSnap(code, s, currentIndex, newSnap) {
  const { code: codeStartingAtIndex, index } = getCodeStartingAtIndex(code, currentIndex);
  const startMatch = startRegex.exec(codeStartingAtIndex);
  const firstKeywordMatch = /toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot/.exec(
    codeStartingAtIndex
  );
  if (!startMatch || startMatch.index !== (firstKeywordMatch == null ? undefined : firstKeywordMatch.index)) {
    return replaceObjectSnap(code, s, index, newSnap);
  }
  const quote = startMatch[1];
  const startIndex = index + startMatch.index + startMatch[0].length;
  const snapString = prepareSnapString(newSnap, code, index);
  if (quote === ")") {
    s.appendRight(startIndex - 1, snapString);
    return true;
  }
  const quoteEndRE = new RegExp(`(?:^|[^\\\\])${quote}`);
  const endMatch = quoteEndRE.exec(code.slice(startIndex));
  if (!endMatch) {
    return false;
  }
  const endIndex = startIndex + endMatch.index + endMatch[0].length;
  s.overwrite(startIndex - 1, endIndex, snapString);
  return true;
}
const INDENTATION_REGEX = /^([^\S\n]*)\S/m;
function stripSnapshotIndentation(inlineSnapshot) {
  const match = inlineSnapshot.match(INDENTATION_REGEX);
  if (!match || !match[1]) {
    return inlineSnapshot;
  }
  const indentation = match[1];
  const lines = inlineSnapshot.split(/\n/g);
  if (lines.length <= 2) {
    return inlineSnapshot;
  }
  if (lines[0].trim() !== "" || lines[lines.length - 1].trim() !== "") {
    return inlineSnapshot;
  }
  for (let i = 1; i < lines.length - 1; i++) {
    if (lines[i] !== "") {
      if (lines[i].indexOf(indentation) !== 0) {
        return inlineSnapshot;
      }
      lines[i] = lines[i].substring(indentation.length);
    }
  }
  lines[lines.length - 1] = "";
  inlineSnapshot = lines.join("\n");
  return inlineSnapshot;
}

async function saveRawSnapshots(environment, snapshots) {
  await Promise.all(
    snapshots.map(async (snap) => {
      if (!snap.readonly) {
        await environment.saveSnapshotFile(snap.file, snap.snapshot);
      }
    })
  );
}

var naturalCompare$1 = {exports: {}};

var hasRequiredNaturalCompare;

function requireNaturalCompare () {
	if (hasRequiredNaturalCompare) return naturalCompare$1.exports;
	hasRequiredNaturalCompare = 1;
	/*
	 * @version    1.4.0
	 * @date       2015-10-26
	 * @stability  3 - Stable
	 * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
	 * @license    MIT License
	 */


	var naturalCompare = function(a, b) {
		var i, codeA
		, codeB = 1
		, posA = 0
		, posB = 0
		, alphabet = String.alphabet;

		function getCode(str, pos, code) {
			if (code) {
				for (i = pos; code = getCode(str, i), code < 76 && code > 65;) ++i;
				return +str.slice(pos - 1, i)
			}
			code = alphabet && alphabet.indexOf(str.charAt(pos));
			return code > -1 ? code + 76 : ((code = str.charCodeAt(pos) || 0), code < 45 || code > 127) ? code
				: code < 46 ? 65               // -
				: code < 48 ? code - 1
				: code < 58 ? code + 18        // 0-9
				: code < 65 ? code - 11
				: code < 91 ? code + 11        // A-Z
				: code < 97 ? code - 37
				: code < 123 ? code + 5        // a-z
				: code - 63
		}


		if ((a+="") != (b+="")) for (;codeB;) {
			codeA = getCode(a, posA++);
			codeB = getCode(b, posB++);

			if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
				codeA = getCode(a, posA, posA);
				codeB = getCode(b, posB, posA = i);
				posB = i;
			}

			if (codeA != codeB) return (codeA < codeB) ? -1 : 1
		}
		return 0
	};

	try {
		naturalCompare$1.exports = naturalCompare;
	} catch (e) {
		String.naturalCompare = naturalCompare;
	}
	return naturalCompare$1.exports;
}

var naturalCompareExports = requireNaturalCompare();
var naturalCompare = /*@__PURE__*/getDefaultExportFromCjs$1(naturalCompareExports);

const serialize$1 = (val, config, indentation, depth, refs, printer) => {
  const name = val.getMockName();
  const nameString = name === "vi.fn()" ? "" : ` ${name}`;
  let callsString = "";
  if (val.mock.calls.length !== 0) {
    const indentationNext = indentation + config.indent;
    callsString = ` {${config.spacingOuter}${indentationNext}"calls": ${printer(
      val.mock.calls,
      config,
      indentationNext,
      depth,
      refs
    )}${config.min ? ", " : ","}${config.spacingOuter}${indentationNext}"results": ${printer(
      val.mock.results,
      config,
      indentationNext,
      depth,
      refs
    )}${config.min ? "" : ","}${config.spacingOuter}${indentation}}`;
  }
  return `[MockFunction${nameString}]${callsString}`;
};
const test = (val) => val && !!val._isMockFunction;
const plugin = { serialize: serialize$1, test };

const {
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent,
  AsymmetricMatcher
} = plugins;
let PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher,
  plugin
];
function addSerializer(plugin) {
  PLUGINS = [plugin].concat(PLUGINS);
}
function getSerializers() {
  return PLUGINS;
}

function testNameToKey(testName, count) {
  return `${testName} ${count}`;
}
function keyToTestName(key) {
  if (!/ \d+$/.test(key)) {
    throw new Error("Snapshot keys must end with a number.");
  }
  return key.replace(/ \d+$/, "");
}
function getSnapshotData(content, options) {
  const update = options.updateSnapshot;
  const data = /* @__PURE__ */ Object.create(null);
  let snapshotContents = "";
  let dirty = false;
  if (content != null) {
    try {
      snapshotContents = content;
      const populate = new Function("exports", snapshotContents);
      populate(data);
    } catch {
    }
  }
  const isInvalid = snapshotContents;
  if ((update === "all" || update === "new") && isInvalid) {
    dirty = true;
  }
  return { data, dirty };
}
function addExtraLineBreaks(string) {
  return string.includes("\n") ? `
${string}
` : string;
}
function removeExtraLineBreaks(string) {
  return string.length > 2 && string.startsWith("\n") && string.endsWith("\n") ? string.slice(1, -1) : string;
}
const escapeRegex = true;
const printFunctionName = false;
function serialize(val, indent = 2, formatOverrides = {}) {
  return normalizeNewlines(
    format$2(val, {
      escapeRegex,
      indent,
      plugins: getSerializers(),
      printFunctionName,
      ...formatOverrides
    })
  );
}
function escapeBacktickString(str) {
  return str.replace(/`|\\|\$\{/g, "\\$&");
}
function printBacktickString(str) {
  return `\`${escapeBacktickString(str)}\``;
}
function normalizeNewlines(string) {
  return string.replace(/\r\n|\r/g, "\n");
}
async function saveSnapshotFile(environment, snapshotData, snapshotPath) {
  const snapshots = Object.keys(snapshotData).sort(naturalCompare).map(
    (key) => `exports[${printBacktickString(key)}] = ${printBacktickString(
      normalizeNewlines(snapshotData[key])
    )};`
  );
  const content = `${environment.getHeader()}

${snapshots.join("\n\n")}
`;
  const oldContent = await environment.readSnapshotFile(snapshotPath);
  const skipWriting = oldContent != null && oldContent === content;
  if (skipWriting) {
    return;
  }
  await environment.saveSnapshotFile(snapshotPath, content);
}
function prepareExpected(expected) {
  function findStartIndent() {
    var _a, _b;
    const matchObject = /^( +)\}\s+$/m.exec(expected || "");
    const objectIndent = (_a = matchObject == null ? undefined : matchObject[1]) == null ? undefined : _a.length;
    if (objectIndent) {
      return objectIndent;
    }
    const matchText = /^\n( +)"/.exec(expected || "");
    return ((_b = matchText == null ? undefined : matchText[1]) == null ? undefined : _b.length) || 0;
  }
  const startIndent = findStartIndent();
  let expectedTrimmed = expected == null ? undefined : expected.trim();
  if (startIndent) {
    expectedTrimmed = expectedTrimmed == null ? undefined : expectedTrimmed.replace(new RegExp(`^${" ".repeat(startIndent)}`, "gm"), "").replace(/ +\}$/, "}");
  }
  return expectedTrimmed;
}
function deepMergeArray(target = [], source = []) {
  const mergedOutput = Array.from(target);
  source.forEach((sourceElement, index) => {
    const targetElement = mergedOutput[index];
    if (Array.isArray(target[index])) {
      mergedOutput[index] = deepMergeArray(target[index], sourceElement);
    } else if (isObject(targetElement)) {
      mergedOutput[index] = deepMergeSnapshot(target[index], sourceElement);
    } else {
      mergedOutput[index] = sourceElement;
    }
  });
  return mergedOutput;
}
function deepMergeSnapshot(target, source) {
  if (isObject(target) && isObject(source)) {
    const mergedOutput = { ...target };
    Object.keys(source).forEach((key) => {
      if (isObject(source[key]) && !source[key].$$typeof) {
        if (!(key in target)) {
          Object.assign(mergedOutput, { [key]: source[key] });
        } else {
          mergedOutput[key] = deepMergeSnapshot(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        mergedOutput[key] = deepMergeArray(target[key], source[key]);
      } else {
        Object.assign(mergedOutput, { [key]: source[key] });
      }
    });
    return mergedOutput;
  } else if (Array.isArray(target) && Array.isArray(source)) {
    return deepMergeArray(target, source);
  }
  return target;
}
class DefaultMap extends Map {
  constructor(defaultFn, entries) {
    super(entries);
    this.defaultFn = defaultFn;
  }
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.defaultFn(key));
    }
    return super.get(key);
  }
}
class CounterMap extends DefaultMap {
  constructor() {
    super(() => 0);
  }
  increment(key) {
    this.set(key, this.get(key) + 1);
  }
  total() {
    let total = 0;
    for (const x of this.values()) {
      total += x;
    }
    return total;
  }
}

class SnapshotState {
  constructor(testFilePath, snapshotPath, snapshotContent, options) {
    this.testFilePath = testFilePath;
    this.snapshotPath = snapshotPath;
    const { data, dirty } = getSnapshotData(snapshotContent, options);
    this._fileExists = snapshotContent != null;
    this._initialData = { ...data };
    this._snapshotData = { ...data };
    this._dirty = dirty;
    this._inlineSnapshots = [];
    this._inlineSnapshotStacks = [];
    this._rawSnapshots = [];
    this._uncheckedKeys = new Set(Object.keys(this._snapshotData));
    this.expand = options.expand || false;
    this._updateSnapshot = options.updateSnapshot;
    this._snapshotFormat = {
      printBasicPrototype: false,
      escapeString: false,
      ...options.snapshotFormat
    };
    this._environment = options.snapshotEnvironment;
  }
  _counters = new CounterMap();
  _dirty;
  _updateSnapshot;
  _snapshotData;
  _initialData;
  _inlineSnapshots;
  _inlineSnapshotStacks;
  _testIdToKeys = new DefaultMap(() => []);
  _rawSnapshots;
  _uncheckedKeys;
  _snapshotFormat;
  _environment;
  _fileExists;
  added = new CounterMap();
  matched = new CounterMap();
  unmatched = new CounterMap();
  updated = new CounterMap();
  expand;
  static async create(testFilePath, options) {
    const snapshotPath = await options.snapshotEnvironment.resolvePath(
      testFilePath
    );
    const content = await options.snapshotEnvironment.readSnapshotFile(
      snapshotPath
    );
    return new SnapshotState(testFilePath, snapshotPath, content, options);
  }
  get environment() {
    return this._environment;
  }
  markSnapshotsAsCheckedForTest(testName) {
    this._uncheckedKeys.forEach((uncheckedKey) => {
      if (/ \d+$| > /.test(uncheckedKey.slice(testName.length))) {
        this._uncheckedKeys.delete(uncheckedKey);
      }
    });
  }
  clearTest(testId) {
    this._inlineSnapshots = this._inlineSnapshots.filter((s) => s.testId !== testId);
    this._inlineSnapshotStacks = this._inlineSnapshotStacks.filter((s) => s.testId !== testId);
    for (const key of this._testIdToKeys.get(testId)) {
      const name = keyToTestName(key);
      const count = this._counters.get(name);
      if (count > 0) {
        if (key in this._snapshotData || key in this._initialData) {
          this._snapshotData[key] = this._initialData[key];
        }
        this._counters.set(name, count - 1);
      }
    }
    this._testIdToKeys.delete(testId);
    this.added.delete(testId);
    this.updated.delete(testId);
    this.matched.delete(testId);
    this.unmatched.delete(testId);
  }
  _inferInlineSnapshotStack(stacks) {
    const promiseIndex = stacks.findIndex(
      (i) => i.method.match(/__VITEST_(RESOLVES|REJECTS)__/)
    );
    if (promiseIndex !== -1) {
      return stacks[promiseIndex + 3];
    }
    const stackIndex = stacks.findIndex(
      (i) => i.method.includes("__INLINE_SNAPSHOT__")
    );
    return stackIndex !== -1 ? stacks[stackIndex + 2] : null;
  }
  _addSnapshot(key, receivedSerialized, options) {
    this._dirty = true;
    if (options.stack) {
      this._inlineSnapshots.push({
        snapshot: receivedSerialized,
        testId: options.testId,
        ...options.stack
      });
    } else if (options.rawSnapshot) {
      this._rawSnapshots.push({
        ...options.rawSnapshot,
        snapshot: receivedSerialized
      });
    } else {
      this._snapshotData[key] = receivedSerialized;
    }
  }
  async save() {
    const hasExternalSnapshots = Object.keys(this._snapshotData).length;
    const hasInlineSnapshots = this._inlineSnapshots.length;
    const hasRawSnapshots = this._rawSnapshots.length;
    const isEmpty = !hasExternalSnapshots && !hasInlineSnapshots && !hasRawSnapshots;
    const status = {
      deleted: false,
      saved: false
    };
    if ((this._dirty || this._uncheckedKeys.size) && !isEmpty) {
      if (hasExternalSnapshots) {
        await saveSnapshotFile(
          this._environment,
          this._snapshotData,
          this.snapshotPath
        );
        this._fileExists = true;
      }
      if (hasInlineSnapshots) {
        await saveInlineSnapshots(this._environment, this._inlineSnapshots);
      }
      if (hasRawSnapshots) {
        await saveRawSnapshots(this._environment, this._rawSnapshots);
      }
      status.saved = true;
    } else if (!hasExternalSnapshots && this._fileExists) {
      if (this._updateSnapshot === "all") {
        await this._environment.removeSnapshotFile(this.snapshotPath);
        this._fileExists = false;
      }
      status.deleted = true;
    }
    return status;
  }
  getUncheckedCount() {
    return this._uncheckedKeys.size || 0;
  }
  getUncheckedKeys() {
    return Array.from(this._uncheckedKeys);
  }
  removeUncheckedKeys() {
    if (this._updateSnapshot === "all" && this._uncheckedKeys.size) {
      this._dirty = true;
      this._uncheckedKeys.forEach((key) => delete this._snapshotData[key]);
      this._uncheckedKeys.clear();
    }
  }
  match({
    testId,
    testName,
    received,
    key,
    inlineSnapshot,
    isInline,
    error,
    rawSnapshot
  }) {
    var _a, _b;
    this._counters.increment(testName);
    const count = this._counters.get(testName);
    if (!key) {
      key = testNameToKey(testName, count);
    }
    this._testIdToKeys.get(testId).push(key);
    if (!(isInline && this._snapshotData[key] !== undefined)) {
      this._uncheckedKeys.delete(key);
    }
    let receivedSerialized = rawSnapshot && typeof received === "string" ? received : serialize(received, undefined, this._snapshotFormat);
    if (!rawSnapshot) {
      receivedSerialized = addExtraLineBreaks(receivedSerialized);
    }
    if (rawSnapshot) {
      if (rawSnapshot.content && rawSnapshot.content.match(/\r\n/) && !receivedSerialized.match(/\r\n/)) {
        rawSnapshot.content = normalizeNewlines(rawSnapshot.content);
      }
    }
    const expected = isInline ? inlineSnapshot : rawSnapshot ? rawSnapshot.content : this._snapshotData[key];
    const expectedTrimmed = rawSnapshot ? expected : prepareExpected(expected);
    const pass = expectedTrimmed === (rawSnapshot ? receivedSerialized : prepareExpected(receivedSerialized));
    const hasSnapshot = expected !== undefined;
    const snapshotIsPersisted = isInline || this._fileExists || rawSnapshot && rawSnapshot.content != null;
    if (pass && !isInline && !rawSnapshot) {
      this._snapshotData[key] = receivedSerialized;
    }
    let stack;
    if (isInline) {
      const stacks = parseErrorStacktrace(
        error || new Error("snapshot"),
        { ignoreStackEntries: [] }
      );
      const _stack = this._inferInlineSnapshotStack(stacks);
      if (!_stack) {
        throw new Error(
          `@vitest/snapshot: Couldn't infer stack frame for inline snapshot.
${JSON.stringify(
            stacks
          )}`
        );
      }
      stack = ((_b = (_a = this.environment).processStackTrace) == null ? undefined : _b.call(_a, _stack)) || _stack;
      stack.column--;
      if (this._inlineSnapshotStacks.some((s) => s.file === stack.file && s.line === stack.line && s.column === stack.column)) {
        this._inlineSnapshots = this._inlineSnapshots.filter((s) => !(s.file === stack.file && s.line === stack.line && s.column === stack.column));
        throw new Error("toMatchInlineSnapshot cannot be called multiple times at the same location.");
      }
      this._inlineSnapshotStacks.push({ ...stack, testId });
    }
    if (hasSnapshot && this._updateSnapshot === "all" || (!hasSnapshot || !snapshotIsPersisted) && (this._updateSnapshot === "new" || this._updateSnapshot === "all")) {
      if (this._updateSnapshot === "all") {
        if (!pass) {
          if (hasSnapshot) {
            this.updated.increment(testId);
          } else {
            this.added.increment(testId);
          }
          this._addSnapshot(key, receivedSerialized, {
            stack,
            testId,
            rawSnapshot
          });
        } else {
          this.matched.increment(testId);
        }
      } else {
        this._addSnapshot(key, receivedSerialized, {
          stack,
          testId,
          rawSnapshot
        });
        this.added.increment(testId);
      }
      return {
        actual: "",
        count,
        expected: "",
        key,
        pass: true
      };
    } else {
      if (!pass) {
        this.unmatched.increment(testId);
        return {
          actual: rawSnapshot ? receivedSerialized : removeExtraLineBreaks(receivedSerialized),
          count,
          expected: expectedTrimmed !== undefined ? rawSnapshot ? expectedTrimmed : removeExtraLineBreaks(expectedTrimmed) : undefined,
          key,
          pass: false
        };
      } else {
        this.matched.increment(testId);
        return {
          actual: "",
          count,
          expected: "",
          key,
          pass: true
        };
      }
    }
  }
  async pack() {
    const snapshot = {
      filepath: this.testFilePath,
      added: 0,
      fileDeleted: false,
      matched: 0,
      unchecked: 0,
      uncheckedKeys: [],
      unmatched: 0,
      updated: 0
    };
    const uncheckedCount = this.getUncheckedCount();
    const uncheckedKeys = this.getUncheckedKeys();
    if (uncheckedCount) {
      this.removeUncheckedKeys();
    }
    const status = await this.save();
    snapshot.fileDeleted = status.deleted;
    snapshot.added = this.added.total();
    snapshot.matched = this.matched.total();
    snapshot.unmatched = this.unmatched.total();
    snapshot.updated = this.updated.total();
    snapshot.unchecked = !status.deleted ? uncheckedCount : 0;
    snapshot.uncheckedKeys = Array.from(uncheckedKeys);
    return snapshot;
  }
}

function createMismatchError(message, expand, actual, expected) {
  const error = new Error(message);
  Object.defineProperty(error, "actual", {
    value: actual,
    enumerable: true,
    configurable: true,
    writable: true
  });
  Object.defineProperty(error, "expected", {
    value: expected,
    enumerable: true,
    configurable: true,
    writable: true
  });
  Object.defineProperty(error, "diffOptions", { value: { expand } });
  return error;
}
class SnapshotClient {
  constructor(options = {}) {
    this.options = options;
  }
  snapshotStateMap = /* @__PURE__ */ new Map();
  async setup(filepath, options) {
    if (this.snapshotStateMap.has(filepath)) {
      return;
    }
    this.snapshotStateMap.set(
      filepath,
      await SnapshotState.create(filepath, options)
    );
  }
  async finish(filepath) {
    const state = this.getSnapshotState(filepath);
    const result = await state.pack();
    this.snapshotStateMap.delete(filepath);
    return result;
  }
  skipTest(filepath, testName) {
    const state = this.getSnapshotState(filepath);
    state.markSnapshotsAsCheckedForTest(testName);
  }
  clearTest(filepath, testId) {
    const state = this.getSnapshotState(filepath);
    state.clearTest(testId);
  }
  getSnapshotState(filepath) {
    const state = this.snapshotStateMap.get(filepath);
    if (!state) {
      throw new Error(
        `The snapshot state for '${filepath}' is not found. Did you call 'SnapshotClient.setup()'?`
      );
    }
    return state;
  }
  assert(options) {
    var _a, _b;
    const {
      filepath,
      name,
      testId = name,
      message,
      isInline = false,
      properties,
      inlineSnapshot,
      error,
      errorMessage,
      rawSnapshot
    } = options;
    let { received } = options;
    if (!filepath) {
      throw new Error("Snapshot cannot be used outside of test");
    }
    const snapshotState = this.getSnapshotState(filepath);
    if (typeof properties === "object") {
      if (typeof received !== "object" || !received) {
        throw new Error(
          "Received value must be an object when the matcher has properties"
        );
      }
      try {
        const pass2 = ((_b = (_a = this.options).isEqual) == null ? void 0 : _b.call(_a, received, properties)) ?? false;
        if (!pass2) {
          throw createMismatchError(
            "Snapshot properties mismatched",
            snapshotState.expand,
            received,
            properties
          );
        } else {
          received = deepMergeSnapshot(received, properties);
        }
      } catch (err) {
        err.message = errorMessage || "Snapshot mismatched";
        throw err;
      }
    }
    const testName = [name, ...message ? [message] : []].join(" > ");
    const { actual, expected, key, pass } = snapshotState.match({
      testId,
      testName,
      received,
      isInline,
      error,
      inlineSnapshot,
      rawSnapshot
    });
    if (!pass) {
      throw createMismatchError(
        `Snapshot \`${key || "unknown"}\` mismatched`,
        snapshotState.expand,
        rawSnapshot ? actual : actual == null ? undefined : actual.trim(),
        rawSnapshot ? expected : expected == null ? undefined : expected.trim()
      );
    }
  }
  async assertRaw(options) {
    if (!options.rawSnapshot) {
      throw new Error("Raw snapshot is required");
    }
    const { filepath, rawSnapshot } = options;
    if (rawSnapshot.content == null) {
      if (!filepath) {
        throw new Error("Snapshot cannot be used outside of test");
      }
      const snapshotState = this.getSnapshotState(filepath);
      options.filepath || (options.filepath = filepath);
      rawSnapshot.file = await snapshotState.environment.resolveRawPath(
        filepath,
        rawSnapshot.file
      );
      rawSnapshot.content = await snapshotState.environment.readSnapshotFile(rawSnapshot.file) ?? undefined;
    }
    return this.assert(options);
  }
  clear() {
    this.snapshotStateMap.clear();
  }
}

const RealDate = Date;
let now = null;
class MockDate extends RealDate {
  constructor(y, m, d, h, M, s, ms) {
    super();
    let date;
    switch (arguments.length) {
      case 0:
        if (now !== null) {
          date = new RealDate(now.valueOf());
        } else {
          date = new RealDate();
        }
        break;
      case 1:
        date = new RealDate(y);
        break;
      default:
        d = typeof d === "undefined" ? 1 : d;
        h = h || 0;
        M = M || 0;
        s = s || 0;
        ms = ms || 0;
        date = new RealDate(y, m, d, h, M, s, ms);
        break;
    }
    Object.setPrototypeOf(date, MockDate.prototype);
    return date;
  }
}
MockDate.UTC = RealDate.UTC;
MockDate.now = function() {
  return new MockDate().valueOf();
};
MockDate.parse = function(dateString) {
  return RealDate.parse(dateString);
};
MockDate.toString = function() {
  return RealDate.toString();
};
function mockDate(date) {
  const dateObj = new RealDate(date.valueOf());
  if (Number.isNaN(dateObj.getTime())) {
    throw new TypeError(`mockdate: The time set is an invalid date: ${date}`);
  }
  globalThis.Date = MockDate;
  now = dateObj.valueOf();
}
function resetDate() {
  globalThis.Date = RealDate;
}

var define_process_env_default$1 = {};
const unsupported = [
  // .poll is meant to retry matchers until they succeed, and
  // snapshots will always succeed as long as the poll method doesn't throw an error
  // in this case using the `vi.waitFor` method is more appropriate
  "matchSnapshot",
  "toMatchSnapshot",
  "toMatchInlineSnapshot",
  "toThrowErrorMatchingSnapshot",
  "toThrowErrorMatchingInlineSnapshot",
  // toThrow will never succeed because we call the poll callback until it doesn't throw
  "throws",
  "Throw",
  "throw",
  "toThrow",
  "toThrowError"
  // these are not supported because you can call them without `.poll`,
  // we throw an error inside the rejects/resolves methods to prevent this
  // rejects,
  // resolves
];
function createExpectPoll(expect) {
  return function poll(fn2, options = {}) {
    const state = getWorkerState();
    const defaults = state.config.expect?.poll ?? {};
    const {
      interval = defaults.interval ?? 50,
      timeout = defaults.timeout ?? 1e3,
      message
    } = options;
    const assertion = expect(null, message).withContext({
      poll: true
    });
    fn2 = fn2.bind(assertion);
    const test = utils_exports.flag(assertion, "vitest-test");
    if (!test) {
      throw new Error("expect.poll() must be called inside a test");
    }
    const proxy = new Proxy(assertion, {
      get(target, key, receiver) {
        const assertionFunction = Reflect.get(target, key, receiver);
        if (typeof assertionFunction !== "function") {
          return assertionFunction instanceof Assertion ? proxy : assertionFunction;
        }
        if (key === "assert") {
          return assertionFunction;
        }
        if (typeof key === "string" && unsupported.includes(key)) {
          throw new SyntaxError(
            `expect.poll() is not supported in combination with .${key}(). Use vi.waitFor() if your assertion condition is unstable.`
          );
        }
        return function(...args) {
          const STACK_TRACE_ERROR = new Error("STACK_TRACE_ERROR");
          const promise = () => new Promise((resolve, reject) => {
            let intervalId;
            let timeoutId;
            let lastError;
            const { setTimeout, clearTimeout } = getSafeTimers();
            const check = async () => {
              try {
                utils_exports.flag(assertion, "_name", key);
                const obj = await fn2();
                utils_exports.flag(assertion, "object", obj);
                resolve(await assertionFunction.call(assertion, ...args));
                clearTimeout(intervalId);
                clearTimeout(timeoutId);
              } catch (err) {
                lastError = err;
                if (!utils_exports.flag(assertion, "_isLastPollAttempt")) {
                  intervalId = setTimeout(check, interval);
                }
              }
            };
            timeoutId = setTimeout(() => {
              clearTimeout(intervalId);
              utils_exports.flag(assertion, "_isLastPollAttempt", true);
              const rejectWithCause = (cause) => {
                reject(
                  copyStackTrace$1(
                    new Error(`Matcher did not succeed in ${timeout}ms`, {
                      cause
                    }),
                    STACK_TRACE_ERROR
                  )
                );
              };
              check().then(() => rejectWithCause(lastError)).catch((e) => rejectWithCause(e));
            }, timeout);
            check();
          });
          let awaited = false;
          test.onFinished ??= [];
          test.onFinished.push(() => {
            if (!awaited) {
              const negated = utils_exports.flag(assertion, "negate") ? "not." : "";
              const name = utils_exports.flag(assertion, "_poll.element") ? "element(locator)" : "poll(assertion)";
              const assertionString = `expect.${name}.${negated}${String(key)}()`;
              const error = new Error(
                `${assertionString} was not awaited. This assertion is asynchronous and must be awaited; otherwise, it is not executed to avoid unhandled rejections:

await ${assertionString}
`
              );
              throw copyStackTrace$1(error, STACK_TRACE_ERROR);
            }
          });
          let resultPromise;
          return {
            then(onFulfilled, onRejected) {
              awaited = true;
              return (resultPromise ||= promise()).then(onFulfilled, onRejected);
            },
            catch(onRejected) {
              return (resultPromise ||= promise()).catch(onRejected);
            },
            finally(onFinally) {
              return (resultPromise ||= promise()).finally(onFinally);
            },
            [Symbol.toStringTag]: "Promise"
          };
        };
      }
    });
    return proxy;
  };
}
function copyStackTrace$1(target, source) {
  if (source.stack !== void 0) {
    target.stack = source.stack.replace(source.message, target.message);
  }
  return target;
}
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var chaiSubset$1 = { exports: {} };
var chaiSubset = chaiSubset$1.exports;
var hasRequiredChaiSubset;
function requireChaiSubset() {
  if (hasRequiredChaiSubset)
    return chaiSubset$1.exports;
  hasRequiredChaiSubset = 1;
  (function(module, exports) {
    (function() {
      (function(chaiSubset2) {
        if (typeof commonjsRequire === "function" && true && true) {
          return module.exports = chaiSubset2;
        } else {
          return chai.use(chaiSubset2);
        }
      })(function(chai2, utils) {
        var Assertion = chai2.Assertion;
        var assertionPrototype = Assertion.prototype;
        Assertion.addMethod("containSubset", function(expected) {
          var actual = utils.flag(this, "object");
          var showDiff = chai2.config.showDiff;
          assertionPrototype.assert.call(
            this,
            compare(expected, actual),
            "expected #{act} to contain subset #{exp}",
            "expected #{act} to not contain subset #{exp}",
            expected,
            actual,
            showDiff
          );
        });
        chai2.assert.containSubset = function(val, exp, msg) {
          new chai2.Assertion(val, msg).to.be.containSubset(exp);
        };
        function compare(expected, actual) {
          if (expected === actual) {
            return true;
          }
          if (typeof actual !== typeof expected) {
            return false;
          }
          if (typeof expected !== "object" || expected === null) {
            return expected === actual;
          }
          if (!!expected && !actual) {
            return false;
          }
          if (Array.isArray(expected)) {
            if (typeof actual.length !== "number") {
              return false;
            }
            var aa = Array.prototype.slice.call(actual);
            return expected.every(function(exp) {
              return aa.some(function(act) {
                return compare(exp, act);
              });
            });
          }
          if (expected instanceof Date) {
            if (actual instanceof Date) {
              return expected.getTime() === actual.getTime();
            } else {
              return false;
            }
          }
          return Object.keys(expected).every(function(key) {
            var eo = expected[key];
            var ao = actual[key];
            if (typeof eo === "object" && eo !== null && ao !== null) {
              return compare(eo, ao);
            }
            if (typeof eo === "function") {
              return eo(ao);
            }
            return ao === eo;
          });
        }
      });
    }).call(chaiSubset);
  })(chaiSubset$1);
  return chaiSubset$1.exports;
}
var chaiSubsetExports = requireChaiSubset();
var Subset = /* @__PURE__ */ getDefaultExportFromCjs$2(chaiSubsetExports);
function createAssertionMessage(util, assertion, hasArgs) {
  const not = util.flag(assertion, "negate") ? "not." : "";
  const name = `${util.flag(assertion, "_name")}(${"expected"})`;
  const promiseName = util.flag(assertion, "promise");
  const promise = promiseName ? `.${promiseName}` : "";
  return `expect(actual)${promise}.${not}${name}`;
}
function recordAsyncExpect(_test, promise, assertion, error) {
  const test = _test;
  if (test && promise instanceof Promise) {
    promise = promise.finally(() => {
      if (!test.promises) {
        return;
      }
      const index = test.promises.indexOf(promise);
      if (index !== -1) {
        test.promises.splice(index, 1);
      }
    });
    if (!test.promises) {
      test.promises = [];
    }
    test.promises.push(promise);
    let resolved = false;
    test.onFinished ??= [];
    test.onFinished.push(() => {
      if (!resolved) {
        const processor = globalThis.__vitest_worker__?.onFilterStackTrace || ((s) => s || "");
        const stack = processor(error.stack);
        console.warn([
          `Promise returned by \`${assertion}\` was not awaited. `,
          "Vitest currently auto-awaits hanging assertions at the end of the test, but this will cause the test to fail in Vitest 3. ",
          "Please remember to await the assertion.\n",
          stack
        ].join(""));
      }
    });
    return {
      then(onFulfilled, onRejected) {
        resolved = true;
        return promise.then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return promise.catch(onRejected);
      },
      finally(onFinally) {
        return promise.finally(onFinally);
      },
      [Symbol.toStringTag]: "Promise"
    };
  }
  return promise;
}
let _client;
function getSnapshotClient() {
  if (!_client) {
    _client = new SnapshotClient({
      isEqual: (received, expected) => {
        return equals(received, expected, [iterableEquality, subsetEquality]);
      }
    });
  }
  return _client;
}
function getError(expected, promise) {
  if (typeof expected !== "function") {
    if (!promise) {
      throw new Error(
        `expected must be a function, received ${typeof expected}`
      );
    }
    return expected;
  }
  try {
    expected();
  } catch (e) {
    return e;
  }
  throw new Error("snapshot function didn't throw");
}
function getTestNames(test) {
  return {
    filepath: test.file.filepath,
    name: getNames(test).slice(1).join(" > "),
    testId: test.id
  };
}
const SnapshotPlugin = (chai2, utils) => {
  function getTest(assertionName, obj) {
    const test = utils.flag(obj, "vitest-test");
    if (!test) {
      throw new Error(`'${assertionName}' cannot be used without test context`);
    }
    return test;
  }
  for (const key of ["matchSnapshot", "toMatchSnapshot"]) {
    utils.addMethod(
      chai2.Assertion.prototype,
      key,
      function(properties, message) {
        utils.flag(this, "_name", key);
        const isNot = utils.flag(this, "negate");
        if (isNot) {
          throw new Error(`${key} cannot be used with "not"`);
        }
        const expected = utils.flag(this, "object");
        const test = getTest(key, this);
        if (typeof properties === "string" && typeof message === "undefined") {
          message = properties;
          properties = void 0;
        }
        const errorMessage = utils.flag(this, "message");
        getSnapshotClient().assert({
          received: expected,
          message,
          isInline: false,
          properties,
          errorMessage,
          ...getTestNames(test)
        });
      }
    );
  }
  utils.addMethod(
    chai2.Assertion.prototype,
    "toMatchFileSnapshot",
    function(file, message) {
      utils.flag(this, "_name", "toMatchFileSnapshot");
      const isNot = utils.flag(this, "negate");
      if (isNot) {
        throw new Error('toMatchFileSnapshot cannot be used with "not"');
      }
      const error = new Error("resolves");
      const expected = utils.flag(this, "object");
      const test = getTest("toMatchFileSnapshot", this);
      const errorMessage = utils.flag(this, "message");
      const promise = getSnapshotClient().assertRaw({
        received: expected,
        message,
        isInline: false,
        rawSnapshot: {
          file
        },
        errorMessage,
        ...getTestNames(test)
      });
      return recordAsyncExpect(
        test,
        promise,
        createAssertionMessage(utils, this),
        error
      );
    }
  );
  utils.addMethod(
    chai2.Assertion.prototype,
    "toMatchInlineSnapshot",
    function __INLINE_SNAPSHOT__(properties, inlineSnapshot, message) {
      utils.flag(this, "_name", "toMatchInlineSnapshot");
      const isNot = utils.flag(this, "negate");
      if (isNot) {
        throw new Error('toMatchInlineSnapshot cannot be used with "not"');
      }
      const test = getTest("toMatchInlineSnapshot", this);
      const isInsideEach = test.each || test.suite?.each;
      if (isInsideEach) {
        throw new Error(
          "InlineSnapshot cannot be used inside of test.each or describe.each"
        );
      }
      const expected = utils.flag(this, "object");
      const error = utils.flag(this, "error");
      if (typeof properties === "string") {
        message = inlineSnapshot;
        inlineSnapshot = properties;
        properties = void 0;
      }
      if (inlineSnapshot) {
        inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
      }
      const errorMessage = utils.flag(this, "message");
      getSnapshotClient().assert({
        received: expected,
        message,
        isInline: true,
        properties,
        inlineSnapshot,
        error,
        errorMessage,
        ...getTestNames(test)
      });
    }
  );
  utils.addMethod(
    chai2.Assertion.prototype,
    "toThrowErrorMatchingSnapshot",
    function(message) {
      utils.flag(this, "_name", "toThrowErrorMatchingSnapshot");
      const isNot = utils.flag(this, "negate");
      if (isNot) {
        throw new Error(
          'toThrowErrorMatchingSnapshot cannot be used with "not"'
        );
      }
      const expected = utils.flag(this, "object");
      const test = getTest("toThrowErrorMatchingSnapshot", this);
      const promise = utils.flag(this, "promise");
      const errorMessage = utils.flag(this, "message");
      getSnapshotClient().assert({
        received: getError(expected, promise),
        message,
        errorMessage,
        ...getTestNames(test)
      });
    }
  );
  utils.addMethod(
    chai2.Assertion.prototype,
    "toThrowErrorMatchingInlineSnapshot",
    function __INLINE_SNAPSHOT__(inlineSnapshot, message) {
      const isNot = utils.flag(this, "negate");
      if (isNot) {
        throw new Error(
          'toThrowErrorMatchingInlineSnapshot cannot be used with "not"'
        );
      }
      const test = getTest("toThrowErrorMatchingInlineSnapshot", this);
      const isInsideEach = test.each || test.suite?.each;
      if (isInsideEach) {
        throw new Error(
          "InlineSnapshot cannot be used inside of test.each or describe.each"
        );
      }
      const expected = utils.flag(this, "object");
      const error = utils.flag(this, "error");
      const promise = utils.flag(this, "promise");
      const errorMessage = utils.flag(this, "message");
      if (inlineSnapshot) {
        inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
      }
      getSnapshotClient().assert({
        received: getError(expected, promise),
        message,
        inlineSnapshot,
        isInline: true,
        error,
        errorMessage,
        ...getTestNames(test)
      });
    }
  );
  utils.addMethod(chai2.expect, "addSnapshotSerializer", addSerializer);
};
use(JestExtend);
use(JestChaiExpect);
use(Subset);
use(SnapshotPlugin);
use(JestAsymmetricMatchers);
function createExpect(test) {
  const expect$1 = (value, message) => {
    const { assertionCalls } = getState(expect$1);
    setState({ assertionCalls: assertionCalls + 1 }, expect$1);
    const assert2 = expect(value, message);
    const _test = test || getCurrentTest();
    if (_test) {
      return assert2.withTest(_test);
    } else {
      return assert2;
    }
  };
  Object.assign(expect$1, expect);
  Object.assign(expect$1, globalThis[ASYMMETRIC_MATCHERS_OBJECT]);
  expect$1.getState = () => getState(expect$1);
  expect$1.setState = (state) => setState(state, expect$1);
  const globalState = getState(globalThis[GLOBAL_EXPECT]) || {};
  setState(
    {
      // this should also add "snapshotState" that is added conditionally
      ...globalState,
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberErrorGen: null,
      environment: getCurrentEnvironment(),
      get testPath() {
        return getWorkerState().filepath;
      },
      currentTestName: test ? getTestName(test) : globalState.currentTestName
    },
    expect$1
  );
  expect$1.extend = (matchers) => expect.extend(expect$1, matchers);
  expect$1.addEqualityTesters = (customTesters) => addCustomEqualityTesters(customTesters);
  expect$1.soft = (...args) => {
    return expect$1(...args).withContext({ soft: true });
  };
  expect$1.poll = createExpectPoll(expect$1);
  expect$1.unreachable = (message) => {
    assert$1.fail(
      `expected${message ? ` "${message}" ` : " "}not to be reached`
    );
  };
  function assertions(expected) {
    const errorGen = () => new Error(
      `expected number of assertions to be ${expected}, but got ${expect$1.getState().assertionCalls}`
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(errorGen(), assertions);
    }
    expect$1.setState({
      expectedAssertionsNumber: expected,
      expectedAssertionsNumberErrorGen: errorGen
    });
  }
  function hasAssertions() {
    const error = new Error("expected any number of assertion, but got none");
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, hasAssertions);
    }
    expect$1.setState({
      isExpectingAssertions: true,
      isExpectingAssertionsError: error
    });
  }
  utils_exports.addMethod(expect$1, "assertions", assertions);
  utils_exports.addMethod(expect$1, "hasAssertions", hasAssertions);
  expect$1.extend(customMatchers);
  return expect$1;
}
const globalExpect = createExpect();
Object.defineProperty(globalThis, GLOBAL_EXPECT, {
  value: globalExpect,
  writable: true,
  configurable: true
});
function inject(key) {
  const workerState = getWorkerState();
  return workerState.providedContext[key];
}
var fakeTimersSrc = {};
var global$1;
var hasRequiredGlobal;
function requireGlobal() {
  if (hasRequiredGlobal)
    return global$1;
  hasRequiredGlobal = 1;
  var globalObject;
  if (typeof commonjsGlobal$1 !== "undefined") {
    globalObject = commonjsGlobal$1;
  } else if (typeof window !== "undefined") {
    globalObject = window;
  } else {
    globalObject = self;
  }
  global$1 = globalObject;
  return global$1;
}
var throwsOnProto_1;
var hasRequiredThrowsOnProto;
function requireThrowsOnProto() {
  if (hasRequiredThrowsOnProto)
    return throwsOnProto_1;
  hasRequiredThrowsOnProto = 1;
  let throwsOnProto;
  try {
    const object2 = {};
    object2.__proto__;
    throwsOnProto = false;
  } catch (_) {
    throwsOnProto = true;
  }
  throwsOnProto_1 = throwsOnProto;
  return throwsOnProto_1;
}
var copyPrototypeMethods;
var hasRequiredCopyPrototypeMethods;
function requireCopyPrototypeMethods() {
  if (hasRequiredCopyPrototypeMethods)
    return copyPrototypeMethods;
  hasRequiredCopyPrototypeMethods = 1;
  var call = Function.call;
  var throwsOnProto = requireThrowsOnProto();
  var disallowedProperties = [
    // ignore size because it throws from Map
    "size",
    "caller",
    "callee",
    "arguments"
  ];
  if (throwsOnProto) {
    disallowedProperties.push("__proto__");
  }
  copyPrototypeMethods = function copyPrototypeMethods2(prototype) {
    return Object.getOwnPropertyNames(prototype).reduce(
      function(result, name) {
        if (disallowedProperties.includes(name)) {
          return result;
        }
        if (typeof prototype[name] !== "function") {
          return result;
        }
        result[name] = call.bind(prototype[name]);
        return result;
      },
      /* @__PURE__ */ Object.create(null)
    );
  };
  return copyPrototypeMethods;
}
var array;
var hasRequiredArray;
function requireArray() {
  if (hasRequiredArray)
    return array;
  hasRequiredArray = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  array = copyPrototype(Array.prototype);
  return array;
}
var calledInOrder_1;
var hasRequiredCalledInOrder;
function requireCalledInOrder() {
  if (hasRequiredCalledInOrder)
    return calledInOrder_1;
  hasRequiredCalledInOrder = 1;
  var every2 = requireArray().every;
  function hasCallsLeft(callMap, spy) {
    if (callMap[spy.id] === void 0) {
      callMap[spy.id] = 0;
    }
    return callMap[spy.id] < spy.callCount;
  }
  function checkAdjacentCalls(callMap, spy, index, spies) {
    var calledBeforeNext = true;
    if (index !== spies.length - 1) {
      calledBeforeNext = spy.calledBefore(spies[index + 1]);
    }
    if (hasCallsLeft(callMap, spy) && calledBeforeNext) {
      callMap[spy.id] += 1;
      return true;
    }
    return false;
  }
  function calledInOrder(spies) {
    var callMap = {};
    var _spies = arguments.length > 1 ? arguments : spies;
    return every2(_spies, checkAdjacentCalls.bind(null, callMap));
  }
  calledInOrder_1 = calledInOrder;
  return calledInOrder_1;
}
var className_1;
var hasRequiredClassName;
function requireClassName() {
  if (hasRequiredClassName)
    return className_1;
  hasRequiredClassName = 1;
  function className(value) {
    const name = value.constructor && value.constructor.name;
    return name || null;
  }
  className_1 = className;
  return className_1;
}
var deprecated = {};
var hasRequiredDeprecated;
function requireDeprecated() {
  if (hasRequiredDeprecated)
    return deprecated;
  hasRequiredDeprecated = 1;
  (function(exports) {
    exports.wrap = function(func, msg) {
      var wrapped = function() {
        exports.printWarning(msg);
        return func.apply(this, arguments);
      };
      if (func.prototype) {
        wrapped.prototype = func.prototype;
      }
      return wrapped;
    };
    exports.defaultMsg = function(packageName, funcName) {
      return `${packageName}.${funcName} is deprecated and will be removed from the public API in a future version of ${packageName}.`;
    };
    exports.printWarning = function(msg) {
      if (typeof process === "object" && process.emitWarning) {
        process.emitWarning(msg);
      } else if (console.info) {
        console.info(msg);
      } else {
        console.log(msg);
      }
    };
  })(deprecated);
  return deprecated;
}
var every;
var hasRequiredEvery;
function requireEvery() {
  if (hasRequiredEvery)
    return every;
  hasRequiredEvery = 1;
  every = function every2(obj, fn2) {
    var pass = true;
    try {
      obj.forEach(function() {
        if (!fn2.apply(this, arguments)) {
          throw new Error();
        }
      });
    } catch (e) {
      pass = false;
    }
    return pass;
  };
  return every;
}
var functionName;
var hasRequiredFunctionName;
function requireFunctionName() {
  if (hasRequiredFunctionName)
    return functionName;
  hasRequiredFunctionName = 1;
  functionName = function functionName2(func) {
    if (!func) {
      return "";
    }
    try {
      return func.displayName || func.name || // Use function decomposition as a last resort to get function
      // name. Does not rely on function decomposition to work - if it
      // doesn't debugging will be slightly less informative
      // (i.e. toString will say 'spy' rather than 'myFunc').
      (String(func).match(/function ([^\s(]+)/) || [])[1];
    } catch (e) {
      return "";
    }
  };
  return functionName;
}
var orderByFirstCall_1;
var hasRequiredOrderByFirstCall;
function requireOrderByFirstCall() {
  if (hasRequiredOrderByFirstCall)
    return orderByFirstCall_1;
  hasRequiredOrderByFirstCall = 1;
  var sort = requireArray().sort;
  var slice = requireArray().slice;
  function comparator(a, b) {
    var aCall = a.getCall(0);
    var bCall = b.getCall(0);
    var aId = aCall && aCall.callId || -1;
    var bId = bCall && bCall.callId || -1;
    return aId < bId ? -1 : 1;
  }
  function orderByFirstCall(spies) {
    return sort(slice(spies), comparator);
  }
  orderByFirstCall_1 = orderByFirstCall;
  return orderByFirstCall_1;
}
var _function;
var hasRequired_function;
function require_function() {
  if (hasRequired_function)
    return _function;
  hasRequired_function = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  _function = copyPrototype(Function.prototype);
  return _function;
}
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap)
    return map;
  hasRequiredMap = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  map = copyPrototype(Map.prototype);
  return map;
}
var object;
var hasRequiredObject;
function requireObject() {
  if (hasRequiredObject)
    return object;
  hasRequiredObject = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  object = copyPrototype(Object.prototype);
  return object;
}
var set;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet)
    return set;
  hasRequiredSet = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  set = copyPrototype(Set.prototype);
  return set;
}
var string;
var hasRequiredString;
function requireString() {
  if (hasRequiredString)
    return string;
  hasRequiredString = 1;
  var copyPrototype = requireCopyPrototypeMethods();
  string = copyPrototype(String.prototype);
  return string;
}
var prototypes;
var hasRequiredPrototypes;
function requirePrototypes() {
  if (hasRequiredPrototypes)
    return prototypes;
  hasRequiredPrototypes = 1;
  prototypes = {
    array: requireArray(),
    function: require_function(),
    map: requireMap(),
    object: requireObject(),
    set: requireSet(),
    string: requireString()
  };
  return prototypes;
}
var typeDetect$1 = { exports: {} };
var typeDetect = typeDetect$1.exports;
var hasRequiredTypeDetect;
function requireTypeDetect() {
  if (hasRequiredTypeDetect)
    return typeDetect$1.exports;
  hasRequiredTypeDetect = 1;
  (function(module, exports) {
    (function(global2, factory) {
      module.exports = factory();
    })(typeDetect, function() {
      var promiseExists = typeof Promise === "function";
      var globalObject = typeof self === "object" ? self : commonjsGlobal$1;
      var symbolExists = typeof Symbol !== "undefined";
      var mapExists = typeof Map !== "undefined";
      var setExists = typeof Set !== "undefined";
      var weakMapExists = typeof WeakMap !== "undefined";
      var weakSetExists = typeof WeakSet !== "undefined";
      var dataViewExists = typeof DataView !== "undefined";
      var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== "undefined";
      var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== "undefined";
      var setEntriesExists = setExists && typeof Set.prototype.entries === "function";
      var mapEntriesExists = mapExists && typeof Map.prototype.entries === "function";
      var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf((/* @__PURE__ */ new Set()).entries());
      var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf((/* @__PURE__ */ new Map()).entries());
      var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === "function";
      var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
      var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === "function";
      var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(""[Symbol.iterator]());
      var toStringLeftSliceLength = 8;
      var toStringRightSliceLength = -1;
      function typeDetect2(obj) {
        var typeofObj = typeof obj;
        if (typeofObj !== "object") {
          return typeofObj;
        }
        if (obj === null) {
          return "null";
        }
        if (obj === globalObject) {
          return "global";
        }
        if (Array.isArray(obj) && (symbolToStringTagExists === false || !(Symbol.toStringTag in obj))) {
          return "Array";
        }
        if (typeof window === "object" && window !== null) {
          if (typeof window.location === "object" && obj === window.location) {
            return "Location";
          }
          if (typeof window.document === "object" && obj === window.document) {
            return "Document";
          }
          if (typeof window.navigator === "object") {
            if (typeof window.navigator.mimeTypes === "object" && obj === window.navigator.mimeTypes) {
              return "MimeTypeArray";
            }
            if (typeof window.navigator.plugins === "object" && obj === window.navigator.plugins) {
              return "PluginArray";
            }
          }
          if ((typeof window.HTMLElement === "function" || typeof window.HTMLElement === "object") && obj instanceof window.HTMLElement) {
            if (obj.tagName === "BLOCKQUOTE") {
              return "HTMLQuoteElement";
            }
            if (obj.tagName === "TD") {
              return "HTMLTableDataCellElement";
            }
            if (obj.tagName === "TH") {
              return "HTMLTableHeaderCellElement";
            }
          }
        }
        var stringTag = symbolToStringTagExists && obj[Symbol.toStringTag];
        if (typeof stringTag === "string") {
          return stringTag;
        }
        var objPrototype = Object.getPrototypeOf(obj);
        if (objPrototype === RegExp.prototype) {
          return "RegExp";
        }
        if (objPrototype === Date.prototype) {
          return "Date";
        }
        if (promiseExists && objPrototype === Promise.prototype) {
          return "Promise";
        }
        if (setExists && objPrototype === Set.prototype) {
          return "Set";
        }
        if (mapExists && objPrototype === Map.prototype) {
          return "Map";
        }
        if (weakSetExists && objPrototype === WeakSet.prototype) {
          return "WeakSet";
        }
        if (weakMapExists && objPrototype === WeakMap.prototype) {
          return "WeakMap";
        }
        if (dataViewExists && objPrototype === DataView.prototype) {
          return "DataView";
        }
        if (mapExists && objPrototype === mapIteratorPrototype) {
          return "Map Iterator";
        }
        if (setExists && objPrototype === setIteratorPrototype) {
          return "Set Iterator";
        }
        if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
          return "Array Iterator";
        }
        if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
          return "String Iterator";
        }
        if (objPrototype === null) {
          return "Object";
        }
        return Object.prototype.toString.call(obj).slice(toStringLeftSliceLength, toStringRightSliceLength);
      }
      return typeDetect2;
    });
  })(typeDetect$1);
  return typeDetect$1.exports;
}
var typeOf;
var hasRequiredTypeOf;
function requireTypeOf() {
  if (hasRequiredTypeOf)
    return typeOf;
  hasRequiredTypeOf = 1;
  var type = requireTypeDetect();
  typeOf = function typeOf2(value) {
    return type(value).toLowerCase();
  };
  return typeOf;
}
var valueToString_1;
var hasRequiredValueToString;
function requireValueToString() {
  if (hasRequiredValueToString)
    return valueToString_1;
  hasRequiredValueToString = 1;
  function valueToString(value) {
    if (value && value.toString) {
      return value.toString();
    }
    return String(value);
  }
  valueToString_1 = valueToString;
  return valueToString_1;
}
var lib;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib)
    return lib;
  hasRequiredLib = 1;
  lib = {
    global: requireGlobal(),
    calledInOrder: requireCalledInOrder(),
    className: requireClassName(),
    deprecated: requireDeprecated(),
    every: requireEvery(),
    functionName: requireFunctionName(),
    orderByFirstCall: requireOrderByFirstCall(),
    prototypes: requirePrototypes(),
    typeOf: requireTypeOf(),
    valueToString: requireValueToString()
  };
  return lib;
}
var hasRequiredFakeTimersSrc;
function requireFakeTimersSrc() {
  if (hasRequiredFakeTimersSrc)
    return fakeTimersSrc;
  hasRequiredFakeTimersSrc = 1;
  const globalObject = requireLib().global;
  let timersModule, timersPromisesModule;
  if (typeof __vitest_required__ !== "undefined") {
    try {
      timersModule = __vitest_required__.timers;
    } catch (e) {
    }
    try {
      timersPromisesModule = __vitest_required__.timersPromises;
    } catch (e) {
    }
  }
  function withGlobal(_global) {
    const maxTimeout = Math.pow(2, 31) - 1;
    const idCounterStart = 1e12;
    const NOOP = function() {
      return void 0;
    };
    const NOOP_ARRAY = function() {
      return [];
    };
    const isPresent = {};
    let timeoutResult, addTimerReturnsObject = false;
    if (_global.setTimeout) {
      isPresent.setTimeout = true;
      timeoutResult = _global.setTimeout(NOOP, 0);
      addTimerReturnsObject = typeof timeoutResult === "object";
    }
    isPresent.clearTimeout = Boolean(_global.clearTimeout);
    isPresent.setInterval = Boolean(_global.setInterval);
    isPresent.clearInterval = Boolean(_global.clearInterval);
    isPresent.hrtime = _global.process && typeof _global.process.hrtime === "function";
    isPresent.hrtimeBigint = isPresent.hrtime && typeof _global.process.hrtime.bigint === "function";
    isPresent.nextTick = _global.process && typeof _global.process.nextTick === "function";
    const utilPromisify = _global.process && _global.__vitest_required__ && _global.__vitest_required__.util.promisify;
    isPresent.performance = _global.performance && typeof _global.performance.now === "function";
    const hasPerformancePrototype = _global.Performance && (typeof _global.Performance).match(/^(function|object)$/);
    const hasPerformanceConstructorPrototype = _global.performance && _global.performance.constructor && _global.performance.constructor.prototype;
    isPresent.queueMicrotask = _global.hasOwnProperty("queueMicrotask");
    isPresent.requestAnimationFrame = _global.requestAnimationFrame && typeof _global.requestAnimationFrame === "function";
    isPresent.cancelAnimationFrame = _global.cancelAnimationFrame && typeof _global.cancelAnimationFrame === "function";
    isPresent.requestIdleCallback = _global.requestIdleCallback && typeof _global.requestIdleCallback === "function";
    isPresent.cancelIdleCallbackPresent = _global.cancelIdleCallback && typeof _global.cancelIdleCallback === "function";
    isPresent.setImmediate = _global.setImmediate && typeof _global.setImmediate === "function";
    isPresent.clearImmediate = _global.clearImmediate && typeof _global.clearImmediate === "function";
    isPresent.Intl = _global.Intl && typeof _global.Intl === "object";
    if (_global.clearTimeout) {
      _global.clearTimeout(timeoutResult);
    }
    const NativeDate = _global.Date;
    const NativeIntl = isPresent.Intl ? Object.defineProperties(
      /* @__PURE__ */ Object.create(null),
      Object.getOwnPropertyDescriptors(_global.Intl)
    ) : void 0;
    let uniqueTimerId = idCounterStart;
    if (NativeDate === void 0) {
      throw new Error(
        "The global scope doesn't have a `Date` object (see https://github.com/sinonjs/sinon/issues/1852#issuecomment-419622780)"
      );
    }
    isPresent.Date = true;
    class FakePerformanceEntry {
      constructor(name, entryType, startTime, duration) {
        this.name = name;
        this.entryType = entryType;
        this.startTime = startTime;
        this.duration = duration;
      }
      toJSON() {
        return JSON.stringify({ ...this });
      }
    }
    function isNumberFinite(num) {
      if (Number.isFinite) {
        return Number.isFinite(num);
      }
      return isFinite(num);
    }
    let isNearInfiniteLimit = false;
    function checkIsNearInfiniteLimit(clock, i) {
      if (clock.loopLimit && i === clock.loopLimit - 1) {
        isNearInfiniteLimit = true;
      }
    }
    function resetIsNearInfiniteLimit() {
      isNearInfiniteLimit = false;
    }
    function parseTime(str) {
      if (!str) {
        return 0;
      }
      const strings = str.split(":");
      const l = strings.length;
      let i = l;
      let ms = 0;
      let parsed;
      if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
        throw new Error(
          "tick only understands numbers, 'm:s' and 'h:m:s'. Each part must be two digits"
        );
      }
      while (i--) {
        parsed = parseInt(strings[i], 10);
        if (parsed >= 60) {
          throw new Error(`Invalid time ${str}`);
        }
        ms += parsed * Math.pow(60, l - i - 1);
      }
      return ms * 1e3;
    }
    function nanoRemainder(msFloat) {
      const modulo = 1e6;
      const remainder = msFloat * 1e6 % modulo;
      const positiveRemainder = remainder < 0 ? remainder + modulo : remainder;
      return Math.floor(positiveRemainder);
    }
    function getEpoch(epoch) {
      if (!epoch) {
        return 0;
      }
      if (typeof epoch.getTime === "function") {
        return epoch.getTime();
      }
      if (typeof epoch === "number") {
        return epoch;
      }
      throw new TypeError("now should be milliseconds since UNIX epoch");
    }
    function inRange(from, to, timer) {
      return timer && timer.callAt >= from && timer.callAt <= to;
    }
    function getInfiniteLoopError(clock, job) {
      const infiniteLoopError = new Error(
        `Aborting after running ${clock.loopLimit} timers, assuming an infinite loop!`
      );
      if (!job.error) {
        return infiniteLoopError;
      }
      const computedTargetPattern = /target\.*[<|(|[].*?[>|\]|)]\s*/;
      let clockMethodPattern = new RegExp(
        String(Object.keys(clock).join("|"))
      );
      if (addTimerReturnsObject) {
        clockMethodPattern = new RegExp(
          `\\s+at (Object\\.)?(?:${Object.keys(clock).join("|")})\\s+`
        );
      }
      let matchedLineIndex = -1;
      job.error.stack.split("\n").some(function(line, i) {
        const matchedComputedTarget = line.match(computedTargetPattern);
        if (matchedComputedTarget) {
          matchedLineIndex = i;
          return true;
        }
        const matchedClockMethod = line.match(clockMethodPattern);
        if (matchedClockMethod) {
          matchedLineIndex = i;
          return false;
        }
        return matchedLineIndex >= 0;
      });
      const stack = `${infiniteLoopError}
${job.type || "Microtask"} - ${job.func.name || "anonymous"}
${job.error.stack.split("\n").slice(matchedLineIndex + 1).join("\n")}`;
      try {
        Object.defineProperty(infiniteLoopError, "stack", {
          value: stack
        });
      } catch (e) {
      }
      return infiniteLoopError;
    }
    function createDate() {
      class ClockDate extends NativeDate {
        /**
         * @param {number} year
         * @param {number} month
         * @param {number} date
         * @param {number} hour
         * @param {number} minute
         * @param {number} second
         * @param {number} ms
         * @returns void
         */
        // eslint-disable-next-line no-unused-vars
        constructor(year, month, date, hour, minute, second, ms) {
          if (arguments.length === 0) {
            super(ClockDate.clock.now);
          } else {
            super(...arguments);
          }
          Object.defineProperty(this, "constructor", {
            value: NativeDate,
            enumerable: false
          });
        }
        static [Symbol.hasInstance](instance) {
          return instance instanceof NativeDate;
        }
      }
      ClockDate.isFake = true;
      if (NativeDate.now) {
        ClockDate.now = function now() {
          return ClockDate.clock.now;
        };
      }
      if (NativeDate.toSource) {
        ClockDate.toSource = function toSource() {
          return NativeDate.toSource();
        };
      }
      ClockDate.toString = function toString() {
        return NativeDate.toString();
      };
      const ClockDateProxy = new Proxy(ClockDate, {
        // handler for [[Call]] invocations (i.e. not using `new`)
        apply() {
          if (this instanceof ClockDate) {
            throw new TypeError(
              "A Proxy should only capture `new` calls with the `construct` handler. This is not supposed to be possible, so check the logic."
            );
          }
          return new NativeDate(ClockDate.clock.now).toString();
        }
      });
      return ClockDateProxy;
    }
    function createIntl() {
      const ClockIntl = {};
      Object.getOwnPropertyNames(NativeIntl).forEach(
        (property) => ClockIntl[property] = NativeIntl[property]
      );
      ClockIntl.DateTimeFormat = function(...args) {
        const realFormatter = new NativeIntl.DateTimeFormat(...args);
        const formatter = {};
        ["formatRange", "formatRangeToParts", "resolvedOptions"].forEach(
          (method) => {
            formatter[method] = realFormatter[method].bind(realFormatter);
          }
        );
        ["format", "formatToParts"].forEach((method) => {
          formatter[method] = function(date) {
            return realFormatter[method](date || ClockIntl.clock.now);
          };
        });
        return formatter;
      };
      ClockIntl.DateTimeFormat.prototype = Object.create(
        NativeIntl.DateTimeFormat.prototype
      );
      ClockIntl.DateTimeFormat.supportedLocalesOf = NativeIntl.DateTimeFormat.supportedLocalesOf;
      return ClockIntl;
    }
    function enqueueJob(clock, job) {
      if (!clock.jobs) {
        clock.jobs = [];
      }
      clock.jobs.push(job);
    }
    function runJobs(clock) {
      if (!clock.jobs) {
        return;
      }
      for (let i = 0; i < clock.jobs.length; i++) {
        const job = clock.jobs[i];
        job.func.apply(null, job.args);
        checkIsNearInfiniteLimit(clock, i);
        if (clock.loopLimit && i > clock.loopLimit) {
          throw getInfiniteLoopError(clock, job);
        }
      }
      resetIsNearInfiniteLimit();
      clock.jobs = [];
    }
    function addTimer(clock, timer) {
      if (timer.func === void 0) {
        throw new Error("Callback must be provided to timer calls");
      }
      if (addTimerReturnsObject) {
        if (typeof timer.func !== "function") {
          throw new TypeError(
            `[ERR_INVALID_CALLBACK]: Callback must be a function. Received ${timer.func} of type ${typeof timer.func}`
          );
        }
      }
      if (isNearInfiniteLimit) {
        timer.error = new Error();
      }
      timer.type = timer.immediate ? "Immediate" : "Timeout";
      if (timer.hasOwnProperty("delay")) {
        if (typeof timer.delay !== "number") {
          timer.delay = parseInt(timer.delay, 10);
        }
        if (!isNumberFinite(timer.delay)) {
          timer.delay = 0;
        }
        timer.delay = timer.delay > maxTimeout ? 1 : timer.delay;
        timer.delay = Math.max(0, timer.delay);
      }
      if (timer.hasOwnProperty("interval")) {
        timer.type = "Interval";
        timer.interval = timer.interval > maxTimeout ? 1 : timer.interval;
      }
      if (timer.hasOwnProperty("animation")) {
        timer.type = "AnimationFrame";
        timer.animation = true;
      }
      if (timer.hasOwnProperty("idleCallback")) {
        timer.type = "IdleCallback";
        timer.idleCallback = true;
      }
      if (!clock.timers) {
        clock.timers = {};
      }
      timer.id = uniqueTimerId++;
      timer.createdAt = clock.now;
      timer.callAt = clock.now + (parseInt(timer.delay) || (clock.duringTick ? 1 : 0));
      clock.timers[timer.id] = timer;
      if (addTimerReturnsObject) {
        const res = {
          refed: true,
          ref: function() {
            this.refed = true;
            return res;
          },
          unref: function() {
            this.refed = false;
            return res;
          },
          hasRef: function() {
            return this.refed;
          },
          refresh: function() {
            timer.callAt = clock.now + (parseInt(timer.delay) || (clock.duringTick ? 1 : 0));
            clock.timers[timer.id] = timer;
            return res;
          },
          [Symbol.toPrimitive]: function() {
            return timer.id;
          }
        };
        return res;
      }
      return timer.id;
    }
    function compareTimers(a, b) {
      if (a.callAt < b.callAt) {
        return -1;
      }
      if (a.callAt > b.callAt) {
        return 1;
      }
      if (a.immediate && !b.immediate) {
        return -1;
      }
      if (!a.immediate && b.immediate) {
        return 1;
      }
      if (a.createdAt < b.createdAt) {
        return -1;
      }
      if (a.createdAt > b.createdAt) {
        return 1;
      }
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
    }
    function firstTimerInRange(clock, from, to) {
      const timers2 = clock.timers;
      let timer = null;
      let id, isInRange;
      for (id in timers2) {
        if (timers2.hasOwnProperty(id)) {
          isInRange = inRange(from, to, timers2[id]);
          if (isInRange && (!timer || compareTimers(timer, timers2[id]) === 1)) {
            timer = timers2[id];
          }
        }
      }
      return timer;
    }
    function firstTimer(clock) {
      const timers2 = clock.timers;
      let timer = null;
      let id;
      for (id in timers2) {
        if (timers2.hasOwnProperty(id)) {
          if (!timer || compareTimers(timer, timers2[id]) === 1) {
            timer = timers2[id];
          }
        }
      }
      return timer;
    }
    function lastTimer(clock) {
      const timers2 = clock.timers;
      let timer = null;
      let id;
      for (id in timers2) {
        if (timers2.hasOwnProperty(id)) {
          if (!timer || compareTimers(timer, timers2[id]) === -1) {
            timer = timers2[id];
          }
        }
      }
      return timer;
    }
    function callTimer(clock, timer) {
      if (typeof timer.interval === "number") {
        clock.timers[timer.id].callAt += timer.interval;
      } else {
        delete clock.timers[timer.id];
      }
      if (typeof timer.func === "function") {
        timer.func.apply(null, timer.args);
      } else {
        const eval2 = eval;
        (function() {
          eval2(timer.func);
        })();
      }
    }
    function getClearHandler(ttype) {
      if (ttype === "IdleCallback" || ttype === "AnimationFrame") {
        return `cancel${ttype}`;
      }
      return `clear${ttype}`;
    }
    function getScheduleHandler(ttype) {
      if (ttype === "IdleCallback" || ttype === "AnimationFrame") {
        return `request${ttype}`;
      }
      return `set${ttype}`;
    }
    function createWarnOnce() {
      let calls = 0;
      return function(msg) {
        !calls++ && console.warn(msg);
      };
    }
    const warnOnce = createWarnOnce();
    function clearTimer(clock, timerId, ttype) {
      if (!timerId) {
        return;
      }
      if (!clock.timers) {
        clock.timers = {};
      }
      const id = Number(timerId);
      if (Number.isNaN(id) || id < idCounterStart) {
        const handlerName = getClearHandler(ttype);
        if (clock.shouldClearNativeTimers === true) {
          const nativeHandler = clock[`_${handlerName}`];
          return typeof nativeHandler === "function" ? nativeHandler(timerId) : void 0;
        }
        warnOnce(
          `FakeTimers: ${handlerName} was invoked to clear a native timer instead of one created by this library.
To automatically clean-up native timers, use \`shouldClearNativeTimers\`.`
        );
      }
      if (clock.timers.hasOwnProperty(id)) {
        const timer = clock.timers[id];
        if (timer.type === ttype || timer.type === "Timeout" && ttype === "Interval" || timer.type === "Interval" && ttype === "Timeout") {
          delete clock.timers[id];
        } else {
          const clear = getClearHandler(ttype);
          const schedule = getScheduleHandler(timer.type);
          throw new Error(
            `Cannot clear timer: timer created with ${schedule}() but cleared with ${clear}()`
          );
        }
      }
    }
    function uninstall(clock, config) {
      let method, i, l;
      const installedHrTime = "_hrtime";
      const installedNextTick = "_nextTick";
      for (i = 0, l = clock.methods.length; i < l; i++) {
        method = clock.methods[i];
        if (method === "hrtime" && _global.process) {
          _global.process.hrtime = clock[installedHrTime];
        } else if (method === "nextTick" && _global.process) {
          _global.process.nextTick = clock[installedNextTick];
        } else if (method === "performance") {
          const originalPerfDescriptor = Object.getOwnPropertyDescriptor(
            clock,
            `_${method}`
          );
          if (originalPerfDescriptor && originalPerfDescriptor.get && !originalPerfDescriptor.set) {
            Object.defineProperty(
              _global,
              method,
              originalPerfDescriptor
            );
          } else if (originalPerfDescriptor.configurable) {
            _global[method] = clock[`_${method}`];
          }
        } else {
          if (_global[method] && _global[method].hadOwnProperty) {
            _global[method] = clock[`_${method}`];
          } else {
            try {
              delete _global[method];
            } catch (ignore) {
            }
          }
        }
        if (clock.timersModuleMethods !== void 0) {
          for (let j = 0; j < clock.timersModuleMethods.length; j++) {
            const entry = clock.timersModuleMethods[j];
            timersModule[entry.methodName] = entry.original;
          }
        }
        if (clock.timersPromisesModuleMethods !== void 0) {
          for (let j = 0; j < clock.timersPromisesModuleMethods.length; j++) {
            const entry = clock.timersPromisesModuleMethods[j];
            timersPromisesModule[entry.methodName] = entry.original;
          }
        }
      }
      if (config.shouldAdvanceTime === true) {
        _global.clearInterval(clock.attachedInterval);
      }
      clock.methods = [];
      for (const [listener, signal] of clock.abortListenerMap.entries()) {
        signal.removeEventListener("abort", listener);
        clock.abortListenerMap.delete(listener);
      }
      if (!clock.timers) {
        return [];
      }
      return Object.keys(clock.timers).map(function mapper(key) {
        return clock.timers[key];
      });
    }
    function hijackMethod(target, method, clock) {
      clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(
        target,
        method
      );
      clock[`_${method}`] = target[method];
      if (method === "Date") {
        target[method] = clock[method];
      } else if (method === "Intl") {
        target[method] = clock[method];
      } else if (method === "performance") {
        const originalPerfDescriptor = Object.getOwnPropertyDescriptor(
          target,
          method
        );
        if (originalPerfDescriptor && originalPerfDescriptor.get && !originalPerfDescriptor.set) {
          Object.defineProperty(
            clock,
            `_${method}`,
            originalPerfDescriptor
          );
          const perfDescriptor = Object.getOwnPropertyDescriptor(
            clock,
            method
          );
          Object.defineProperty(target, method, perfDescriptor);
        } else {
          target[method] = clock[method];
        }
      } else {
        target[method] = function() {
          return clock[method].apply(clock, arguments);
        };
        Object.defineProperties(
          target[method],
          Object.getOwnPropertyDescriptors(clock[method])
        );
      }
      target[method].clock = clock;
    }
    function doIntervalTick(clock, advanceTimeDelta) {
      clock.tick(advanceTimeDelta);
    }
    const timers = {
      setTimeout: _global.setTimeout,
      clearTimeout: _global.clearTimeout,
      setInterval: _global.setInterval,
      clearInterval: _global.clearInterval,
      Date: _global.Date
    };
    if (isPresent.setImmediate) {
      timers.setImmediate = _global.setImmediate;
    }
    if (isPresent.clearImmediate) {
      timers.clearImmediate = _global.clearImmediate;
    }
    if (isPresent.hrtime) {
      timers.hrtime = _global.process.hrtime;
    }
    if (isPresent.nextTick) {
      timers.nextTick = _global.process.nextTick;
    }
    if (isPresent.performance) {
      timers.performance = _global.performance;
    }
    if (isPresent.requestAnimationFrame) {
      timers.requestAnimationFrame = _global.requestAnimationFrame;
    }
    if (isPresent.queueMicrotask) {
      timers.queueMicrotask = _global.queueMicrotask;
    }
    if (isPresent.cancelAnimationFrame) {
      timers.cancelAnimationFrame = _global.cancelAnimationFrame;
    }
    if (isPresent.requestIdleCallback) {
      timers.requestIdleCallback = _global.requestIdleCallback;
    }
    if (isPresent.cancelIdleCallback) {
      timers.cancelIdleCallback = _global.cancelIdleCallback;
    }
    if (isPresent.Intl) {
      timers.Intl = NativeIntl;
    }
    const originalSetTimeout = _global.setImmediate || _global.setTimeout;
    function createClock(start, loopLimit) {
      start = Math.floor(getEpoch(start));
      loopLimit = loopLimit || 1e3;
      let nanos = 0;
      const adjustedSystemTime = [0, 0];
      const clock = {
        now: start,
        Date: createDate(),
        loopLimit
      };
      clock.Date.clock = clock;
      function getTimeToNextFrame() {
        return 16 - (clock.now - start) % 16;
      }
      function hrtime(prev) {
        const millisSinceStart = clock.now - adjustedSystemTime[0] - start;
        const secsSinceStart = Math.floor(millisSinceStart / 1e3);
        const remainderInNanos = (millisSinceStart - secsSinceStart * 1e3) * 1e6 + nanos - adjustedSystemTime[1];
        if (Array.isArray(prev)) {
          if (prev[1] > 1e9) {
            throw new TypeError(
              "Number of nanoseconds can't exceed a billion"
            );
          }
          const oldSecs = prev[0];
          let nanoDiff = remainderInNanos - prev[1];
          let secDiff = secsSinceStart - oldSecs;
          if (nanoDiff < 0) {
            nanoDiff += 1e9;
            secDiff -= 1;
          }
          return [secDiff, nanoDiff];
        }
        return [secsSinceStart, remainderInNanos];
      }
      function fakePerformanceNow() {
        const hrt = hrtime();
        const millis = hrt[0] * 1e3 + hrt[1] / 1e6;
        return millis;
      }
      if (isPresent.hrtimeBigint) {
        hrtime.bigint = function() {
          const parts = hrtime();
          return BigInt(parts[0]) * BigInt(1e9) + BigInt(parts[1]);
        };
      }
      if (isPresent.Intl) {
        clock.Intl = createIntl();
        clock.Intl.clock = clock;
      }
      clock.requestIdleCallback = function requestIdleCallback(func, timeout) {
        let timeToNextIdlePeriod = 0;
        if (clock.countTimers() > 0) {
          timeToNextIdlePeriod = 50;
        }
        const result = addTimer(clock, {
          func,
          args: Array.prototype.slice.call(arguments, 2),
          delay: typeof timeout === "undefined" ? timeToNextIdlePeriod : Math.min(timeout, timeToNextIdlePeriod),
          idleCallback: true
        });
        return Number(result);
      };
      clock.cancelIdleCallback = function cancelIdleCallback(timerId) {
        return clearTimer(clock, timerId, "IdleCallback");
      };
      clock.setTimeout = function setTimeout(func, timeout) {
        return addTimer(clock, {
          func,
          args: Array.prototype.slice.call(arguments, 2),
          delay: timeout
        });
      };
      if (typeof _global.Promise !== "undefined" && utilPromisify) {
        clock.setTimeout[utilPromisify.custom] = function promisifiedSetTimeout(timeout, arg) {
          return new _global.Promise(function setTimeoutExecutor(resolve) {
            addTimer(clock, {
              func: resolve,
              args: [arg],
              delay: timeout
            });
          });
        };
      }
      clock.clearTimeout = function clearTimeout(timerId) {
        return clearTimer(clock, timerId, "Timeout");
      };
      clock.nextTick = function nextTick(func) {
        return enqueueJob(clock, {
          func,
          args: Array.prototype.slice.call(arguments, 1),
          error: isNearInfiniteLimit ? new Error() : null
        });
      };
      clock.queueMicrotask = function queueMicrotask(func) {
        return clock.nextTick(func);
      };
      clock.setInterval = function setInterval(func, timeout) {
        timeout = parseInt(timeout, 10);
        return addTimer(clock, {
          func,
          args: Array.prototype.slice.call(arguments, 2),
          delay: timeout,
          interval: timeout
        });
      };
      clock.clearInterval = function clearInterval(timerId) {
        return clearTimer(clock, timerId, "Interval");
      };
      if (isPresent.setImmediate) {
        clock.setImmediate = function setImmediate(func) {
          return addTimer(clock, {
            func,
            args: Array.prototype.slice.call(arguments, 1),
            immediate: true
          });
        };
        if (typeof _global.Promise !== "undefined" && utilPromisify) {
          clock.setImmediate[utilPromisify.custom] = function promisifiedSetImmediate(arg) {
            return new _global.Promise(
              function setImmediateExecutor(resolve) {
                addTimer(clock, {
                  func: resolve,
                  args: [arg],
                  immediate: true
                });
              }
            );
          };
        }
        clock.clearImmediate = function clearImmediate(timerId) {
          return clearTimer(clock, timerId, "Immediate");
        };
      }
      clock.countTimers = function countTimers() {
        return Object.keys(clock.timers || {}).length + (clock.jobs || []).length;
      };
      clock.requestAnimationFrame = function requestAnimationFrame(func) {
        const result = addTimer(clock, {
          func,
          delay: getTimeToNextFrame(),
          get args() {
            return [fakePerformanceNow()];
          },
          animation: true
        });
        return Number(result);
      };
      clock.cancelAnimationFrame = function cancelAnimationFrame(timerId) {
        return clearTimer(clock, timerId, "AnimationFrame");
      };
      clock.runMicrotasks = function runMicrotasks() {
        runJobs(clock);
      };
      function doTick(tickValue, isAsync, resolve, reject) {
        const msFloat = typeof tickValue === "number" ? tickValue : parseTime(tickValue);
        const ms = Math.floor(msFloat);
        const remainder = nanoRemainder(msFloat);
        let nanosTotal = nanos + remainder;
        let tickTo = clock.now + ms;
        if (msFloat < 0) {
          throw new TypeError("Negative ticks are not supported");
        }
        if (nanosTotal >= 1e6) {
          tickTo += 1;
          nanosTotal -= 1e6;
        }
        nanos = nanosTotal;
        let tickFrom = clock.now;
        let previous = clock.now;
        let timer, firstException, oldNow, nextPromiseTick, compensationCheck, postTimerCall;
        clock.duringTick = true;
        oldNow = clock.now;
        runJobs(clock);
        if (oldNow !== clock.now) {
          tickFrom += clock.now - oldNow;
          tickTo += clock.now - oldNow;
        }
        function doTickInner() {
          timer = firstTimerInRange(clock, tickFrom, tickTo);
          while (timer && tickFrom <= tickTo) {
            if (clock.timers[timer.id]) {
              tickFrom = timer.callAt;
              clock.now = timer.callAt;
              oldNow = clock.now;
              try {
                runJobs(clock);
                callTimer(clock, timer);
              } catch (e) {
                firstException = firstException || e;
              }
              if (isAsync) {
                originalSetTimeout(nextPromiseTick);
                return;
              }
              compensationCheck();
            }
            postTimerCall();
          }
          oldNow = clock.now;
          runJobs(clock);
          if (oldNow !== clock.now) {
            tickFrom += clock.now - oldNow;
            tickTo += clock.now - oldNow;
          }
          clock.duringTick = false;
          timer = firstTimerInRange(clock, tickFrom, tickTo);
          if (timer) {
            try {
              clock.tick(tickTo - clock.now);
            } catch (e) {
              firstException = firstException || e;
            }
          } else {
            clock.now = tickTo;
            nanos = nanosTotal;
          }
          if (firstException) {
            throw firstException;
          }
          if (isAsync) {
            resolve(clock.now);
          } else {
            return clock.now;
          }
        }
        nextPromiseTick = isAsync && function() {
          try {
            compensationCheck();
            postTimerCall();
            doTickInner();
          } catch (e) {
            reject(e);
          }
        };
        compensationCheck = function() {
          if (oldNow !== clock.now) {
            tickFrom += clock.now - oldNow;
            tickTo += clock.now - oldNow;
            previous += clock.now - oldNow;
          }
        };
        postTimerCall = function() {
          timer = firstTimerInRange(clock, previous, tickTo);
          previous = tickFrom;
        };
        return doTickInner();
      }
      clock.tick = function tick(tickValue) {
        return doTick(tickValue, false);
      };
      if (typeof _global.Promise !== "undefined") {
        clock.tickAsync = function tickAsync(tickValue) {
          return new _global.Promise(function(resolve, reject) {
            originalSetTimeout(function() {
              try {
                doTick(tickValue, true, resolve, reject);
              } catch (e) {
                reject(e);
              }
            });
          });
        };
      }
      clock.next = function next() {
        runJobs(clock);
        const timer = firstTimer(clock);
        if (!timer) {
          return clock.now;
        }
        clock.duringTick = true;
        try {
          clock.now = timer.callAt;
          callTimer(clock, timer);
          runJobs(clock);
          return clock.now;
        } finally {
          clock.duringTick = false;
        }
      };
      if (typeof _global.Promise !== "undefined") {
        clock.nextAsync = function nextAsync() {
          return new _global.Promise(function(resolve, reject) {
            originalSetTimeout(function() {
              try {
                const timer = firstTimer(clock);
                if (!timer) {
                  resolve(clock.now);
                  return;
                }
                let err;
                clock.duringTick = true;
                clock.now = timer.callAt;
                try {
                  callTimer(clock, timer);
                } catch (e) {
                  err = e;
                }
                clock.duringTick = false;
                originalSetTimeout(function() {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(clock.now);
                  }
                });
              } catch (e) {
                reject(e);
              }
            });
          });
        };
      }
      clock.runAll = function runAll() {
        let numTimers, i;
        runJobs(clock);
        for (i = 0; i < clock.loopLimit; i++) {
          if (!clock.timers) {
            resetIsNearInfiniteLimit();
            return clock.now;
          }
          numTimers = Object.keys(clock.timers).length;
          if (numTimers === 0) {
            resetIsNearInfiniteLimit();
            return clock.now;
          }
          clock.next();
          checkIsNearInfiniteLimit(clock, i);
        }
        const excessJob = firstTimer(clock);
        throw getInfiniteLoopError(clock, excessJob);
      };
      clock.runToFrame = function runToFrame() {
        return clock.tick(getTimeToNextFrame());
      };
      if (typeof _global.Promise !== "undefined") {
        clock.runAllAsync = function runAllAsync() {
          return new _global.Promise(function(resolve, reject) {
            let i = 0;
            function doRun() {
              originalSetTimeout(function() {
                try {
                  runJobs(clock);
                  let numTimers;
                  if (i < clock.loopLimit) {
                    if (!clock.timers) {
                      resetIsNearInfiniteLimit();
                      resolve(clock.now);
                      return;
                    }
                    numTimers = Object.keys(
                      clock.timers
                    ).length;
                    if (numTimers === 0) {
                      resetIsNearInfiniteLimit();
                      resolve(clock.now);
                      return;
                    }
                    clock.next();
                    i++;
                    doRun();
                    checkIsNearInfiniteLimit(clock, i);
                    return;
                  }
                  const excessJob = firstTimer(clock);
                  reject(getInfiniteLoopError(clock, excessJob));
                } catch (e) {
                  reject(e);
                }
              });
            }
            doRun();
          });
        };
      }
      clock.runToLast = function runToLast() {
        const timer = lastTimer(clock);
        if (!timer) {
          runJobs(clock);
          return clock.now;
        }
        return clock.tick(timer.callAt - clock.now);
      };
      if (typeof _global.Promise !== "undefined") {
        clock.runToLastAsync = function runToLastAsync() {
          return new _global.Promise(function(resolve, reject) {
            originalSetTimeout(function() {
              try {
                const timer = lastTimer(clock);
                if (!timer) {
                  runJobs(clock);
                  resolve(clock.now);
                }
                resolve(clock.tickAsync(timer.callAt - clock.now));
              } catch (e) {
                reject(e);
              }
            });
          });
        };
      }
      clock.reset = function reset() {
        nanos = 0;
        clock.timers = {};
        clock.jobs = [];
        clock.now = start;
      };
      clock.setSystemTime = function setSystemTime(systemTime) {
        const newNow = getEpoch(systemTime);
        const difference = newNow - clock.now;
        let id, timer;
        adjustedSystemTime[0] = adjustedSystemTime[0] + difference;
        adjustedSystemTime[1] = adjustedSystemTime[1] + nanos;
        clock.now = newNow;
        nanos = 0;
        for (id in clock.timers) {
          if (clock.timers.hasOwnProperty(id)) {
            timer = clock.timers[id];
            timer.createdAt += difference;
            timer.callAt += difference;
          }
        }
      };
      clock.jump = function jump(tickValue) {
        const msFloat = typeof tickValue === "number" ? tickValue : parseTime(tickValue);
        const ms = Math.floor(msFloat);
        for (const timer of Object.values(clock.timers)) {
          if (clock.now + ms > timer.callAt) {
            timer.callAt = clock.now + ms;
          }
        }
        clock.tick(ms);
      };
      if (isPresent.performance) {
        clock.performance = /* @__PURE__ */ Object.create(null);
        clock.performance.now = fakePerformanceNow;
      }
      if (isPresent.hrtime) {
        clock.hrtime = hrtime;
      }
      return clock;
    }
    function install(config) {
      if (arguments.length > 1 || config instanceof Date || Array.isArray(config) || typeof config === "number") {
        throw new TypeError(
          `FakeTimers.install called with ${String(
            config
          )} install requires an object parameter`
        );
      }
      if (_global.Date.isFake === true) {
        throw new TypeError(
          "Can't install fake timers twice on the same global object."
        );
      }
      config = typeof config !== "undefined" ? config : {};
      config.shouldAdvanceTime = config.shouldAdvanceTime || false;
      config.advanceTimeDelta = config.advanceTimeDelta || 20;
      config.shouldClearNativeTimers = config.shouldClearNativeTimers || false;
      if (config.target) {
        throw new TypeError(
          "config.target is no longer supported. Use `withGlobal(target)` instead."
        );
      }
      function handleMissingTimer(timer) {
        if (config.ignoreMissingTimers) {
          return;
        }
        throw new ReferenceError(
          `non-existent timers and/or objects cannot be faked: '${timer}'`
        );
      }
      let i, l;
      const clock = createClock(config.now, config.loopLimit);
      clock.shouldClearNativeTimers = config.shouldClearNativeTimers;
      clock.uninstall = function() {
        return uninstall(clock, config);
      };
      clock.abortListenerMap = /* @__PURE__ */ new Map();
      clock.methods = config.toFake || [];
      if (clock.methods.length === 0) {
        clock.methods = Object.keys(timers);
      }
      if (config.shouldAdvanceTime === true) {
        const intervalTick = doIntervalTick.bind(
          null,
          clock,
          config.advanceTimeDelta
        );
        const intervalId = _global.setInterval(
          intervalTick,
          config.advanceTimeDelta
        );
        clock.attachedInterval = intervalId;
      }
      if (clock.methods.includes("performance")) {
        const proto = (() => {
          if (hasPerformanceConstructorPrototype) {
            return _global.performance.constructor.prototype;
          }
          if (hasPerformancePrototype) {
            return _global.Performance.prototype;
          }
        })();
        if (proto) {
          Object.getOwnPropertyNames(proto).forEach(function(name) {
            if (name !== "now") {
              clock.performance[name] = name.indexOf("getEntries") === 0 ? NOOP_ARRAY : NOOP;
            }
          });
          clock.performance.mark = (name) => new FakePerformanceEntry(name, "mark", 0, 0);
          clock.performance.measure = (name) => new FakePerformanceEntry(name, "measure", 0, 100);
          clock.performance.timeOrigin = getEpoch(config.now);
        } else if ((config.toFake || []).includes("performance")) {
          return handleMissingTimer("performance");
        }
      }
      if (_global === globalObject && timersModule) {
        clock.timersModuleMethods = [];
      }
      if (_global === globalObject && timersPromisesModule) {
        clock.timersPromisesModuleMethods = [];
      }
      for (i = 0, l = clock.methods.length; i < l; i++) {
        const nameOfMethodToReplace = clock.methods[i];
        if (!isPresent[nameOfMethodToReplace]) {
          handleMissingTimer(nameOfMethodToReplace);
          continue;
        }
        if (nameOfMethodToReplace === "hrtime") {
          if (_global.process && typeof _global.process.hrtime === "function") {
            hijackMethod(_global.process, nameOfMethodToReplace, clock);
          }
        } else if (nameOfMethodToReplace === "nextTick") {
          if (_global.process && typeof _global.process.nextTick === "function") {
            hijackMethod(_global.process, nameOfMethodToReplace, clock);
          }
        } else {
          hijackMethod(_global, nameOfMethodToReplace, clock);
        }
        if (clock.timersModuleMethods !== void 0 && timersModule[nameOfMethodToReplace]) {
          const original = timersModule[nameOfMethodToReplace];
          clock.timersModuleMethods.push({
            methodName: nameOfMethodToReplace,
            original
          });
          timersModule[nameOfMethodToReplace] = _global[nameOfMethodToReplace];
        }
        if (clock.timersPromisesModuleMethods !== void 0) {
          if (nameOfMethodToReplace === "setTimeout") {
            clock.timersPromisesModuleMethods.push({
              methodName: "setTimeout",
              original: timersPromisesModule.setTimeout
            });
            timersPromisesModule.setTimeout = (delay, value, options = {}) => new Promise((resolve, reject) => {
              const abort = () => {
                options.signal.removeEventListener(
                  "abort",
                  abort
                );
                clock.abortListenerMap.delete(abort);
                clock.clearTimeout(handle);
                reject(options.signal.reason);
              };
              const handle = clock.setTimeout(() => {
                if (options.signal) {
                  options.signal.removeEventListener(
                    "abort",
                    abort
                  );
                  clock.abortListenerMap.delete(abort);
                }
                resolve(value);
              }, delay);
              if (options.signal) {
                if (options.signal.aborted) {
                  abort();
                } else {
                  options.signal.addEventListener(
                    "abort",
                    abort
                  );
                  clock.abortListenerMap.set(
                    abort,
                    options.signal
                  );
                }
              }
            });
          } else if (nameOfMethodToReplace === "setImmediate") {
            clock.timersPromisesModuleMethods.push({
              methodName: "setImmediate",
              original: timersPromisesModule.setImmediate
            });
            timersPromisesModule.setImmediate = (value, options = {}) => new Promise((resolve, reject) => {
              const abort = () => {
                options.signal.removeEventListener(
                  "abort",
                  abort
                );
                clock.abortListenerMap.delete(abort);
                clock.clearImmediate(handle);
                reject(options.signal.reason);
              };
              const handle = clock.setImmediate(() => {
                if (options.signal) {
                  options.signal.removeEventListener(
                    "abort",
                    abort
                  );
                  clock.abortListenerMap.delete(abort);
                }
                resolve(value);
              });
              if (options.signal) {
                if (options.signal.aborted) {
                  abort();
                } else {
                  options.signal.addEventListener(
                    "abort",
                    abort
                  );
                  clock.abortListenerMap.set(
                    abort,
                    options.signal
                  );
                }
              }
            });
          } else if (nameOfMethodToReplace === "setInterval") {
            clock.timersPromisesModuleMethods.push({
              methodName: "setInterval",
              original: timersPromisesModule.setInterval
            });
            timersPromisesModule.setInterval = (delay, value, options = {}) => ({
              [Symbol.asyncIterator]: () => {
                const createResolvable = () => {
                  let resolve, reject;
                  const promise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                  });
                  promise.resolve = resolve;
                  promise.reject = reject;
                  return promise;
                };
                let done = false;
                let hasThrown = false;
                let returnCall;
                let nextAvailable = 0;
                const nextQueue = [];
                const handle = clock.setInterval(() => {
                  if (nextQueue.length > 0) {
                    nextQueue.shift().resolve();
                  } else {
                    nextAvailable++;
                  }
                }, delay);
                const abort = () => {
                  options.signal.removeEventListener(
                    "abort",
                    abort
                  );
                  clock.abortListenerMap.delete(abort);
                  clock.clearInterval(handle);
                  done = true;
                  for (const resolvable of nextQueue) {
                    resolvable.resolve();
                  }
                };
                if (options.signal) {
                  if (options.signal.aborted) {
                    done = true;
                  } else {
                    options.signal.addEventListener(
                      "abort",
                      abort
                    );
                    clock.abortListenerMap.set(
                      abort,
                      options.signal
                    );
                  }
                }
                return {
                  next: async () => {
                    if (options.signal?.aborted && !hasThrown) {
                      hasThrown = true;
                      throw options.signal.reason;
                    }
                    if (done) {
                      return { done: true, value: void 0 };
                    }
                    if (nextAvailable > 0) {
                      nextAvailable--;
                      return { done: false, value };
                    }
                    const resolvable = createResolvable();
                    nextQueue.push(resolvable);
                    await resolvable;
                    if (returnCall && nextQueue.length === 0) {
                      returnCall.resolve();
                    }
                    if (options.signal?.aborted && !hasThrown) {
                      hasThrown = true;
                      throw options.signal.reason;
                    }
                    if (done) {
                      return { done: true, value: void 0 };
                    }
                    return { done: false, value };
                  },
                  return: async () => {
                    if (done) {
                      return { done: true, value: void 0 };
                    }
                    if (nextQueue.length > 0) {
                      returnCall = createResolvable();
                      await returnCall;
                    }
                    clock.clearInterval(handle);
                    done = true;
                    if (options.signal) {
                      options.signal.removeEventListener(
                        "abort",
                        abort
                      );
                      clock.abortListenerMap.delete(abort);
                    }
                    return { done: true, value: void 0 };
                  }
                };
              }
            });
          }
        }
      }
      return clock;
    }
    return {
      timers,
      createClock,
      install,
      withGlobal
    };
  }
  const defaultImplementation = withGlobal(globalObject);
  fakeTimersSrc.timers = defaultImplementation.timers;
  fakeTimersSrc.createClock = defaultImplementation.createClock;
  fakeTimersSrc.install = defaultImplementation.install;
  fakeTimersSrc.withGlobal = withGlobal;
  return fakeTimersSrc;
}
var fakeTimersSrcExports = requireFakeTimersSrc();
class FakeTimers {
  _global;
  _clock;
  _fakingTime;
  _fakingDate;
  _fakeTimers;
  _userConfig;
  _now = RealDate.now;
  constructor({
    global: global2,
    config
  }) {
    this._userConfig = config;
    this._fakingDate = false;
    this._fakingTime = false;
    this._fakeTimers = fakeTimersSrcExports.withGlobal(global2);
    this._global = global2;
  }
  clearAllTimers() {
    if (this._fakingTime) {
      this._clock.reset();
    }
  }
  dispose() {
    this.useRealTimers();
  }
  runAllTimers() {
    if (this._checkFakeTimers()) {
      this._clock.runAll();
    }
  }
  async runAllTimersAsync() {
    if (this._checkFakeTimers()) {
      await this._clock.runAllAsync();
    }
  }
  runOnlyPendingTimers() {
    if (this._checkFakeTimers()) {
      this._clock.runToLast();
    }
  }
  async runOnlyPendingTimersAsync() {
    if (this._checkFakeTimers()) {
      await this._clock.runToLastAsync();
    }
  }
  advanceTimersToNextTimer(steps = 1) {
    if (this._checkFakeTimers()) {
      for (let i = steps; i > 0; i--) {
        this._clock.next();
        this._clock.tick(0);
        if (this._clock.countTimers() === 0) {
          break;
        }
      }
    }
  }
  async advanceTimersToNextTimerAsync(steps = 1) {
    if (this._checkFakeTimers()) {
      for (let i = steps; i > 0; i--) {
        await this._clock.nextAsync();
        this._clock.tick(0);
        if (this._clock.countTimers() === 0) {
          break;
        }
      }
    }
  }
  advanceTimersByTime(msToRun) {
    if (this._checkFakeTimers()) {
      this._clock.tick(msToRun);
    }
  }
  async advanceTimersByTimeAsync(msToRun) {
    if (this._checkFakeTimers()) {
      await this._clock.tickAsync(msToRun);
    }
  }
  advanceTimersToNextFrame() {
    if (this._checkFakeTimers()) {
      this._clock.runToFrame();
    }
  }
  runAllTicks() {
    if (this._checkFakeTimers()) {
      this._clock.runMicrotasks();
    }
  }
  useRealTimers() {
    if (this._fakingDate) {
      resetDate();
      this._fakingDate = false;
    }
    if (this._fakingTime) {
      this._clock.uninstall();
      this._fakingTime = false;
    }
  }
  useFakeTimers() {
    if (this._fakingDate) {
      throw new Error(
        '"setSystemTime" was called already and date was mocked. Reset timers using `vi.useRealTimers()` if you want to use fake timers again.'
      );
    }
    if (!this._fakingTime) {
      const toFake = Object.keys(this._fakeTimers.timers).filter(
        (timer) => timer !== "nextTick"
      );
      if (this._userConfig?.toFake?.includes("nextTick") && isChildProcess()) {
        throw new Error(
          "process.nextTick cannot be mocked inside child_process"
        );
      }
      this._clock = this._fakeTimers.install({
        now: Date.now(),
        ...this._userConfig,
        toFake: this._userConfig?.toFake || toFake,
        ignoreMissingTimers: true
      });
      this._fakingTime = true;
    }
  }
  reset() {
    if (this._checkFakeTimers()) {
      const { now } = this._clock;
      this._clock.reset();
      this._clock.setSystemTime(now);
    }
  }
  setSystemTime(now) {
    if (this._fakingTime) {
      this._clock.setSystemTime(now);
    } else {
      mockDate(now ?? this.getRealSystemTime());
      this._fakingDate = true;
    }
  }
  getRealSystemTime() {
    return this._now();
  }
  getTimerCount() {
    if (this._checkFakeTimers()) {
      return this._clock.countTimers();
    }
    return 0;
  }
  configure(config) {
    this._userConfig = config;
  }
  isFakeTimers() {
    return this._fakingTime;
  }
  _checkFakeTimers() {
    if (!this._fakingTime) {
      throw new Error(
        'Timers are not mocked. Try calling "vi.useFakeTimers()" first.'
      );
    }
    return this._fakingTime;
  }
}
function copyStackTrace(target, source) {
  if (source.stack !== void 0) {
    target.stack = source.stack.replace(source.message, target.message);
  }
  return target;
}
function waitFor(callback, options = {}) {
  const { setTimeout, setInterval, clearTimeout, clearInterval } = getSafeTimers();
  const { interval = 50, timeout = 1e3 } = typeof options === "number" ? { timeout: options } : options;
  const STACK_TRACE_ERROR = new Error("STACK_TRACE_ERROR");
  return new Promise((resolve, reject) => {
    let lastError;
    let promiseStatus = "idle";
    let timeoutId;
    let intervalId;
    const onResolve = (result) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      resolve(result);
    };
    const handleTimeout = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      let error = lastError;
      if (!error) {
        error = copyStackTrace(
          new Error("Timed out in waitFor!"),
          STACK_TRACE_ERROR
        );
      }
      reject(error);
    };
    const checkCallback = () => {
      if (vi.isFakeTimers()) {
        vi.advanceTimersByTime(interval);
      }
      if (promiseStatus === "pending") {
        return;
      }
      try {
        const result = callback();
        if (result !== null && typeof result === "object" && typeof result.then === "function") {
          const thenable = result;
          promiseStatus = "pending";
          thenable.then(
            (resolvedValue) => {
              promiseStatus = "resolved";
              onResolve(resolvedValue);
            },
            (rejectedValue) => {
              promiseStatus = "rejected";
              lastError = rejectedValue;
            }
          );
        } else {
          onResolve(result);
          return true;
        }
      } catch (error) {
        lastError = error;
      }
    };
    if (checkCallback() === true) {
      return;
    }
    timeoutId = setTimeout(handleTimeout, timeout);
    intervalId = setInterval(checkCallback, interval);
  });
}
function waitUntil(callback, options = {}) {
  const { setTimeout, setInterval, clearTimeout, clearInterval } = getSafeTimers();
  const { interval = 50, timeout = 1e3 } = typeof options === "number" ? { timeout: options } : options;
  const STACK_TRACE_ERROR = new Error("STACK_TRACE_ERROR");
  return new Promise((resolve, reject) => {
    let promiseStatus = "idle";
    let timeoutId;
    let intervalId;
    const onReject = (error) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (!error) {
        error = copyStackTrace(
          new Error("Timed out in waitUntil!"),
          STACK_TRACE_ERROR
        );
      }
      reject(error);
    };
    const onResolve = (result) => {
      if (!result) {
        return;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      resolve(result);
      return true;
    };
    const checkCallback = () => {
      if (vi.isFakeTimers()) {
        vi.advanceTimersByTime(interval);
      }
      if (promiseStatus === "pending") {
        return;
      }
      try {
        const result = callback();
        if (result !== null && typeof result === "object" && typeof result.then === "function") {
          const thenable = result;
          promiseStatus = "pending";
          thenable.then(
            (resolvedValue) => {
              promiseStatus = "resolved";
              onResolve(resolvedValue);
            },
            (rejectedValue) => {
              promiseStatus = "rejected";
              onReject(rejectedValue);
            }
          );
        } else {
          return onResolve(result);
        }
      } catch (error) {
        onReject(error);
      }
    };
    if (checkCallback() === true) {
      return;
    }
    timeoutId = setTimeout(onReject, timeout);
    intervalId = setInterval(checkCallback, interval);
  });
}
function createVitest() {
  let _mockedDate = null;
  let _config = null;
  const workerState = getWorkerState();
  let _timers;
  const timers = () => _timers ||= new FakeTimers({
    global: globalThis,
    config: workerState.config.fakeTimers
  });
  const _stubsGlobal = /* @__PURE__ */ new Map();
  const _stubsEnv = /* @__PURE__ */ new Map();
  const _envBooleans = ["PROD", "DEV", "SSR"];
  const utils = {
    useFakeTimers(config) {
      if (isChildProcess()) {
        if (config?.toFake?.includes("nextTick") || workerState.config?.fakeTimers?.toFake?.includes("nextTick")) {
          throw new Error(
            'vi.useFakeTimers({ toFake: ["nextTick"] }) is not supported in node:child_process. Use --pool=threads if mocking nextTick is required.'
          );
        }
      }
      if (config) {
        timers().configure({ ...workerState.config.fakeTimers, ...config });
      } else {
        timers().configure(workerState.config.fakeTimers);
      }
      timers().useFakeTimers();
      return utils;
    },
    isFakeTimers() {
      return timers().isFakeTimers();
    },
    useRealTimers() {
      timers().useRealTimers();
      _mockedDate = null;
      return utils;
    },
    runOnlyPendingTimers() {
      timers().runOnlyPendingTimers();
      return utils;
    },
    async runOnlyPendingTimersAsync() {
      await timers().runOnlyPendingTimersAsync();
      return utils;
    },
    runAllTimers() {
      timers().runAllTimers();
      return utils;
    },
    async runAllTimersAsync() {
      await timers().runAllTimersAsync();
      return utils;
    },
    runAllTicks() {
      timers().runAllTicks();
      return utils;
    },
    advanceTimersByTime(ms) {
      timers().advanceTimersByTime(ms);
      return utils;
    },
    async advanceTimersByTimeAsync(ms) {
      await timers().advanceTimersByTimeAsync(ms);
      return utils;
    },
    advanceTimersToNextTimer() {
      timers().advanceTimersToNextTimer();
      return utils;
    },
    async advanceTimersToNextTimerAsync() {
      await timers().advanceTimersToNextTimerAsync();
      return utils;
    },
    advanceTimersToNextFrame() {
      timers().advanceTimersToNextFrame();
      return utils;
    },
    getTimerCount() {
      return timers().getTimerCount();
    },
    setSystemTime(time) {
      const date = time instanceof Date ? time : new Date(time);
      _mockedDate = date;
      timers().setSystemTime(date);
      return utils;
    },
    getMockedSystemTime() {
      return _mockedDate;
    },
    getRealSystemTime() {
      return timers().getRealSystemTime();
    },
    clearAllTimers() {
      timers().clearAllTimers();
      return utils;
    },
    // mocks
    spyOn,
    fn,
    waitFor,
    waitUntil,
    hoisted(factory) {
      assertTypes(factory, '"vi.hoisted" factory', ["function"]);
      return factory();
    },
    mock(path, factory) {
      if (typeof path !== "string") {
        throw new TypeError(
          `vi.mock() expects a string path, but received a ${typeof path}`
        );
      }
      const importer = getImporter("mock");
      _mocker().queueMock(
        path,
        importer,
        typeof factory === "function" ? () => factory(
          () => _mocker().importActual(
            path,
            importer,
            _mocker().getMockContext().callstack
          )
        ) : factory
      );
    },
    unmock(path) {
      if (typeof path !== "string") {
        throw new TypeError(
          `vi.unmock() expects a string path, but received a ${typeof path}`
        );
      }
      _mocker().queueUnmock(path, getImporter("unmock"));
    },
    doMock(path, factory) {
      if (typeof path !== "string") {
        throw new TypeError(
          `vi.doMock() expects a string path, but received a ${typeof path}`
        );
      }
      const importer = getImporter("doMock");
      _mocker().queueMock(
        path,
        importer,
        typeof factory === "function" ? () => factory(
          () => _mocker().importActual(
            path,
            importer,
            _mocker().getMockContext().callstack
          )
        ) : factory
      );
    },
    doUnmock(path) {
      if (typeof path !== "string") {
        throw new TypeError(
          `vi.doUnmock() expects a string path, but received a ${typeof path}`
        );
      }
      _mocker().queueUnmock(path, getImporter("doUnmock"));
    },
    async importActual(path) {
      return _mocker().importActual(
        path,
        getImporter("importActual"),
        _mocker().getMockContext().callstack
      );
    },
    async importMock(path) {
      return _mocker().importMock(path, getImporter("importMock"));
    },
    // this is typed in the interface so it's not necessary to type it here
    mocked(item, _options = {}) {
      return item;
    },
    isMockFunction(fn2) {
      return isMockFunction(fn2);
    },
    clearAllMocks() {
      mocks.forEach((spy) => spy.mockClear());
      return utils;
    },
    resetAllMocks() {
      mocks.forEach((spy) => spy.mockReset());
      return utils;
    },
    restoreAllMocks() {
      mocks.forEach((spy) => spy.mockRestore());
      return utils;
    },
    stubGlobal(name, value) {
      if (!_stubsGlobal.has(name)) {
        _stubsGlobal.set(
          name,
          Object.getOwnPropertyDescriptor(globalThis, name)
        );
      }
      Object.defineProperty(globalThis, name, {
        value,
        writable: true,
        configurable: true,
        enumerable: true
      });
      return utils;
    },
    stubEnv(name, value) {
      if (!_stubsEnv.has(name)) {
        _stubsEnv.set(name, define_process_env_default$1[name]);
      }
      if (_envBooleans.includes(name)) {
        define_process_env_default$1[name] = value ? "1" : "";
      } else if (value === void 0) {
        delete define_process_env_default$1[name];
      } else {
        define_process_env_default$1[name] = String(value);
      }
      return utils;
    },
    unstubAllGlobals() {
      _stubsGlobal.forEach((original, name) => {
        if (!original) {
          Reflect.deleteProperty(globalThis, name);
        } else {
          Object.defineProperty(globalThis, name, original);
        }
      });
      _stubsGlobal.clear();
      return utils;
    },
    unstubAllEnvs() {
      _stubsEnv.forEach((original, name) => {
        if (original === void 0) {
          delete define_process_env_default$1[name];
        } else {
          define_process_env_default$1[name] = original;
        }
      });
      _stubsEnv.clear();
      return utils;
    },
    resetModules() {
      resetModules(workerState.moduleCache);
      return utils;
    },
    async dynamicImportSettled() {
      return waitForImportsToResolve();
    },
    setConfig(config) {
      if (!_config) {
        _config = { ...workerState.config };
      }
      Object.assign(workerState.config, config);
    },
    resetConfig() {
      if (_config) {
        Object.assign(workerState.config, _config);
      }
    }
  };
  return utils;
}
const vitest = createVitest();
const vi = vitest;
function _mocker() {
  return typeof __vitest_mocker__ !== "undefined" ? __vitest_mocker__ : new Proxy(
    {},
    {
      get(_, name) {
        throw new Error(
          `Vitest mocker was not initialized in this environment. vi.${String(name)}() is forbidden.`
        );
      }
    }
  );
}
function getImporter(name) {
  const stackTrace = createSimpleStackTrace({ stackTraceLimit: 5 });
  const stackArray = stackTrace.split("\n");
  const importerStackIndex = stackArray.findIndex((stack2) => {
    return stack2.includes(` at Object.${name}`) || stack2.includes(`${name}@`);
  });
  const stack = parseSingleStack(stackArray[importerStackIndex + 1]);
  return stack?.file || "";
}

const filesCount = /* @__PURE__ */ new Map();
const cache = /* @__PURE__ */ new Map();
function runOnce(fn, key) {
  const filepath = getWorkerState().filepath || "__unknown_files__";
  if (!key) {
    filesCount.set(filepath, (filesCount.get(filepath) || 0) + 1);
    key = String(filesCount.get(filepath));
  }
  const id = `${filepath}:${key}`;
  if (!cache.has(id)) {
    cache.set(id, fn());
  }
  return cache.get(id);
}
function isFirstRun() {
  let firstRun = false;
  runOnce(() => {
    firstRun = true;
  }, "__vitest_first_run__");
  return firstRun;
}
function resetRunOnceCounter() {
  filesCount.clear();
}

const benchFns = /* @__PURE__ */ new WeakMap();
const benchOptsMap = /* @__PURE__ */ new WeakMap();
function getBenchOptions(key) {
  return benchOptsMap.get(key);
}
function getBenchFn(key) {
  return benchFns.get(key);
}
const bench = createBenchmark(function(name, fn = noop, options = {}) {
  if (getWorkerState().config.mode !== "benchmark") {
    throw new Error("`bench()` is only available in benchmark mode.");
  }
  const task = getCurrentSuite().task(formatName(name), {
    ...this,
    meta: {
      benchmark: true
    }
  });
  benchFns.set(task, fn);
  benchOptsMap.set(task, options);
});
function createBenchmark(fn) {
  const benchmark = createChainable(
    ["skip", "only", "todo"],
    fn
  );
  benchmark.skipIf = (condition) => condition ? benchmark.skip : benchmark;
  benchmark.runIf = (condition) => condition ? benchmark : benchmark.skip;
  return benchmark;
}
function formatName(name) {
  return typeof name === "string" ? name : name instanceof Function ? name.name || "<anonymous>" : String(name);
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getDefaultExportFromNamespaceIfPresent (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
}

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var dist = {};

var branding = {};

"use strict";
Object.defineProperty(branding, "__esModule", { value: true });

var messages = {};

"use strict";
Object.defineProperty(messages, "__esModule", { value: true });
/**
 * @internal
 */
const inverted = Symbol('inverted');
/**
 * @internal
 */
const expectNull = Symbol('expectNull');
/**
 * @internal
 */
const expectUndefined = Symbol('expectUndefined');
/**
 * @internal
 */
const expectNumber = Symbol('expectNumber');
/**
 * @internal
 */
const expectString = Symbol('expectString');
/**
 * @internal
 */
const expectBoolean = Symbol('expectBoolean');
/**
 * @internal
 */
const expectVoid = Symbol('expectVoid');
/**
 * @internal
 */
const expectFunction = Symbol('expectFunction');
/**
 * @internal
 */
const expectObject = Symbol('expectObject');
/**
 * @internal
 */
const expectArray = Symbol('expectArray');
/**
 * @internal
 */
const expectSymbol = Symbol('expectSymbol');
/**
 * @internal
 */
const expectAny = Symbol('expectAny');
/**
 * @internal
 */
const expectUnknown = Symbol('expectUnknown');
/**
 * @internal
 */
const expectNever = Symbol('expectNever');
/**
 * @internal
 */
const expectNullable = Symbol('expectNullable');
/**
 * @internal
 */
const expectBigInt = Symbol('expectBigInt');

var overloads = {};

"use strict";
Object.defineProperty(overloads, "__esModule", { value: true });

var utils = {};

"use strict";
Object.defineProperty(utils, "__esModule", { value: true });
/**
 * @internal
 */
const secret = Symbol('secret');
/**
 * @internal
 */
const mismatch = Symbol('mismatch');
/**
 * A type which should match anything passed as a value but *doesn't*
 * match {@linkcode Mismatch}. It helps TypeScript select the right overload
 * for {@linkcode PositiveExpectTypeOf.toEqualTypeOf | .toEqualTypeOf()} and
 * {@linkcode PositiveExpectTypeOf.toMatchTypeOf | .toMatchTypeOf()}.
 *
 * @internal
 */
const avalue = Symbol('avalue');

(function (exports) {
	"use strict";
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.expectTypeOf = void 0;
	__exportStar(branding, exports); // backcompat, consider removing in next major version
	__exportStar(messages, exports); // backcompat, consider removing in next major version
	__exportStar(overloads, exports);
	__exportStar(utils, exports); // backcompat, consider removing in next major version
	const fn = () => true;
	/**
	 * Similar to Jest's `expect`, but with type-awareness.
	 * Gives you access to a number of type-matchers that let you make assertions about the
	 * form of a reference or generic type parameter.
	 *
	 * @example
	 * ```ts
	 * import { foo, bar } from '../foo'
	 * import { expectTypeOf } from 'expect-type'
	 *
	 * test('foo types', () => {
	 *   // make sure `foo` has type { a: number }
	 *   expectTypeOf(foo).toMatchTypeOf({ a: 1 })
	 *   expectTypeOf(foo).toHaveProperty('a').toBeNumber()
	 *
	 *   // make sure `bar` is a function taking a string:
	 *   expectTypeOf(bar).parameter(0).toBeString()
	 *   expectTypeOf(bar).returns.not.toBeAny()
	 * })
	 * ```
	 *
	 * @description
	 * See the [full docs](https://npmjs.com/package/expect-type#documentation) for lots more examples.
	 */
	const expectTypeOf = (_actual) => {
	    const nonFunctionProperties = [
	        'parameters',
	        'returns',
	        'resolves',
	        'not',
	        'items',
	        'constructorParameters',
	        'thisParameter',
	        'instance',
	        'guards',
	        'asserts',
	        'branded',
	    ];
	    const obj = {
	        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
	        toBeAny: fn,
	        toBeUnknown: fn,
	        toBeNever: fn,
	        toBeFunction: fn,
	        toBeObject: fn,
	        toBeArray: fn,
	        toBeString: fn,
	        toBeNumber: fn,
	        toBeBoolean: fn,
	        toBeVoid: fn,
	        toBeSymbol: fn,
	        toBeNull: fn,
	        toBeUndefined: fn,
	        toBeNullable: fn,
	        toBeBigInt: fn,
	        toMatchTypeOf: fn,
	        toEqualTypeOf: fn,
	        toBeConstructibleWith: fn,
	        toBeCallableWith: exports.expectTypeOf,
	        extract: exports.expectTypeOf,
	        exclude: exports.expectTypeOf,
	        pick: exports.expectTypeOf,
	        omit: exports.expectTypeOf,
	        toHaveProperty: exports.expectTypeOf,
	        parameter: exports.expectTypeOf,
	    };
	    const getterProperties = nonFunctionProperties;
	    getterProperties.forEach((prop) => Object.defineProperty(obj, prop, { get: () => (0, exports.expectTypeOf)({}) }));
	    return obj;
	};
	exports.expectTypeOf = expectTypeOf; 
} (dist));

const index = /*@__PURE__*/getDefaultExportFromCjs(dist);

var define_process_env_default = {};
function getRunningMode() {
  return define_process_env_default.VITEST_MODE === "WATCH" ? "watch" : "run";
}
function isWatchMode() {
  return getRunningMode() === "watch";
}
const assertType = function assertType2() {
};
var VitestIndex = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  afterAll,
  afterEach,
  assert: assert$1,
  assertType,
  beforeAll,
  beforeEach,
  bench,
  chai: chai$1,
  createExpect,
  describe,
  expect: globalExpect,
  expectTypeOf: dist.expectTypeOf,
  getRunningMode,
  inject,
  isFirstRun,
  isWatchMode,
  it,
  onTestFailed,
  onTestFinished,
  runOnce,
  should,
  suite,
  test: test$1,
  vi,
  vitest
});

beforeEach(() => {
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a));
});
describe("JMX dom tests", () => {
  it("HTag 1", () => {
    var _h =
    
    {
      tag: "BODY",
      children: () => ["hase"]
    };
    let h = {
      tag: "BODY",
      children: () => ["hase"]
    };
    patch(document.body, h);
    globalExpect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 2", () => {
    let _h =
    
    {
      tag: "BODY",
      props: () => ({
        class: "cc"
      }),
      children: () => ["hase", 42, true, false]
    };
    let h = {
      tag: "BODY",
      props: () => ({
        class: "cc"
      }),
      children: () => ["hase", 42, true, false]
    };
    patch(document.body, h);
    globalExpect(document.body.className).toBe("cc");
    globalExpect(document.body.innerHTML).toBe("hase42truefalse");
  });
  it("HFunction", () => {
    let F = ({
      x
    }) => ({
      tag: "DIV",
      props: () => ({
        class: "classo" + x * 3
      }),
      children: () => [x * 2]
    });
    let a =
    
    {
      tag: "BODY",
      children: () => [
      
      {
        tag: F,
        props: () => ({
          x: 7
        }),
        children: () => []
      }]
    };
    let _F = ({
      x
    }) => ({
      tag: "DIV",
      props: () => ({
        class: "classo" + x * 3
      }),
      children: () => [x * 2]
    });
    let _a = {
      tag: "BODY",
      children: () => [{
        tag: F,
        props: () => ({
          x: 7
        }),
        children: () => []
      }]
    };
    patch(document.body, a);
    globalExpect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
});

export { commonjsGlobal as c, getDefaultExportFromCjs as g };
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}