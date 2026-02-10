document.addEventListener('DOMContentLoaded', function() {
    let currentCase = 0;

    const totalCases = 10;

    let image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
    let loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
    let zoom = 3; // Facteur de zoom de la loupe

    let tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
    let recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0);
    let recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0);
    let tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
    let tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
    let countdownElement = document.getElementById('countdownElement' + currentCase.toString());

    // Affiche la recommandation IA pendant 5 secondes
    function showRecommendation() {
        tdDecIni.style.display = 'none';

        if(currentCase==0){
            recIA = recIA0
        }else if(currentCase==1){
            recIA = recIA1
        }else if(currentCase==2){
            recIA = recIA2
        }else if(currentCase==3){
            recIA = recIA3
        }else if(currentCase==4){
            recIA = recIA4
        }else if(currentCase==5){
            recIA = recIA5
        }else if(currentCase==6){
            recIA = recIA6
        }else if(currentCase==7){
            recIA = recIA7
        }else if(currentCase==8){
            recIA = recIA8
        }else if(currentCase==9){
            recIA = recIA9
        }

        console.log(recIA)

        if (recIA == "neutre"){
            recSus.style.display = 'none';
            recNeu.style.display = 'inline-flex';
        }else if(recIA == "suspect"){
            recSus.style.display = 'inline-flex';
            recNeu.style.display = 'none';
        }
        tdRec.style.display = 'block';
    }

    // Gère le clic sur les boutons de décision initiale
    function handleInitialDecision() {
        // Affiche la recommandation IA associée
        showRecommendation();
        startRecCountdown();
        // Affiche la recommandation pendant 5 secondes
        setTimeout(() => {
            tdRec.style.display = 'none';
            tdDecFin.style.display = 'block';
            startFinalDecisionCountdown();
        }, 5000);
    }

    // Compte à rebours pour la décision finale
    let finalDecisionTimeout = null;
    function startFinalDecisionCountdown() {
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 10;

        countdownElement.textContent = `${timeLeft}`;

        finalDecisionTimeout = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = `${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(finalDecisionTimeout);
                nextCase();
            }
        }, 1000);
    }

    let recCountdown = null;
    function startRecCountdown() {
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 5;
        countdownElement.textContent = `${timeLeft}`;

        recCountdown = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = `${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(recCountdown);
            }
        }, 1000);
    }

    let iniCountdown = null;
    function startInitDecisionCountdown(){
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 30;
        countdownElement.textContent = `${timeLeft}`;

        iniCountdown = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = `${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(iniCountdown);
                handleInitialDecision();
            }
        }, 1000);
    }

    // Ajout des écouteurs d'événements pour les boutons décision finale
    document.querySelectorAll("#butIniSus").forEach(e => {
        e.addEventListener('click', () => handleInitialDecision());
    });

    document.querySelectorAll("#butIniNeu").forEach(e => {
        e.addEventListener('click', () => handleInitialDecision());
    });

    document.querySelectorAll("#butFinSus").forEach(e => {
        e.addEventListener('click', () => nextCase());
    });

    document.querySelectorAll("#butFinNeu").forEach(e => {
        e.addEventListener('click', () => nextCase());
    });

        // Liste des éléments à expliquer dans l'ordre
    const guideElements = ['tdSus', 'tdAis', 'tdSensor', 'imgVes', 'imgTac', 'tdDecIni'];
    const explanations = {
        'tdSus': "1 - Liste des navires suspects potentiels. Si le navire traité est dans cette liste, il est suspect par défaut.",
        'tdAis': "2 - Données AIS fournies par le navire actuellement traité.",
        'tdSensor': "3 - Données captées par les senseurs et traitées par les systèmes embarqués dans l'avion.",
        'imgVes': "4 - Image du navire traité, permettant de vérifier nom, type, taille estimée… (zoom possible).",
        'imgTac': "5 - Vue tactique centrée sur le navire traité, pour contextualiser les autres données.",
        'tdDecIni': "6 - Emplacement des boutons pour la décision initiale, la recommandation IA (sans explication) et pour la décision finale. Cliquez sur un des boutons pour commencer le tutoriel de 6 images.",
    };
    let currentIndex = 0;
    let guideActive = false;
    let firstCase = true; // Pour savoir si on est sur le premier cas

    function showChatBubbleWithHalo(elementId, message) {
        const el = document.getElementsByClassName(elementId + currentCase.toString()).item(0);
        if (!el) return;
        // Supprime bulle et halo existants
        document.querySelectorAll('.chat-bubble').forEach(e => e.remove());
        document.querySelectorAll('.halo-effect').forEach(e => e.classList.remove('halo-effect'));
        el.classList.add('halo-effect');

        // Crée la bulle
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerText = message;

        // Ajoute les boutons navigation sous le texte
        const navDiv = document.createElement('div');
        navDiv.className = 'guide-nav-btns';

        // Bouton précédent
        const prevBtn = document.createElement('button');
        prevBtn.innerText = 'Précédent';
        prevBtn.onclick = prevExplanation;
        if (currentIndex === 0) prevBtn.disabled = true;

        // Bouton suivant
        const nextBtn = document.createElement('button');
        nextBtn.innerText = 'Suivant';
        nextBtn.onclick = nextExplanation;
        if (currentIndex === guideElements.length - 1) nextBtn.disabled = true;

        navDiv.appendChild(prevBtn);
        navDiv.appendChild(nextBtn);
        bubble.appendChild(navDiv);

        document.body.appendChild(bubble);

        // Positionne la bulle au-dessus de l'élément
        const rect = el.getBoundingClientRect();
        let top = rect.top + window.scrollY - bubble.offsetHeight - 12;
        if (top < 0) top = rect.bottom + window.scrollY + 12; // Si trop haut, la placer en dessous
        if (currentIndex == 0) top = rect.top + window.scrollY - bubble.offsetHeight + 500;
        if (currentIndex == 1) top = rect.top + window.scrollY - bubble.offsetHeight + 500;
        if (currentIndex == 2) top = rect.top + window.scrollY - bubble.offsetHeight + 500;
        if (currentIndex == 4) top = rect.top + window.scrollY - bubble.offsetHeight + 150;
        bubble.style.top = top + 'px';
        bubble.style.left = (rect.left + window.scrollX) + 'px';
        if (currentIndex == 4) bubble.style.left = (rect.left + window.scrollX + 20) + 'px';
        if (currentIndex == 5) bubble.style.left = (rect.left + window.scrollX + 175) + 'px';
        bubble.style.zIndex = 1000;
    }

    function showCurrentExplanation() {
        if (!guideActive) return;
        const id = guideElements[currentIndex];
        const message = explanations[id];
        showChatBubbleWithHalo(id, message);
    }

    function nextExplanation() {
        if (!guideActive) return;
        if (currentIndex < guideElements.length - 1) {
            currentIndex++;
            showCurrentExplanation();
        }
    }

    function prevExplanation() {
        if (!guideActive) return;
        if (currentIndex > 0) {
            currentIndex--;
            showCurrentExplanation();
        }
    }

    function startGuide() {
        guideActive = true;
        currentIndex = 0;
        showCurrentExplanation();
        updateGuideButton();
    }

    function stopGuide() {
        guideActive = false;
        document.querySelectorAll('.chat-bubble').forEach(e => e.remove());
        document.querySelectorAll('.halo-effect').forEach(e => e.classList.remove('halo-effect'));
        updateGuideButton();
    }

    // Gère le texte du bouton flottant selon le contexte
    function updateGuideButton() {
        const btn = document.getElementById('startGuideBtn');
        if (!btn) return;
        if (guideActive) {
            btn.innerText = "Fermer le guide";
        } else {
            btn.innerText = "Lancer le guide";
        }
    }

    // Bouton de lancement/fermeture du guide en bas à droite
    function createStartGuideButton() {
        if (document.getElementById('startGuideBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'startGuideBtn';
        btn.onclick = () => {
            if (guideActive) {
            stopGuide();
            } else {
            startGuide();
            }
        };
        document.body.appendChild(btn);
        updateGuideButton();
    }

    // À appeler lors du changement de cas (ex : onCaseChange(0) pour le premier cas)
    function onCaseChange(caseIndex) {
        if (caseIndex === 0 && ses==0) {
            firstCase = true;
            guideActive = true;
            currentIndex = 0;
            showCurrentExplanation();
            updateGuideButton();
        } else {
            firstCase = false;
            stopGuide();
        }
    }

    function showCase(idx) {
        for (let i = 0; i < totalCases; i++) {
            const div = document.getElementById('case' + i);
            if (div) div.style.display = (i === idx) ? '' : 'none';
        }
        currentCase = idx;
        updateCaseNavButtons();
        // Ici, tu peux aussi arrêter ou relancer le guide interactif selon le cas affiché :
        if (typeof onCaseChange === "function") onCaseChange(idx);
    }

    function prevCase() {
        // Nettoyage
        if(iniCountdown) clearInterval(iniCountdown);
        if (finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if (recCountdown) clearInterval(recCountdown);
        if (currentCase>0) currentCase--;
        if (currentCase >= totalCases) {
            currentCase = 0; // ou gérer différemment si besoin
            prevCase = document.getElementById("case" + (totalCases - 1).toString());
        }else if(currentCase >= 0){
            prevCase = document.getElementById("case" + (currentCase + 1).toString())
        }

        caseToPrint = document.getElementById("case" + currentCase.toString())
        prevCase.style.display  = "none"
        caseToPrint.style.display  = "block"
        startInitDecisionCountdown();
        tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0)
        recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0)
        recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0)
        tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0)
        tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0)
        countdownElement = document.getElementById('countdownElement' + currentCase.toString())
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        updateImg();
        tdDecIni.style.display = "block"
        tdRec.style.display = "none"
        tdDecFin.style.display = "none"
        firstCase = false;
        stopGuide();
        adjustLayout();
        updateCaseNavButtons();
    }

    function nextCase() {
        // Nettoyage
        if(iniCountdown) clearInterval(iniCountdown);
        if (finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if (recCountdown) clearInterval(recCountdown);
        currentCase++;
        if (currentCase >= totalCases) {
            currentCase = 0; // ou gérer différemment si besoin
            prevCase = document.getElementById("case" + (totalCases - 1).toString());
        }else{
            prevCase = document.getElementById("case" + (currentCase - 1).toString())
        }

        caseToPrint = document.getElementById("case" + currentCase.toString())
        prevCase.style.display  = "none"
        caseToPrint.style.display  = "block"
        startInitDecisionCountdown();
        tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0)
        recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0)
        recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0)
        tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0)
        tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0)
        countdownElement = document.getElementById('countdownElement' + currentCase.toString())
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        updateImg();
        tdDecIni.style.display = "block"
        tdRec.style.display = "none"
        tdDecFin.style.display = "none"
        firstCase = false;
        stopGuide();
        adjustLayout();
        updateCaseNavButtons();
    }

    function updateCaseNavButtons() {
        const prevBtn = document.getElementById('casePrevBtn');
        const nextBtn = document.getElementById('caseNextBtn');
        prevBtn.disabled = (currentCase === 0);
        nextBtn.disabled = (currentCase === totalCases - 1);

    }

    // Création dynamique des boutons et insertion dans le DOM
    function createCaseNavButtons() {
        const container = document.getElementById('cases-container');
        if (!container) return;

        // Bouton précédent
        const prevBtn = document.createElement('button');
        prevBtn.id = 'casePrevBtn';
        prevBtn.className = 'case-nav-btn';
        prevBtn.innerHTML = '&larr;';
        prevBtn.onclick = prevCase;

        // Bouton suivant
        const nextBtn = document.createElement('button');
        nextBtn.id = 'caseNextBtn';
        nextBtn.className = 'case-nav-btn';
        nextBtn.innerHTML = '&rarr;';
        nextBtn.onclick = nextCase;

        // Ajoute les boutons autour des cases
        container.insertBefore(prevBtn, container.firstChild);
        container.appendChild(nextBtn);

        updateCaseNavButtons();
    }

    window.addEventListener('resize', adjustLayout);

    function adjustLayout() {
        const currentZoom = window.devicePixelRatio;
        const zoomRatio = currentZoom / 1;
        tdAis = document.getElementsByClassName('tdAis' + currentCase.toString()).item(0);
        tdSensor = document.getElementsByClassName('tdSensor' + currentCase.toString()).item(0);
        tdSus = document.getElementsByClassName('tdSus' + currentCase.toString()).item(0);
        tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
        tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
        tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
        // const width = window.innerWidth;
        // const height = window.innerHeight;

        initialFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newFontSize = 16 / zoomRatio;
        paragraphs = tdAis.querySelectorAll('p')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdSensor.querySelectorAll('p')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdSus.querySelectorAll('p')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        th_vesData = document.getElementsByClassName("th_vesData")
        for (let i = 0; i < th_vesData.length; i++) {
            th_vesData[i].style.fontSize = `${newFontSize}px`;
        }
        paragraphs = tdDecIni.querySelectorAll('button')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecIni.querySelectorAll('span')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecFin.querySelectorAll('button')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecFin.querySelectorAll('span')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdRec.querySelectorAll('div')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdRec.querySelectorAll('span')
        // Applique la nouvelle taille à chaque <p>
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
    }

    function updateImg() {
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        image.addEventListener('mouseenter', () => {
            loupe.style.display = 'block';
            loupe.style.backgroundImage = `url('${image.src}')`;
            loupe.style.backgroundSize = (image.width * zoom) + 'px ' + (image.height * zoom) + 'px';
        });

        image.addEventListener('mouseleave', () => {
            loupe.style.display = 'none';
        });

        image.addEventListener('mousemove', function(event) {
            const rect = image.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

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

    updateImg();
    createCaseNavButtons();
    showCase(0); // Affiche le premier cas au chargement
    createStartGuideButton();
    // Lance le guide automatiquement sur le premier cas
    onCaseChange(0);
});