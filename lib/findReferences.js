import {SyntaxKind} from "ts-morph";
import {findCallExpressions} from "./findCallExpressions.js";

/**
 *
 * @param {import('ts-morph').Project} project
 * @returns {Map<string, {value: string, docs?: string[]}>}
 */
export function findReferences(project) {
    const references = new Map()

    project.getSourceFiles().forEach(file => {
        const aliases = []
        const importsFromElectron = file.getDescendantsOfKind(SyntaxKind.ImportDeclaration)
            .filter(d => d.getLastChildByKind(SyntaxKind.StringLiteral).compilerNode.text === 'electron')

        if (importsFromElectron.length === 0) {
            return
        }


        for (const importDeclaration of importsFromElectron) {
            if (importDeclaration.getImportClause().isTypeOnly()) continue;

            const defaultImport = importDeclaration.getImportClause().getDefaultImport()

            if (defaultImport !== undefined) {
                const electronAlias = defaultImport.getText()
                aliases.push(`${electronAlias}.contextBridge.exposeInMainWorld`)
            }

            const namedImports = importDeclaration.getImportClause().getNamedImports()
            if (namedImports.length) {
                for (const namedImport of namedImports) {
                    const namedImportStructure = namedImport.getStructure()
                    if (namedImportStructure.name === 'contextBridge') {
                        aliases.push(`${namedImportStructure.alias || namedImportStructure.name}.exposeInMainWorld`)
                    }
                }
            }
        }

        findCallExpressions(file, aliases)
            .forEach(((value, key) => references.set(key, value)))
    })

    return references
}


