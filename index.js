#!/usr/bin/env node

import {Project} from "ts-morph";
import {findReferences} from "./findReferences.js";

const project = new Project();
project.addSourceFilesAtPaths("preload/**/*.ts");

const dtsFile = project.createSourceFile('./dts/exposed.ts')
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

console.log(dtsFile.getText())