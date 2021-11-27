#!/usr/bin/env node

import coa from 'coa'
import {generate} from "../src/generate.js";

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
    .act((opts) => generate(opts))
    .run(process.argv.slice(2))

