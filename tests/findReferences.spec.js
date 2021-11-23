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
    assert.is(references.get(expectedKey), expectedType)
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
    assert.is(references.get(expectedKey), expectedType)
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
    assert.is(references.get(expectedKey), expectedType)
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
    assert.is(references.get(expectedKey), expectedType)
})

test('exposeInMainWorld without arguments should be ignored', () => {
    const project = new Project()
    project.createSourceFile(
        './tmp.ts',
        'import {contextBridge as contextBridgeAlias} from "electron"'
        + `contextBridgeAlias.exposeInMainWorld()`
    )
    const references = findReferences(project)
    assert.is(references.size, 0)
})

test.run()