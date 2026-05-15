<template>
  <div class="page-container">
    <h1 class="page-title">Questions sur la confiance</h1>
    <div class="explanations-textQuest page-content">
      <p>
        Merci de compléter ces deux questions concernant votre confiance en vous et la confiance en l'IA.
      </p>
      <p>
        Pour chacune de ces questions, votre note doit aller de
        1 (vous n'êtes pas du tout d'accord avec la proposition)
        à 7 (vous êtes extrêmement en accord avec la proposition).
      </p>
    </div>
    <form id="sliderForm" @submit.prevent="submitSlider" class="form-container">
      <div class="question">
        <h2>Quel niveau de confiance en vous avez-vous pour réaliser la tâche seul ?</h2>
        <div class="rating-row">
          <div class="rating-scale">
            <button type="button"
                    v-for="n in 7"
                    :key="'q1-' + n"
                    class="rating-button question1"
                    :data-value="n">
              {{ n }}
            </button>
          </div>
          <input type="hidden" name="question1" id="hidden-question1">
          <div class="rating-labels">
            <span class="left-label">Pas du tout</span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span class="right-label">Extrêmement</span>
          </div>
        </div>
      </div>

      <div class="question">
        <h2>Quel niveau de confiance en l'intelligence artificielle avez-vous pour vous aider à réaliser la tâche ?</h2>
        <div class="rating-row">
          <div class="rating-scale">
            <button type="button"
                    v-for="n in 7"
                    :key="'q2-' + n"
                    class="rating-button question2"
                    :data-value="n">
              {{ n }}
            </button>
          </div>
          <input type="hidden" name="question2" id="hidden-question2">
          <div class="rating-labels">
            <span class="left-label">Pas du tout</span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span class="right-label">Extrêmement</span>
          </div>
        </div>
      </div>

      <button type="submit" class="page-button" id="end" v-if="end === 2">Passer au questionnaire</button>
      <button type="submit" class="page-button" id="mid" v-if="end === 1">Continuer</button>
      <button type="submit" class="page-button" id="begin" v-if="end === 0">Voir les suspects</button>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

export default {
  name: 'SliderView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();
    const end = ref(0);

    const submitSlider = async () => {
      // La validation est gérée par le code JavaScript intégré
      // Le formulaire sera soumis normalement si toutes les questions sont répondues
    };

    const loadSliderData = async () => {
      try {
        const response = await gameStore.getSliderData();
        if (response.success) {
          end.value = response.end || 0;
          // Initialiser la logique après que les données soient chargées
          setTimeout(initializeSliderLogic, 100);
        } else {
          alert('Erreur lors du chargement des données: ' + (response.message || 'Veuillez réessayer'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du chargement des données');
      }
    };

    const initializeSliderLogic = () => {
      // Réinitialiser les valeurs
      for (let i = 1; i <= 2; i++) {
        const input = document.getElementById('hidden-question' + i);
        if (input) input.value = '';
      }
      // Retirer la classe "selected" des boutons
      document.querySelectorAll('.rating-button.selected').forEach(btn => btn.classList.remove('selected'));

      // Gestion de la soumission du formulaire
      const sliderForm = document.getElementById('sliderForm');
      if (sliderForm) {
        sliderForm.addEventListener('submit', function(event) {
          // Désactiver les boutons pendant la soumission
          document.getElementById("end") && (document.getElementById("end").disabled = true);
          document.getElementById("mid") && (document.getElementById("mid").disabled = true);
          document.getElementById("begin") && (document.getElementById("begin").disabled = true);

          let allAnswered = true;
          for (let i = 1; i <= 2; i++) {
            const val = document.getElementById('hidden-question' + i)?.value;
            if (!val || val.trim() === '') {
              allAnswered = false;
              break;
            }
          }

          if (!allAnswered) {
            event.preventDefault();
            alert("Veuillez répondre à toutes les questions !");
            // Réactiver les boutons
            document.getElementById("end") && (document.getElementById("end").disabled = false);
            document.getElementById("mid") && (document.getElementById("mid").disabled = false);
            document.getElementById("begin") && (document.getElementById("begin").disabled = false);
          }
        });
      }

      // Gestion des clics sur les boutons de notation
      document.querySelectorAll('.rating-button').forEach(function(btn) {
        btn.addEventListener('click', function() {
          // Trouve le numéro de la question à partir de la classe
          const classes = Array.from(btn.classList);
          const questionClass = classes.find(c => c.startsWith('question'));
          const questionNum = questionClass.replace('question', '');
          // Met à jour l'input caché
          document.getElementById('hidden-question' + questionNum).value = btn.dataset.value;

          // Visuel : retire la sélection des autres boutons de la même question
          document.querySelectorAll('.' + questionClass).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    };

    onMounted(() => {
      loadSliderData();
    });

    return {
      end,
      submitSlider
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

.rating-button.selected {
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