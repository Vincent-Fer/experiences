document.addEventListener('DOMContentLoaded', function() {
    // Existing code for the main explanations section
    let currentCase = 0;
    const totalCases = 10;

    // Initialize training cases functionality in code-container
    initTrainingCasesInCodeContainer();

    // Existing variables
    let image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
    let loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
    let zoom = 3;

    let tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
    let recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0);
    let recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0);
    let tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
    let tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
    let countdownElement = document.getElementById('countdownElement' + currentCase.toString());

    // Training Cases Functionality for code-container
    function initTrainingCasesInCodeContainer() {
        const codeContainer = document.getElementById('code-container');
        const nextCaseElement = document.getElementById('nextCase');

        // Add navigation buttons for training cases
        const navContainer = document.createElement('div');
        navContainer.style.display = 'flex';
        navContainer.style.justifyContent = 'space-between';
        navContainer.style.marginTop = '20px';
        navContainer.style.marginBottom = '20px';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Précédent';
        prevBtn.id = 'trainingPrevBtn';
        prevBtn.style.padding = '8px 15px';
        prevBtn.style.backgroundColor = '#4a6fa5';
        prevBtn.style.color = 'white';
        prevBtn.style.border = 'none';
        prevBtn.style.borderRadius = '4px';
        prevBtn.style.cursor = 'pointer';
        prevBtn.disabled = true;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Suivant';
        nextBtn.id = 'trainingNextBtn';
        nextBtn.style.padding = '8px 15px';
        nextBtn.style.backgroundColor = '#4a6fa5';
        nextBtn.style.color = 'white';
        nextBtn.style.border = 'none';
        nextBtn.style.borderRadius = '4px';
        nextBtn.style.cursor = 'pointer';

        const caseCounter = document.createElement('div');
        caseCounter.textContent = 'Cas 1/10';
        caseCounter.style.textAlign = 'center';
        caseCounter.style.margin = '10px 0';
        caseCounter.style.fontWeight = 'bold';

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(caseCounter);
        navContainer.appendChild(nextBtn);

        // Insert navigation before the nextCase paragraph
        nextCaseElement.parentNode.insertBefore(navContainer, nextCaseElement);

        // Add feedback message container
        const feedbackMessage = document.createElement('div');
        feedbackMessage.id = 'trainingFeedbackMessage';
        feedbackMessage.style.marginTop = '15px';
        feedbackMessage.style.padding = '10px';
        feedbackMessage.style.borderRadius = '4px';
        feedbackMessage.style.display = 'none';
        nextCaseElement.parentNode.insertBefore(feedbackMessage, nextCaseElement);

        let currentTrainingCase = 0;
        let trainingCases = [];

        // Load training cases data
        loadTrainingCases();

        // Navigation button event listeners
        prevBtn.addEventListener('click', () => {
            if (currentTrainingCase > 0) {
                currentTrainingCase--;
                showTrainingCase(currentTrainingCase);
                updateNavigationButtons();
                caseCounter.textContent = `Cas ${currentTrainingCase + 1}/10`;
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentTrainingCase < 9) {
                currentTrainingCase++;
                showTrainingCase(currentTrainingCase);
                updateNavigationButtons();
                caseCounter.textContent = `Cas ${currentTrainingCase + 1}/10`;
            }
        });

        // Update button states
        function updateNavigationButtons() {
            prevBtn.disabled = currentTrainingCase === 0;
            nextBtn.disabled = currentTrainingCase === 9;
        }

        // Load training cases from backend
        async function loadTrainingCases() {
            try {
                const response = await fetch('/api/training/cases');
                if (response.ok) {
                    trainingCases = await response.json();
                    showTrainingCase(currentTrainingCase);
                } else {
                    console.error('Failed to load training cases');
                    feedbackMessage.textContent = 'Failed to load training cases';
                    feedbackMessage.className = 'feedback-message incorrect';
                    feedbackMessage.style.display = 'block';
                    feedbackMessage.style.backgroundColor = '#f8d7da';
                    feedbackMessage.style.color = '#721c24';
                    feedbackMessage.style.border = '1px solid #f5c6cb';
                }
            } catch (error) {
                console.error('Error loading training cases:', error);
                feedbackMessage.textContent = 'Error loading training cases';
                feedbackMessage.className = 'feedback-message incorrect';
                feedbackMessage.style.display = 'block';
                feedbackMessage.style.backgroundColor = '#f8d7da';
                feedbackMessage.style.color = '#721c24';
                feedbackMessage.style.border = '1px solid #f5c6cb';
            }
        }

        // Show a specific training case
        async function showTrainingCase(caseId) {
            try {
                const response = await fetch(`/api/training/cases/${caseId}`);
                if (response.ok) {
                    const caseData = await response.json();
                    displayTrainingCase(caseData);
                } else {
                    console.error(`Failed to load training case ${caseId}`);
                }
            } catch (error) {
                console.error(`Error loading training case ${caseId}:`, error);
            }
        }

        // Display a training case in the code-container
        function displayTrainingCase(caseData) {
            // Format the case data for display
            const formattedInfo = formatCaseInfo(caseData);

            // Create the HTML for the training case
            const caseHTML = `
                <div class="training-case-display">
                    <h3 style="margin-bottom: 15px;">${caseData.name} (${caseData.type})</h3>

                    <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
                        <div style="flex: 1; min-width: 300px;">
                            <img src="${caseData.vesselImage}" alt="Navire ${caseData.name}"
                                 style="width: 100%; max-height: 250px; object-fit: contain; border: 1px solid #eee; margin-bottom: 10px;">
                            <p style="text-align: center; font-style: italic;">Image du navire</p>
                        </div>

                        <div style="flex: 1; min-width: 300px;">
                            <img src="${caseData.contextImage}" alt="Contexte ${caseData.name}"
                                 style="width: 100%; max-height: 250px; object-fit: contain; border: 1px solid #eee; margin-bottom: 10px;">
                            <p style="text-align: center; font-style: italic;">Contexte tactique</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        ${formattedInfo}
                    </div>

                    <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
                        <button class="btn-suspect" data-case-id="${caseData.id}" data-decision="suspect"
                                style="padding: 10px 20px; background-color: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Suspect
                        </button>
                        <button class="btn-neutral" data-case-id="${caseData.id}" data-decision="neutral"
                                style="padding: 10px 20px; background-color: #51cf66; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            Neutre
                        </button>
                    </div>
                </div>
            `;

            // Insert the case HTML into the code-container
            codeContainer.innerHTML = caseHTML;

            // Add event listeners to decision buttons
            const suspectBtn = codeContainer.querySelector('.btn-suspect');
            const neutralBtn = codeContainer.querySelector('.btn-neutral');

            if (suspectBtn && neutralBtn) {
                suspectBtn.addEventListener('click', () => handleDecision(caseData, 'suspect'));
                neutralBtn.addEventListener('click', () => handleDecision(caseData, 'neutral'));
            }
        }

        // Format case info for display
        function formatCaseInfo(caseData) {
            // Fields to display and their labels
            const fieldsToDisplay = {
                'vLastAIS': 'Dernière émission AIS',
                'vDistAIS': 'Distance AIS',
                'headAIS': 'Cap AIS',
                'headReal': 'Cap réel',
                'speedAIS': 'Vitesse AIS',
                'speedReal': 'Vitesse réelle',
                'to': 'Destination',
                'from': 'Provenance',
                'nat': 'Nationalité',
                'status': 'Statut',
                'lengthAIS': 'Longueur AIS',
                'lengthReal': 'Longueur réelle',
                'width': 'Largeur',
                'built': 'Année de construction',
                'inMaritimeRoad': 'Sur route maritime',
                'inFishingZone': 'En zone de pêche',
                'inCoastZone': 'En zone côtière',
                'nearOtherVessel': 'Proche d\'un autre navire',
                'protectedZone': 'Zone protégée'
            };

            // Format boolean fields
            const booleanFields = ['inMaritimeRoad', 'inFishingZone', 'inCoastZone', 'nearOtherVessel'];

            // Create a table for the information
            let html = '<table style="width: 100%; border-collapse: collapse;">';

            for (const [key, label] of Object.entries(fieldsToDisplay)) {
                if (caseData[key]) {
                    let value = caseData[key];

                    // Format boolean fields
                    if (booleanFields.includes(key)) {
                        value = value === '1' ? 'Oui' : 'Non';
                    }

                    // Format speed values (remove comma and add unit)
                    if (key === 'speedAIS' || key === 'speedReal') {
                        value = value.replace(',', '.') + ' noeuds';
                    }

                    // Format heading values (add degree symbol)
                    if (key === 'headAIS' || key === 'headReal') {
                        value = value.replace(',', '.') + '°';
                    }

                    // Format length values (add unit)
                    if (key === 'lengthAIS' || key === 'lengthReal' || key === 'width') {
                        value = value.replace(',', '.') + 'm';
                    }

                    // Add table row
                    html += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 8px; width: 40%; font-weight: bold; background-color: #f5f5f5;">${label}</td>
                            <td style="padding: 8px;">${value}</td>
                        </tr>
                    `;
                }
            }

            html += '</table>';
            return html;
        }

        // Handle user decision
        function handleDecision(caseData, decision) {
            const feedbackMessage = document.getElementById('trainingFeedbackMessage');
            const groundTruth = caseData.gt || 'neutre'; // Default to 'neutre' if not specified

            if (decision === groundTruth) {
                feedbackMessage.textContent = 'Bonne décision! Ce navire est bien ' +
                    (decision === 'suspect' ? 'suspect' : 'neutre');
                feedbackMessage.style.backgroundColor = '#d4edda';
                feedbackMessage.style.color = '#155724';
                feedbackMessage.style.border = '1px solid #c3e6cb';
            } else {
                feedbackMessage.textContent = 'Mauvaise décision. Ce navire est ' +
                    (groundTruth === 'suspect' ? 'suspect' : 'neutre');
                feedbackMessage.style.backgroundColor = '#f8d7da';
                feedbackMessage.style.color = '#721c24';
                feedbackMessage.style.border = '1px solid #f5c6cb';
            }

            feedbackMessage.style.display = 'block';
        }
    }

    // Rest of the existing code...
    function showRecommendation() {
        // Existing implementation
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

    // Rest of the existing functions...
    function handleInitialDecision() {
        showRecommendation();
        startRecCountdown();
        setTimeout(() => {
            tdRec.style.display = 'none';
            tdDecFin.style.display = 'block';
            startFinalDecisionCountdown();
        }, 5000);
    }

    // ... (all other existing functions remain unchanged)
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
    let firstCase = true;

    function showChatBubbleWithHalo(elementId, message) {
        const el = document.getElementsByClassName(elementId + currentCase.toString()).item(0);
        if (!el) return;
        document.querySelectorAll('.chat-bubble').forEach(e => e.remove());
        document.querySelectorAll('.halo-effect').forEach(e => e.classList.remove('halo-effect'));
        el.classList.add('halo-effect');

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerText = message;

        const navDiv = document.createElement('div');
        navDiv.className = 'guide-nav-btns';

        const prevBtn = document.createElement('button');
        prevBtn.innerText = 'Précédent';
        prevBtn.onclick = prevExplanation;
        if (currentIndex === 0) prevBtn.disabled = true;

        const nextBtn = document.createElement('button');
        nextBtn.innerText = 'Suivant';
        nextBtn.onclick = nextExplanation;
        if (currentIndex === guideElements.length - 1) nextBtn.disabled = true;

        navDiv.appendChild(prevBtn);
        navDiv.appendChild(nextBtn);
        bubble.appendChild(navDiv);

        document.body.appendChild(bubble);

        const rect = el.getBoundingClientRect();
        let top = rect.top + window.scrollY - bubble.offsetHeight - 12;
        if (top < 0) top = rect.bottom + window.scrollY + 12;
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

    function updateGuideButton() {
        const btn = document.getElementById('startGuideBtn');
        if (!btn) return;
        if (guideActive) {
            btn.innerText = "Fermer le guide";
        } else {
            btn.innerText = "Lancer le guide";
        }
    }

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
        if (typeof onCaseChange === "function") onCaseChange(idx);
    }

    function prevCase() {
        if(iniCountdown) clearInterval(iniCountdown);
        if (finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if (recCountdown) clearInterval(recCountdown);
        if (currentCase>0) currentCase--;
        if (currentCase >= totalCases) {
            currentCase = 0;
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
        if(iniCountdown) clearInterval(iniCountdown);
        if (finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if (recCountdown) clearInterval(recCountdown);
        currentCase++;
        if (currentCase >= totalCases) {
            currentCase = 0;
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

    function createCaseNavButtons() {
        const container = document.getElementById('cases-container');
        if (!container) return;

        const prevBtn = document.createElement('button');
        prevBtn.id = 'casePrevBtn';
        prevBtn.className = 'case-nav-btn';
        prevBtn.innerHTML = '&larr;';
        prevBtn.onclick = prevCase;

        const nextBtn = document.createElement('button');
        nextBtn.id = 'caseNextBtn';
        nextBtn.className = 'case-nav-btn';
        nextBtn.innerHTML = '&rarr;';
        nextBtn.onclick = nextCase;

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

        initialFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newFontSize = 16 / zoomRatio;
        paragraphs = tdAis.querySelectorAll('p')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdSensor.querySelectorAll('p')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdSus.querySelectorAll('p')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        th_vesData = document.getElementsByClassName("th_vesData")
        for (let i = 0; i < th_vesData.length; i++) {
            th_vesData[i].style.fontSize = `${newFontSize}px`;
        }
        paragraphs = tdDecIni.querySelectorAll('button')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecIni.querySelectorAll('span')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecFin.querySelectorAll('button')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdDecFin.querySelectorAll('span')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdRec.querySelectorAll('div')
        paragraphs.forEach(p => {
            p.style.fontSize = `${newFontSize}px`;
        });
        paragraphs = tdRec.querySelectorAll('span')
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

            loupe.style.left = (x - loupeWidth / 2) + 'px';
            loupe.style.top = (y - loupeHeight / 2) + 'px';

            loupe.style.backgroundPosition =
                `-${(x * zoom) - loupeWidth / 2}px -${(y * zoom) - loupeHeight / 2}px`;
        });

        loupe.style.backgroundImage = `url(${image.src})`;
    }

    updateImg();
    createCaseNavButtons();
    showCase(0);
    createStartGuideButton();
    onCaseChange(0);
});