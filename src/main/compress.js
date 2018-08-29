const cp = require('child_process')
const fs = require('fs')
const path = require('path')

const bunchCompress = {
    bindContents(win) {
        this.win = win
    },
    trigger(num) {
        this.win.webContents.send('percent', num)
    },
    sendLog(message) {
        this.win.webContents.send('log', message)
    },
    openDirAndCompress(dir, ignoreReg, option) {
        let that = this
        let files = fs.readdirSync(dir)
        let num = 0,
            // files number
            total = files.length,
            // need compress files number
            cTotal = files.filter(item => {
                return (/\.js$/.test(item) && !ignoreReg.test(item))
            }).length,
            ignoreFiles = []
    
        files.forEach(item => {
            if (/\.js$/.test(item) && !ignoreReg.test(item)) {
                cp.exec(`${path.join(__dirname, '/../../node_modules/.bin/uglifyjs')}` + ` --overwrite ${option} ${dir}/${item}`, (err, stdout, stderr) => {
                    if (err) {
                        throw err
                    }
                    num++;
                    that.sendLog(`${item} <span class="compress-suc">已压缩</span><br/>`)
                    that.trigger(Number(num / cTotal) * 100)
                })
            } else {
                that.sendLog(`${item} <span class="compress-ign">已忽略</span><br/>`)
                ignoreFiles.push(item)
            }
        })
    },
    renameFile(dir, ignoreReg, appendStr) {
        let files = fs.readdirSync(dir)
        files.forEach(item => {
            if (/\.js$/.test(item) && !ignoreReg.test(item)) {
                let index = item.indexOf('.js')
                fs.writeFileSync(`${dir}/${item.slice(0, index) + appendStr}`, fs.readFileSync(`${dir}/${item}`))
            }
        })

    },
    renameDir(dir, rawPath) {
        fs.existsSync(rawPath) || fs.mkdirSync(rawPath)
        copyFileToAnotherDir(dir, rawPath)
    }
}


function copyFileToOriginDir(path, appendStr) {
    let files = fs.readdirSync(path)
    if (files.length > 0) {
        files.forEach(item => {
            let index = item.indexOf('.js')
            fs.writeFileSync(`${path}/${item.slice(0, index) + appendStr}`, fs.readFileSync(`${path}/${item}`))
        })
    }
}

function copyFileToAnotherDir(path, rawPath) {
    let files = fs.readdirSync(path)
    if (files.length > 0) {
        files.forEach(item => {
            fs.writeFileSync(`${rawPath}/${item}`, fs.readFileSync(`${path}/${item}`))
        })
    }
}

module.exports = bunchCompress