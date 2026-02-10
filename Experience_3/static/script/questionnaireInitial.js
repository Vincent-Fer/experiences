document.addEventListener('DOMContentLoaded', function() {

    for (let i = 1; i <= 12; i++) {
        const input = document.getElementById('hidden-question' + i);
        if (input) input.value = '';
    }
    // (Optionnel) retire la classe "selected" des boutons
    document.querySelectorAll('.rating-button.selected').forEach(btn => btn.classList.remove('selected'));

    document.getElementById('questionnaireForm')?.addEventListener('submit', function(event) {
        let allAnswered = true;
        for (let i = 1; i <= 12; i++) {
            const val = document.getElementById('hidden-question' + i)?.value;
            if (!val || val.trim() === '') {
                allAnswered = false;
                break;
            }
        }
        if (!allAnswered) {
            event.preventDefault();
            alert("Veuillez répondre à toutes les questions !");
        }
    });

    document.querySelectorAll('.rating-button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Trouve le numéro de la question à partir de la classe (question1, question2, ...)
            const classes = Array.from(btn.classList);
            const questionClass = classes.find(c => c.startsWith('question'));
            const questionNum = questionClass.replace('question', '');
            // Met à jour l'input caché
            document.getElementById('hidden-question' + questionNum).value = btn.dataset.value;

            // (Optionnel) Visuel : retire la sélection des autres boutons de la même question
            document.querySelectorAll('.' + questionClass).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

});