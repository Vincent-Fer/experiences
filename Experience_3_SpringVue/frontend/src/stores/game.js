import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useGameStore = defineStore('game', () => {
  // State
  const gameData = ref(null)
  const feedbackData = ref(null)
  const rankData = ref(null)
  const error = ref(null)
  const loading = ref(false)

  // Getters
  const getGameData = () => gameData.value
  const getFeedbackData = () => feedbackData.value
  const getRankData = () => rankData.value
  const getError = () => error.value
  const isLoading = () => loading.value

  // Actions
  const fetchGameData = async (session) => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get(`http://localhost:8080/api/game/data/${session}`, {
        withCredentials: true
      })
      gameData.value = response.data
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch game data'
      gameData.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchFeedbackData = async (session) => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get(`http://localhost:8080/api/game/feedback/${session}`, {
        withCredentials: true
      })
      feedbackData.value = response.data.feedback
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch feedback data'
      feedbackData.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchRankData = async (session) => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get(`http://localhost:8080/api/game/rank/${session}`, {
        withCredentials: true
      })
      rankData.value = response.data.rank
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch rank data'
      rankData.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  const updateSession = async (session) => {
    try {
      loading.value = true
      error.value = null
      await axios.post('http://localhost:8080/api/game/update-session', null, {
        params: { session },
        withCredentials: true
      })
      return true
    } catch (err) {
      error.value = 'Failed to update session'
      return false
    } finally {
      loading.value = false
    }
  }

  const canStartNewSession = async (session) => {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get(`http://localhost:8080/api/game/can-start-session/${session}`, {
        withCredentials: true
      })
      return response.data.canStart
    } catch (err) {
      error.value = 'Failed to check session availability'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateChoice = async (fieldName, value) => {
    try {
      loading.value = true
      error.value = null
      await axios.post('http://localhost:8080/api/choice/update', null, {
        params: { fieldName, value },
        withCredentials: true
      })
      return true
    } catch (err) {
      error.value = 'Failed to update choice'
      return false
    } finally {
      loading.value = false
    }
  }

  // Actions for FeedbackView
  const getFeedback = async (session) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get(`http://localhost:8080/api/game/feedback/${session}`, {
        withCredentials: true
      });
      return {
        success: true,
        feedback: response.data.feedback
      };
    } catch (err) {
      console.error('Error fetching feedback:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch feedback'
      };
    } finally {
      loading.value = false;
    }
  };

  // Actions for ListSuspectView
  const getSuspectsList = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get('http://localhost:8080/api/game/suspects', {
        withCredentials: true
      });
      return {
        success: true,
        suspects: response.data.suspects
      };
    } catch (err) {
      console.error('Error fetching suspects list:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch suspects list'
      };
    } finally {
      loading.value = false;
    }
  };

  const submitSuspectsList = async (suspectsData) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.post('http://localhost:8080/api/game/submit-suspects', suspectsData, {
        withCredentials: true
      });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (err) {
      console.error('Error submitting suspects list:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to submit suspects list'
      };
    } finally {
      loading.value = false;
    }
  };

  // Actions for SliderView
  const getSliderData = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get('http://localhost:8080/api/game/slider-data', {
        withCredentials: true
      });
      return {
        success: true,
        end: response.data.end
      };
    } catch (err) {
      console.error('Error fetching slider data:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to fetch slider data'
      };
    } finally {
      loading.value = false;
    }
  };

  const submitSliderData = async (data) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.post('http://localhost:8080/api/game/submit-slider', data, {
        withCredentials: true
      });
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (err) {
      console.error('Error submitting slider data:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to submit slider data'
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    gameData,
    feedbackData,
    rankData,
    error,
    loading,
    getGameData,
    getFeedbackData,
    getRankData,
    getError,
    isLoading,
    fetchGameData,
    fetchFeedbackData,
    fetchRankData,
    updateSession,
    canStartNewSession,
    updateChoice,
    getFeedback,
    getSuspectsList,
    submitSuspectsList,
    getSliderData,
    submitSliderData
  }
})

// Méthode pour QuestionnaireView
export const submitQuestionnaire = async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/game/submit-questionnaire', data, {
      withCredentials: true
    });
    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (err) {
    console.error('Error submitting questionnaire:', err);
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to submit questionnaire'
    };
  }
};