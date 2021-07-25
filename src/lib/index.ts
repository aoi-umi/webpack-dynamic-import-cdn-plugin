import { Template, ExternalsPlugin, version } from 'webpack';
import * as Chunk from 'webpack/lib/Chunk';

import { HtmlWebpackPlugin } from './plugins';

const ver = parseInt(version.split('.')[0])

const PluginName = 'DynamicImportCdnPlugin';

const CssExtractType = "css/mini-extract";
type CdnPublicOpt = {
    url: string;
    noUrlPrefix?: boolean;
}
type CssOptType = {
    [key: string]: {} & CdnPublicOpt
}
type CdnOpt<CssType = string | {
} & CdnPublicOpt> = {
    urlPrefix?: string;
    css?: {
        [key: string]: CssType
    };
    js?: {
        [key: string]: {
            moduleName: string;
        } & CdnPublicOpt
    };
    for?: string;
};
export class DynamicImportCdnPlugin {
    cdn: CdnOpt<CssOptType>;
    globalCdn: {
        js: any;
        css: any;
    };
    constructor(cdn: CdnOpt) {
        let newCdnCss = {};
        let origCdnCss = cdn.css
        for (let key in origCdnCss) {
            newCdnCss[key] = typeof origCdnCss[key] === 'string' ? { url: origCdnCss[key] } : origCdnCss[key];
        }
        let cdnCss = newCdnCss;
        this.cdn = {
            for: 'html-webpack-plugin',
            ...cdn,
            css: cdnCss
        };
        this.globalCdn = {
            js: {},
            css: {},
        };
    }

    apply(compiler) {
        let self = this;
        let externals = {};
        let cdnJs = self.cdn.js;
        let hasCdnJs = cdnJs && Object.keys(cdnJs).length > 0;
        if (hasCdnJs) {
            for (let key in cdnJs) {
                externals[key] = cdnJs[key].moduleName;
            }
        }

        let cdnCss = self.cdn.css;
        let hasCdnCss = cdnCss && Object.keys(cdnCss).length > 0;

        function updateOpt(opts) {
            for (let key in opts) {
                let opt: CdnPublicOpt = opts[key];
                if (self.cdn.urlPrefix && (!opt || !opt.noUrlPrefix)) {
                    opt.url = `${self.cdn.urlPrefix}${opt.url}`
                }
            }
        }
        updateOpt(cdnCss);
        updateOpt(cdnJs);

        if (Object.keys(externals).length) {
            new ExternalsPlugin(
                'var',
                externals
            ).apply(compiler);
        }

        if (ver >= 5) {
            this.webpack5(compiler, { hasCdnJs, hasCdnCss, cdnCss, cdnJs })
        } else {
            this.webpack4(compiler, { hasCdnJs, hasCdnCss, cdnCss, cdnJs })
        }
    }

    toArray<T = any>(obj) {
        return Array.from<T>(obj)
    }

