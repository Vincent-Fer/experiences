<template>
  <div class="page-container">
    <h1 class="page-title">Questionnaire initial sur la confiance</h1>
    <div class="explanations-textQuest page-content">
      <p>
        Merci de compléter ce formulaire comportant
        12 questions sur la confiance que vous ressentez envers l'intelligence artificielle en général.
      </p>
      <p>
        Pour chacune de ces questions, votre note doit aller de
        1 (vous n'êtes pas du tout d'accord avec la proposition)
        à 7 (vous êtes parfaitement en accord avec la proposition).
      </p>
    </div>
    <form id="questionnaireForm" @submit.prevent="submitQuestionnaire">
      <div class="question" v-for="(question, index) in 12" :key="index">
        <h2>{{ getQuestionText(index + 1) }}</h2>
        <div class="rating-row">
          <div class="rating-scale">
            <button type="button" class="rating-button" :class="`question${index + 1}`"
                    v-for="value in 7" :key="value"
                    :data-value="value"
                    @click="selectRating($event, `question${index + 1}`)">
              {{ value }}
            </button>
          </div>
          <input type="hidden" :name="`question${index + 1}`" :id="`hidden-question${index + 1}`" value="">
          <div class="rating-labels">
            <span class="left-label">Pas du tout</span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span class="right-label">Parfaitement</span>
          </div>
        </div>
      </div>
      <button type="submit" class="page-button">Envoyer</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'QuestionnaireInitialView',
  setup() {
    const router = useRouter();
    const questionnaireData = ref({
      question1: null,
      question2: null,
      question3: null,
      question4: null,
      question5: null,
      question6: null,
      question7: null,
      question8: null,
      question9: null,
      question10: null,
      question11: null,
      question12: null
    });

    const questions = [
      "En général, l'intelligence artificielle est trompeuse",
      "En général, l'intelligence artificielle se comporte de façon sournoise",
      "En général, je me méfie de l'intention, de l'action ou des résultats de l'intelligence artificielle",
      "En général, je me méfie de l'intelligence artificielle",
      "En général, les actions de l'intelligence artificielle ont un résultat nocif ou préjudiciable",
      "En général, j'ai confiance dans les capacités de l'intelligence artificielle",
      "En général, l'intelligence artificielle apporte de la sécurité",
      "En général, l'intelligence artificielle est intègre",
      "En général, l'intelligence artificielle est sûre",
      "En général, l'intelligence artificielle est fiable",
      "En général, je peux avoir confiance dans l'intelligence artificielle",
      "En général, je suis familier avec l'intelligence artificielle"
    ];

    const getQuestionText = (index) => {
      return questions[index - 1] || '';
    };

    const selectRating = (event, question) => {
      // Remove active class from all buttons of the same question
      document.querySelectorAll(`.rating-button.${question}`).forEach(btn => {
        btn.classList.remove('active');
      });

      // Add active class to the clicked button
      event.target.classList.add('active');

      // Set the value in the hidden input
      const hiddenInput = document.getElementById(`hidden-${question}`);
      if (hiddenInput) {
        hiddenInput.value = event.target.dataset.value;
      }

      // Update the questionnaire data
      questionnaireData.value[question] = parseInt(event.target.dataset.value);
    };

    const submitQuestionnaire = async () => {
      try {
        // Check if all questions are answered
        const allAnswered = Object.values(questionnaireData.value).every(val => val !== null);

        if (!allAnswered) {
          alert('Veuillez répondre à toutes les questions avant de soumettre le questionnaire.');
          return;
        }

        const response = await axios.post('http://localhost:8080/api/questionnaire/initial', questionnaireData.value, {
          withCredentials: true
        });

        if (response.data.success) {
          router.push('/game');
        } else {
          alert('Erreur lors de l\'enregistrement du questionnaire: ' + response.data.message);
        }
      } catch (error) {
        console.error('Erreur lors de la soumission du questionnaire:', error);
        alert('Erreur lors de la soumission du questionnaire');
      }
    };

    return {
      selectRating,
      submitQuestionnaire,
      getQuestionText
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';

/* Style spécifique pour les boutons de notation */
.rating-scale {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.rating-button {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.rating-button:hover {
  background-color: #e9ecef;
}

.rating-button.active {
  background-color: #004080;
  color: white;
  border-color: #004080;
}

.rating-row {
  margin-bottom: 20px;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.left-label, .right-label {
  font-size: 0.9rem;
  color: #666;
}

.question {
  margin-bottom: 30px;
  text-align: left;
}

.question h2 {
  color: #004080;
  font-size: 1.1rem;
  margin-bottom: 10px;
}
</style>