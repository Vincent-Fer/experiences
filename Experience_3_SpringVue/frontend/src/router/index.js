import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import views
import LoginView from '../views/LoginView.vue'
import IndexView from '../views/IndexView.vue'
import ConsentView from '../views/ConsentView.vue'
import ChoiceView from '../views/ChoiceView.vue'
import GameView from '../views/GameView.vue'
import FeedbackView from '../views/FeedbackView.vue'
import EndGameView from '../views/EndGameView.vue'
import QuestionnaireView from '../views/QuestionnaireView.vue'
import QuestionnaireDemographyView from '../views/QuestionnaireDemographyView.vue'
import QuestionnaireInitialView from '../views/QuestionnaireInitialView.vue'
import ExplainationsView from '../views/ExplainationsView.vue'
import ListSuspectView from '../views/ListSuspectView.vue'
import SliderView from '../views/SliderView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'index',
    component: IndexView,
    meta: { requiresAuth: true }
  },
  {
    path: '/consent',
    name: 'consent',
    component: ConsentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/choice',
    name: 'choice',
    component: ChoiceView,
    meta: { requiresAuth: true }
  },
  {
    path: '/game/:session',
    name: 'game',
    component: GameView,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/feedback/:session',
    name: 'feedback',
    component: FeedbackView,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/end-game',
    name: 'end-game',
    component: EndGameView,
    meta: { requiresAuth: true }
  },
  {
    path: '/questionnaire',
    name: 'questionnaire',
    component: QuestionnaireView,
    meta: { requiresAuth: true }
  },
  {
    path: '/questionnaire-demography',
    name: 'questionnaire-demography',
    component: QuestionnaireDemographyView,
    meta: { requiresAuth: true }
  },
  {
    path: '/questionnaire-initial',
    name: 'questionnaire-initial',
    component: QuestionnaireInitialView,
    meta: { requiresAuth: true }
  },
  {
    path: '/explainations',
    name: 'explainations',
    component: ExplainationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/list-suspect',
    name: 'list-suspect',
    component: ListSuspectView,
    meta: { requiresAuth: true }
  },
  {
    path: '/slider',
    name: 'slider',
    component: SliderView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      try {
        // Try to check session
        await authStore.checkSession()
        if (!authStore.isAuthenticated) {
          // Redirect to login if not authenticated
          return next({ name: 'login' })
        }
      } catch (error) {
        // Redirect to login on error
        return next({ name: 'login' })
      }
    }

    // Redirection logic after login
    if (to.name === 'index') {
      const user = authStore.getUser()

      // Check if user needs to complete demographic questionnaire
      if (user && !user.hasCompletedDemography) {
        return next({ name: 'questionnaire-demography' })
      }

      // Check if user needs to see explanations
      if (user && !user.hasSeenExplainations) {
        return next({ name: 'explainations' })
      }

      // Default redirect to choice
      return next({ name: 'choice' })
    }
  }

  // Continue to route
  next()
})

export default router