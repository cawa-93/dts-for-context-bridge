import {SyntaxKind} from "ts-morph";


/**
 * Returns an array of aliases for an electron.contextBridge.exposeInMainWorld:
 * - Looks for alternative names in imports
 *
 * @param {import("ts-morph").SourceFile} file
 * @returns {string[]}
 */
export function findAliases(file) {
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