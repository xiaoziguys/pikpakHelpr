<template>
  <div style="width: 400px" v-if="show" class="dialog">
    <h2>请配置你的aria2</h2>
    <div class="close" @click="close">×</div>
    <div class="form">
      <div class="form-item">
        <span>服务器:</span><div class="el-input xz-input"><input v-model="form.host" class="el-input__inner"/></div>
      </div>
      <div class="form-item">
        <span>路径:</span><div class="el-input xz-input"><input v-model="form.path" class="el-input__inner"/></div>
      </div>
      <div class="form-item">
        <span>密钥:</span><div class="el-input xz-input"><input v-model="form.token" class="el-input__inner"/></div>
      </div>
    </div>
    <div class="footer">
      <div class="btn el-button el-button--primary" @click="save">保存</div>
    </div>
  </div>
</template>

<script setup>
import {reactive} from 'vue'

const props = defineProps({
  show: Boolean
})
const emits = defineEmits(['update:show', 'msg'])

const close = () => {
  emits('update:show', false)
}

// 表单
let ariaHost = window.localStorage.getItem('ariaHost') || ''
let ariaPath = window.localStorage.getItem('ariaPath') || ''
let ariaToken = window.localStorage.getItem('ariaToken') || ''

const form = reactive({
  host: ariaHost,
  path: ariaPath,
  token: ariaToken
})

const save = () => {
  window.localStorage.setItem('ariaHost',form.host)
  window.localStorage.setItem('ariaPath',form.path)
  window.localStorage.setItem('ariaToken',form.token)
  close()
  emits('msg', '保存成功！')
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
.footer {
  margin-top: 20px;
  display: flex;
  flex-direction: row-reverse;
}
.form {
  margin-top: 20px;
}
.xz-input {
  border: #d9d9d9 1px solid;
  margin-bottom: 10px;
  padding: 5px;
  margin-top: 5px;
}
</style>
