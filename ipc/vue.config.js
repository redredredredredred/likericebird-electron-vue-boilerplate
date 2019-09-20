const path = require('path');
const merge = require('webpack-merge');
const resolve = dir => require('path').join(__dirname, dir);

module.exports = {
  lintOnSave: true,
  publicPath: '/',
  productionSourceMap: false,
  outputDir: path.resolve(__dirname, './dist'),
  indexPath: 'index.html',
  devServer: {
    index: 'index.html',
    open: process.platform === 'darwin',
    port: 10900,
    https: false,
    hotOnly: false,
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: false,// "server" : "disabled"
      analyzerPort: 8099,
    },
    electronBuilder: {
      externals: ['my-native-dep'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      builderOptions: {
        appId: 'com.electron.zhibeiIPC',
        productName: 'zhibeiIPC',
        copyright: 'copyright @ 2019 zhibei',
        artifactName: 'zhibeiIPC Setup ${version}.${ext}', // 安装包名
        "compression": "maximum",
        // "asar": true,
        asar: true,
        // directories: {
        //   output: "dist_electron"
        // },
        // files: [
        //   "dist_electron/bundled/**/*"
        // ],
        dmg: {
          contents: [
            {
              "x": 410,
              "y": 150,
              "type": "link",
              "path": "/Applications"
            },
            {
              "x": 130,
              "y": 150,
              "type": "file"
            }
          ]
        },
        mac: {
          "category": "public.app-category.social-networking",
          "icon": "build/icons/icon.icns"
        },
        win: {
          icon: "build/icons/icon.ico",
          target: {
            target: 'nsis', // 打包为nsis安装文件,
            arch: [
              'x64',
              'ia32'
            ] // 支持32、64位的Windows系统
          }
        },
        linux: {
          "icon": "build/icons/icon.ico"
        },
        nsis: {
          "oneClick": false,
          "createDesktopShortcut": true,
          "createStartMenuShortcut": true,
          "menuCategory": false,
          "allowElevation": true,
          "allowToChangeInstallationDirectory": true,
          "runAfterFinish": true
        }
      }
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [],
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
          '@': resolve('src')
      },
    },
    externals: {
    },
  },
  assetsDir: undefined,
  runtimeCompiler: true,
  parallel: undefined,
  chainWebpack: config => {

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options =>
        merge(options, {
          limit: 10000,
        })
      );

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },
};