    webpack4(compiler, opt) {
        let self = this
        let { hasCdnCss, hasCdnJs, cdnCss, cdnJs } = opt
        let globalCdn = this.globalCdn;

        const findCdnDep = (opt: { dep, module?, chunk?, entryModule?, res?}) => {
            let { dep, module, chunk, entryModule, res } = opt

            if (entryModule) {
                module = chunk.entryModule
            }
            if (!res)
                res = {};
            if (module) {
                for (let d of module.dependencies) {
                    if (d.request === dep)
                        return d;
                    if (d.module && d.userRequest && !res[d.userRequest]) {
                        res[d.userRequest] = true;
                        let rs = findCdnDep({ dep, module: d.module, res });
                        if (rs)
                            return rs;
                    }
                }
            }
            return false;
        }

        let cssClearMap = {};

        compiler.hooks.compilation.tap(PluginName, function (compilation, options) {
            const setGlobalCdn = (type, chunk) => {
                let global = globalCdn[type];
                let cdnOpt = self.cdn[type];
                for (let key in cdnOpt) {
                    while (true) {
                        if (global[key])
                            break;
                        let dep = findCdnDep({ dep: key, chunk, entryModule: true });
                        if (!dep)
                            break;

                        // if (type === 'css') {
                        //     global[key] = cdnOpt[key];
                        // } else {
                        //     global[key] = cdnOpt[key].url
                        // }
                        global[key] = cdnOpt[key].url
                        break;
                    }
                }
            }

            const getDependencies = (modules) => {
                let filterFn = m => typeof m.source === "function" && m.blocks.length > 0;
                let dependencies = [];
                modules.filter(filterFn).forEach(module => {
                    module.blocks.forEach(block => {
                        block.dependencies.forEach(d => {
                            let chunkGroup = d.block.chunkGroup;
                            if (!chunkGroup)
                                return;
                            dependencies.push(d);
                        });
                    });
                });
                return dependencies;
            }

            const cdnJsFn = (chunk) => {
                // if (!chunk.isOnlyInitial()) {
                //     return;
                // }
                // let entry = chunk.hasRuntime();
                // if (entry) {
                setGlobalCdn('js', chunk);
                // }
                let dependencies = getDependencies(chunk.getModules());
                for (let d of dependencies) {
                    let chunkGroup = d.block.chunkGroup;
                    for (let key in cdnJs) {
                        if (globalCdn.js[key] || chunkGroup.chunks.find(ele => ele.id === key)
                            || !findCdnDep({ dep: key, module: d.module })) {
                            continue;
                        }
                        let chunk = new Chunk();
                        chunk.id = key;
                        chunk.chunkReason = 'cdn';
                        chunkGroup.chunks.push(chunk);
                    }
                }
            }

            const cdnJsVar = 'cdnJs';
            const jsHandler = (compilation) => {
                let mainTemplate = compilation.mainTemplate;

                mainTemplate.hooks.localVars.tap(PluginName, function (source, chunk, hash) {
                    let str = 'function jsonpScriptSrc(chunkId) {';
                    let idx = source.indexOf(str);
                    if (idx === -1) {
                        return source;
                    }
                    let buf = [];
                    buf.push(
                        source.substr(0, idx),
                        `var ${cdnJsVar} = ${JSON.stringify(cdnJs, null, '\t')};`,
                        str,
                        Template.indent([
                            `if(${cdnJsVar}[chunkId]) {`,
                            Template.indent([
                                `return ${cdnJsVar}[chunkId].url;`,
                            ]),
                            `}`,]),

                        source.substr(idx + str.length),
                    );
                    return Template.asString(buf);
                });
                if (mainTemplate.hooks.jsonpScript) {
                    mainTemplate.hooks.jsonpScript.tap(PluginName, function (source, chunk, hash) {
                        let buf = [];
                        let idx = source.indexOf('var chunk = installedChunks[chunkId];');
                        buf.push(source.substr(0, idx));
                        buf.push(
                            `if(${cdnJsVar}[chunkId]) {`,
                            Template.indent([
                                Template.indent([
                                    `webpackJsonp.push([[chunkId], window[${cdnJsVar}[chunkId].moduleName]]);`,
                                ]),
                            ]),
                            '}'
                        );
                        buf.push(source.substr(idx));
                        return Template.asString(buf);
                    });
                }

                compilation.hooks.afterOptimizeChunks.tap(PluginName, (chunks, chunkGroups) => {
                    for (const chunk of chunks) {
                        cdnJsFn(chunk);
                    }
                });
            }

            let chunkCssMap = {};
            const cdnCssFn = (chunk) => {
                // if (!chunk.isOnlyInitial()) {
                //     return;
                // }
                let entry = chunk.hasRuntime();
                if (entry) {
                    setGlobalCdn('css', chunk);
                }
                //find css map
                for (let c of chunk.getAllAsyncChunks()) {
                    for (let key in cdnCss) {
                        if (globalCdn.css[key] || (chunkCssMap[c.id] && chunkCssMap[c.id].includes(cdnCss[key].url)))
                            continue;
                        for (const module of c.modulesIterable) {
                            if (module.type === CssExtractType && module.issuer.rawRequest === key) {
                                if (!chunkCssMap[c.id]) {
                                    chunkCssMap[c.id] = [];
                                }
                                chunkCssMap[c.id].push(cdnCss[key].url);
                                break;
                            }
                        }
                    }
                }
            }

            const insCdnCssChunksVar = 'installedCdnCssChunks';
            const cssHandler = (compilation) => {
                let mainTemplate = compilation.mainTemplate;
                mainTemplate.hooks.localVars.tap(PluginName, function (source, chunk, hash) {
                    return Template.asString([source, '', '// object to store loaded cdn CSS chunks', `var ${insCdnCssChunksVar} = {};`]);
                });

                compilation.hooks.afterOptimizeDependencies.tap(PluginName, (modules) => {
                    for (let key in cdnCss) {
                        if (cssClearMap[key])
                            continue;
                        modules.filter(m => m.issuer && m.issuer.rawRequest === key).forEach(m => {
                            //i don't know how to exclude it now, so, clear the content
                            m.content = `/* cdn  ${cdnCss[key].url} */`;
                            if (m.issuer.buildInfo && m.issuer.buildInfo.assets)
                                m.issuer.buildInfo.assets = null;
                            cssClearMap[key] = true;
                        });
                    }
                });

                compilation.hooks.afterOptimizeChunkIds.tap(PluginName, () => {
                    let chunks = compilation.chunks;
                    for (const chunk of chunks) {
                        cdnCssFn(chunk);
                    }
                });

                mainTemplate.hooks.requireEnsure.tap(PluginName, (source, chunk, hash) => {
                    let buf = [source];
                    const cdnCssVar = 'cdnCss';
                    buf.push(
                        '',
                        `var ${cdnCssVar} = ${JSON.stringify(chunkCssMap, null, '\t')};`,
                        // `var testCss = ${JSON.stringify(cdnCss, null, '\t')};`,
                        `if(${insCdnCssChunksVar}[chunkId]) promises.push(${insCdnCssChunksVar}[chunkId]);`,
                        `else if(${insCdnCssChunksVar}[chunkId] !== 0 && ${cdnCssVar}[chunkId]) {`,
                        Template.indent([
                            `promises.push(${insCdnCssChunksVar}[chunkId] = Promise.all(${cdnCssVar}[chunkId].map(function(href) {`,
                            Template.indent([
                                `var fullhref = href;`,
                                `return new Promise(function(resolve, reject) {`,
                                Template.indent([
                                    'var existingLinkTags = document.getElementsByTagName("link");',
                                    'for(var i = 0; i < existingLinkTags.length; i++) {',
                                    Template.indent([
                                        'var tag = existingLinkTags[i];',
                                        'var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");',
                                        'if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return resolve();'
                                    ]),
                                    '}',
                                    'var existingStyleTags = document.getElementsByTagName("style");',
                                    'for(var i = 0; i < existingStyleTags.length; i++) {',
                                    Template.indent([
                                        'var tag = existingStyleTags[i];', 'var dataHref = tag.getAttribute("data-href");',
                                        'if(dataHref === href || dataHref === fullhref) return resolve();'
                                    ]),
                                    '}',
                                    'var linkTag = document.createElement("link");', 'linkTag.rel = "stylesheet";',
                                    'linkTag.type = "text/css";',
                                    'linkTag.onload = resolve;',
                                    'linkTag.onerror = function(event) {',
                                    Template.indent([
                                        'var request = event && event.target && event.target.src || fullhref;',
                                        'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + request + ")");',
                                        'err.code = "CDN_CSS_CHUNK_LOAD_FAILED";',
                                        'err.request = request;',
                                        `delete ${insCdnCssChunksVar}[chunkId]`,
                                        'linkTag.parentNode.removeChild(linkTag)',
                                        'reject(err);'
                                    ]),
                                    '};',
                                    'linkTag.href = fullhref;',
                                    // crossOriginLoading ?
                                    //     Template.asString([`if (linkTag.href.indexOf(window.location.origin + '/') !== 0) {`,
                                    //         Template.indent(`linkTag.crossOrigin = ${JSON.stringify(crossOriginLoading)};`), '}'
                                    //     ]) : '',
                                    'var head = document.getElementsByTagName("head")[0];',
                                    'head.appendChild(linkTag);'
                                ]),
                                `});`,
                            ]),
                            `})).then(function() {`,
                            Template.indent([`${insCdnCssChunksVar}[chunkId] = 0;`]),
                            '}));'
                        ]),
                        '}',
                    );
                    return Template.asString(buf);
                });
            }
            if (hasCdnJs)
                jsHandler(compilation);


            if (hasCdnCss)
                cssHandler(compilation);

            const logics: {
                [key: string]: {
                    setGlobal: () => any
                }
            } = {
                'html-webpack-plugin': {
                    setGlobal: () => {
                        function setHtmlData(htmlPluginData) {
                            function unshiftCdn(cdn, assets) {
                                let list = [];
                                for (let key in cdn) {
                                    list.push(cdn[key]);
                                }
                                if (list.length)
                                    assets.unshift(...list);
                            }
                            unshiftCdn(globalCdn.js, htmlPluginData.assets.js);
                            unshiftCdn(globalCdn.css, htmlPluginData.assets.css);
                            return htmlPluginData;
                        }

                        if (ver >= 5)
                            HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(PluginName, setHtmlData)
                        else
                            compilation.plugin('html-webpack-plugin-before-html-generation', setHtmlData);
                    }
                },
                'vue-client-plugin': {
                    setGlobal: () => {
                        compiler.hooks.emit.tap(PluginName, function () {
                            // const hash = require('hash-sum');
                            // let stats = compilation.getStats().toJson();
                            let assets = [];
                            for (let key in cdnJs) {
                                assets.push({
                                    name: key,
                                    url: cdnJs[key].url,
                                    initial: true//!!globalCdn.js[key]
                                });
                            }
                            for (let key in compilation.assets) {
                                if (key.includes('.json')) {
                                    let asset = compilation.assets[key];
                                    let manifest = JSON.parse(asset.source());

                                    manifest.all.push(...assets.map(ele => ele.url));
                                    // for (let ele of assets) {
                                    //     if (!ele.initial) {
                                    //         let m = stats.modules.find(m => m.id === ele.name);
                                    //         if (m) {
                                    //             m.issuerPath.forEach(issuer => {
                                    //                 let hashId = hash(issuer.identifier.replace(/\s\w+$/, ''))
                                    //                 let module = manifest.modules[hashId];
                                    //                 if (!module)
                                    //                     module = manifest.modules[hashId] = [];
                                    //                 let idx = manifest.all.findIndex(a => a === ele.url);
                                    //                 if (idx >= 0 && !module.includes(idx))
                                    //                     module.push(idx)
                                    //             })
                                    //         }
                                    //     }
                                    // }

                                    manifest.initial.unshift(...assets.filter(ele => ele.initial).map(ele => ele.url));
                                    let json = JSON.stringify(manifest, null, 2);
                                    let newAsset = {
                                        source: function () { return json; },
                                        size: function () { return json.length; }
                                    };
                                    compilation.assets[key] = newAsset;
                                }
                            }
                        });
                    }
                }
            };
            let logic = logics[self.cdn.for];
            if (logic)
                logic.setGlobal();
        });
    }


