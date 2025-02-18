/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import * as fs from "fs"

let lazify = (expression) => t.arrowFunctionExpression([], expression)

//let makekind = kind => t.objectProperty(t.identifier("kind"), t.stringLiteral(kind))

function transform(code: string, filename: string) {

    const ast = parse(code, { sourceType: "module", sourceFilename: filename })

    traverse(ast, {

        CallExpression: function (path) {
            if (path.node.callee.name == "jsx") {

                let args = path.node.arguments
                let a = args[0]

                if (t.isIdentifier(a) && a.name == "jsxf") {

                    // fragment
                    // let F = jsx(jsxf, null, "aa", "bb");
                    // args = (jsxf, null, "aa", "bb");

                    let cn = t.arrayExpression(args.slice(2))

                    path.replaceWith(t.objectExpression([
                        //makekind("<>"),
                        t.objectProperty(t.identifier("cn"), lazify(cn))
                    ]))
                }
                else {

                    // element
                    // let App3 = jsx("body", null, jsx(F, null), jsx("div", null));

                    let tagProperty
                    const tag = args[0]
                    if (t.isStringLiteral(tag)) tag.value = tag.value.toUpperCase()
                    if (t.isIdentifier(tag) && tag.name == "jsx") { } // fragment
                    else tagProperty = t.objectProperty(t.identifier("tag"), tag)

                    let propsProperty
                    let props = args[1]
                    let nopros = t.isNullLiteral(props)
                    if (props && !nopros) {
                        props = lazify(props)
                        propsProperty = t.objectProperty(t.identifier("p"), props)
                    }

                    let childrenProperty
                    let cna = args.slice(2)
                    if (cna.length) {
                        let cn = t.arrayExpression(cna)
                        childrenProperty = t.objectProperty(t.identifier("cn"), lazify(cn))
                    }

                    path.replaceWith(t.objectExpression([
                        //makekind(t.isStringLiteral(a) ? "element" : "component"),
                        tagProperty,
                        propsProperty,
                        childrenProperty].filter(x => !!x)))
                }
            }
        },
    })

    return generate(ast, { sourceMaps: true }, code)
}

export default (options?) => {
    console.log("create vite jmx plugin ************** 2")
    return {
        name: "vite-plugin-jmx",
        transform(raw, filename) {
            if (filename.endsWith(".tsx")) {
                console.log("transform", filename)
                options?.debug && fs.writeFileSync(filename + "orig.ts", "" + raw)
                let r = transform(raw, filename)
                options?.debug && fs.writeFileSync(filename + ".result.tsx", "" + r.code)
                options?.debug && fs.writeFileSync(filename + ".result.tsx.map", "" + JSON.stringify(r.map))
                return { code: r.code, map: r.map }
            }
            else return null
        }
    }
}