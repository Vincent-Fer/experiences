<template>
  <div class="page-container">
    <h1 class="page-title">Explications</h1>

    <div class="section">
      <h2 class="section-title">Sur la tâche à réaliser</h2>
      <div class="page-content">
        <p>Vous êtes dans un avion de surveillance maritime et votre action consiste à identifier des navires <span style="color: red"> suspect </span> à l'aide des moyens à bord de l'avion.</p>
        <p>
          Vous allez réaliser 7 missions à raison de 2 missions maximum par semaine.<br/>
          Durant chacune de ces missions, votre tâche sera de classifier 30 navires, séparés en 3 ensembles de 10 navires, en vous appuyant sur diverses informations pour déterminer si chaque navire est <span style="color: red">Suspect</span> ou <span style="color: green">Neutre</span>. <br/>
          Vous recevrez une recommandation d'une IA après chacune de vos décisions initiales.
        </p>
        <p class="highlight-box">
          L'IA vous accompagnant utilise les mêmes données que celles à votre disposition.
        </p>
        <p>
          Pour chaque navire :
          <ul>
            <li>vous aurez 30 secondes pour prendre une décision initiale : <span style="color: red">Suspect</span> ou <span style="color: green">Neutre</span>. Si vous ne répondez pas à temps, la décision <span style="color: red">Suspect</span> sera prise par défaut.</li>
            <li>puis une recommandation de l'IA apparaitra pendant 5 secondes indiquant <span style="color: red">Suspect</span> ou <span style="color: green">Neutre</span>;</li>
            <li>puis vous aurez 10 secondes pour prendre une décision finale <span style="color: red">Suspect</span> ou <span style="color: green">Neutre</span>. Si vous ne répondez pas à temps, la décision initiale sera prise par défaut.</li>
          </ul>
          Les informations que vous devrez analyser sont agencées comme suit :
        </p>
        <div v-html="interfaceCode" class="page-image"></div>
        <p>
          Votre mission sera d'aggréger toutes les informations et de voir si le navire à traiter possède des informations non cohérentes menant à la classification <span style="color: red">Suspect</span>.
          <p>
            Toutes vos décisions finales sont enregistrées permettant d'établir un classement entre chaque participant. Ce classement sera accessible dans un feedback qui sera à consulter <span style="font-weight: bold; font-style: italic;">obligatoirement entre chaque session</span>.
          </p>
          <p class="highlight-box">Vous ne pourrez pas commencer de nouvelle session sans avoir consulté préalablement ce feedback.</p>
          <p>
            Les points sont comptabilisés comme suit :
            <ul>
              <li>une bonne décision finale vous fera <span style="font-weight: bold; font-style: italic; color: green">gagner 5 points</span>.</li>
              <li>une mauvaise décision finale vous fera <span style="font-weight: bold; font-style: italic; color: red;">perdre 11 points</span>.</li>
              <li>un temps dépassé dans la décision initiale ou finale vous fera <span style="font-weight: bold; font-style: italic; color: red;">perdre 10 points</span>. Ces <span style="font-weight: bold; font-style: italic; color: red;">10 points perdus</span> se cumuleront avec <span style="font-weight: bold; font-style: italic; color: red;">l'erreur</span> ou <span style="font-weight: bold; font-style: italic; color: green;">la bonne réponse</span> associée à la décision finale.</li>
            </ul>
          </p>
          <p class="highlight-box">
            Faites donc bien attention à répondre dans les temps.
          </p>
        </p>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Sur le feedback inter session</h2>
      <div class="page-content">
        <p>
          Ce feedback devra être obligatoirement lu au moins 1 jour avant la session suivante.
        </p>
        <p>
          Il sera constitué de 6 cas rencontrés pendant la mission précédente plus les différents éléments suivant pour chaque cas:<br/>
          <img :src="elementsFeedbackImage" alt="Elements feedback" class="page-image"/><br/>
          <ul>
            <li>1 - Votre décision initiale.</li>
            <li>2 - La recommandation de l'IA plus son explication.</li>
            <li>3 - Votre décision finale.</li>
            <li>4 - La vérité terrain determinée par des experts.</li>
          </ul>
          Vous pourrez donc vous baser sur ces éléments pour comprendre comment l'IA fonctionne et mieux appréhender son fonctionnement pour la suite de l'expérience.<br/>
          En fin de feedback, vous retrouverez votre classement par rapport au premier de la session et au participant juste devant vous.<br/>
          <img :src="rankingFeedbackImage" alt="Ranking feedback" class="page-image"/><br/>
        </p>
        <form @submit.prevent="goToChoice" class="form-container">
          <button class="page-button" type="submit" id="previousPage">Revenir à la page choix</button>
          <button class="page-button" type="submit" id="previousPage2" style="display: none">Suivant</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

export default {
  name: 'ExplainationsView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();
    const interfaceCode = ref('');
    const elementsFeedbackImage = ref('');
    const rankingFeedbackImage = ref('');
    const showNextButton = ref(false);

    const goToChoice = async () => {
      try {
        const authStore = useAuthStore();
        if (authStore.user) {
          // Mettre à jour le flag hasSeenExplainations sur le serveur
          const response = await axios.post('http://localhost:8080/api/user/update-field', {
            fieldName: 'hasSeenExplainations',
            value: true
          }, {
            withCredentials: true
          });

          if (response.data.success) {
            // Mettre à jour le flag localement
            authStore.user.hasSeenExplainations = true;
            router.push('/choice');
          } else {
            console.error('Failed to update hasSeenExplainations flag');
            router.push('/choice');
          }
        } else {
          router.push('/choice');
        }
      } catch (error) {
        console.error('Error updating hasSeenExplainations flag:', error);
        router.push('/choice');
      }
    };

    const loadExplainationsData = async () => {
      try {
        const response = await gameStore.getExplainationsData();
        if (response.success) {
          interfaceCode.value = response.interfaceCode || '';
          elementsFeedbackImage.value = response.elementsFeedback || '';
          rankingFeedbackImage.value = response.rankingFeedback || '';
          showNextButton.value = response.choice === 1;

          // Show appropriate button
          if (showNextButton.value) {
            document.getElementById('previousPage2').style.display = "block";
          } else {
            document.getElementById('previousPage').style.display = "block";
          }
        } else {
          alert('Erreur lors du chargement des explications: ' + (response.message || 'Veuillez réessayer'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du chargement des explications');
      }
    };

    onMounted(() => {
      loadExplainationsData();
    });

    return {
      interfaceCode,
      elementsFeedbackImage,
      rankingFeedbackImage,
      goToChoice
    };
  }
};
</script>

<style scoped>
@import '../assets/style/global.css';

/* Style spécifique pour les boîtes mises en évidence */
.highlight-box {
  font-weight: bold;
  border: 1px solid #004080;
  padding: 15px;
  text-align: center;
  margin: 20px 0;
  background-color: #f8f9fa;
}
</style>