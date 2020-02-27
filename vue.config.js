const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');

process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  lintOnSave: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  productionSourceMap: false,
  outputDir: path.resolve(__dirname, './dist'),
  indexPath: 'index.html',
  devServer: {
    index: 'index.html',
    open: process.platform === 'darwin',
    port: 10844,
    https: false,
    hotOnly: false,
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode: 'disabled',
      analyzerPort: 8099,
    },
    electronBuilder: {
      externals: ['my-native-dep'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      // buildVersion:'2.3.2',
      builderOptions: {
        publish: [{
          provider: 'generic',
          url: 'http://jackksssss.com/',
          channel: 'latest',
          useMultipleRangeRequest: true,
          publishAutoUpdate: true,
        }],
        appId: 'com.electron.fans',
        productName: 'fans',
        copyright: 'copyright @ 2019 fans',
        // artifactName: "fans${version}.${ext}", // 安装包名
        // eslint-disable-next-line no-template-curly-in-string
        artifactName: 'fansInstaller.${ext}', // 安装包名
        // compression: "maximum",
        asar: true,
        // directories: {
        //   output: "dist_electron"
        // },
        // files: [
        //   ".dist/**/*"
        // ],
        mac: {
          type: 'distribution',
          category: 'public.app-category.productivity',
          icon: 'build/icons/icon.jpg',
          // target: ['dmg', 'pkg', 'zip', 'mas'],
          target: ['dmg', 'pkg', 'zip'],
          // identity: "", // app开发者 groupid
          // bundleVersion: '',
          // extendInfo: {
          //   "ElectronTeamID": ""
          // }
        },
        // mas: {
        //   icon: 'build/icons/icon.jpg',
        //   // provisioningProfile: "build/App_Store_XC_Wildcard.provisionprofile",
        //   // entitlements: 'build/entitlements.mas.plist',
        //   // entitlementsInherit: 'build/entitlements.mas.inherit.plist',
        //   // extendInfo: {
        //   //   "ElectronTeamID": "",
        //   //   "com.apple.security.app-sandbox": true
        //   // }
        // },
        dmg: {
          contents: [{
            x: 410,
            y: 150,
            type: 'link',
            path: '/Applications',
          },
          {
            x: 130,
            y: 150,
            type: 'file',
          }],
        },
        win: {
          icon: 'build/icons/icon.jpg',
          target: {
            target: 'nsis', // 打包为nsis安装文件,
            arch: [
              'x64',
              'ia32',
            ], // 支持32、64位的Windows系统
          },
        },
        linux: {
          icon: 'build/icons/icon.jpg',
        },
        nsis: {
          oneClick: false,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          menuCategory: false,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          runAfterFinish: true,
        },
      },
    },
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
        common: '@/common',
        vue$: 'vue/dist/vue.esm.js',
      },
    },
    externals: {
      'aws-sdk': 'AWS',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.VUE_APP_VERSION': JSON.stringify(new Date().toLocaleString()),
      }),
    ],
  },
  assetsDir: undefined,
  runtimeCompiler: true,
  parallel: undefined,
  chainWebpack: (config) => {
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => merge(options, {
        limit: 10000,
      }));

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },
};
