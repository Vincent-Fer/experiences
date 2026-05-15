<template>
  <div id="case">
    <table id="tab_data">
      <tr id="tr_th">
        <th class="th_vesData" id="th_sus">
          Liste suspects
        </th>
        <th class="th_vesData" id="th_ais">
          Données AIS
        </th>
        <th class="th_vesData" id="th_sens">
          Données capteurs
        </th>
      </tr>
      <tr id="tr_vesData">
        <td class="vesData" id="tdSus">
          <p v-for="(suspect, index) in suspects" :key="index">{{ suspect }}</p>
        </td>
        <td class="vesData" id="tdAis">
          <p><strong>Vitesse</strong> : {{ vesselData.vspeedAIS }}</p>
          <p><strong>Cap</strong> : {{ vesselData.vheadAIS }}</p>
          <p><strong>Longueur</strong> : {{ vesselData.vlengthAIS }}</p>
          <p><strong>Largeur</strong> : {{ vesselData.vwidth }}</p>
          <p><strong>MAJ</strong> : {{ vesselData.vLastAIS }}</p>
          <p><strong>Type</strong> : {{ vesselData.vtype }}</p>
          <p><strong>Nom</strong> : {{ vesselData.vname }}</p>
          <p><strong>Nat</strong> : {{ vesselData.vnat }}</p>
          <p><strong>MMSI</strong> : {{ vesselData.vmmsi }}</p>
          <p><strong>IMO</strong> : {{ vesselData.vimo }}</p>
          <p><strong>De</strong> : {{ vesselData.vfrom }}</p>
          <p><strong>A</strong> : {{ vesselData.vto }}</p>
          <p><strong>Statut</strong> : {{ vesselData.vstatus }}</p>
          <p><strong>Année</strong> : {{ vesselData.vbuilt }}</p>
          <p><strong>Poids</strong> : {{ vesselData.vweight }}</p>
          <p><strong>Tirant</strong> : {{ vesselData.vdraught }}</p>
        </td>
        <td class="vesData" id="tdSensor">
          <p><strong>Vitesse</strong> : {{ vesselData.vspeedReal }}</p>
          <p><strong>Cap</strong> : {{ vesselData.vheadReal }}</p>
          <p><strong>Longueur</strong> : {{ vesselData.vlengthReal }}</p>
          <p><strong>Dist. AIS</strong> : {{ vesselData.vDistAIS }}</p>
          <p><strong>Route maritime</strong> : {{ vesselData.inMaritimeRoad }}</p>
          <p><strong>Zone de pêche</strong> : {{ vesselData.inFishingZone }}</p>
          <p><strong>Zone côtière</strong> : {{ vesselData.inCoastZone }}</p>
          <p><strong>Navire proche</strong> : {{ vesselData.nearOtherVessel }}</p>
          <p><strong>Zone protégée</strong> : {{ vesselData.protectedZone }}</p>
        </td>
      </tr>
      <tr id="tr_ves">
        <td colspan="3" id="td_ves">
          <img id="imgVes" :src="vesselImage" alt="Vessel image"/>
          <div class="loupe" id="loupe"></div>
        </td>
      </tr>
    </table>
    <table id="tab_tac">
      <tr id="tr_tac">
        <td id="td_img_tac">
          <img id="imgTac" :src="tacticalImage" alt="Tactical image"/>
        </td>
      </tr>
      <tr id="tr_dec">
        <td class="td_dec" id="tdDecIni">
          <span class="td_span" id="targetIs">Ce navire est</span>
          <div class="btn_group">
            <button id="butIniSus" class="but_sus" @click="setInitialDecision('suspect')" :class="{'active': initialDecision === 'suspect'}">Suspect</button>
            <button id="butIniNeu" class="but_neu" @click="setInitialDecision('neutral')" :class="{'active': initialDecision === 'neutral'}">Neutre</button>
          </div>
        </td>
        <td class="td_dec" id="tdRec">
          <span class="td_span" id="recIs">Recommandation IA</span>
          <div class="btn_group">
            <div class="but_sus" :class="{'active': aiRecommendation === 'suspect'}">{{ aiRecommendationText }}</div>
            <div class="but_neu" :class="{'active': aiRecommendation === 'neutral'}"></div>
          </div>
        </td>
        <td class="td_dec" id="tdDecFin">
          <span class="td_span" id="finTargetIs">Finalement, ce navire est :</span>
          <div class="btn_group">
            <form id="formFin" @submit.prevent="submitFinalDecision('suspect')">
              <input type="hidden" id="inputFin" name="objectName" value="suspect"/>
              <button id="butFinSus" class="but_sus" type="submit" :class="{'active': finalDecision === 'suspect'}">Suspect</button>
            </form>
            <form @submit.prevent="submitFinalDecision('neutral')">
              <input type="hidden" name="objectName" value="neutral"/>
              <button id="butFinNeu" class="but_neu" type="submit" :class="{'active': finalDecision === 'neutral'}">Neutre</button>
            </form>
          </div>
        </td>
      </tr>
      <tr id="tr_cd">
        <td id="td_countdown">
          <span class="normal" id="countdownElement">{{ countdown }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, onUpdated } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

