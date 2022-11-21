// ==UserScript==
// @name         pikpak助手
// @name:zh-CN   pikpak助手
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  pikpak网盘助手，绕过ip限制，支持aria2下载!
// @description:zh-CN  pikpak网盘助手，绕过ip限制，支持aria2下载!
// @author       xiaoziguys
// @match        https://mypikpak.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mypikpak.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @license      MIT
// ==/UserScript==
function getPlatform () {
    let u = navigator.userAgent;
    let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //判断是否是 android终端
    let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //判断是否是 iOS终端
    if(isAndroid){
        return 'Android';
    }else if(isIOS){
        return 'IOS';
    }else{
        return 'PC';
    }
}
function Toast(dom, value) {
    dom.innerText = value
    dom.style.visibility = 'visible'
    setTimeout(() => {dom.style.visibility = 'hidden'}, 1000)
}
function addStyle(id, tag, css) {
    tag = tag || 'style';
    let doc = document, styleDom = doc.getElementById(id);
    if (styleDom) return;
    let style = doc.createElement(tag);
    style.rel = 'stylesheet';
    style.id = id;
    tag === 'style' ? style.innerHTML = css : style.href = css;
    doc.getElementsByTagName('head')[0].appendChild(style);
}
function post(url, data, headers, type) {
    console.log(url, data, headers, type)
    data = JSON.stringify(data);
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST", url, headers, data,
            responseType: type || 'json',
            onload: (res) => {
                type === 'blob' ? resolve(res) : resolve(res.response || res.responseText);
            },
            onerror: (err) => {
                reject(err);
            },
        });
    });
}
async function postData(url = '', data = {}, customHeaders = {}, method = 'GET') {
    // Default options are marked with *
    let options = {
        method: method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
            ...customHeaders
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer'
    }
    if (method === 'GET') {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
                ...customHeaders
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
        return response.json(); // parses JSON response into native JavaScript objects
    } else {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response))
                    } else {
                        reject({})
                    }
                }
            }
            xhr.open(method, url) // 带参数
            xhr.setRequestHeader('content-type', 'application/json')// 设置服务端要求的参数类型，后面会专门出一期，针对各种常用content-type讲解
            xhr.send(JSON.stringify(data));// 带上复杂参数
        })
    }
}

