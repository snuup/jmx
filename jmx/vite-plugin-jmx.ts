/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"

let lazify = (expression) => t.arrowFunctionExpression([], expression)

function transform(code: string, filename: string) {
    const ast = parse(code, { sourceType: "module", sourceFilename: filename })

    traverse(ast, {

        CallExpression: function (path) {
            if (path.node.callee.name == "jsx") {
                let args = path.node.arguments

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
        },
    })

    return generate(ast, { sourceMaps: true }, code)
}

export const jmxplugin = () => {
    return {
        name: "vite-plugin-jmx",
        transform(raw, filename) {
            return (filename.endsWith(".tsx")) ? transform(raw, filename) : raw
        }
    }
}