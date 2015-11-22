/**
 * @file ls中间件
 * @author xiaowu
 * @email fe.xiaowu@gmail.com
 */

'use strict';

import fs from 'fs';
import path from 'path';

export default class extends think.middleware.base {
    /**
     * 默认配置
     *
     * @type {Object}
     */
    options = {
        open: '<%',
        close: '%>'
    }
    /**
     * run
     * @return {} []
     */
    async run(content) {
        // 如果内容为空
        if (!content) {
            return content;
        }

        // 合并参数
        let options = think.extend({}, this.options, this.config('ls.options') || {});

        // 快速查找内容里有没有替换标签
        if (content.indexOf(options.open) === -1) {
            return content;
        }

        // 用正则查找标签
        const REG_TAG = new RegExp(options.open +'(.+?)'+ options.close, 'g');
        const REG_TYPE_ID = new RegExp('(\\w+)\\([\'\"]([\\w_-]+)[\'\"]\\)');

        // 如果没有开启则替换成link,script标签
        if (this.config('ls.on') === false) {
            // 使用配置而不是缓存
            let ls_config = this.config('ls') || {};

            return content.replace(REG_TAG, ($0, $1) => {
                let data = $1.match(REG_TYPE_ID);

                // 如果没有配置到或者没有配置ls
                if (data === null || think.isEmpty(ls_config)) {
                    return '';
                }

                let id = data[2];
                let type = data[1];

                // 如果没有配置{css:{}}或者{css:{id:{}}}
                if (!ls_config[type] || !ls_config[type][id]) {
                    return '';
                }

                let html;

                if (type === 'js') {
                    html = `<script src="${ls_config[type][id]}"></script>`;
                } else {
                    html = `<link rel="stylesheet" href="${ls_config[type][id]}" />`
                }

                return html;
            });
        }

        // 读取缓存数据
        let ls_data = await think.cache('ls_data');

        // 如果没有缓存数据则先编译
        if (!ls_data) {
            ls_data = await this.build();
        }

        // 替换内容
        content = content.replace(REG_TAG, ($0, $1) => {
            let data = $1.match(REG_TYPE_ID);

            if (data === null) {
                return '';
            }

            return this.get_ls_data(ls_data, data[2], data[1]);
        });

        return content;
    }

    /**
     * 获取ls数据
     *
     * @param  {Object} data ls的缓存配置
     * @param  {string} id   id
     * @param  {string} type 类型,css\js
     *
     * @return {string}      结果
     */
    get_ls_data(ls_data, id, type) {
        // 如果没有配置这个id的数据
        if (!ls_data[type] || !ls_data[type][id]) {
            return '';
        }

        let http = this.http;
        let data = ls_data[type][id];

        // 获取cookie的值，对比版本号
        let cookie_data = http.cookie(type + '_'+ id);
        let html;

        if (!cookie_data || cookie_data !== data.md5) {
            if (type === 'js') {
                html = `<script id="${type}_${id}">${data.source}</script>`;
            } else {
                html = `<style id="${type}_${id}">${data.source}</style>`;
            }
            html += `<script>LS.set('${type}_${id}', '${data.md5}')</script>`;
        } else {
            html = `<script>LS.get('${type}_${id}', '${type}')</script>`;
        }

        return html;
    }

    /**
     * 编译
     */
    async build() {
        let ls_data = {
            js: await this.init_ls_data('js'),
            css: await this.init_ls_data('css')
        };

        await think.cache('ls_data', ls_data, {
            timeout: 60 * 60 * 24 * 30
        });

        return ls_data;
    }

    /**
     * 设置ls数据
     *
     * @param {string} type 类型
     * @return {Object} {source, md5, uri, path}
     */
    init_ls_data(type = 'js') {
        let result = {};
        let config_ls = think.config('ls') || {};
        let data = config_ls[type];

        // 如果没有配置
        if(think.isEmpty(data)){
            return result;
        }

        Object.keys(data).forEach(key => {
            let filepath = data[key];

            if ('function' === typeof data[key]) {
                filepath = data[key]();
            }
            
            // 文件路径
            filepath = path.resolve(think.RESOURCE_PATH, filepath.substr(1));

            // 如果该文件不存在
            if (!fs.existsSync(filepath)) {
                return;
            }

            // 获取文件内容
            let filedata = fs.readFileSync(filepath).toString();

            result[key] = {
                path: filepath,
                uri: data[key],
                md5: think.md5(filedata).substr(0, 6),
                source: filedata
            } 
        });

        return result;
    }
}