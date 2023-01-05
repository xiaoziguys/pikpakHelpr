<template>
  <div class="aria2-tip" v-if="show"><slot></slot></div>
</template>

<script setup>
import {ref} from 'vue'

const show = ref(false)

const open = () => {
  show.value = true
  setTimeout(() => {
    show.value = false
  }, 3000)
}

defineExpose({ open })
</script>

<style scoped>
.aria2-tip {
  padding: 10px;
  background: rgba(0,0,0,0.8);
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translate(0, -50%);
  color: #fff;
  border-radius: 8px;
}
</style>
