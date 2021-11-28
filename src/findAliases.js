import {SyntaxKind} from "ts-morph";


/**
 * Find relevant method names from ESM imports
 * @param file
 * @return {string[]}
 *
 * @example
 * import electron from 'electron';
 * import electronAlias from 'electron';
 * import {contextBridge} from 'electron';
 * import {contextBridge as contextBridge} from 'electron';
 */
function findAliasesFromESImports(file) {
    return file
        .getDescendantsOfKind(SyntaxKind.ImportDeclaration)
        .filter(d => d.getLastChildByKind(SyntaxKind.StringLiteral).compilerNode.text === 'electron')
        .reduce(
            (aliases, declaration) => {
                /**
                 * Skip type-only imports
                 * @example
                 * import type {contextBridge} from 'electron'
                 */
                if (declaration.getImportClause().isTypeOnly()) {
                    return aliases
                }

                const defaultImport = declaration.getImportClause().getDefaultImport()
                if (defaultImport) {
                    const electronAlias = defaultImport.getText()
                    aliases.push(`${electronAlias}.contextBridge.exposeInMainWorld`)
                }

                const namedImports = declaration.getImportClause().getNamedImports()
                namedImports.forEach(specifier => {

                    /**
                     * Skip type-only imports
                     * @example
                     * import {type contextBridge} from 'electron'
                     */
                    if (specifier.isTypeOnly()) {
                        return
                    }

                    const {name, alias} = specifier.getStructure()
                    if (name === 'contextBridge') {
                        aliases.push(`${alias || name}.exposeInMainWorld`)
                    }
                })

                return aliases
            },
            /** @type {string[]} */[]
        )
}

/**
 * Find relevant method names from CJS require()
 * @param file
 * @return {string[]}
 *
 * @example
 * const electron = require('electron');
 * const electronAlias = require('electron');
 * const {contextBridge} = require('electron');
 * const {contextBridge: contextBridgeAlias} = require('electron');
 * const {contextBridge: {exposeInMainWorld}} = require('electron');
 * const {contextBridge: {exposeInMainWorld: exposeInMainWorldAlias}} = require('electron');
 */
function findAliasesFromCJSRequires(file) {
    return file
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter(e => {
            const identifier = e.getFirstChildByKind(SyntaxKind.Identifier)
            if (!identifier || identifier.getText() !== 'require') return false
            const [moduleName] = e.getArguments()
            if (!moduleName) return false
            const moduleType = moduleName.getType()
            return moduleType.isStringLiteral() && moduleType.getLiteralValue() === 'electron'
        })
        .reduce(
            (aliases, expression) => {
                const variableDeclarationList = expression.getFirstAncestorByKind(SyntaxKind.VariableDeclarationList)
                const declarations = variableDeclarationList.getDeclarations()

                declarations.forEach(declaration => {
                    switch (declaration.compilerNode.name.kind) {

                        /**
                         * @example
                         * const electron = require('electron');
                         * const electronAlias = require('electron');
                         */
                        case SyntaxKind.Identifier :
                            aliases.push(`${declaration.compilerNode.name.getText()}.contextBridge.exposeInMainWorld`)
                            break;

                        /**
                         * @example
                         * const {contextBridge} = require('electron');
                         * const {contextBridge: contextBridgeAlias} = require('electron');
                         * const {contextBridge: {exposeInMainWorld}} = require('electron');
                         * const {contextBridge: {exposeInMainWorld: exposeInMainWorldAlias}} = require('electron');
                         */
                        case SyntaxKind.ObjectBindingPattern :
                            declaration.compilerNode.name.elements
                                .forEach(/** @type {import('ts-morph').BindingElement} */e => {
                                    const prop = e.propertyName || e.name
                                    if (prop.escapedText !== 'contextBridge') return
                                    if (typeof e.name.escapedText === 'string') {
                                        aliases.push(`${e.name.escapedText}.exposeInMainWorld`)
                                    } else if (e.name.kind === SyntaxKind.ObjectBindingPattern) {
                                        const subBindings = e.name.elements
                                        subBindings.forEach(e => {
                                            const prop = e.propertyName || e.name
                                            if (prop.escapedText !== 'exposeInMainWorld') return
                                            if (typeof e.name.escapedText === 'string') {
                                                aliases.push(`${e.name.escapedText}`)
                                            }
                                        })
                                    }
                                })
                            break;
                    }
                })

                return aliases
            },
            /** @type {string[]} */[]
        )


}


/**
 * Returns an array of aliases for an electron.contextBridge.exposeInMainWorld:
 * - Looks for alternative names in imports
 *
 * @param {import("ts-morph").SourceFile} file
 * @returns {string[]}
 */
export function findAliases(file) {
    return findAliasesFromESImports(file)
        .concat(findAliasesFromCJSRequires(file))
}