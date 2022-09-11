// ==UserScript==
// @name         pikpak助手
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  pikpak网盘助手，绕过ip限制，支持aria2下载!
// @author       xiaoziguys
// @match        https://mypikpak.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mypikpak.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @license      MIT
// ==/UserScript==
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
    method === 'POST' && (options.body = JSON.stringify(data))
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
            configBtn.className = 'el-button el-button--primary'
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
            left: calc(50vw - 50px);
            /* height: 30px; */
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
            `)
            document.body.append(form)
            form.innerHTML = `
            服务器:<br/>
            <div class="el-input xz-input"><input class="el-input__inner" id="aria2Host"></input></div>
            路径:<br/>
            <div class="el-input xz-input"><input class="el-input__inner" id="aria2path"></input></div>
            <button class="el-button el-button--primary" id="ariaSaveBtn">保存</button>
            `
            //toast
            let toast = document.createElement('div')
            toast.id = 'aria2Toast'
            document.body.append(toast)
            // 配置aria2
            let ariaSaveBtn = document.getElementById('ariaSaveBtn')
            let ariaInput = document.getElementById('aria2Host')
            let ariaPathInput = document.getElementById('aria2path')
            ariaInput.value = ariaHost
            ariaPathInput.value = ariaPath
            configBtn.addEventListener('click', () => {
                form.style.visibility = 'visible'
            })
            ariaSaveBtn.addEventListener('click', () => {
                form.style.visibility = 'visible'
                window.localStorage.setItem('ariaHost',ariaInput.value)
                window.localStorage.setItem('ariaPath',ariaPathInput.value)
                ariaHost = ariaInput.value || ''
                ariaPath = ariaPathInput.value || ''
                Toast(toast, '配置成功')
                form.style.visibility = 'hidden'
            })
            // token
            let token = ''
            let captcha = ''
            for (let i = 0; i < 10; i++) {
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
                            'token:xiaoziguys',
                            [res.web_content_link],
                            { out: res.name }
                        ]
                    }
                ariaPath && (ariaData.params[2].dir = ariaPath)
                    let ariares = await post(ariaHost, ariaData, {}, '')
                    if(ariares.result) {
                        Toast(toast, 'aria2下载成功')
                    } else {
                        Toast(toast, 'aria2下载失败，请查看配置')
                    }
                } catch(e) {
                    console.log(e)
                }
            })
        }
    }, 1000)
    // Your code here...
})();