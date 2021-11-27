import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {Project} from "ts-morph";
import {findAliases} from "../src/findAliases.js";

const project = new Project()


test('Default import', () => {
    const code = `import electron from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases[0], 'electron.contextBridge.exposeInMainWorld')
})


test('Default import with alias', () => {
    const code = `import electronAlias from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases[0], 'electronAlias.contextBridge.exposeInMainWorld')
})


test('Named import', () => {
    const code = `import {contextBridge} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases[0], 'contextBridge.exposeInMainWorld')
})


test('Named import with alias', () => {
    const code = `import {contextBridge as contextBridgeAlias} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases[0], 'contextBridgeAlias.exposeInMainWorld')
})


test('Default import with Named import ', () => {
    const code = `import electron, {contextBridge} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.ok(aliases.includes('contextBridge.exposeInMainWorld'))
    assert.ok(aliases.includes('electron.contextBridge.exposeInMainWorld'))
})


test('Default import alias with Named import alias', () => {
    const code = `import electronAlias, {contextBridge as contextBridgeAlias} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.ok(aliases.includes('contextBridgeAlias.exposeInMainWorld'))
    assert.ok(aliases.includes('electronAlias.contextBridge.exposeInMainWorld'))
})


test('Type-only default imports should be ignored', () => {
    const code = `import type Electron from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases.length, 0)
})


test('Type-only named imports should be ignored', () => {
    const code = `import type {contextBridge} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases.length, 0)
})


test('Type-only named imports should be ignored', () => {
    const code = `import {type contextBridge} from 'electron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases.length, 0)
})

test('Should return empty array if no relevant imports', () => {
    const code =
        `import {someThingElse} from 'electron';`
        + `import notElectron from 'notElectron'`;
    const file = project.createSourceFile('tmp.ts', code, {overwrite: true})
    const aliases = findAliases(file)
    assert.is(aliases.length, 0)
})


test.run()