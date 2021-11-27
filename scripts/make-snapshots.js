import fs from 'node:fs'
import path from 'node:path'
import {generate} from "../lib/generate.js";

const SNAPSHOTS_DIR_PATH = path.resolve('./examples')

const filesToProcess =
    typeof process.argv[2] === 'string'
        ? [path.resolve(process.argv[2])]
        : fs
            .readdirSync(SNAPSHOTS_DIR_PATH)
            .filter(
                file =>
                    fs.lstatSync(path.resolve(SNAPSHOTS_DIR_PATH, file)).isFile()
                    && file.endsWith('.ts') && !file.endsWith('.d.ts')
            )
            .map(file => path.resolve(SNAPSHOTS_DIR_PATH, file))


filesToProcess.forEach(file => {
    const basename = path.basename(file, '.ts')
    generate({
        input: file,
        output: file.replace(basename, `${basename}.d`)
    })
})

