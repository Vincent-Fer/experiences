import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configure axios to work with credentials
axios.defaults.withCredentials = true

const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')
