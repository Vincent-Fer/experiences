document.addEventListener('DOMContentLoaded', function() {

    function getNumberSession(){
        fetch('/getNumberSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({getNumberSession : 'getNumberSession'})
        })
        .then((response)=>{
            if(response.redirected){
                window.location.href = response.url;
            }else{
                return response.json();
            }
        })
        .then(data => {
            document.getElementById('div_feedback').innerHTML = data.message;
            addEventToFeedback();
        });
    }

    function addEventToFeedback(){
        document.querySelectorAll('.feedbackSession').forEach(element => {
            element.addEventListener('click',function (){
                // Récupérer la valeur du bouton cliqué depuis l'attribut data-value
                sess = element.getAttribute('data-value');
                fetch('/getFeedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({feedback : sess})
                })
                .then((response)=>{
                    if(response.redirected){
                        window.location.href = response.url;
                    }else{
                        return response.json();
                    }
                })
                .then(data => console.log(data))
                .catch(error => {
                    console.error('Erreur:', error);
                });
            })
        })
    }

    class Tutorial {
        constructor() {
            this.steps = [
            {
                target: '#divSes',
                content: "C'est ici que vous pouvez démarrer une nouvelle session, à condition de respecter le temps minimal entre chaque session."
            },
            {
                target: '#divExp',
                content: "C'est ici que vous pouvez retrouver les explications fournies au début de l'expérimenation à tout moment. N'hésitez pas à les consulter si vous avez le moindre doute."
            },
            {
                target: '#div_feedback',
                content: "C'est ici que vous retrouverez tous vos feedbacks reçus depuis le début de l'expérimentation. Chaque nouveau feedback apparaitra le lendemain de votre dernière session."
            }
            ];

            this.currentStep = 0;
            this.init();
        }

        init() {
            this.toggleBtn = document.getElementById('tutorialToggle');
            this.tooltip = document.getElementById('tutorialTooltip');
            this.content = document.getElementById('tutorialContent');

            this.toggleBtn.addEventListener('click', () => this.toggle());
            document.getElementById('closeTutorial').addEventListener('click', () => this.hide());
            document.getElementById('nextStep').addEventListener('click', () => this.next());
            document.getElementById('prevStep').addEventListener('click', () => this.prev());
        }

        toggle() {
            if(this.tooltip.style.display === 'none' || !this.tooltip.style.display) {
            this.show();
            } else {
            this.hide();
            }
        }

        show() {
            this.toggleBtn.textContent = 'Masquer le guide';
            this.tooltip.style.display = 'block';
            this.showStep(0);
        }

        hide() {
            this.toggleBtn.textContent = 'Guide interactif';
            this.tooltip.style.display = 'none';
            document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
            });
        }

        showStep(step) {
            if(this.currentStep >= 0) {
            document.querySelector(this.steps[this.currentStep].target)
                ?.classList.remove('tutorial-highlight');
            }

            this.currentStep = step;
            const {target, content} = this.steps[step];
            const targetEl = document.querySelector(target);

            if(targetEl) {
                targetEl.classList.add('tutorial-highlight');
                this.content.textContent = content;

                const rect = targetEl.getBoundingClientRect();
                if(this.currentStep<2){
                    this.tooltip.style.top = `${rect.top + window.scrollY + 60}px`;
                }else{
                    this.tooltip.style.top = `${rect.top + window.scrollY + 30}px`;
                }
                this.tooltip.style.left = `${rect.left + window.scrollX + rect.width/2 - this.tooltip.offsetWidth/2}px`;

                document.getElementById('stepCounter').textContent = `${step + 1}/${this.steps.length}`;
            }
        }

        next() {
            document.querySelector(this.steps[this.currentStep].target)
            .classList.remove('tutorial-highlight');

            if(this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
            } else {
            this.hide();
            }
        }

        prev() {
            document.querySelector(this.steps[this.currentStep].target)
            .classList.remove('tutorial-highlight');

            if(this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
            }
        }
    }
    // Initialisation
    const tutorial = new Tutorial();

    if (typeof ses !== "undefined" && ses == 0) {
        tutorial.show();
    }

    getNumberSession();
})