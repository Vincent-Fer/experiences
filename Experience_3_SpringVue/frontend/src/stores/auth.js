import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isAuthenticated = ref(false)
  const error = ref(null)

  // Getters
  const getUser = () => user.value
  const getError = () => error.value

  // Actions
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password
      }, {
        withCredentials: true
      })

      if (response.data.success) {
        user.value = {
          uid: response.data.uid,
          login: username,
          grp: response.data.grp,
          lastSession: response.data.lastSession,
          hasCompletedDemography: response.data.hasCompletedDemography || false,
          hasSeenExplainations: response.data.hasSeenExplainations || false
        }
        isAuthenticated.value = true
        error.value = null
        return true
      } else {
        error.value = response.data.message || 'Login failed'
        isAuthenticated.value = false
        return false
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      isAuthenticated.value = false
      return false
    }
  }

  const logout = async () => {
    try {
      await axios.post('http://localhost:8080/api/auth/logout', {}, {
        withCredentials: true
      })
      user.value = null
      isAuthenticated.value = false
      error.value = null
    } catch (err) {
      error.value = 'Logout failed'
    }
  }

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/session', {
        withCredentials: true
      })
      if (response.data.authenticated) {
        user.value = {
          uid: response.data.uid,
          login: response.data.login,
          grp: response.data.grp,
          lastSession: response.data.lastSession,
          hasCompletedDemography: response.data.hasCompletedDemography || false,
          hasSeenExplainations: response.data.hasSeenExplainations || false
        }
        isAuthenticated.value = true
        error.value = null
        return true
      } else {
        user.value = null
        isAuthenticated.value = false
        error.value = null
        return false
      }
    } catch (err) {
      user.value = null
      isAuthenticated.value = false
      error.value = 'Session check failed'
      return false
    }
  }

  // Actions for demographic questionnaire
  const submitDemographicQuestionnaire = async (formData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/questionnaire/demography', formData, {
        withCredentials: true
      });
      if (response.data.success) {
        // Mettre à jour le flag localement
        if (user.value) {
          user.value.hasCompletedDemography = true;
        }
      }
      return response.data;
    } catch (err) {
      console.error('Error submitting demographic questionnaire:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to submit questionnaire'
      };
    }
  };

  const getDemographicQuestionnaire = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/questionnaire/demography', {
        withCredentials: true
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching demographic questionnaire:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch questionnaire data'
      };
    }
  };

  return {
    user,
    isAuthenticated,
    error,
    getUser,
    getError,
    login,
    logout,
    checkSession,
    submitDemographicQuestionnaire,
    getDemographicQuestionnaire
  }
})