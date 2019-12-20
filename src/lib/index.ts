import { Template, ExternalsPlugin } from 'webpack';
import * as Chunk from 'webpack/lib/Chunk';

const PluginName = 'DynamicImportCdnPlugin';
type CdnOpt = {
    css: { [key: string]: string };
    js: {
        [key: string]: {
            moduleName: string;
            url: string;
        }
    };
};
export class DynamicImportCdnPlugin {
    cdn: CdnOpt;
    globalCdn: {
        js: any;
        css: any;
    };
    constructor(cdn: CdnOpt) {
        this.cdn = cdn;
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
        let cdnCss = self.cdn.css;
        let hasCdnCss = cdnCss && Object.keys(cdnCss).length > 0;
        if (hasCdnJs) {
            for (let key in cdnJs) {
                externals[key] = cdnJs[key].moduleName;
            }
        }
        const CssExtractType = "css/mini-extract";

        if (Object.keys(externals).length) {
            new ExternalsPlugin(
                'var',
                externals
            ).apply(compiler);
        }

        let globalCdn = this.globalCdn;

        const findCdnDep = (dep, module, res?) => {
            if (!res)
                res = {};
            for (let d of module.dependencies) {
                if (d.request === dep)
                    return d;
                if (d.module && d.userRequest && !res[d.userRequest]) {
                    res[d.userRequest] = true;
                    let rs = findCdnDep(dep, d.module, res);
                    if (rs)
                        return rs;
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
                        let dep = findCdnDep(key, chunk.entryModule);
                        if (!dep)
                            break;
                        if (type === 'css') {
                            global[key] = cdnOpt[key];
                        } else {
                            global[key] = cdnOpt[key].url
                        }
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
                if (!chunk.isOnlyInitial()) {
                    return;
                }
                let entry = chunk.hasRuntime();
                if (entry) {
                    setGlobalCdn('js', chunk);
                }
                let dependencies = getDependencies(chunk.getModules());
                for (let d of dependencies) {
                    let chunkGroup = d.block.chunkGroup;
                    for (let key in cdnJs) {
                        if (globalCdn.js[key] || chunkGroup.chunks.find(ele => ele.id === key)
                            || !findCdnDep(key, d.module)) {
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
                if (!chunk.isOnlyInitial()) {
                    return;
                }
                let entry = chunk.hasRuntime();
                if (entry) {
                    setGlobalCdn('css', chunk);
                }
                //find css map
                for (let c of chunk.getAllAsyncChunks()) {
                    for (let key in cdnCss) {
                        if (globalCdn.css[key] || (chunkCssMap[c.id] && chunkCssMap[c.id].includes(cdnCss[key])))
                            continue;
                        for (const module of c.modulesIterable) {
                            if (module.type === CssExtractType && module.issuer.rawRequest === key) {
                                if (!chunkCssMap[c.id]) {
                                    chunkCssMap[c.id] = [];
                                }
                                chunkCssMap[c.id].push(cdnCss[key]);
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
                            m.content = `/* cdn  ${cdnCss[key]} */`;
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

            compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData) {
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
            });
        });
    }
}