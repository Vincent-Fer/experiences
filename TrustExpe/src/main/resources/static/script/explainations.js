document.addEventListener('DOMContentLoaded', function() {
    // Existing code for the main explanations section
    let currentCase = 0;
    const totalCases = 10;

    // Initialize training cases functionality in code-container
    initTrainingCasesInCodeContainer();

    // Existing variables - these are for the game page
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

        if (!codeContainer || !nextCaseElement) {
            return;
        }

        // Add case counter
        const caseCounter = document.createElement('div');
        caseCounter.id = 'trainingCaseCounter';
        caseCounter.textContent = 'Cas 1/10';
        caseCounter.style.textAlign = 'center';
        caseCounter.style.margin = '10px 0';
        caseCounter.style.fontWeight = 'bold';
        caseCounter.style.fontSize = '18px';

        // Add phase indicator
        const phaseIndicator = document.createElement('div');
        phaseIndicator.id = 'trainingPhaseIndicator';
        phaseIndicator.textContent = 'Phase: Decision initiale - 10 secondes';
        phaseIndicator.style.textAlign = 'center';
        phaseIndicator.style.margin = '5px 0';
        phaseIndicator.style.fontStyle = 'italic';
        phaseIndicator.style.fontSize = '14px';

        // Add feedback message container - position it below the interface
        const feedbackMessage = document.createElement('div');
        feedbackMessage.id = 'trainingFeedbackMessage';
        feedbackMessage.style.margin = '15px auto 15px auto';
        feedbackMessage.style.padding = '15px';
        feedbackMessage.style.borderRadius = '4px';
        feedbackMessage.style.display = 'none';
        feedbackMessage.style.width = '80vw';
        feedbackMessage.style.fontSize = '16px';
        feedbackMessage.style.fontWeight = 'bold';
        feedbackMessage.style.zIndex = '200';
        feedbackMessage.style.position = 'relative';

        // Insert elements before the nextCase paragraph
        nextCaseElement.parentNode.insertBefore(feedbackMessage, nextCaseElement);
        nextCaseElement.parentNode.insertBefore(phaseIndicator, nextCaseElement);
        nextCaseElement.parentNode.insertBefore(caseCounter, nextCaseElement);

        // State variables
        let currentTrainingCase = 0;
        let trainingCases = [];
        let initialDecision = null;
        let finalDecision = null;
        let initialCountdown = null;
        let recommendationCountdown = null;
        let finalDecisionCountdown = null;

        // Load training cases
        async function loadTrainingCases() {
            try {
                const response = await fetch('/api/training/cases');
                if (response.ok) {
                    trainingCases = await response.json();
                    startTrainingSession();
                } else {
                    console.error('Failed to load training cases');
                    feedbackMessage.textContent = 'Echec du chargement des cas';
                    feedbackMessage.style.backgroundColor = '#f8d7da';
                    feedbackMessage.style.color = '#721c24';
                    feedbackMessage.style.border = '1px solid #f5c6cb';
                    feedbackMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error loading training cases:', error);
                feedbackMessage.textContent = 'Erreur de chargement';
                feedbackMessage.style.backgroundColor = '#f8d7da';
                feedbackMessage.style.color = '#721c24';
                feedbackMessage.style.border = '1px solid #f5c6cb';
                feedbackMessage.style.display = 'block';
            }
        }

        function startTrainingSession() {
            currentTrainingCase = 0;
            showTrainingCase(currentTrainingCase);
        }

        async function showTrainingCase(caseId) {
            try {
                const response = await fetch(`/api/training/cases/${caseId}`);
                if (response.ok) {
                    const caseData = await response.json();
                    displayTrainingCase(caseData);
                }
            } catch (error) {
                console.error(`Error loading case ${caseId}:`, error);
            }
        }

        function displayTrainingCase(caseData) {
            clearAllTimeouts();
            initialDecision = null;
            finalDecision = null;

            caseCounter.textContent = `Cas ${currentTrainingCase + 1}/10`;
            phaseIndicator.textContent = 'Phase: Decision initiale - 10 secondes';
            feedbackMessage.style.display = 'none';

            // Format the case data for the original structure
            const caseHTML = generateOriginalStyleHTML(caseData);

            codeContainer.innerHTML = caseHTML;

            // Update the countdown element for this case
            const countdownEl = document.getElementById('countdownElement' + currentTrainingCase);
            if (countdownEl) {
                countdownEl.textContent = '10';
            }

            // Get elements for this case
            const tdDecIniEl = document.getElementsByClassName('td_ini' + currentTrainingCase).item(0);
            const recSusEl = document.getElementsByClassName('recSus' + currentTrainingCase).item(0);
            const recNeuEl = document.getElementsByClassName('recNeu' + currentTrainingCase).item(0);
            const tdRecEl = document.getElementsByClassName('td_rec' + currentTrainingCase).item(0);
            const tdDecFinEl = document.getElementsByClassName('td_fin' + currentTrainingCase).item(0);
            const countdownElementEl = document.getElementById('countdownElement' + currentTrainingCase);
            const imageEl = document.getElementsByClassName('imgVes' + currentTrainingCase).item(0);
            const loupeEl = document.getElementsByClassName('loupe' + currentTrainingCase).item(0);
            
            // Center the interface container
            const interfaceDiv = codeContainer.querySelector('#interface');
            if (interfaceDiv) {
                interfaceDiv.style.margin = '0 auto';
                interfaceDiv.style.width = '100vw';
            }

            // Set up image and loupe
            if (imageEl && loupeEl) {
                imageEl.src = caseData.vesselImage;
                imageEl.addEventListener('mouseenter', () => {
                    loupeEl.style.display = 'block';
                    loupeEl.style.backgroundImage = `url('${imageEl.src}')`;
                    loupeEl.style.backgroundSize = (imageEl.width * zoom) + 'px ' + (imageEl.height * zoom) + 'px';
                });
                imageEl.addEventListener('mouseleave', () => loupeEl.style.display = 'none');
                imageEl.addEventListener('mousemove', function(event) {
                    const rect = imageEl.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;
                    const loupeWidth = loupeEl.offsetWidth;
                    const loupeHeight = loupeEl.offsetHeight;
                    loupeEl.style.left = (x - loupeWidth / 2) + 'px';
                    loupeEl.style.top = (y - loupeHeight / 2) + 'px';
                    loupeEl.style.backgroundPosition = `-${(x * zoom) - loupeWidth / 2}px -${(y * zoom) - loupeHeight / 2}px`;
                });
                loupeEl.style.backgroundImage = `url(${imageEl.src})`;
            }

            // Set up tactic image
            const imgTacEl = document.getElementsByClassName('imgTac' + currentTrainingCase).item(0);
            if (imgTacEl) {
                imgTacEl.src = caseData.contextImage;
            }

            // Set up event listeners for decision buttons
            const butIniSus = document.getElementById('butIniSus' + currentTrainingCase);
            const butIniNeu = document.getElementById('butIniNeu' + currentTrainingCase);
            const butFinSus = document.getElementById('butFinSus' + currentTrainingCase);
            const butFinNeu = document.getElementById('butFinNeu' + currentTrainingCase);

            if (butIniSus) butIniSus.addEventListener('click', () => handleInitialDecision('suspect'));
            if (butIniNeu) butIniNeu.addEventListener('click', () => handleInitialDecision('neutral'));
            if (butFinSus) butFinSus.addEventListener('click', () => handleFinalDecision('suspect'));
            if (butFinNeu) butFinNeu.addEventListener('click', () => handleFinalDecision('neutral'));

            // Store references for timer functions
            tdDecIni = tdDecIniEl;
            recSus = recSusEl;
            recNeu = recNeuEl;
            tdRec = tdRecEl;
            tdDecFin = tdDecFinEl;
            countdownElement = countdownElementEl;
            image = imageEl;
            loupe = loupeEl;

            // Start the initial decision countdown (10 seconds)
            startInitialDecisionCountdown();
        }

        function clearAllTimeouts() {
            if (initialCountdown) clearInterval(initialCountdown);
            if (recommendationCountdown) clearInterval(recommendationCountdown);
            if (finalDecisionCountdown) clearInterval(finalDecisionCountdown);
            initialCountdown = null;
            recommendationCountdown = null;
            finalDecisionCountdown = null;
        }

        function startInitialDecisionCountdown() {
            clearAllTimeouts();

            phaseIndicator.textContent = 'Phase: Decision initiale - 10 secondes';

            if (tdDecIni) tdDecIni.style.display = 'block';
            if (tdRec) tdRec.style.display = 'none';
            if (tdDecFin) tdDecFin.style.display = 'none';

            let timeLeft = 10;
            if (countdownElement) countdownElement.textContent = `${timeLeft}`;

            initialCountdown = setInterval(() => {
                timeLeft--;
                if (countdownElement) countdownElement.textContent = `${timeLeft}`;
                if (timeLeft <= 0) {
                    clearInterval(initialCountdown);
                    initialCountdown = null;
                    if (initialDecision === null) handleInitialDecision('suspect');
                }
            }, 1000);
        }

        function handleInitialDecision(decision) {
            initialDecision = decision;

            const currentCase = trainingCases[currentTrainingCase];
            const recIA = currentCase ? currentCase.recIA : 'neutre';

            phaseIndicator.textContent = 'Phase: Recommandation IA - 5 secondes';

            if (tdDecIni) tdDecIni.style.display = 'none';
            if (tdRec) tdRec.style.display = 'block';
            if (tdDecFin) tdDecFin.style.display = 'none';

            // Show AI recommendation
            if (recIA === 'suspect') {
                if (recSus) recSus.style.display = 'inline-flex';
                if (recNeu) recNeu.style.display = 'none';
            } else {
                if (recSus) recSus.style.display = 'none';
                if (recNeu) recNeu.style.display = 'inline-flex';
            }

            let timeLeft = 5;
            if (countdownElement) countdownElement.textContent = `${timeLeft}`;

            recommendationCountdown = setInterval(() => {
                timeLeft--;
                if (countdownElement) countdownElement.textContent = `${timeLeft}`;
                if (timeLeft <= 0) {
                    clearInterval(recommendationCountdown);
                    recommendationCountdown = null;
                    startFinalDecisionPhase();
                }
            }, 1000);
        }

        function startFinalDecisionPhase() {
            phaseIndicator.textContent = 'Phase: Decision finale - 10 secondes';

            if (tdDecIni) tdDecIni.style.display = 'none';
            if (tdRec) tdRec.style.display = 'none';
            if (tdDecFin) tdDecFin.style.display = 'block';

            let timeLeft = 10;
            if (countdownElement) countdownElement.textContent = `${timeLeft}`;

            finalDecisionCountdown = setInterval(() => {
                timeLeft--;
                if (countdownElement) countdownElement.textContent = `${timeLeft}`;
                if (timeLeft <= 0) {
                    clearInterval(finalDecisionCountdown);
                    finalDecisionCountdown = null;
                    if (finalDecision === null) finalDecision = initialDecision || 'suspect';
                    moveToNextCase();
                }
            }, 1000);
        }

        function handleFinalDecision(decision) {
            finalDecision = decision;
            moveToNextCase();
        }

        function moveToNextCase() {
            clearAllTimeouts();
            
            // Show feedback for previous case
            const previousCase = trainingCases[currentTrainingCase];
            if (previousCase && currentTrainingCase < 10) {
                const groundTruth = previousCase.gt || 'neutre';
                const wasCorrect = finalDecision === groundTruth;

                feedbackMessage.textContent = wasCorrect
                    ? `Bonne decision finale ! Ce navire etait bien ${groundTruth}.`
                    : `Mauvaise decision. Ce navire etait ${groundTruth}.`;
                feedbackMessage.style.backgroundColor = wasCorrect ? '#d4edda' : '#f8d7da';
                feedbackMessage.style.color = wasCorrect ? '#155724' : '#721c24';
                feedbackMessage.style.border = wasCorrect ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
                feedbackMessage.style.display = 'block';
            }
            
            currentTrainingCase++;
            
            if (currentTrainingCase < 10) {
                // Hide feedback after a delay
                setTimeout(() => {
                    feedbackMessage.style.display = 'none';
                }, 2000);
                
                // Show next case after feedback is shown
                setTimeout(() => showTrainingCase(currentTrainingCase), 2500);
            } else {
                // Hide feedback for last case
                setTimeout(() => {
                    feedbackMessage.style.display = 'none';
                }, 3000);
                showTrainingComplete();
            }
        }

        function showTrainingComplete() {
            caseCounter.style.display = 'none';
            phaseIndicator.style.display = 'none';
            feedbackMessage.style.display = 'none';
            codeContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
                    <h2 style="color: #28a745; margin-bottom: 20px;">Session d\'entrainement terminee !</h2>
                    <p style="font-size: 18px; margin-bottom: 20px;">Vous avez classe les 10 cas avec succes.</p>
                    <p style="font-size: 16px; color: #6c757d;">Vous pouvez maintenant commencer la session principale.</p>
                </div>
            `;
        }

        function generateOriginalStyleHTML(caseData) {
            const i = currentTrainingCase;
            const susList = []; // Empty list for training cases

            return `
                <div class="case" id="interface" style="position: relative; margin: 0 auto; width: 100vw; max-width: 100%;">
                    <table id="tab_data">
                        <tr id="tr_th">
                            <th class="th_vesData" id="th_sus">Liste suspects</th>
                            <th class="th_vesData" id="th_ais">Donnees AIS</th>
                            <th class="th_vesData" id="th_sens">Donnees capteurs</th>
                        </tr>
                        <tr id="tr_vesData">
                            <td class="vesData tdSus${i}" id="tdSus">
                                ${susList.map(s => `<p>${s}</p>`).join('')}
                            </td>
                            <td class="vesData tdAis${i}" id="tdAis">
                                <p><strong>Vitesse</strong> : ${caseData.speedAIS ? caseData.speedAIS.replace(',', '.') + ' noeuds' : 'N/A'}</p>
                                <p><strong>Cap</strong> : ${caseData.headAIS ? caseData.headAIS.replace(',', '.') + 'deg' : 'N/A'}</p>
                                <p><strong>Longueur</strong> : ${caseData.lengthAIS ? caseData.lengthAIS.replace(',', '.') + 'm' : 'N/A'}</p>
                                <p><strong>Largeur</strong> : ${caseData.width ? caseData.width.replace(',', '.') + 'm' : 'N/A'}</p>
                                <p><strong>MAJ</strong> : ${caseData.vLastAIS || 'N/A'}</p>
                                <p><strong>Type</strong> : ${caseData.type || 'N/A'}</p>
                                <p><strong>Nom</strong> : ${caseData.name || 'N/A'}</p>
                                <p><strong>Nat</strong> : ${caseData.nat || 'N/A'}</p>
                                <p><strong>MMSI</strong> : ${caseData.mmsi || 'N/A'}</p>
                                <p><strong>IMO</strong> : ${caseData.imo || 'N/A'}</p>
                                <p><strong>De</strong> : ${caseData.from || 'N/A'}</p>
                                <p><strong>A</strong> : ${caseData.to || 'N/A'}</p>
                                <p><strong>Status</strong> : ${caseData.status || 'N/A'}</p>
                                <p><strong>Annee</strong> : ${caseData.built || 'N/A'}</p>
                                <p><strong>Poids</strong> : ${caseData.weight || 'N/A'}</p>
                                <p><strong>Tirant</strong> : ${caseData.draught || 'N/A'}</p>
                            </td>
                            <td class="vesData tdSensor${i}" id="tdSensor">
                                <p><strong>Vitesse</strong> : ${caseData.speedReal ? caseData.speedReal.replace(',', '.') + ' noeuds' : 'N/A'}</p>
                                <p><strong>Cap</strong> : ${caseData.headReal ? caseData.headReal.replace(',', '.') + 'deg' : 'N/A'}</p>
                                <p><strong>Longueur</strong> : ${caseData.lengthReal ? caseData.lengthReal.replace(',', '.') + 'm' : 'N/A'}</p>
                                <p><strong>Dist. AIS</strong> : ${caseData.vDistAIS || 'N/A'}</p>
                                <p><strong>Route maritime</strong> : ${caseData.inMaritimeRoad === '1' ? 'Oui' : 'Non'}</p>
                                <p><strong>Zone de peche</strong> : ${caseData.inFishingZone === '1' ? 'Oui' : 'Non'}</p>
                                <p><strong>Zone cotiere</strong> : ${caseData.inCoastZone === '1' ? 'Oui' : 'Non'}</p>
                                <p><strong>Navire proche</strong> : ${caseData.nearOtherVessel === '1' ? 'Oui' : 'Non'}</p>
                                <p><strong>Zone protegee</strong> : ${caseData.protectedZone === '1' ? 'Oui' : 'Non'}</p>
                            </td>
                        </tr>
                        <tr id="tr_ves">
                            <td colspan="3" id="td_ves">
                                <img class="imgVes imgVes${i}" id="imgVes${i}" src="${caseData.vesselImage}"/>
                                <div class="loupe loupe${i}" id="loupe${i}"></div>
                            </td>
                        </tr>
                    </table>
                    <table id="tab_tac">
                        <tr id="tr_tac">
                            <td id="td_img_tac">
                                <img class="imgTac${i}" id="imgTac${i}" src="${caseData.contextImage}"/>
                            </td>
                        </tr>
                        <tr id="tr_dec">
                            <td class="td_dec td_ini${i} tdDecIni${i}" id="tdDecIni${i}">
                                <span class="td_span" id="targetIs${i}">Ce navire est</span>
                                <div class="btn_group">
                                    <button class="but_sus iniSus${i}" id="butIniSus${i}">Suspect</button>
                                    <button class="but_neu iniNeu${i}" id="butIniNeu${i}">Neutre</button>
                                </div>
                            </td>
                            <td class="td_dec td_rec${i}" id="tdRec${i}">
                                <span class="td_span" id="recIs${i}">Recommandation IA</span>
                                <div class="btn_group">
                                    <div class="but_sus recSus${i}" id="recSus${i}">Suspect</div>
                                    <div class="but_neu recNeu${i}" id="recNeu${i}">Neutre</div>
                                </div>
                            </td>
                            <td class="td_dec td_fin${i}" id="tdDecFin${i}">
                                <span class="td_span" id="finTargetIs${i}">Finalement, ce navire est :</span>
                                <div class="btn_group">
                                    <button class="but_sus finSus${i}" type="button" id="butFinSus${i}">Suspect</button>
                                    <button class="but_neu finNeu${i}" type="button" id="butFinNeu${i}">Neutre</button>
                                </div>
                            </td>
                        </tr>
                        <tr id="tr_cd">
                            <td class="td_countdown">
                                <span class="normal countdownElement" id="countdownElement${i}">10</span>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
        }

        loadTrainingCases();
    }

    // Rest of existing functions for game page compatibility
    function showRecommendation() {
        if (!tdDecIni || !recSus || !recNeu || !tdRec) return;
        tdDecIni.style.display = 'none';
        let recIA = 'neutre';
        if(currentCase==0) recIA = recIA0;
        else if(currentCase==1) recIA = recIA1;
        else if(currentCase==2) recIA = recIA2;
        else if(currentCase==3) recIA = recIA3;
        else if(currentCase==4) recIA = recIA4;
        else if(currentCase==5) recIA = recIA5;
        else if(currentCase==6) recIA = recIA6;
        else if(currentCase==7) recIA = recIA7;
        else if(currentCase==8) recIA = recIA8;
        else if(currentCase==9) recIA = recIA9;
        if (recIA == "neutre"){ recSus.style.display = 'none'; recNeu.style.display = 'inline-flex'; }
        else if(recIA == "suspect"){ recSus.style.display = 'inline-flex'; recNeu.style.display = 'none'; }
        tdRec.style.display = 'block';
    }

    function handleInitialDecision() {
        if (!tdDecIni || !tdRec || !tdDecFin || !countdownElement) return;
        showRecommendation();
        startRecCountdown();
        setTimeout(() => { tdRec.style.display = 'none'; tdDecFin.style.display = 'block'; startFinalDecisionCountdown(); }, 5000);
    }

    let recCountdown = null;
    function startRecCountdown() {
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 5; countdownElement.textContent = `${timeLeft}`;
        recCountdown = setInterval(() => { timeLeft--; countdownElement.textContent = `${timeLeft}`; if (timeLeft <= 0) clearInterval(recCountdown); }, 1000);
    }

    let iniCountdown = null;
    function startInitDecisionCountdown(){
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 30; countdownElement.textContent = `${timeLeft}`;
        iniCountdown = setInterval(() => { timeLeft--; countdownElement.textContent = `${timeLeft}`; if (timeLeft <= 0) { clearInterval(iniCountdown); handleInitialDecision(); } }, 1000);
    }

    let finalDecisionTimeout = null;
    function startFinalDecisionCountdown() {
        if(recCountdown) clearInterval(recCountdown);
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        let timeLeft = 10; countdownElement.textContent = `${timeLeft}`;
        finalDecisionTimeout = setInterval(() => { timeLeft--; countdownElement.textContent = `${timeLeft}`; if (timeLeft <= 0) { clearInterval(finalDecisionTimeout); nextCase(); } }, 1000);
    }

    document.querySelectorAll("#butIniSus").forEach(e => e.addEventListener('click', () => handleInitialDecision()));
    document.querySelectorAll("#butIniNeu").forEach(e => e.addEventListener('click', () => handleInitialDecision()));
    document.querySelectorAll("#butFinSus").forEach(e => e.addEventListener('click', () => nextCase()));
    document.querySelectorAll("#butFinNeu").forEach(e => e.addEventListener('click', () => nextCase()));

    const guideElements = ['tdSus', 'tdAis', 'tdSensor', 'imgVes', 'imgTac', 'tdDecIni'];
    const explanations = {
        'tdSus': "1 - Liste des navires suspects potentiels. Si le navire traite est dans cette liste, il est suspect par defaut.",
        'tdAis': "2 - Donnees AIS fournies par le navire actuellement traite.",
        'tdSensor': "3 - Donnees captees par les senseurs et traitees par les systemes embarques dans l'avion.",
        'imgVes': "4 - Image du navire traite, permettant de verifier nom, type, taille estimee... (zoom possible).",
        'imgTac': "5 - Vue tactique centre sur le navire traite, pour contextualiser les autres donnes.",
        'tdDecIni': "6 - Emplacement des boutons pour la decision initiale, la recommandation IA (sans explication) et pour la decision finale."
    };
    let currentIndex = 0, guideActive = false, firstCase = true;

    function showChatBubbleWithHalo(elementId, message) {
        const el = document.getElementsByClassName(elementId + currentCase.toString()).item(0);
        if (!el) return;
        document.querySelectorAll('.chat-bubble').forEach(e => e.remove());
        document.querySelectorAll('.halo-effect').forEach(e => e.classList.remove('halo-effect'));
        el.classList.add('halo-effect');
        const bubble = document.createElement('div'); bubble.className = 'chat-bubble'; bubble.innerText = message;
        const navDiv = document.createElement('div'); navDiv.className = 'guide-nav-btns';
        const prevBtn = document.createElement('button'); prevBtn.innerText = 'Precedent'; prevBtn.onclick = prevExplanation;
        if (currentIndex === 0) prevBtn.disabled = true;
        const nextBtn = document.createElement('button'); nextBtn.innerText = 'Suivant'; nextBtn.onclick = nextExplanation;
        if (currentIndex === guideElements.length - 1) nextBtn.disabled = true;
        navDiv.appendChild(prevBtn); navDiv.appendChild(nextBtn); bubble.appendChild(navDiv);
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
        showChatBubbleWithHalo(guideElements[currentIndex], explanations[guideElements[currentIndex]]);
    }

    function nextExplanation() {
        if (!guideActive) return;
        if (currentIndex < guideElements.length - 1) { currentIndex++; showCurrentExplanation(); }
    }

    function prevExplanation() {
        if (!guideActive) return;
        if (currentIndex > 0) { currentIndex--; showCurrentExplanation(); }
    }

    function startGuide() {
        guideActive = true; currentIndex = 0; showCurrentExplanation(); updateGuideButton();
    }

    function stopGuide() {
        guideActive = false;
        document.querySelectorAll('.chat-bubble').forEach(e => e.remove());
        document.querySelectorAll('.halo-effect').forEach(e => e.classList.remove('halo-effect'));
        updateGuideButton();
    }

    function updateGuideButton() {
        const btn = document.getElementById('startGuideBtn');
        if (!btn) return; btn.innerText = guideActive ? "Fermer le guide" : "Lancer le guide";
    }

    function createStartGuideButton() {
        if (document.getElementById('startGuideBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'startGuideBtn';
        btn.onclick = () => { if (guideActive) stopGuide(); else startGuide(); };
        document.body.appendChild(btn); updateGuideButton();
    }

    function onCaseChange(caseIndex) {
        if (caseIndex === 0 && typeof ses !== 'undefined' && ses == 0) {
            firstCase = true; guideActive = true; currentIndex = 0; showCurrentExplanation(); updateGuideButton();
        } else { firstCase = false; stopGuide(); }
    }

    function showCase(idx) {
        for (let i = 0; i < totalCases; i++) {
            const div = document.getElementById('case' + i);
            if (div) div.style.display = (i === idx) ? '' : 'none';
        }
        currentCase = idx; updateCaseNavButtons();
        if (typeof onCaseChange === "function") onCaseChange(idx);
    }

    function prevCase() {
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if(recCountdown) clearInterval(recCountdown);
        if(currentCase > 0) currentCase--;
        let prevCaseEl = null;
        if(currentCase >= totalCases) { currentCase = 0; prevCaseEl = document.getElementById("case" + (totalCases - 1).toString()); }
        else if(currentCase >= 0) prevCaseEl = document.getElementById("case" + (currentCase + 1).toString());
        let caseToPrint = document.getElementById("case" + currentCase.toString());
        if(prevCaseEl) prevCaseEl.style.display = "none";
        if(caseToPrint) caseToPrint.style.display = "block";
        startInitDecisionCountdown();
        tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
        recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0);
        recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0);
        tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
        tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
        countdownElement = document.getElementById('countdownElement' + currentCase.toString());
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        updateImg();
        if(tdDecIni) tdDecIni.style.display = "block";
        if(tdRec) tdRec.style.display = "none";
        if(tdDecFin) tdDecFin.style.display = "none";
        firstCase = false; stopGuide(); adjustLayout(); updateCaseNavButtons();
    }

    function nextCase() {
        if(iniCountdown) clearInterval(iniCountdown);
        if(finalDecisionTimeout) clearInterval(finalDecisionTimeout);
        if(recCountdown) clearInterval(recCountdown);
        currentCase++;
        let prevCaseEl = null;
        if(currentCase >= totalCases) { currentCase = 0; prevCaseEl = document.getElementById("case" + (totalCases - 1).toString()); }
        else prevCaseEl = document.getElementById("case" + (currentCase - 1).toString());
        let caseToPrint = document.getElementById("case" + currentCase.toString());
        if(prevCaseEl) prevCaseEl.style.display = "none";
        if(caseToPrint) caseToPrint.style.display = "block";
        startInitDecisionCountdown();
        tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
        recSus = document.getElementsByClassName('recSus' + currentCase.toString()).item(0);
        recNeu = document.getElementsByClassName('recNeu' + currentCase.toString()).item(0);
        tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
        tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
        countdownElement = document.getElementById('countdownElement' + currentCase.toString());
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        updateImg();
        if(tdDecIni) tdDecIni.style.display = "block";
        if(tdRec) tdRec.style.display = "none";
        if(tdDecFin) tdDecFin.style.display = "none";
        firstCase = false; stopGuide(); adjustLayout(); updateCaseNavButtons();
    }

    function updateCaseNavButtons() {
        const prevBtn = document.getElementById('casePrevBtn');
        const nextBtn = document.getElementById('caseNextBtn');
        if(prevBtn) prevBtn.disabled = (currentCase === 0);
        if(nextBtn) nextBtn.disabled = (currentCase === totalCases - 1);
    }

    function createCaseNavButtons() {
        const container = document.getElementById('cases-container');
        if(!container) return;
        const prevBtn = document.createElement('button'); prevBtn.id = 'casePrevBtn'; prevBtn.className = 'case-nav-btn';
        prevBtn.innerHTML = '&larr;'; prevBtn.onclick = prevCase;
        const nextBtn = document.createElement('button'); nextBtn.id = 'caseNextBtn'; nextBtn.className = 'case-nav-btn';
        nextBtn.innerHTML = '&rarr;'; nextBtn.onclick = nextCase;
        container.insertBefore(prevBtn, container.firstChild); container.appendChild(nextBtn); updateCaseNavButtons();
    }

    window.addEventListener('resize', adjustLayout);

    function adjustLayout() {
        const currentZoom = window.devicePixelRatio; const zoomRatio = currentZoom / 1;
        const tdAis = document.getElementsByClassName('tdAis' + currentCase.toString()).item(0);
        const tdSensor = document.getElementsByClassName('tdSensor' + currentCase.toString()).item(0);
        const tdSus = document.getElementsByClassName('tdSus' + currentCase.toString()).item(0);
        const tdDecFin = document.getElementsByClassName('td_fin' + currentCase.toString()).item(0);
        const tdDecIni = document.getElementsByClassName('td_ini' + currentCase.toString()).item(0);
        const tdRec = document.getElementsByClassName('td_rec' + currentCase.toString()).item(0);
        const newFontSize = 16 / zoomRatio;
        if(tdAis) tdAis.querySelectorAll('p').forEach(p => p.style.fontSize = `${newFontSize}px`);
        if(tdSensor) tdSensor.querySelectorAll('p').forEach(p => p.style.fontSize = `${newFontSize}px`);
        if(tdSus) tdSus.querySelectorAll('p').forEach(p => p.style.fontSize = `${newFontSize}px`);
        document.getElementsByClassName("th_vesData").forEach(el => el.style.fontSize = `${newFontSize}px`);
        if(tdDecIni) { tdDecIni.querySelectorAll('button').forEach(p => p.style.fontSize = `${newFontSize}px`); tdDecIni.querySelectorAll('span').forEach(p => p.style.fontSize = `${newFontSize}px`); }
        if(tdDecFin) { tdDecFin.querySelectorAll('button').forEach(p => p.style.fontSize = `${newFontSize}px`); tdDecFin.querySelectorAll('span').forEach(p => p.style.fontSize = `${newFontSize}px`); }
        if(tdRec) { tdRec.querySelectorAll('div').forEach(p => p.style.fontSize = `${newFontSize}px`); tdRec.querySelectorAll('span').forEach(p => p.style.fontSize = `${newFontSize}px`); }
    }

    function updateImg() {
        image = document.getElementsByClassName('imgVes' + currentCase.toString()).item(0);
        loupe = document.getElementsByClassName('loupe' + currentCase.toString()).item(0);
        if(image && loupe) {
            image.addEventListener('mouseenter', () => {
                loupe.style.display = 'block'; loupe.style.backgroundImage = `url('${image.src}')`;
                loupe.style.backgroundSize = (image.width * zoom) + 'px ' + (image.height * zoom) + 'px';
            });
            image.addEventListener('mouseleave', () => loupe.style.display = 'none');
            image.addEventListener('mousemove', function(event) {
                const rect = image.getBoundingClientRect();
                const x = event.clientX - rect.left; const y = event.clientY - rect.top;
                const loupeWidth = loupe.offsetWidth; const loupeHeight = loupe.offsetHeight;
                loupe.style.left = (x - loupeWidth / 2) + 'px'; loupe.style.top = (y - loupeHeight / 2) + 'px';
                loupe.style.backgroundPosition = `-${(x * zoom) - loupeWidth / 2}px -${(y * zoom) - loupeHeight / 2}px`;
            });
            loupe.style.backgroundImage = `url(${image.src})`;
        }
    }

    updateImg(); createCaseNavButtons(); showCase(0); createStartGuideButton(); onCaseChange(0);
});
