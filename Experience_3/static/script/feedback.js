document.addEventListener('DOMContentLoaded', function() {
    const zoom = 3; // Facteur de zoom de la loupe

    let current = 0;
    const contextes = document.querySelectorAll('.contexte');

    function updateButtons() {
        contextes.forEach((ctx, index) => {
            const prevBtn = ctx.querySelector('.btn-prev');
            const nextBtn = ctx.querySelector('.btn-next');
            const form1 = ctx.querySelector('.myForm1');
            const form2 = ctx.querySelector('.myForm2');

            prevBtn.style.display = current > 0 ? 'block' : 'none';
            if(current==0){
                form1.style.display = 'block';
                form2.style.display = 'none';
            }
            else if(current<(contextes.length - 1)){
                form1.style.display = 'none';
                form2.style.display = 'none';

            }else{
                form1.style.display = 'none';
                form2.style.display = 'block';
            }
            nextBtn.style.display = current < contextes.length - 1 ? 'block' : 'none';
            ctx.querySelectorAll('.imgVes').forEach(image => {
                const container = image.parentElement;
                const loupe = container.querySelector('.loupe');

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

                    // Positionner la loupe dans le container
                    loupe.style.left = (x - loupeWidth / 2) + "px";
                    loupe.style.top = (y - loupeHeight / 2) + "px";

                    // Déplacer l'arrière-plan de la loupe pour zoomer
                    loupe.style.backgroundPosition =
                        `-${(x * zoom) - loupeWidth / 2}px -${(y * zoom) - loupeHeight / 2}px`;
                });
            });
        });
    }

    function showContexte(index) {
        contextes.forEach(ctx => ctx.classList.remove('active'));
        contextes[index].classList.add('active');
        if(index==contextes.length - 1){
            contextes[index].style.display = "flex";
        }else{
            contextes[contextes.length - 1].style.display = "none";
        }
        current = index;
        updateButtons();
    }

    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => {
            current < contextes.length - 1 && showContexte(current + 1)
            fetch('/nextFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    objectName: 'next'
                }),
            });
        });
    });

    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            current > 0 && showContexte(current - 1)
            fetch('/prevFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    objectName: 'next'
                }),
            });
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
        document.getElementById('but-prev').style.fontSize = `${newFontSize}px`;
        document.getElementById('but-next').style.fontSize = `${newFontSize}px`;
        document.getElementById('idImg').style.fontSize = `${newFontSize}px`;
    }

    document.addEventListener('wheel', function(e) {
        e.preventDefault();
      }, { passive: false });

    // Initialisation
    showContexte(0);
});