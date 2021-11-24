import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {findReferences} from "../lib/findReferences.js";
import {Project} from "ts-morph";

test('default import', () => {

    const expectedKey = '"EXPECTED_KEY"'
    const expectedType = '"EXPECTED_TYPE"'

    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import electron from "electron"'
        + `electron.contextBridge.exposeInMainWorld(${expectedKey}, ${expectedType})`
    )
    const references = findReferences(project)
    assert.is(references.get(expectedKey).value, expectedType)
})


test('default import with alias', () => {

    const expectedKey = '"EXPECTED_KEY"'
    const expectedType = '"EXPECTED_TYPE"'

    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import electronAlias from "electron"'
        + `electronAlias.contextBridge.exposeInMainWorld(${expectedKey}, ${expectedType})`
    )
    const references = findReferences(project)
    assert.is(references.get(expectedKey).value, expectedType)
})


test('named import', () => {

    const expectedKey = '"EXPECTED_KEY"'
    const expectedType = '"EXPECTED_TYPE"'

    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import {contextBridge} from "electron"'
        + `contextBridge.exposeInMainWorld(${expectedKey}, ${expectedType})`
    )
    const references = findReferences(project)
    assert.is(references.get(expectedKey).value, expectedType)
})


test('named import with alias', () => {

    const expectedKey = '"EXPECTED_KEY"'
    const expectedType = '"EXPECTED_TYPE"'

    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import {contextBridge as contextBridgeAlias} from "electron"'
        + `contextBridgeAlias.exposeInMainWorld(${expectedKey}, ${expectedType})`
    )
    const references = findReferences(project)
    assert.is(references.get(expectedKey).value, expectedType)
})


test('exposeInMainWorld without arguments should be ignored', () => {

    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import {contextBridge} from "electron"'
        + `contextBridge.exposeInMainWorld()`
    )
    const references = findReferences(project)
    assert.is(references.size, 0)
})


test('Empty JSDoc Comment should not exist', () => {

    const project = new Project()

    const key = '"KEY"'
    const code = `
import {contextBridge} from "electron"
contextBridge.exposeInMainWorld(${key}, 1)`

    project.createSourceFile('./tmp.ts', code)

    const references = findReferences(project)
    assert.is(references.get(key).docs, undefined)
})


test('JSDoc Comment should copy', () => {

    const project = new Project()

    const comment = 'This comment should be copy'
    const key = '"KEY"'
    const code = `
import {contextBridge} from "electron"
/**\n * ${comment}\n */
contextBridge.exposeInMainWorld(${key}, 1)`

    project.createSourceFile('./tmp.ts', code)

    const references = findReferences(project)
    assert.is(references.get(key).docs[0], comment)
})

test.run()