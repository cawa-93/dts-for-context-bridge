#!/usr/bin/env node

import {Project} from "ts-morph";
import {findReferences} from "../lib/findReferences.js";
import coa from 'coa'
import {writeFileSync} from 'node:fs'

/**
 *
 * @param {{input: string, output: string}} opts
 */
function cli({input, output}) {
    const project = new Project();
    project.addSourceFilesAtPaths(input);

    const dtsFile = project.createSourceFile('./tmp.d.ts')
    const interfaceDeclaration = dtsFile.addInterface({
        name: 'Window',
    })

    findReferences(project)
        .forEach((value, key) => {
            interfaceDeclaration.addProperty({
                name: key,
                type: value
            })
        })

    const interfaceStr = dtsFile.getText()
    writeFileSync(output, interfaceStr, 'utf8')
}

coa.Cmd()
    .name(process.argv[1])
    .helpful()
    .end()
    .opt()
    .name('input')
    .title('Input glob pattern')
    .short('i')
    .long('input')
    .req()
    .end()
    .opt()
    .name('output')
    .title('Output path')
    .long('output')
    .short('o')
    .req()
    .end()
    .act((opts) => cli(opts))
    .run(process.argv.slice(2))

