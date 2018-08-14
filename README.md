# bunchCompress
一个批量压缩混淆js代码的工具。

由于web前端js代码含有大量注释和接口信息， 这些注释和文字信息会造成web页面的安全性降低。为了在不破坏原项目结构的情况下加强web应用的安全性和减少代码的体积，请使用bunchCompress。



#### 注意事项

* 依赖nodejs， 请先下载nodejs
* 遵守命名规范， 以.min.js结尾的js文件会被跳过，避免重复压缩 (可配置)
* 若由js代码本身书写不规范导致压缩出错， 概不负责。



#### 下载&使用

1. 下载并安装依赖

  ```shell
  git clone https://github.com/zexiplus/bunchCompress.git
  npm i 
  ```
  

2. 修改配置项 config.js

   ```js
   module.exports = {
       path: __dirname + '/demo/js',    // 压缩的js目录路径
       rawPathName: __dirname + '/demo/rawJs',    // 保存未压缩混淆的js目录路径 
       ignoreReg: /.min.js$/,
       options: "-nc"          // unglifyjs的参数，默认为-nc 忽略源代码作者信息
   }
   ```

   uglifyjs 参数请参考[uglifyjs](https://github.com/mishoo/UglifyJS)

   

3. 运行脚本

   ```bash
   # 第一次压缩混淆代码使用的命令
   npm run firstCompress
   
   # 已有rawJs文件夹时运行的命令
   npm run compress
   ```

   

#### 运行原理

此脚本依赖于uglifyjs, 通过node的filesystem对文件进行复制，移动。

`npm run firstCompress `  命令把原js目录下的文件拷贝到rawJs目录下， 对原js目录下的脚本进行压缩混淆并生成与原来同名的文件， 这样可以在不改变其他文件对js引用的情况下批量压缩混淆代码。

`npm run compress` 命令把rawJs 目录下的js文件拷贝至js目录下并进行压缩混淆。