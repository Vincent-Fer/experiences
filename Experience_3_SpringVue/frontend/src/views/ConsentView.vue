<template>
  <div class="container">
    <form @submit.prevent="submitConsent">
      <div id="formulairePDF">
        <h1>FORMULAIRE DE CONSENTEMENT (adultes)</h1>
        <h2>Titre du projet : Expérience de classification de cible dans le cadre de la thèse de Vincent Fer</h2>
        <p style="text-align: right;">Paraphez chaque case</p>
        <table>
          <tr>
            <td class="question">
              1. Avez-vous lu la fiche d'information pour les participants ?
            </td>
            <td>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="q1" value="oui" required>Oui
                </label>
                <label>
                  <input type="radio" v-model="q1" value="non">Non
                </label>
                <input type="text" class="initiales-input" v-model="init1" maxlength="5" placeholder="Initiales" required>
              </div>
            </td>
          </tr>
          <tr>
            <td class="question">
              2. Avez-vous reçu suffisamment d'informations sur l'étude et ce qu'implique votre participation ?
            </td>
            <td>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="q2" value="oui" required>Oui
                </label>
                <label>
                  <input type="radio" v-model="q2" value="non">Non
                </label>
                <input type="text" class="initiales-input" v-model="init2" maxlength="5" placeholder="Initiales" required>
              </div>
            </td>
          </tr>
          <tr>
            <td class="question">
              3. Comprenez-vous que vous n'avez pas besoin de participer à l'étude et que si vous le faites, vous êtes libre de vous retirer :
              <ul style="margin:6px 0 0 18px; padding-left:0; font-weight:400;">
                <li>à tout moment pendant l'étude ;</li>
                <li>sans avoir à vous justifier ;</li>
                <li>et sans préjudice pour vous ?</li>
              </ul>
            </td>
            <td>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="q3" value="oui" required>Oui
                </label>
                <label>
                  <input type="radio" v-model="q3" value="non">Non
                </label>
                <input type="text" class="initiales-input" v-model="init3" maxlength="5" placeholder="Initiales" required>
              </div>
            </td>
          </tr>
          <tr>
            <td class="question">
              4. Êtes-vous d'accord pour participer à cette étude ?
            </td>
            <td>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="q4" value="oui" required>Oui
                </label>
                <label>
                  <input type="radio" v-model="q4" value="non">Non
                </label>
                <input type="text" class="initiales-input" v-model="init4" maxlength="5" placeholder="Initiales" required>
              </div>
            </td>
          </tr>
        </table>

        <div class="form-row">
          <label for="nom">Prénom / Nom :</label>
          <input type="text" id="nom" v-model="nom" required>
          <label for="age">Âge :</label>
          <input type="number" id="age" v-model="age" min="0" max="120" style="width:80px;" required>
        </div>

        <div class="signature-row">
          <label for="signatureCanvas">Signature :</label>
          <canvas id="signatureCanvas" class="signature-box" ref="signatureCanvas"></canvas>
          <button type="button" class="clear-btn" @click="clearSignature">Effacer</button>
        </div>

        <div class="form-row">
          <label for="date">Date :</label>
          <input type="date" id="date" v-model="date" required>
        </div>

        <div class="form-row">
          <label for="chercheur">Nom du chercheur :</label>
          <input type="text" id="chercheur" v-model="chercheur" value="Vincent FER" required>
          <label for="dateChercheur">Date :</label>
          <input type="date" id="dateChercheur" v-model="dateChercheur" required>
        </div>

        <div class="signature-row">
          <label for="signatureChercheur">Signature chercheur :</label>
          <img id="imgSignature" :src="signatureImage"/>
        </div>

        <button type="submit" id="submitBtn" class="btn" :disabled="!isFormValid">Envoyer</button>

        <p class="note">
          Ce projet a été approuvé par le Comité Institutionnel Consultatif pour la Protection des Personnes dans la Recherche d'IMT Atlantique.
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'ConsentView',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // Form data
    const q1 = ref('');
    const q2 = ref('');
    const q3 = ref('');
    const q4 = ref('');
    const init1 = ref('');
    const init2 = ref('');
    const init3 = ref('');
    const init4 = ref('');
    const nom = ref('');
    const age = ref('');
    const date = ref('');
    const chercheur = ref('Vincent FER');
    const dateChercheur = ref('');
    const signatureImage = ref('data:image/png;base64,{{ signature }}');

    // Signature canvas
    const signatureCanvas = ref(null);
    let isDrawing = false;
    let context = null;

    // Check if form is valid
    const isFormValid = computed(() => {
      return q1.value === 'oui' && q2.value === 'oui' && q3.value === 'oui' && q4.value === 'oui' &&
             init1.value && init2.value && init3.value && init4.value &&
             nom.value && age.value && date.value && chercheur.value && dateChercheur.value;
    });

    // Initialize signature canvas
    const initSignatureCanvas = () => {
      if (signatureCanvas.value) {
        context = signatureCanvas.value.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
        context.strokeStyle = 'black';
        context.lineWidth = 2;

        signatureCanvas.value.addEventListener('mousedown', startDrawing);
        signatureCanvas.value.addEventListener('mousemove', draw);
        signatureCanvas.value.addEventListener('mouseup', stopDrawing);
        signatureCanvas.value.addEventListener('mouseout', stopDrawing);

        signatureCanvas.value.addEventListener('touchstart', handleTouchStart);
        signatureCanvas.value.addEventListener('touchmove', handleTouchMove);
        signatureCanvas.value.addEventListener('touchend', stopDrawing);
      }
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      signatureCanvas.value.dispatchEvent(mouseEvent);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      signatureCanvas.value.dispatchEvent(mouseEvent);
    };

    const startDrawing = (e) => {
      isDrawing = true;
      draw(e);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      context.lineTo(e.offsetX, e.offsetY);
      context.stroke();
      context.beginPath();
      context.moveTo(e.offsetX, e.offsetY);
    };

    const stopDrawing = () => {
      isDrawing = false;
      context.beginPath();
    };

    const clearSignature = () => {
      if (context) {
        context.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
        context.fillStyle = 'white';
        context.fillRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
      }
    };

    const submitConsent = async () => {
      try {
        // Get signature data URL
        const signatureData = signatureCanvas.value.toDataURL('image/png');

        const consentData = {
          q1: q1.value,
          q2: q2.value,
          q3: q3.value,
          q4: q4.value,
          init1: init1.value,
          init2: init2.value,
          init3: init3.value,
          init4: init4.value,
          nom: nom.value,
          age: age.value,
          date: date.value,
          chercheur: chercheur.value,
          dateChercheur: dateChercheur.value,
          signature: signatureData
        };

        const response = await authStore.submitConsent(consentData);
        if (response.success) {
          router.push('/choice');
        } else {
          alert('Erreur lors de l\'envoi du consentement: ' + (response.message || 'Veuillez réessayer'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'envoi du consentement');
      }
    };

    onMounted(() => {
      initSignatureCanvas();
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      date.value = today;
      dateChercheur.value = today;
    });

    return {
      q1, q2, q3, q4,
      init1, init2, init3, init4,
      nom, age, date,
      chercheur, dateChercheur,
      signatureImage,
      signatureCanvas,
      isFormValid,
      clearSignature,
      submitConsent
    };
  }
};
</script>

<style scoped>
@import '../assets/style/consent.css';
</style>