    webpack5(compiler, opt) {
        let { hasCdnCss, hasCdnJs, cdnCss, cdnJs } = opt
        let globalCdn = this.globalCdn;
        let self = this

        let allKeys = [...Object.keys(self.cdn.css), ...Object.keys(self.cdn.js)];

        let exitsKeys = []

        compiler.hooks.compile.tap(PluginName, ({ normalModuleFactory }) => {
            normalModuleFactory.hooks.beforeResolve.tapAsync(PluginName, (data, callback) => {
                const dependency = data.dependencies[0];

                let key = dependency.request
                if (allKeys.includes(key) && !exitsKeys.includes(key)) {

                    exitsKeys.push(key)
                    if (key.endsWith('.css'))
                        globalCdn.css[key] = self.cdn.css[key]?.url
                    else
                        globalCdn.js[key] = self.cdn.js[key]?.url
                }
                callback()
            })
        });

        const findDep = (chunk, compilation) => {
            let modules = self.toArray(compilation.chunkGraph.getChunkModulesIterable(chunk));
            let m = modules.filter(ele => allKeys.includes(ele.rawRequest)).map(ele => ele.rawRequest);
            console.log(m);
        }

        compiler.hooks.compilation.tap(PluginName, function (compilation, options) {

            compilation.hooks.afterOptimizeChunks.tap(PluginName, (chunks, chunkGroups) => {
                for (const chunk of chunks) {
                    findDep(chunk, compilation)
                }
            });

            function setHtmlData(htmlPluginData, cb) {
                function unshiftCdn(cdn, assets) {
                    let list = [];
                    for (let key in cdn) {
                        list.push(cdn[key]);
                    }
                    if (list.length)
                        assets.unshift(...list);
                }
                unshiftCdn(globalCdn.js, htmlPluginData.assets.js);
                unshiftCdn(globalCdn.css, htmlPluginData.assets.css);
                cb(null, htmlPluginData)
            }
            let htmlHooks = HtmlWebpackPlugin.getHooks(compilation)
            htmlHooks.beforeAssetTagGeneration.tapAsync(PluginName, setHtmlData);
        });
    }
}