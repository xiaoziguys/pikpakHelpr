<template>
  <div style="width: 600px" v-if="show" class="dialog">
    <h2>请勾选你要下载的</h2>
    <div class="close" @click="close">×</div>
    <input @change="onCheckAll" style="margin: 10px 10px 0 0" type="checkbox" id="checkbox" v-model="checkedAll">全选
    <ul class="movies">
      <li v-for="item in list" :key="item.id"><input @change="onCheck" type="checkbox" :id="item.id" :value="item.id" v-model="selected">{{item.name}}</li>
    </ul>
    <div class="footer">
      <div class="btn el-button el-button--primary" @click="push">推送到aria2</div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import {getDownload, pushToAria} from '../api'

const props = defineProps({
  show: Boolean
})
const emits = defineEmits(['update:show', 'msg'])

const list = ref([])
const selected = ref([])
const checkedAll = ref(false)
watch(
    () => props.show,
    (val) => {
      if (val) {
        const domItems = document.body.querySelectorAll('.row.grid')
        const tempList = []
        for (let i = 0; i < domItems.length; i++) {
          const item = domItems[i]
          if (!domItems[i].querySelector('.folder-cover')) {
            tempList.push({id: item.id, name: item.querySelector('.name').innerText})
          }
        }
        list.value = tempList
      }
    }
)

const close = () => {
  selected.value = []
  checkedAll.value = false
  emits('update:show', false)
}

// 选择
const onCheckAll = () => {
  if (checkedAll.value) {
    selected.value = list.value.map(item => item.id)
  } else {
    selected.value = []
  }
}
const onCheck = () => {
  checkedAll.value = selected.value.length === list.value.length
}

const push = () => {
  let total = selected.value.length
  let success = 0
  let fail = 0
  let ariaHost = window.localStorage.getItem('ariaHost') || ''
  let ariaPath = window.localStorage.getItem('ariaPath') || ''
  let ariaToken = window.localStorage.getItem('ariaToken') || ''
  let ariaParams = window.localStorage.getItem('ariaParams') || ''
  let errorMSG = ''
  if (!ariaHost) {
    emits('msg', '请先配置aria2')
    close()
    return
  }
  for(let item of selected.value) {
    getDownload(item).then((res) => {
      if (res.error_description) {
        emits('msg', `失败原因: ${res.error_description} 请刷新！`)
        return
      }
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
      if (ariaParams) {
        const customParams = ariaParams.split(';')
        customParams.forEach(item => {
          const customParam = item.split('=')
          ariaData.params[1][customParam[0]] = customParam[1]
        })
      }
      ariaToken && (ariaData.params.unshift(`token:${ariaToken}`))
      total--
      pushToAria(ariaHost, ariaData).then((ariares) => {
        if (ariares.result) {
          success++
        } else {
          errorMSG = ariares.error.message === 'Unauthorized' ? '密钥不对' : '推送失败'
          fail++
        }
      }).catch((e) => {
        errorMSG = `${e.statusText} 请检测配置`
        emits('msg', `失败原因: ${e.statusText}`)
        fail++
      }).finally(() => {
        if (total === 0) {
          emits('msg', `成功：${success} 失败: ${fail} ${fail !== 0 ? '失败原因' + errorMSG : ''}`)
        }
      })
    }).catch((e) => {
      fail++
      total--
    })
  }
  close()
}
</script>

<style scoped>
.dialog {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, 0%);
  background: #fff;
  z-index: 10000;
  padding: 30px;
  box-shadow: 0 0 50px rgba(0,0,0,1);
  border-radius: 8px;
}
.dialog .close {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 30px;
  cursor: pointer;
  color: #999;
}
.movies {
  margin-top: 10px;
}
.movies li {
  margin-top: 10px;
}
.movies li input {
  margin-right: 10px;
}
.footer {
  margin-top: 20px;
  display: flex;
  flex-direction: row-reverse;
}
</style>
