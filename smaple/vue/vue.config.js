
const { DynamicImportCdnPlugin } = require('../../dest/lib');
module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        plugins: [new DynamicImportCdnPlugin({
            css: {
                'iview/dist/styles/iview.css': 'https://unpkg.com/iview@3.5.4/dist/styles/iview.css',
                'video.js/dist/video-js.min.css': 'https://unpkg.com/video.js@7.6.6/dist/video-js.min.css',
            },
            js: {
                vue: {
                    moduleName: 'Vue',
                    url: 'https://unpkg.com/vue@2.6.10/dist/vue.min.js',
                },
                'vue-router': {
                    moduleName: 'VueRouter',
                    url: 'https://unpkg.com/vue-router@3.0.2/dist/vue-router.min.js',
                },
                vuex: {
                    moduleName: 'Vuex',
                    url: 'https://unpkg.com/vuex@3.1.0/dist/vuex.min.js',
                },
                iview: {
                    moduleName: 'iview',
                    url: 'https://unpkg.com/iview@3.5.4/dist/iview.min.js',
                },

                'video.js': {
                    moduleName: 'videojs',
                    url: 'https://unpkg.com/video.js@7.6.6/dist/video.min.js',
                },
            }
        })]
    },
};