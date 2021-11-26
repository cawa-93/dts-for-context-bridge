import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {Project, SyntaxKind} from "ts-morph";
import {getDataFromCallExpression} from "../lib/getDataFromCallExpression.js";

const project = new Project()

const parseCallExpressionFromCode = (code) => {
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const exp = file.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression)
    return getDataFromCallExpression(exp)
}

test('Should find apiKey', () => {
    const {apiKey} = parseCallExpressionFromCode(`expose('apiKEY', '')`)
    assert.is(apiKey, 'apiKEY')
})


test('Should parse api type', () => {
    /** Alias for shorten code */
    const is = (code, expect) => assert.is(parseCallExpressionFromCode(code).api, expect)

    is(`expose('k', '')`, `""`)
    is(`expose('k', 'stringLiteral')`, `"stringLiteral"`)
    is(`expose('k', 123)`, `123`)
    is(`expose('k', {})`, `{}`)
    is(`expose('k', {foo: 'bar'})`, `{ foo: string; }`)
    is(`const api = {foo: 'bar'}; expose('k', api)`, `{ foo: string; }`)
    is(`const api = {foo: 'bar'} as const; expose('k', api)`, `{ readonly foo: "bar"; }`)
    is(`const v = {foo: 'bar'}; const api = [v]; expose('k', api)`, `{ foo: string; }[]`)
})


// test('Should parse api type from external module', () => {
//     project.createSourceFile('./external.ts', `export const api = {foo: 'bar'}`)
//     assert.is(parseCallExpressionFromCode(`import {api} from './external.ts'; expose('k', api)`).api, `{ foo: string; }`)
// })


test('Should parse single JSDoc before call expression', () => {
    const commentRows = [
        'Description',
        'Second line of description',
        '@see https://example.com',
        '@example',
        'Example code',
    ]

    const comment = commentRows.map((r) => ` * ${r}`).join('\n')

    const code = `/**\n${comment}\n */\n`
    + `expose('key', 'api')`
    assert.is(parseCallExpressionFromCode(code).docs[0], commentRows.join('\n'))
})

test.run()
