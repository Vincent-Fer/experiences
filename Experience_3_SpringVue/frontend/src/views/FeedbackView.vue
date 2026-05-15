<template>
  <div id="feedback-container">
    <!-- Le contenu sera injecté dynamiquement ici -->
  </div>
</template>

<script>
import { ref, onMounted, onUpdated } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

export default {
  name: 'FeedbackView',
  setup() {
    const router = useRouter();
    const gameStore = useGameStore();
    const feedbackContent = ref('');
    let current = 0;
    let contextes = [];

    const loadFeedback = async () => {
      try {
        const response = await gameStore.getFeedback();
        if (response.success) {
          const container = document.getElementById('feedback-container');
          if (container) {
            container.innerHTML = response.feedback || '';
          }
          // Initialiser la logique après que le contenu soit chargé
          setTimeout(initializeFeedbackLogic, 100);
        } else {
          alert('Erreur lors du chargement du feedback: ' + (response.message || 'Veuillez réessayer'));
          router.push('/choice');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du chargement du feedback');
        router.push('/choice');
      }
    };

    const initializeFeedbackLogic = () => {
      // Initialiser les variables
      contextes = document.querySelectorAll('.contexte');
      if (contextes.length === 0) return;

      // Fonction pour mettre à jour les boutons
      const updateButtons = () => {
        contextes.forEach((ctx, index) => {
          const prevBtn = ctx.querySelector('.btn-prev');
          const nextBtn = ctx.querySelector('.btn-next');
          const form1 = ctx.querySelector('.myForm1');
          const form2 = ctx.querySelector('.myForm2');

          if (prevBtn) prevBtn.style.display = current > 0 ? 'block' : 'none';
          if (nextBtn) nextBtn.style.display = current < contextes.length - 1 ? 'block' : 'none';

          if (current === 0) {
            if (form1) form1.style.display = 'block';
            if (form2) form2.style.display = 'none';
          } else if (current < (contextes.length - 1)) {
            if (form1) form1.style.display = 'none';
            if (form2) form2.style.display = 'none';
          } else {
            if (form1) form1.style.display = 'none';
            if (form2) form2.style.display = 'block';
          }

          // Configuration de la loupe pour les images
          ctx.querySelectorAll('.imgVes').forEach(image => {
            const container = image.parentElement;
            let loupe = container.querySelector('.loupe');

            if (!loupe) {
              loupe = document.createElement('div');
              loupe.className = 'loupe';
              container.appendChild(loupe);
            }

            image.addEventListener('mouseenter', () => {
              loupe.style.display = 'block';
              loupe.style.backgroundImage = `url('${image.src}')`;
              loupe.style.backgroundSize = (image.width * 3) + 'px ' + (image.height * 3) + 'px';
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

              // Positionner la loupe dans le container
              loupe.style.left = (x - loupeWidth / 2) + "px";
              loupe.style.top = (y - loupeHeight / 2) + "px";

              // Déplacer l'arrière-plan de la loupe pour zoomer
              loupe.style.backgroundPosition =
                `-${(x * 3) - loupeWidth / 2}px -${(y * 3) - loupeHeight / 2}px`;
            });
          });
        });
      };

      // Fonction pour afficher un contexte spécifique
      const showContexte = (index) => {
        contextes.forEach(ctx => ctx.classList.remove('active'));
        contextes[index].classList.add('active');
        if (index === contextes.length - 1) {
          contextes[index].style.display = "flex";
        } else {
          contextes[contextes.length - 1].style.display = "none";
        }
        current = index;
        updateButtons();
      };

      // Configuration des boutons next et prev
      document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
          if (current < contextes.length - 1) {
            showContexte(current + 1);
            // Envoyer une requête pour passer au feedback suivant
            fetch('/nextFeedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                objectName: 'next'
              }),
            });
          }
        });
      });

      document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
          if (current > 0) {
            showContexte(current - 1);
            // Envoyer une requête pour revenir au feedback précédent
            fetch('/prevFeedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                objectName: 'prev'
              }),
            });
          }
        });
      });

      // Empêcher le défilement avec la molette
      document.addEventListener('wheel', function(e) {
        e.preventDefault();
      }, { passive: false });

      // Initialisation
      showContexte(0);
    };

    onMounted(() => {
      loadFeedback();
    });

    onUpdated(() => {
      // Réinitialiser la logique si le contenu change
      const container = document.getElementById('feedback-container');
      if (container && container.innerHTML) {
        setTimeout(initializeFeedbackLogic, 100);
      }
    });

    return {
      feedbackContent
    };
  }
};
</script>

<style>
/* Import styles for feedback */
@import '../assets/style/game.css';
@import '../assets/style/feedback.css';

/* Style pour la loupe */
.loupe {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 3px solid #000;
  border-radius: 50%;
  background-repeat: no-repeat;
  display: none;
  pointer-events: none;
  z-index: 100;
}
</style>