(function() {
    'use strict';
    // divert region limit
    document.cookie = "pp_access_to_visit=true"
    let flag = setInterval(() => {
        let container = document.getElementsByClassName('context-menu')
        if (container[0]) {
            clearInterval(flag)
            // ready
            let ariaHost = window.localStorage.getItem('ariaHost') || ''
            let ariaPath = window.localStorage.getItem('ariaPath') || ''
            let ariaToken = window.localStorage.getItem('ariaToken') || ''
            // add download btn
            let aria2Btn = document.createElement('button')
            aria2Btn.innerText = '推送到aria2'
            aria2Btn.className = 'el-button el-button--primary'
            aria2Btn.style.marginTop = '10px'
            container[0].append(aria2Btn)
            // aria2配置dom
            let btnBox = document.getElementsByClassName('add-resources')[0]
            let configBtn = document.createElement('button')
            configBtn.innerText = '配置aira2'
            configBtn.className = 'el-button el-button--primary aria-config-btn'
            configBtn.style.marginTop = '10px'
            btnBox.append(configBtn)
            // form
            let form = document.createElement('div')
            form.id = 'aria2form'
            addStyle('','',`
            #aria2form {
            top: 20vh;
            position: fixed;
            background: #fff;
            left: 50%;
            width: 320px;
            transform: translate(-50%, 0);
            padding: 20px;
            box-shadow: 0 2px 8px rgb(0 0 0 / 10%);;
            border-radius: 4px;
            visibility: hidden;
            }
            .xz-input {
            border: #d9d9d9 1px solid;
            margin-bottom: 10px;
            padding: 5px;
            margin-top: 5px;
            }
            #aria2Toast {
            top: 5vh;
            position: fixed;
            background: #fff;
            left: 50%;
            transform: translate(-50%, 0);
            /* height: 30px; */
            padding: 20px;
            box-shadow: 0 2px 8px rgb(0 0 0 / 10%);;
            border-radius: 4px;
            visibility: hidden;
            }
            @media screen and (max-width: 760px) {
            .add-resources .aria-config-btn {
            margin-top: 0px!important;
            margin-left: 10px;
            }
            }
            `)
            document.body.append(form)
            form.innerHTML = `
            服务器:<br/>
            <div class="el-input xz-input"><input class="el-input__inner" id="aria2Host"></input></div>
            路径:<br/>
            <div class="el-input xz-input"><input class="el-input__inner" id="aria2path"></input></div>
            密钥:<br/>
            <div class="el-input xz-input"><input class="el-input__inner" id="aria2Token"></input></div>
            <button class="el-button el-button--primary" id="ariaSaveBtn">保存</button>
            <button class="el-button" id="ariaCancelBtn">取消</button>
            `
            //toast
            let toast = document.createElement('div')
            toast.id = 'aria2Toast'
            document.body.append(toast)
            // 配置aria2
            let ariaSaveBtn = document.getElementById('ariaSaveBtn')
            let ariaCancelBtn = document.getElementById('ariaCancelBtn')
            let ariaInput = document.getElementById('aria2Host')
            let ariaPathInput = document.getElementById('aria2path')
            let ariaTokenInput = document.getElementById('aria2Token')
            ariaInput.value = ariaHost
            ariaPathInput.value = ariaPath
            ariaTokenInput.value = ariaToken
            configBtn.addEventListener('click', () => {
                form.style.visibility = 'visible'
            })
            ariaSaveBtn.addEventListener('click', () => {
                form.style.visibility = 'visible'
                window.localStorage.setItem('ariaHost',ariaInput.value)
                window.localStorage.setItem('ariaPath',ariaPathInput.value)
                window.localStorage.setItem('ariaToken',ariaTokenInput.value)
                ariaHost = ariaInput.value || ''
                ariaPath = ariaPathInput.value || ''
                ariaToken = ariaTokenInput.value || ''
                Toast(toast, '配置成功')
                form.style.visibility = 'hidden'
            })
            ariaCancelBtn.addEventListener('click', () => {
                form.style.visibility = 'hidden'
            })
            // token
            let token = ''
            let captcha = ''
            for (let i = 0; i < window.localStorage.length; i++) {
                let key = window.localStorage.key(i)
                if (key && key.startsWith('credentials')) {
                    let tokenData = JSON.parse(window.localStorage.getItem(key))
                    token = tokenData.token_type + ' ' + tokenData.access_token
                    continue
                }
                if (key && key.startsWith('captcha')) {
                    let tokenData = JSON.parse(window.localStorage.getItem(key))
                    captcha = tokenData.token
                }
            }
            let header = {
                Authorization: token,
                'x-device-id': window.localStorage.getItem('deviceid'),
                'x-captcha-token': captcha
            }
            // push to aria2
            aria2Btn.addEventListener('click', async () => {
                if (!ariaHost) {
                    Toast(toast, '请先配置aria2')
                    return
                }
                let item = document.getElementsByClassName('selected')[0]
                let id = item.getAttribute('id')
                try {
                    let res = await postData('https://api-drive.mypikpak.com/drive/v1/files/' + id + '?',{},header)
                    let ariaData = {
                        id: new Date().getTime(),
                        jsonrpc:'2.0',
                        method:'aria2.addUri',
                        params:[
                            [res.web_content_link],
                            { out: res.name }
                        ]
                    }
                    ariaPath && (ariaData.params[1].dir = ariaPath)
                    ariaToken && (ariaData.params.unshift(`token:${ariaToken}`))
                    let ariares = {}
                    if (['Android','IOS'].includes(getPlatform()) && !GM_xmlhttpRequest) {
                        ariares = await postData(ariaHost, ariaData,{}, 'POST')
                    } else {
                        ariares = await post(ariaHost, ariaData, {}, '')
                    }
                    console.log('ariares', ariares)
                    if(ariares.result) {
                        Toast(toast, 'aria2下载成功')
                    } else {
                        Toast(toast, 'aria2下载失败，请查看配置')
                    }
                } catch(e) {
                    console.log('ariares', e)
                }
            })
        }
    }, 1000)
    // Your code here...
})();
