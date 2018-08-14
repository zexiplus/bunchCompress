const bunchCompress = require('./lib')
const { path, rawPath, options, ignoreReg } = require('./config')

if (process.argv[2] === '0') {
    bunchCompress.renameDir(path, rawPath)
    bunchCompress.openDirAndCompress(path, ignoreReg, options)
} else if (process.argv[2] === '1') {
    bunchCompress.renameDir(rawPath, path)
    bunchCompress.openDirAndCompress(path, ignoreReg, options)
}
