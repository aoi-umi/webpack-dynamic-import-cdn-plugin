
const { DynamicImportCdnPlugin } = require('../../dest/lib');
function getCdn(host, cfg, noUrlPrefix) {
    let rs = {};
    for (let key in cfg) {
        rs[key] = { url: host + cfg[key], noUrlPrefix };
    }
    return rs;
}
module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        plugins: [new DynamicImportCdnPlugin({
            urlPrefix: 'https://cdn.jsdelivr.net/npm',
            css: {
                'iview/dist/styles/iview.css': '/iview@3.5.4/dist/styles/iview.css',
                'video.js/dist/video-js.min.css': '/video.js@7.6.6/dist/video-js.min.css',
                ...getCdn('https://unpkg.com/quill@1.3.7/dist/', {
                    'quill/dist/quill.core.css': 'quill.core.css',
                    'quill/dist/quill.snow.css': 'quill.snow.css',
                    'quill/dist/quill.bubble.css': 'quill.bubble.css',
                }, true),
                'element-ui/lib/theme-chalk/index.css': '/element-ui@2.13.2/lib/theme-chalk/index.css',
            },
            js: {
                vue: {
                    moduleName: 'Vue',
                    url: '/vue@2.6.10/dist/vue.min.js',
                    // noUrlPrefix: true
                },
                'vue-router': {
                    moduleName: 'VueRouter',
                    url: '/vue-router@3.0.2/dist/vue-router.min.js',
                },
                vuex: {
                    moduleName: 'Vuex',
                    url: '/vuex@3.1.0/dist/vuex.min.js',
                },
                iview: {
                    moduleName: 'iview',
                    url: '/iview@3.5.4/dist/iview.min.js',
                },

                'video.js': {
                    moduleName: 'videojs',
                    url: '/video.js@7.6.6/dist/video.min.js',
                },
                quill: {
                    moduleName: 'Quill',
                    url: '/quill@1.3.7/dist/quill.min.js',
                },
                'element-ui': {
                    moduleName: 'ELEMENT',
                    url: '/element-ui@2.13.2/lib/index.js'
                }
            }
        })]
    },
};