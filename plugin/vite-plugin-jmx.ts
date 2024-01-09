/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"


function lazifyIfNonLiteral(expression) {
    //console.log("lazifyIfNonLiteral", expression);
    if(!expression) console.log("see here:", expression);

    if (t.isCallExpression(expression)) {
        //console.log("expression.callee.name", (expression.callee as any).name)
        if ((expression.callee as any).name == "jsx") {
            return expression
        }
    }
    if (t.isLiteral(expression)) return expression

    return lazify(expression)
}

function lazify(expression) {
    return t.arrowFunctionExpression([], expression)
}

function transform(code: string) {
    const ast = parse(code, { sourceType: "module" })

    traverse(ast, {
        CallExpression: function (path) {
            if (path.node.callee.name == "jsx") {
                // path.node.callee.name = "aaaa"
                let args = path.node.arguments

                const tag = args[0]
                if (t.isStringLiteral(tag)) tag.value = tag.value.toUpperCase() // convert tagname to uppercase
                let tagProperty = t.objectProperty(t.identifier("tag"), tag)

                let props = args[1]
                if (props && !t.isNullLiteral(props)) {
                    props = lazify(props)
                    // for (let p of props.properties) {
                    //     if (!t.isLiteral(p.value)) {
                    //         p.value = lazifyIfNonLiteral(p.value)
                    //     }
                    // }
                }
                let propsProperty = t.objectProperty(t.identifier("props"), props)

                let cn = t.arrayExpression(args.slice(2))
                let childrenProperty = t.objectProperty(t.identifier("children"), lazify(cn))

                path.replaceWith(t.objectExpression([tagProperty, propsProperty, childrenProperty]))
            }
        },
    })

    const output = generate(ast, code)
    return output.code
}

export const jmxplugin = (options = {}) => {
    return {
        name: "vite-plugin-jmx",
        transform(raw, id) {
            if (id.endsWith(".tsx")) {
                return "// jmx transformed:\n" + transform(raw)
            } else raw
        },
    }
}
