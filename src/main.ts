import './assets/main.css'
import { License } from 'yfiles'
import license from './license.json'
License.value = license
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
