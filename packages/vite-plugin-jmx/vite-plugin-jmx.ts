/* eslint-disable prefer-const */
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import * as fs from "fs"

let isconstant = (expression: t.Expression | t.SpreadElement): boolean => {
    if (t.isStringLiteral(expression) || t.isNumericLiteral(expression) || t.isBooleanLiteral(expression) || t.isNullLiteral(expression)) {
        return true;
    }
    if (t.isObjectExpression(expression)) {
        return expression.properties.every(prop => {
            if (t.isObjectProperty(prop)) {
                return t.isAssignmentPattern(prop.value) ? false : t.isExpression(prop.value) || t.isSpreadElement(prop.value) ? isconstant(prop.value) : false;
            }
            if (t.isSpreadElement(prop)) {
                return isconstant(prop.argument);
            }
            return false;
        });
    }
    if (t.isArrayExpression(expression)) {
        return expression.elements.every(elem => isconstant(elem as t.Expression));
    }
    return false;
}

let lazify = (expression) => t.arrowFunctionExpression([], expression)
let lazifyifnotconstant = (e) => isconstant(e) ? e : lazify(e)
//let markit = (expression) => t.arrowFunctionExpression([t.identifier("hase")], expression) // debug utility

function transform(code: string, filename: string) {

    const ast = parse(code, { sourceType: "module", sourceFilename: filename })

    traverse(ast, {

        CallExpression: function (path) {

            if (path.node.callee.name != "jsx") return

            let args = path.node.arguments

            if (t.isIdentifier(args[0]) && args[0].name == "jsxf") {

                console.log("fragmento");

                // fragment
                // let F = jsx(jsxf, null, "aa", "bb");
                //     args = (jsxf, null, "aa", "bb");

                let cn = t.arrayExpression(args.slice(2))

                path.replaceWith(t.objectExpression([t.objectProperty(t.identifier("cn"), lazifyifnotconstant(cn))]))
            }
            else {

                // element
                // let App3 = jsx("body", null, jsx(F, null), jsx("div", null));

                const tag = args[0]
                if (t.isStringLiteral(tag)) tag.value = tag.value.toUpperCase() // unless it is a component, tags are uppercase
                let tagProperty = t.objectProperty(t.identifier("tag"), tag)

                let propsProperty
                let props = args[1]
                let nopros = t.isNullLiteral(props)
                if (props && !nopros) {

                    //if (isconstant(props)) props = markit(props)

                    props = lazifyifnotconstant(props)
                    propsProperty = t.objectProperty(t.identifier("p"), props)
                }

                let childrenProperty
                let cna = args.slice(2)
                if (cna.length) {
                    let cn = t.arrayExpression(cna)

                    // if (isconstant(cn)) console.log("constant children", cn);

                    childrenProperty = t.objectProperty(t.identifier("cn"), lazifyifnotconstant(cn))
                }

                path.replaceWith(t.objectExpression([
                    tagProperty,
                    propsProperty,
                    childrenProperty].filter(x => !!x)))
            }
        },
    })

    return generate(ast, { sourceMaps: true }, code)
}

export default (options?) => {

    console.log("create vite jmx plugin", JSON.stringify(options))

    return {
        name: "vite-plugin-jmx",
        transform(raw, filename) {

            if (filename.endsWith(".tsx")) {
                let r = transform(raw, filename)

                if (options?.debug) {
                    fs.writeFileSync(filename + ".orig.ts", "" + raw)
                    fs.writeFileSync(filename + ".result.tsx", "" + r.code)
                }

                return r
            }
            else return null // important to return null and not the raw input !
        }
    }
}