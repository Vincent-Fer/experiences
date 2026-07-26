document.addEventListener('DOMContentLoaded', function() {

    const countdownElement = document.getElementById('countdownElement');

    const inputIni = document.getElementById('inputIni');
    if (inputIni) inputIni.value = '';
    const inputFin = document.getElementById('inputFin');
    if (inputFin) inputFin.value = '';

    const image = document.getElementById('imgVes');
    const loupe = document.getElementById('loupe');
    const zoom = 3; // Facteur de zoom de la loupe

    let clicked = false

    // Fonction utilitaire pour désactiver un bouton
    function disableButton(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = true;
    }

    // Fonction utilitaire pour réactiver un bouton (si besoin)
    function enableButton(btnId) {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = false;
    }

    function pollTimer() {
        fetch('/get_timer')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    countdownElement.innerHTML = "Erreur";
                    return;
                }
                // Mettre à jour le timer
                countdownElement.innerHTML = data.countdown;
                // Gérer les classes CSS
                countdownElement.className = data.class;
                recIA = data.recIA;

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
                                objectName: 'recIA' // remplace par ta variable JS si besoin
                            })
                        });
                    }
                } else if (data.phase == 'final') {
                    document.getElementById('tdDecIni').style.display = 'none';
                    document.getElementById('tdRec').style.display = 'none';
                    document.getElementById('tdDecFin').style.display = 'block';
                    if (data.countdown <= 0 && clicked==false) {
                        disableButton('butFinSus');
                        disableButton('butFinNeu');
                        inputFin.value = 'none';
                        const form = document.getElementById("formFin");
                        const data = new FormData(form);

                        fetch(form.action, {
                            method: "POST",
                            body: data,
                            credentials: "same-origin"
                        })
                        .then(response => response.json()) // ou .then(response => response.text()) selon la réponse du serveur
                        .then(data => {
                            // Ici, redirige dynamiquement ou change l'image
                            if (data.redirect_url) {
                                window.location.href = data.redirect_url;
                            }
                            // ou bien, change l'image dynamiquement si tu reçois l'URL de l'image
                        })
                        .catch(error => {
                            console.error("Erreur lors de la soumission :", error);
                        });
                    }
                }
            })
            .catch(err => {
                countdownElement.innerHTML = "Erreur";
                console.error("Erreur timer:", err);
            })
            .finally(() => {
                setTimeout(pollTimer, 1000); // relance le polling dans 1s
            });
    }

    document.getElementById('butIniNeu')?.addEventListener('click', async function() {
        disableButton('butIniSus');
        disableButton('butIniNeu'); // On désactive aussi l'autre bouton initial

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

            if (result.success) {
                // Succès : passe à la phase suivante, recharge, affiche une nouvelle image, etc.
                // Par exemple, tu peux appeler une fonction pour charger la phase "ai"
                console.log("ok")
            } else {
                // Échec : informer l'utilisateur, réactiver les boutons, etc.
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
        disableButton('butIniNeu'); // On désactive aussi l'autre bouton initial

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

            if (result.success) {
                // Succès : passe à la phase suivante, recharge, affiche une nouvelle image, etc.
                // Par exemple, tu peux appeler une fonction pour charger la phase "ai"
                console.log("ok")
            } else {
                // Échec : informer l'utilisateur, réactiver les boutons, etc.
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

    // Bouton final "Suspect"
    document.getElementById('butFinSus')?.addEventListener('click', function(){
        disableButton('butFinSus');
        disableButton('butFinNeu');
        clicked = true
        document.getElementById('inputFin').value = 'suspect';
        const form = document.getElementById("formFin");
        const data = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: data,
            credentials: "same-origin"
        })
        .then(response => response.json()) // ou .then(response => response.text()) selon la réponse du serveur
        .then(data => {
            // Ici, redirige dynamiquement ou change l'image
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
            // ou bien, change l'image dynamiquement si tu reçois l'URL de l'image
        })
        .catch(error => {
            console.error("Erreur lors de la soumission :", error);
        });
    });

    // Bouton final "Neutre"
    document.getElementById('butFinNeu')?.addEventListener('click', function(){
        disableButton('butFinSus');
        disableButton('butFinNeu');
        clicked = true
        document.getElementById('inputFin').value = 'neutre';
        const form = document.getElementById("formFin");
        const data = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: data,
            credentials: "same-origin"
        })
        .then(response => response.json()) // ou .then(response => response.text()) selon la réponse du serveur
        .then(data => {
            // Ici, redirige dynamiquement ou change l'image
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
            // ou bien, change l'image dynamiquement si tu reçois l'URL de l'image
        })
        .catch(error => {
            console.error("Erreur lors de la soumission :", error);
        });
    });

    window.addEventListener('resize', adjustLayout);

    function adjustLayout() {
        const currentZoom = window.devicePixelRatio;
        const zoomRatio = currentZoom / 1;

        // const width = window.innerWidth;
        // const height = window.innerHeight;

        initialFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const newFontSize = initialFontSize / zoomRatio;

        document.getElementById('tdAis').style.fontSize = `${newFontSize}px`;
        document.getElementById('tdSensor').style.fontSize = `${newFontSize}px`;
        document.getElementById('tdSus').style.fontSize = `${newFontSize}px`;
        document.getElementById('tr_th').style.fontSize = `${newFontSize}px`;
        document.getElementById('butIniSus').style.fontSize = `${newFontSize}px`;
        document.getElementById('butIniNeu').style.fontSize = `${newFontSize}px`;
        document.getElementById('recSus').style.fontSize = `${newFontSize}px`;
        document.getElementById('recNeu').style.fontSize = `${newFontSize}px`;
        document.getElementById('butFinSus').style.fontSize = `${newFontSize}px`;
        document.getElementById('butFinNeu').style.fontSize = `${newFontSize}px`;
        document.getElementById('tdDecIni').style.fontSize = `${newFontSize}px`;
        document.getElementById('countdownElement').style.fontSize = `${newFontSize}px`;
        document.getElementById('targetIs').style.fontSize = `${newFontSize}px`;
        document.getElementById('recIs').style.fontSize = `${newFontSize}px`;
        document.getElementById('finTargetIs').style.fontSize = `${newFontSize}px`;
    }

    document.addEventListener('wheel', function(e) {
        e.preventDefault();
      }, { passive: false });

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
    adjustLayout();
    pollTimer();

});
