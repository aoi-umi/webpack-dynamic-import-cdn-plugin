
const { DynamicImportCdnPlugin } = require('../../dest/lib');
function getCdn(commonCfg, cfg) {
    let rs = {};
    for (let key in cfg) {
        rs[key] = {
            ...commonCfg,
            url: cfg[key]
        };
    }
    return rs;
}
module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        plugins: [new DynamicImportCdnPlugin({
            urlPrefix: 'https://cdn.jsdelivr.net/npm',
            split: '@',
            // urlPrefix: 'https://cdnjs.cloudflare.com/ajax/libs',
            // split: '/',
            // noRoot: true,
            css: {
                'iview/dist/styles/iview.css': {
                    package: 'iview',
                    version: '3.5.4',
                    root: '/dist',
                    url: '/styles/iview.css',
                },
                'video.js/dist/video-js.min.css': {
                    package: 'video.js',
                    version: '7.6.6',
                    root: '/dist',
                    url: '/video-js.min.css'
                },
                ...getCdn({
                    package: 'quill',
                    version: '1.3.7',
                    root: '/dist',
                }, {
                    'quill/dist/quill.core.css': '/quill.core.css',
                    'quill/dist/quill.snow.css': '/quill.snow.css',
                    'quill/dist/quill.bubble.css': '/quill.bubble.css',
                }),
                'element-ui/lib/theme-chalk/index.css': {
                    package: 'element-ui',
                    version: '2.13.2',
                    root: '/lib',
                    url: '/theme-chalk/index.css',
                }
            },
            js: {
                vue: {
                    urlPrefix: '',
                    split: '',
                    moduleName: 'Vue',
                    package: 'vue',
                    version: '2.6.10',
                    root: '/dist',
                    url: '/vue.min.js',
                },
                'vue-router': {
                    moduleName: 'VueRouter',
                    package: 'vue-router',
                    version: '3.0.2',
                    root: '/dist',
                    url: '/vue-router.min.js',
                },
                vuex: {
                    moduleName: 'Vuex',
                    package: 'vuex',
                    version: '3.1.0',
                    root: '/dist',
                    url: '/vuex.min.js',
                },
                iview: {
                    moduleName: 'iview',
                    package: 'iview',
                    version: '3.5.4',
                    root: '/dist',
                    url: '/iview.min.js',
                },

                'video.js': {
                    moduleName: 'videojs',
                    package: 'video.js',
                    version: '7.6.6',
                    root: '/dist',
                    url: '/video.min.js',
                },
                quill: {
                    moduleName: 'Quill',
                    package: 'quill',
                    version: '1.3.7',
                    root: '/dist',
                    url: '/quill.min.js',
                },
                'element-ui': {
                    moduleName: 'ELEMENT',
                    package: 'element-ui',
                    version: '2.13.2',
                    root: '/lib',
                    url: '/index.min.js'
                },

                'echarts': {
                    moduleName: 'echarts',
                    package: 'echarts',
                    version: '5.0.2',
                    root: '/dist',
                    url: '/echarts.min.js',
                },
            }
        })]
    },
};