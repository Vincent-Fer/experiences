<template>
  <div class="page-container">
    <h1 class="page-title">Questionnaire démographique</h1>

    <div v-if="showSuccessMessage" class="success-message">
      Questionnaire soumis avec succès! Redirection en cours...
    </div>

    <form @submit.prevent="submitQuestionnaire" v-else class="form-container">
      <div class="form-group">
        <label for="age">Quel est votre âge ?</label>
        <input type="number" id="age" v-model="formData.age" min="18" max="100" required>
      </div>

      <div class="form-group">
        <label>Quel est votre genre ?</label>
        <div class="radio-group">
          <label><input type="radio" v-model="formData.genre" value="Homme" required> Homme</label>
          <label><input type="radio" v-model="formData.genre" value="Femme"> Femme</label>
          <label><input type="radio" v-model="formData.genre" value="Autre"> Autre</label>
        </div>
      </div>

      <div class="form-group">
        <label for="etudes">Quel est votre niveau d'études ?</label>
        <select id="etudes" v-model="formData.etudes" required>
          <option value="">Sélectionnez une option</option>
          <option value="Bac">Bac</option>
          <option value="Bac+2">Bac+2</option>
          <option value="Bac+3">Bac+3</option>
          <option value="Bac+5">Bac+5</option>
          <option value="Bac+8">Bac+8</option>
        </select>
      </div>

      <div class="form-group">
        <label>Avez-vous déjà classé des images ?</label>
        <div class="radio-group">
          <label><input type="radio" v-model="formData.classification" value="Oui" @change="toggleClassificationDuration" required> Oui</label>
          <label><input type="radio" v-model="formData.classification" value="Non" @change="toggleClassificationDuration"> Non</label>
        </div>
      </div>

      <div class="form-group" v-if="formData.classification === 'Oui'">
        <label for="duree_classification">Si oui, depuis combien de temps ?</label>
        <select id="duree_classification" v-model="formData.duree_classification">
          <option value="">Sélectionnez une durée</option>
          <option value="Moins d'un an">Moins d'un an</option>
          <option value="1-2 ans">1-2 ans</option>
          <option value="2-5 ans">2-5 ans</option>
          <option value="Plus de 5 ans">Plus de 5 ans</option>
        </select>
      </div>

      <div class="form-group">
        <label>Utilisez-vous des outils d'IA dans votre travail ?</label>
        <div class="radio-group">
          <label><input type="radio" v-model="formData.utilisation_ia" value="Oui" required> Oui</label>
          <label><input type="radio" v-model="formData.utilisation_ia" value="Non"> Non</label>
        </div>
      </div>

      <div class="form-group">
        <label>Sur une échelle de 1 à 10, à quel point êtes-vous familier avec l'IA ?</label>
        <div class="slider-container">
          <input type="range" min="1" max="10" v-model="formData.familiarite_ia" class="slider" id="familiarite-ia">
          <div class="slider-value">{{ formData.familiarite_ia || '5' }}</div>
          <input type="hidden" id="familiarite-ia-input" :value="formData.familiarite_ia || '5'">
        </div>
      </div>

      <button type="submit" class="page-button">Soumettre</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'QuestionnaireDemographyView',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const formData = ref({
      age: '',
      genre: '',
      etudes: '',
      classification: '',
      duree_classification: '',
      utilisation_ia: '',
      familiarite_ia: null
    });
    const showSuccessMessage = ref(false);

    const toggleClassificationDuration = () => {
      if (formData.value.classification !== 'Oui') {
        formData.value.duree_classification = '';
      }
    };

    const submitQuestionnaire = async () => {
      try {
        // Mettre à jour formData avec les valeurs des champs cachés
        const familiariteIaInput = document.getElementById('familiarite-ia-input');
        if (familiariteIaInput) {
          formData.value.familiarite_ia = familiariteIaInput.value;
        }

        const response = await authStore.submitDemographicQuestionnaire(formData.value);
        if (response.success) {
          showSuccessMessage.value = true;
          setTimeout(() => {
            router.push('/explainations');
          }, 2000);
        } else {
          alert('Erreur lors de l\'envoi du questionnaire: ' + (response.message || 'Veuillez réessayer'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'envoi du questionnaire');
      }
    };

    return {
      formData,
      showSuccessMessage,
      toggleClassificationDuration,
      submitQuestionnaire
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';
</style>