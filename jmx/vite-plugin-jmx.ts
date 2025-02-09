/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import * as fs from "fs"

let lazify = (expression) => t.arrowFunctionExpression([], expression)

function transform(code: string, filename: string) {

    fs.writeFileSync(filename + "orig.ts", code)

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
                        t.objectProperty(t.identifier("kind"), t.stringLiteral("fragment")),
                        t.objectProperty(t.identifier("children"), lazify(cn))
                    ]))
                }
                else {

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
                        propsProperty = t.objectProperty(t.identifier("props"), props)
                    }

                    let childrenProperty
                    let cna = args.slice(2)
                    if (cna.length) {
                        let cn = t.arrayExpression(cna)
                        childrenProperty = t.objectProperty(t.identifier("children"), lazify(cn))
                    }

                    path.replaceWith(t.objectExpression([tagProperty, propsProperty, childrenProperty].filter(x => !!x)))
                }
            }
        },
    })

    return generate(ast, { sourceMaps: true }, code)
}

export const jmxplugin = () => {
    return {
        name: "vite-plugin-jmx",
        transform(raw, filename) {
            if(filename.endsWith(".tsx")){
                let r = transform(raw, filename)
                fs.writeFileSync(filename + ".result.tsx", "" + r.code)
                return r
            }
            else return raw
        }
    }
}