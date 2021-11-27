import {Project} from "ts-morph";
import {findReferences} from "./findReferences.js";
import {writeFileSync} from "node:fs";

/**
 *
 * @param {{input: string, output: string}} opts
 */
export function generate({input, output}) {
    const project = new Project();
    project.addSourceFilesAtPaths(input);

    const dtsFile = project.createSourceFile('./tmp.d.ts')
    const interfaceDeclaration = dtsFile.addInterface({
        name: 'Window',
    })

    findReferences(project)
        .forEach(({value, docs}, key) => {
            interfaceDeclaration.addProperty({
                name: key,
                type: value,
                isReadonly: true,
                docs,
            })
        })

    const interfaceStr = dtsFile.getText()
    writeFileSync(output, interfaceStr, 'utf8')
}