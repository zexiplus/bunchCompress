const cp = require('child_process')
const fs = require('fs')


const bunchCompress = {
    openDirAndCompress(path, ignoreReg, options) {
        fs.readdir(path, (err, files) => {
            let num = 0;
            let total = files.length;
            let ignoreFiles = [];
            if (err) throw err
            files.forEach(item => {
                if (!ignoreReg.test(item)) {
                    cp.exec(`${__dirname}/../node_modules/.bin/uglifyjs --overwrite ${options} ${path}/${item}`, (err, stdout, stderr) => {
                        if (err) {
                            throw err
                        }
                        num ++;
                        console.log(`已压缩混淆${num}/${total},${item} 已压缩混淆`)
                    })
                } else {
                    ignoreFiles.push(item)
                }
            })
            console.log(`忽略文件 ${ignoreFiles.join(',')}`)
        })
    },
    renameDir(path, rawPath) {
        try {
            fs.mkdirSync(rawPath)
        } catch (e) {
            
        }
        copyFile(path, rawPath)
    }
}



function copyFile(path, rawPath) {
    let files = fs.readdirSync(path);
    if (files.length > 0) {
        files.forEach(item => {
            fs.writeFileSync(`${rawPath}/${item}`, fs.readFileSync(`${path}/${item}`))
        })
    }
}

module.exports = bunchCompress