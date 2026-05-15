// 1. Génération du créneau
let demain = new Date();
demain.setDate(demain.getDate() + 1);
let jour = demain.getDay();
if (jour === 6) { // samedi
    demain.setDate(demain.getDate() + 2); // ajoute 2 jours pour arriver au lundi
} else if (jour === 0) { // dimanche
    demain.setDate(demain.getDate() + 1); // ajoute 1 jour pour arriver au lundi
}
let heureDebutFeedback = new Date(demain);
heureDebutFeedback.setHours(9, 0, 0, 0);
let heureFinFeedback = new Date(heureDebutFeedback);
heureFinFeedback.setMinutes(heureDebutFeedback.getMinutes() + 5);

let thirdDay = new Date();
thirdDay.setDate(thirdDay.getDate() + 3);
let tDay = thirdDay.getDay();
if (tDay === 6) { // samedi
    thirdDay.setDate(thirdDay.getDate() + 2); // ajoute 2 jours pour arriver au lundi
} else if (tDay === 0) { // dimanche
    thirdDay.setDate(thirdDay.getDate() + 1); // ajoute 1 jour pour arriver au lundi
}

if (thirdDay.getDay() === demain.getDay()){
    thirdDay.setDate(thirdDay.getDate() + 1);
}

let heureDebSes = new Date(thirdDay);
heureDebSes.setHours(9, 0, 0, 0);
let heureFinSes = new Date(heureDebSes);
heureFinSes.setMinutes(heureDebSes.getMinutes() + 30);

let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

// 2. Génération du fichier ICS
function generateICSEvent(start, end, title, description, location) {
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    };
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MonApp//FR',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    return icsContent;
}

let titreFb = "Confiance dans l'IA - Feedback";
let descriptionFb = "Merci de lire le feedback un jour avant la session suivante !";
let lieu = "https://vfer.pythonanywhere.com/";
let icsDataFb = generateICSEvent(heureDebutFeedback, heureFinFeedback, titreFb, descriptionFb, lieu);

let titreSes = "Confiance dans l'IA - Nouvelle Session";
let descriptionSes = "Merci de réaliser votre session suivant 1 jour après avoir lu le feedback !";
let icsDataSes = generateICSEvent(heureDebSes, heureFinSes, titreSes, descriptionSes, lieu);

// 3. Affichage et téléchargement
document.addEventListener('DOMContentLoaded', function() {
    const divFin = document.getElementById("divFin");

    const contenuFb  = `
        <p>Nous vous proposons ce créneau pour lire le feedback :<br>
        le ${heureDebutFeedback.toLocaleDateString('fr-FR', options)} de ${heureDebutFeedback.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} à ${heureFinFeedback.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
        <a href="#" id="downloadIcsFb" class="btn">Ajouter à Outlook (fichier ICS)</a>
    `;

    divFin.insertAdjacentHTML('beforeend', contenuFb);

    document.getElementById('downloadIcsFb').addEventListener('click', function(e) {
        e.preventDefault();
        const blob = new Blob([icsDataFb], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invitation.ics';
        a.click();
        URL.revokeObjectURL(url);
    });

    const contenuSes = `
        <p>Nous vous proposons ce créneau de 30 minutes pour la nouvelle session:<br>
        le ${heureDebSes.toLocaleDateString('fr-FR', options)} de ${heureDebSes.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} à ${heureFinSes.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
        <a href="#" id="downloadIcsSes" class="btn">Ajouter à Outlook (fichier ICS)</a>
    `;

    divFin.insertAdjacentHTML('beforeend', contenuSes);

    document.getElementById('downloadIcsSes').addEventListener('click', function(e) {
        e.preventDefault();
        const blob = new Blob([icsDataSes], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invitation.ics';
        a.click();
        URL.revokeObjectURL(url);
    });

    let Thanks = "<p>Libre à vous de modifier les horaires de ces créneaux en fonction de vos disponibilités.</p>";
    Thanks += "<p><strong>Merci d'avoir participé à la session " + idSes + "</strong></p>";

    divFin.insertAdjacentHTML('beforeend', Thanks);
});