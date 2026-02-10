document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('consentForm');
  const submitBtn = document.getElementById('submitBtn');
  const canvas = document.getElementById('signatureCanvas');
  let points = [];

  // Pré-remplissage des dates
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('date').value = formattedDate;
  document.getElementById('dateChercheur').value = formattedDate;

  // Fonction de vérification globale
  function checkForm() {
      // Vérifie tous les champs requis (texte, nombre, date)
      const requiredInputs = form.querySelectorAll('input[required]:not([type="radio"]):not([type="checkbox"])');
      let allFilled = Array.from(requiredInputs).every(input => input.value.trim() !== '');

      // Vérifie que chaque groupe radio a une valeur cochée
      const radioGroups = ['q1', 'q2', 'q3', 'q4'];
      let allRadiosChecked = radioGroups.every(name => form.querySelector(`input[name="${name}"]:checked`));

      // Vérifie la signature (au moins 2 points)
      let signatureOk = points.length > 2;

      // Active ou désactive le bouton
      if (allFilled && allRadiosChecked && signatureOk) {
          submitBtn.disabled = false;
          submitBtn.classList.add('enabled');
      } else {
          submitBtn.disabled = true;
          submitBtn.classList.remove('enabled');
      }
  }

  // Gestion du canvas (signature)
  const ctx = canvas.getContext('2d');
  let drawing = false;

  // Redimensionnement canvas
  function resizeCanvas() {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      ctx.scale(ratio, ratio);
      ctx.translate(0.5, 0.5);
      redraw();
  }

  // Conversion pour PDF
  function preparePDF() {
    const clone = document.getElementById('formulairePDF').cloneNode(true);
    
    // Gestion des radios
    clone.querySelectorAll('.radio-group').forEach(group => {
        const checked = group.querySelector('input:checked');
        const span = document.createElement('span');
        span.textContent = checked ? checked.value.toUpperCase() : '';
        span.style.marginLeft = '10px';
        group.replaceWith(span);
    });

    // Conversion canvas signature
    const canvasClone = clone.querySelector('#signatureCanvas');
    if(points.length > 0) {
        const img = document.createElement('img');
        img.style.maxWidth = '200px';
        img.src = canvasClone.toDataURL();
        canvasClone.replaceWith(img);
    }

    // Remplacement des autres inputs
    clone.querySelectorAll('input').forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value;
        span.className = 'form-static';
        input.replaceWith(span);
    });

    return clone;
  }

  // Génération PDF
  function genererPDF() {
    const element = preparePDF();
    
    html2pdf().set({
      margin: [10, 5], // Marges réduites [haut/bas, gauche/droite]
      filename: 'consentement.pdf',
      html2canvas: { 
        scale: 1.5, // Échelle augmentée pour meilleure résolution
        windowWidth: 794, // Largeur A4 en pixels (794px ≈ 210mm)
        logging: true,
        useCORS: true
      },
      jsPDF: { 
        unit: 'mm',
        format: [190, 280], // Largeur x Hauteur personnalisée (190mm × 280mm)
        orientation: 'portrait'
      }
    }).from(element).save();
  }

  function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return {
          x: (e.clientX - rect.left) * (canvas.width / rect.width),
          y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
  }

  function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 2;
      ctx.stroke();
  }

  canvas.addEventListener('mousedown', e => {
      drawing = true;
      points.push(getCanvasCoords(e));
      redraw();
  });
  canvas.addEventListener('mousemove', e => {
      if (!drawing) return;
      points.push(getCanvasCoords(e));
      redraw();
  });
  canvas.addEventListener('mouseup', e => {
      drawing = false;
      checkForm();
  });
  canvas.addEventListener('mouseleave', e => { drawing = false; });

  // Tactile
  canvas.addEventListener('touchstart', e => {
      drawing = true;
      points.push(getCanvasCoords(e.touches[0]));
      redraw();
  });
  canvas.addEventListener('touchmove', e => {
      if (!drawing) return;
      e.preventDefault();
      points.push(getCanvasCoords(e.touches[0]));
      redraw();
  }, { passive: false });
  canvas.addEventListener('touchend', e => {
      drawing = false;
      checkForm();
  });

  // Effacer la signature
  window.clearSignature = function() {
      points = [];
      redraw();
      checkForm();
  }

  // Sur chaque modification d'un champ, on vérifie le formulaire
  form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', checkForm);
      el.addEventListener('change', checkForm);
  });

  document.getElementById('consentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    genererPDF();
  });

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialisation
  checkForm();
});
