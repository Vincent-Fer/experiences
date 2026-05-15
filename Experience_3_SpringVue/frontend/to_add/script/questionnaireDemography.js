document.addEventListener('DOMContentLoaded', function() {

    // (Optionnel) retire la classe "selected" des boutons
    document.querySelectorAll('.rating-button.selected').forEach(btn => btn.classList.remove('selected'));

    // Gestion de la sélection sur l'échelle de familiarité IA
    const iaRatingButtons = document.querySelectorAll('#ia-familiarite-scale .rating-button');
    const familiariteIaInput = document.getElementById('familiarite-ia-input');
    iaRatingButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            iaRatingButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            familiariteIaInput.value = btn.getAttribute('data-value');
        });
    });

    // Affichage conditionnel de la durée de classification
    const classificationRadios = document.querySelectorAll('input[name="classification"]');
    const dureeClassificationQuestion = document.getElementById('duree-classification-question');
    classificationRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (radio.value === "Oui") {
                dureeClassificationQuestion.classList.remove('hidden');
                dureeClassificationQuestion.querySelector('input').setAttribute('required', 'required');
            } else {
                dureeClassificationQuestion.classList.add('hidden');
                dureeClassificationQuestion.querySelector('input').removeAttribute('required');
                dureeClassificationQuestion.querySelector('input').value = '';
            }
        });
    });

    // Gestion de l'envoi du formulaire
    document.getElementById('demographic-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collecte des données
        const data = Object.fromEntries(new FormData(this).entries());
        // Ici, tu peux envoyer les données via fetch à ton backend Flask si besoin
        // fetch('/votre-endpoint', { ... })
        document.getElementById('demographic-form').submit()
        // Optionnel : reset du formulaire
        this.reset();
    });

});