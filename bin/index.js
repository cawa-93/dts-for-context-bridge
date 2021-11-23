#!/usr/bin/env node

import coa from 'coa'
import {index} from "../lib/index.js";

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
    .act((opts) => index(opts))
    .run(process.argv.slice(2))

