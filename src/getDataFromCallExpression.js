import {SyntaxKind} from "ts-morph";

/**
 * @typedef ParsedExpression
 * @property {string} apiKey The key to inject the API onto window with. The API will be accessible on window[apiKey].
 * @property {string} api Your API
 * @property {string[] | undefined} docs Content from JSDocs
 */


/**
 * Analyzes a method call expression and returns values such as:
 * - the global key
 * - its value
 * - documentation from JSDoc comments
 * @param {import('ts-morph').CallExpression} expression
 * @return {ParsedExpression}
 */
export function getDataFromCallExpression(expression) {
    const [key, value] = expression.getArguments()

    if (!key || !value) {
        throw new Error('Expect CallExpression with at least 2 arguments ')
    }

    if (!key.getType().isStringLiteral()) {
        throw new Error('Expect first argument with type StringLiteral')
    }

    if (!key.getType().getLiteralValue()) {
        throw new Error('First argument can not be empty string')
    }

    const comment = expression.getPreviousSiblingIfKind(SyntaxKind.JSDocComment)

    return {
        apiKey: key.getType().getLiteralValue(),
        api: value.getType().getText(),
        docs: comment ? [comment.getInnerText()] : undefined
    }
}