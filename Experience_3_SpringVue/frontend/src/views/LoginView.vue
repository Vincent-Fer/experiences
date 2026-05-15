<template>
  <div class="page-container">
    <h1 class="page-title">Login page</h1>
    <div class="page-content">
      <p>Veuillez entrer les identifiants fournis précédemment.</p>
    </div>
    <form @submit.prevent="login" class="form-container">
      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input type="text" id="username" v-model="username" placeholder="Username" required>
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input type="password" id="password" v-model="password" placeholder="Password" required>
      </div>
      <span v-if="error" class="error-message">
        {{ error }}
      </span>
      <button type="submit" class="page-button">Login</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const username = ref('');
    const password = ref('');
    const error = ref('');

     const login = async () => {
       error.value = '';
       const success = await authStore.login(username.value, password.value);
       if (success) {
         // Rediriger vers la racine pour que le guard de navigation gère la redirection
         router.push('/');
       } else {
         error.value = authStore.error || 'Login failed';
       }
     };

    return {
      username,
      password,
      error,
      login
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';
</style>