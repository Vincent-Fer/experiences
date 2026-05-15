<template>
  <div class="container">
    <h1 class="text-center mb-4">Bienvenue dans Experience 3</h1>
    
    <div v-if="loading" class="text-center">
      <p>Chargement en cours...</p>
    </div>
    
    <div v-else>
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Informations utilisateur</h2>
          <p><strong>Nom d'utilisateur:</strong> {{ user.login }}</p>
          <p><strong>Groupe:</strong> {{ user.grp }}</p>
          <p><strong>Dernière session:</strong> {{ formatSession(user.lastSession) }}</p>
        </div>
      </div>
      
      <div class="card mt-4">
        <div class="card-body">
          <h2 class="card-title">Sessions disponibles</h2>
          
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <div class="session-grid">
            <div v-for="session in availableSessions" :key="session" class="session-card">
              <div class="session-header">
                <h3>Session {{ session }}</h3>
              </div>
              <div class="session-body">
                <p v-if="canStartSession[session]">
                  <router-link :to="{ name: 'game', params: { session } }" class="btn btn-primary">
                    Commencer la session
                  </router-link>
                </p>
                <p v-else class="text-muted">
                  Vous devez attendre {{ interSessionHours }} heures entre les sessions
                </p>
                
                <p v-if="user.lastSession === session">
                  <router-link :to="{ name: 'feedback', params: { session } }" class="btn btn-secondary">
                    Voir les feedbacks
                  </router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'

const authStore = useAuthStore()
const gameStore = useGameStore()

const user = authStore.getUser()
const loading = ref(true)
const error = ref('')
const canStartSession = ref({})
const availableSessions = [0, 1, 2, 3, 4, 5, 6]
const interSessionHours = ref(24) // Default value, will be updated

const formatSession = (session) => {
  if (!session) return 'Aucune'
  return `Session ${session}`
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Check session availability for each session
    for (const session of availableSessions) {
      const canStart = await gameStore.canStartNewSession(session)
      canStartSession.value[session] = canStart
    }
    
    // Get inter-session hours from config
    // Note: In a real app, you would fetch this from the backend
    interSessionHours.value = 24
  } catch (err) {
    error.value = 'Échec du chargement des informations de session'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  color: var(--color-primary);
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 10px;
}

.session-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.session-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.session-header {
  background-color: var(--color-primary);
  color: white;
  padding: 10px;
  text-align: center;
}

.session-body {
  padding: 15px;
  text-align: center;
}

.btn {
  display: inline-block;
  margin: 5px;
}
</style>