export default {
  name: 'GameView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();

    // Game data
    const suspects = ref([]);
    const vesselData = ref({});
    const vesselImage = ref('');
    const tacticalImage = ref('');
    const aiRecommendation = ref('');
    const aiRecommendationText = ref('En attente...');
    const countdown = ref('00:00');
    const initialDecision = ref('');
    const finalDecision = ref('');

    // Timer
    let countdownInterval;
    let gameEndTimeout;
    let clicked = false;

    // Fonction utilitaire pour désactiver un bouton
    const disableButton = (btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.disabled = true;
    };

    // Fonction utilitaire pour réactiver un bouton
    const enableButton = (btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.disabled = false;
    };

    // Initialize game
    const initGame = async () => {
      try {
        const response = await gameStore.startGame();
        if (response.success) {
          updateGameData(response.data);
          startCountdown(response.data.timeRemaining);
          // Initialiser la logique dynamique après le chargement des données
          setTimeout(initializeGameLogic, 100);
        } else {
          alert('Erreur lors du démarrage du jeu: ' + (response.message || 'Veuillez réessayer'));
          router.push('/choice');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du démarrage du jeu');
      }
    };

    // Update game data
    const updateGameData = (data) => {
      suspects.value = data.suspects || [];
      vesselData.value = data.vesselData || {};
      vesselImage.value = data.vesselImage || '';
      tacticalImage.value = data.tacticalImage || '';
      aiRecommendation.value = data.aiRecommendation || '';
      aiRecommendationText.value = aiRecommendation.value === 'suspect' ? 'Suspect' : 'Neutre';

      // Reset decisions
      initialDecision.value = '';
      finalDecision.value = '';
      clicked = false;
    };

    // Start countdown
    const startCountdown = (seconds) => {
      clearInterval(countdownInterval);
      clearTimeout(gameEndTimeout);

      let remaining = seconds;
      updateCountdownDisplay(remaining);

      countdownInterval = setInterval(() => {
        remaining--;
        updateCountdownDisplay(remaining);

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          endGame();
        }
      }, 1000);

      gameEndTimeout = setTimeout(endGame, seconds * 1000);
    };

    // Update countdown display
    const updateCountdownDisplay = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      countdown.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Set initial decision
    const setInitialDecision = (decision) => {
      initialDecision.value = decision;
      gameStore.recordInitialDecision(decision);
    };

    // Submit final decision
    const submitFinalDecision = async (decision) => {
      finalDecision.value = decision;
      document.getElementById('inputFin').value = decision;

      try {
        const response = await gameStore.submitFinalDecision(decision);
        if (response.success) {
          if (response.gameOver) {
            router.push('/end-game');
          } else {
            // Load next vessel
            updateGameData(response.data);
            startCountdown(response.data.timeRemaining);
            // Réinitialiser la logique après le chargement des nouvelles données
            setTimeout(initializeGameLogic, 100);
          }
        } else {
          alert('Erreur lors de la soumission de la décision: ' + (response.message || 'Veuillez réessayer'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la soumission de la décision');
      }
    };

    // End game
    const endGame = () => {
      clearInterval(countdownInterval);
      clearTimeout(gameEndTimeout);
      router.push('/end-game');
    };

    // Initialiser la logique dynamique du jeu
    const initializeGameLogic = () => {
      // Réinitialiser les champs cachés
      const inputIni = document.getElementById('inputIni');
      const inputFin = document.getElementById('inputFin');
      if (inputIni) inputIni.value = '';
      if (inputFin) inputFin.value = '';

      // Configuration de la loupe
      const image = document.getElementById('imgVes');
      const loupe = document.getElementById('loupe');
      const zoom = 3; // Facteur de zoom

      if (image && loupe) {
        image.addEventListener('mouseenter', () => {
          loupe.style.display = 'block';
          loupe.style.backgroundImage = `url('${image.src}')`;
          loupe.style.backgroundSize = (image.width * zoom) + 'px ' + (image.height * zoom) + 'px';
        });

        image.addEventListener('mouseleave', () => {
          loupe.style.display = 'none';
        });

        image.addEventListener('mousemove', function(e) {
          const rect = image.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const loupeWidth = loupe.offsetWidth;
          const loupeHeight = loupe.offsetHeight;

          // Positionner la loupe
          loupe.style.left = (x - loupeWidth / 2) + 'px';
          loupe.style.top = (y - loupeHeight / 2) + 'px';

          // Déplacer l'arrière-plan de la loupe pour zoomer
          loupe.style.backgroundPosition =
            `-${(x * zoom) - loupeWidth / 2}px -${(y * zoom) - loupeHeight / 2}px`;
        });

        loupe.style.backgroundImage = `url(${image.src})`;
      }

      // Gestion des boutons de décision initiale
      document.getElementById('butIniNeu')?.addEventListener('click', async function() {
        disableButton('butIniSus');
        disableButton('butIniNeu');

        try {
          const response = await fetch('/click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              objectName: 'neutre'
            })
          });

          const result = await response.json();

          if (!result.success) {
            alert("Le temps est écoulé ou une erreur est survenue.");
            enableButton('butIniSus');
            enableButton('butIniNeu');
          }
        } catch (error) {
          console.error("Erreur lors de la requête :", error);
          enableButton('butIniSus');
          enableButton('butIniNeu');
        }
      });

      document.getElementById('butIniSus')?.addEventListener('click', async function() {
        disableButton('butIniSus');
        disableButton('butIniNeu');

        try {
          const response = await fetch('/click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              objectName: 'suspect'
            })
          });

          const result = await response.json();

          if (!result.success) {
            alert("Le temps est écoulé ou une erreur est survenue.");
            enableButton('butIniSus');
            enableButton('butIniNeu');
          }
        } catch (error) {
          console.error("Erreur lors de la requête :", error);
          enableButton('butIniSus');
          enableButton('butIniNeu');
        }
      });

      // Gestion des boutons de décision finale
      document.getElementById('butFinSus')?.addEventListener('click', function() {
        disableButton('butFinSus');
        disableButton('butFinNeu');
        clicked = true;
        document.getElementById('inputFin').value = 'suspect';
      });

      document.getElementById('butFinNeu')?.addEventListener('click', function() {
        disableButton('butFinSus');
        disableButton('butFinNeu');
        clicked = true;
        document.getElementById('inputFin').value = 'neutre';
      });

      // Empêcher le défilement avec la molette
      document.addEventListener('wheel', function(e) {
        e.preventDefault();
      }, { passive: false });

      // Ajuster la mise en page
      adjustLayout();

      // Démarrer le polling du timer
      pollTimer();
    };

    // Fonction de polling pour le timer
    const pollTimer = () => {
      fetch('/get_timer')
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            document.getElementById('countdownElement').innerHTML = "Erreur";
            return;
          }

          // Mettre à jour le timer
          document.getElementById('countdownElement').innerHTML = data.countdown;
          document.getElementById('countdownElement').className = data.class;

          // Gérer les transitions de phase
          if (data.phase == 'initial') {
            if (data.countdown <= 0) {
              disableButton('butIniSus');
              disableButton('butIniNeu');
              fetch('/click', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  objectName: 'none'
                }),
              });
            }
          } else if (data.phase == 'ai') {
            document.getElementById('tdDecIni').style.display = 'none';
            document.getElementById('tdRec').style.display = 'block';

            if (data.recIA == 'suspect') {
              document.getElementById('recNeu').style.display = 'none';
              document.getElementById('recSus').style.display = 'inline-flex';
            } else if (data.recIA == 'neutre') {
              document.getElementById('recSus').style.display = 'none';
              document.getElementById('recNeu').style.display = 'inline-flex';
            }

            if (data.countdown <= 0) {
              fetch('/click', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  objectName: 'recIA'
                })
              });
            }
          } else if (data.phase == 'final') {
            document.getElementById('tdDecIni').style.display = 'none';
            document.getElementById('tdRec').style.display = 'none';
            document.getElementById('tdDecFin').style.display = 'block';

            if (data.countdown <= 0 && clicked == false) {
              disableButton('butFinSus');
              disableButton('butFinNeu');
              document.getElementById('inputFin').value = 'none';
              const form = document.getElementById("formFin");
              const data = new FormData(form);

              fetch(form.action, {
                method: "POST",
                body: data,
                credentials: "same-origin"
              })
              .then(response => response.json())
              .then(data => {
                if (data.redirect_url) {
                  window.location.href = data.redirect_url;
                }
              })
              .catch(error => {
                console.error("Erreur lors de la soumission :", error);
              });
            }
          }
        })
        .catch(err => {
          document.getElementById('countdownElement').innerHTML = "Erreur";
          console.error("Erreur timer:", err);
        })
        .finally(() => {
          setTimeout(pollTimer, 1000);
        });
    };

    // Ajuster la mise en page en fonction du zoom
    const adjustLayout = () => {
      const currentZoom = window.devicePixelRatio;
      const zoomRatio = currentZoom / 1;
      const initialFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const newFontSize = initialFontSize / zoomRatio;

      const elementsToAdjust = [
        'tdAis', 'tdSensor', 'tdSus', 'tr_th', 'butIniSus', 'butIniNeu',
        'recSus', 'recNeu', 'butFinSus', 'butFinNeu', 'tdDecIni',
        'countdownElement', 'targetIs', 'recIs', 'finTargetIs'
      ];

      elementsToAdjust.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.fontSize = `${newFontSize}px`;
      });
    };

    // Cleanup
    onUnmounted(() => {
      clearInterval(countdownInterval);
      clearTimeout(gameEndTimeout);
      // Supprimer les écouteurs d'événements
      document.removeEventListener('wheel', function(e) {
        e.preventDefault();
      });
    });

    // Réinitialiser la logique quand les données changent
    onUpdated(() => {
      if (vesselImage.value) {
        setTimeout(initializeGameLogic, 100);
      }
    });

    // Initialize on mount
    onMounted(() => {
      initGame();
    });

    return {
      suspects,
      vesselData,
      vesselImage,
      tacticalImage,
      aiRecommendation,
      aiRecommendationText,
      countdown,
      initialDecision,
      finalDecision,
      setInitialDecision,
      submitFinalDecision
    };
  }
};
</script>

<style scoped>
@import '../assets/style/game.css';
</style>