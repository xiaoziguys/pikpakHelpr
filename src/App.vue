<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import {ref} from "vue";
import AriaDownloadDialog from "./components/AriaDownloadDialog.vue";
import AriaConfigDialog from "./components/AriaConfigDialog.vue"
import Aria2Toast from './components/Aria2Toast.vue'

const downloadShow = ref(false) // 下载
const configShow = ref(false) // 配置
const tip = ref('') // 提示
const toastRef = ref(null)
const showPlugin = ref(false)

const showToast = (val) => {
  tip.value = val
  toastRef.value.open()
}

if(location.pathname !== '/') {
  showPlugin.value = true
}

</script>

<template>
  <ul class="btns" v-if="showPlugin">
  <li class="btn" @click="downloadShow = true">aria2下载</li>
  <li class="btn" @click="configShow = true">aria2配置</li>
  </ul>
  <AriaDownloadDialog @msg="showToast" v-model:show="downloadShow"></AriaDownloadDialog>
  <AriaConfigDialog @msg="showToast" v-model:show="configShow"></AriaConfigDialog>
  <Aria2Toast ref="toastRef">{{tip}}</Aria2Toast>
</template>

<style scoped>
.btns {
  display: flex;
  flex-direction: row-reverse;
  padding-right: 10px;
  padding-top: 20px;
}
.btns li {
  cursor: pointer;
  margin-right: 10px;
}
</style>
