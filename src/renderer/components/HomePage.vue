<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div id="logo">
      <span>Bunch-</span><span>Compress</span>
    </div>
    <el-row :gutter="20" class="main-container">
      <el-form label-width="100px">
        <el-col :span="12">
          <h3 class="form-label">文件 选项</h3>
          <el-form-item label="选择文件夹">
            <el-row :gutter="18">
              <el-col :span="18">
                <el-input 
                  placeholder="请选择包含js文件且需要压缩混淆的目录" 
                  v-model="selectFolder"></el-input>
              </el-col>
              <el-col :span="4">
                <el-button @click="openDialog" circle icon="el-icon-document"></el-button>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="文件重命名">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-input placeholder="请输入备份文件增加的后缀名" 
                  :disabled="!renameFlag" 
                  v-model="renameValue"></el-input>
              </el-col>
              <el-col :span="4">
                <el-switch v-model="renameFlag"></el-switch>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="备份源文件">
            <el-row :gutter="20">
              <el-col :span="18">
                <el-input placeholder="请输入备份文件增加的后缀名" 
                :disabled="!backup" 
                v-model="postValue"></el-input>
              </el-col>
              <el-col :span="4">
                <el-switch v-model="backup"></el-switch>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item v-for="(item, index) in ignoreNum" 
            :label="'忽略文件(' + (index + 1) + ')'"
            :key="'igkey' + index">
            <el-row :gutter="20">
              <el-col :span="15">
                <el-input v-model="ignoreNum[index]"></el-input>
              </el-col>
              <el-col :span="8">
                <el-row>
                  <el-button 
                    icon="el-icon-plus"
                    circle
                    @click="addIgnoreRules">
                  </el-button>
                  <el-button 
                    icon="el-icon-minus"
                    circle
                    @click="subIgnoreRules(index)">
                  </el-button>
                </el-row>
              </el-col>
            </el-row>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <h3 class="form-label">混淆 选项</h3>
          <el-form-item label="忽略作者信息">
            <el-switch v-model="ignoreAuthor"></el-switch>
          </el-form-item>
          <el-form-item label="混淆局部变量">
            <el-switch v-model="compressVar"></el-switch>
          </el-form-item>
          <el-form-item label="混淆全局变量">
            <el-switch v-model="compressAllVar"></el-switch>
          </el-form-item>
          <!-- <el-form-item label="混淆函数名">
            <el-switch v-model="compressFn"></el-switch>
          </el-form-item> -->
          
        </el-col>

        <el-col :span="6">
          <h3 class="form-label">压缩 日志</h3>
          <div class="compress-log" v-html="logText">
          </div>
        </el-col>

      </el-form>
    </el-row>
    <div class="button-wrapper">
      <el-button @click="compress">压缩混淆</el-button>
      <el-button @click="clearLogs">清空日志</el-button>
    </div>
    <div>
      <el-progress :text-inside="true" :stroke-width="18" :percentage="percent"></el-progress>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'home-page',
    components: {},
    data() {
      let postValue = this.genrateDateString()
      return {
        selectFolder: '',
        backup: true,
        renameFlag: false,
        renameValue: '.min.js',
        postValue: postValue,
        ignoreFiles: '.min.js',
        ignoreNum: ['\\.min\\.js$', '\\.backup\\.js$'],

        ignoreAuthor: true,
        compressVar: true,
        compressAllVar: false,
        compressFn: false,

        percent: 0, // progress bar init num

        logText: '', // compress log text
      }
    },
    filters: {
      unescape(html) {
        return html
          .replace(html ? /&(?!#?\w+;)/g : /&/g, '&amp;')
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, "\"")
          .replace(/&#39;/g, "\'")
      }
    },
    watch: {
      backup(val, oldVal) {
        if (val) {
          this.postValue = this.genrateDateString()
        }
      }
    },
    mounted() {
        this.$electron.ipcRenderer.on('percent', (event, num) => {
          this.percent = num
        })
        this.$electron.ipcRenderer.on('log', (event, msg) => {
          this.logText += ('\n' + msg)
        })
    },
    methods: {
      openDialog () {
        this.$electron.remote.dialog.showOpenDialog({
          properties: ['openDirectory'],
        }, filePath => {
          if (filePath) {
            this.selectFolder = filePath.pop()
          }
        })
      },
      genrateDateString () {
        return [
          '',
          new Date().getFullYear(), 
          new Date().getMonth() + 1, 
          new Date().getDate(),
          new Date().getHours(),
          new Date().getMinutes()
        ].join('_') + '.backup.js'
      },
      clearLogs () {
        this.logText = ''
      },
      addIgnoreRules () {
        if (this.ignoreNum.length < 3) this.ignoreNum.push('')
      },
      subIgnoreRules (index) {
        if (this.ignoreNum.length > 1) this.ignoreNum.splice(index, 1)
      },
      compress () {
        const Notification = this.$electron.remote.Notification
        if (this.selectFolder == '') {
          if (!Notification.isSupported()) return
          let opt = {
            title: '通知',
            body: '请选择需要混淆压缩js代码的文件夹'
          }
          let notify = new Notification(opt)
          notify.show()
          return 
        } 

        let op = {
          '-nc': this.ignoreAuthor,
          '-nm': !this.compressVar,
          '-nmf': !this.compressFn,
          '-mt': this.compressAllVar,
        }
        let ugOpt = Object.keys(op).filter(key => {
          return op[key]
        }).join(' ')
        console.log(ugOpt)
        this.percent = 0
        this.$electron.ipcRenderer.send('compress', {
            folder: this.selectFolder,
            ignoreRegxs: this.ignoreNum,
            renameFlag: this.renameFlag,
            renameValue: this.renameValue,
            postValue: this.postValue,
            ugOpt: ugOpt,
          })
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }
  
  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 20px 80px;
    width: 100vw;
    position: relative;
  }

  #logo {
    width: 420px;
    height: 100px;
    margin-bottom: 20px;
    font-size: 50px;
    color: #955BA5;
  }

  #logo :nth-child(2) {
    color: #2F343B;
  }

  .form-label {
    margin-bottom: 20px;
  }

  .main-container {
    height: 60vh;
  }

  .compress-log {
    line-height: 1.5;
    width: 100%;
    height: 47vh;
    background-color: #2F343B;
    border-radius: 5px;
    color: white;
    overflow-y: auto;
    padding: 12px;
  }

  .compress-suc {
    color: #A1C181;
  }
  .compress-ign {
    color: #F6F466;
  }

  .button-wrapper {
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

</style>
