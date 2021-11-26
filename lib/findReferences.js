import {findCallExpressions} from "./findCallExpressions.js";
import {findAliases} from "../findAliases.js";

/**
 *
 * @param {import('ts-morph').Project} project
 * @returns {Map<string, {value: string, docs?: string[]}>}
 */
export function findReferences(project) {
    const references = new Map()

    project.getSourceFiles().forEach(file => {
        const aliases = findAliases(file)

        findCallExpressions(file, aliases)
            .forEach(((value, key) => references.set(key, value)))
    })

    return references
}


