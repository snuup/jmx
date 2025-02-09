/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"

// function lazifyIfNonLiteral(expression) {
//     if (!expression) console.log("see here:", expression)

//     if (t.isCallExpression(expression)) {
//         if ((expression.callee as any).name == "jsx") {
//             return expression
//         }
//     }
//     if (t.isLiteral(expression)) return expression

//     return lazify(expression)
// }

function lazify(expression) {
    return t.arrowFunctionExpression([], expression)
}

function transform(code: string, filename: string) {
    const ast = parse(code, { sourceType: "module", sourceFilename: filename })

    traverse(ast, {
        CallExpression: function (path) {
            if (path.node.callee.name == "jsx") {
                let args = path.node.arguments

                const tag = args[0]
                if (t.isStringLiteral(tag)) tag.value = tag.value.toUpperCase()

                let tagProperty
                if (t.isIdentifier(tag) && tag.name == "jsx") {} // fragment
                else tagProperty = t.objectProperty(t.identifier("tag"), tag)

                let props = args[1]
                let nopros = t.isNullLiteral(props)
                let propsProperty
                if (props && !nopros) {
                    props = lazify(props)
                    propsProperty = t.objectProperty(t.identifier("props"), props)
                }

                let cn = t.arrayExpression(args.slice(2))
                let childrenProperty = t.objectProperty(t.identifier("children"), lazify(cn))

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