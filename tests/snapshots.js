import fs from "node:fs";
import path from "node:path";
import {generate} from "../src/generate.js";
import {test} from "uvu";
import * as assert from "uvu/assert";

const SNAPSHOTS_DIR_PATH = path.resolve('./examples')

const filesToTest = fs
    .readdirSync(SNAPSHOTS_DIR_PATH)
    .filter(
        file =>
            fs.lstatSync(path.resolve(SNAPSHOTS_DIR_PATH, file)).isFile()
            && file.endsWith('.ts') && !file.endsWith('.d.ts')
    )
    .map(file => path.resolve(SNAPSHOTS_DIR_PATH, file))


filesToTest.forEach(file => {
    test(file, () => {
        const basename = path.basename(file, '.ts')
        const outputPath = file.replace(basename, `test.${basename}.d`)
        const snapshotPath = file.replace(basename, `${basename}.d`)

        generate({
            input: file,
            output: outputPath
        })

        const snapshot = fs.readFileSync(snapshotPath, 'utf8')
        const output = fs.readFileSync(outputPath, 'utf8')

        assert.snapshot(output, snapshot)

        // Cleanup if not CI
        if (!process.env.CI) {
            fs.unlinkSync(outputPath)
        }
    })
})

test.run()