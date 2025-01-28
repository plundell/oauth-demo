const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const root_dir = path.dirname(require.main.filename);
const tmp_file = `zod.tmp.ts`; //will be created in root_dir

function help() {
    print(`
    Generate zod schemas from a .ts or .tsx file. Output is added 
    to the clipboard as well as printed to stdout.

    Usage: node create-zod-schema.js [FLAGS] filepath

    FLAGS:
        --help      Show this help
        --debug     Enable debug logging
        --silent    Don't print anything regardless
    `);
}


function debug(...args) {
    if (process.env.DEBUG && !process.env.SILENT)
        console.debug(...args);
}
function error(...args) {
    if (!process.env.SILENT)
        console.error(`\x1b[31m%s\x1b[0m`, ...args);
}
function print(...args) {
    if (!process.env.SILENT)
        console.log(...args);
}

function isValidFile(filepath) {
    if (!(filepath.endsWith('.ts') || filepath.endsWith('.tsx'))) {
        error(`Expected a .ts or .tsx file, got: ${filepath}`);
        return null;
    }
    if (!path.isAbsolute(filepath)) {
        filepath = path.join(process.env.INIT_CWD, filepath);
    }
    if (!fs.existsSync(filepath) || !fs.statSync(filepath).isFile()) {
        error(`The specified path is not an existing file: ${filepath}`);
        return null;
    }
    return filepath;
}



function tsToZod(filepath) {
    const input = '.' + filepath.replace(root_dir, '') //ts-to-zod wants paths relative to package root
    const tsToZod = spawn('npx', ['ts-to-zod', input, tmp_file]);

    //Buffer the output

    let combinedBuffer = []
    const debugOrStore = (data) => { (process.env.DEBUG && debug(data)) || combinedBuffer.push(data) };
    tsToZod.stdout.on('data', debugOrStore);
    tsToZod.stderr.on('data', debugOrStore);

    return new Promise((resolve, reject) => {
        tsToZod.on('error', (err) => {
            reject(err);
        });
        tsToZod.on('close', (code) => {
            try {
                if (code !== 0) {
                    reject(`ts-to-zod process exited with code ${code}`);
                } else {
                    //The temp file has been created, read it's contents...
                    let _tmp_file = path.join(root_dir, tmp_file);
                    fs.readFile(_tmp_file, { encoding: 'utf-8' }, (err, data) => {
                        //...and delete it
                        if (err) {
                            reject(new Error(`Failed to read ${_tmp_file}`, { cause: err }));
                        } else {
                            try {
                                fs.unlinkSync(_tmp_file);
                            } catch (e) {
                                error(`Failed to delete ${_tmp_file}`, e);
                            }
                            resolve(data);
                        }
                    });
                }
            } catch (e) {

                reject(e);
            }
        });
    }).catch(e => {
        //Any error above and we print whatever's in the combined buffer (unless
        //we've already been doing so in debug mode)
        process.env.DEBUG || error(...combinedBuffer);
        reject(e);
    });
}





// Parse command line arguments
process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('-')) {
        switch (arg.slice(2)) {
            case 'debug':
                process.env.DEBUG = true;
                break;
            case 'silent':
                process.env.SILENT = true;
                break;
            case 'help':
                help();
                process.exit(0);
            default:
                error(`Unknown flag: ${arg}`);
                process.exit(1);
        }
    }
});



(async () => {
    try {
        //The last arg should be the filepath of the file to process
        const filepath = isValidFile(process.argv.slice(-1)[0]);

        //Generate zod schemas for every type and interface in the file
        const schemas = await tsToZod(filepath);

        //Add to clipboard
        execSync(`echo -n "${schemas}"  | xclip -selection clipboard`, { stdio: 'inherit' });

        //If we're not in silent mode...
        if (!process.env.SILENT)
            print(schemas);

    } catch (e) {
        error(e);
        error("FATAL ERROR");
        process.exit(1);
    }
})()




