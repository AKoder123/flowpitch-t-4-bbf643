document.addEventListener('DOMContentLoaded', function(){
  const deckEl = document.getElementById('deck');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const notesToggle = document.getElementById('notesToggle');
  const progressEl = document.getElementById('progress');
  const deckTitleEl = document.getElementById('deckTitle');
  let slides = [];
  let index = 0;
  let notesShown = false;

  function fetchContent(){
    return fetch('content.json').then(r=>r.json()).catch(()=>{
      console.error('Failed to load content.json');
      return null;
    });
  }

  function renderCurrent(){
    if(!slides.length) return;
    const s = slides[index];
    deckEl.innerHTML = '';
    const slideWrap = document.createElement('section');
    slideWrap.className = 'slide';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = s.title || '';
    slideWrap.appendChild(title);

    if(s.subtitle){
      const sub = document.createElement('div');
      sub.className = 'subtitle';
      sub.textContent = s.subtitle;
      slideWrap.appendChild(sub);
    }

    const body = document.createElement('div');
    body.className = 'body';

    if(s.paragraphs && s.paragraphs.length){
      s.paragraphs.forEach(p=>{
        const pEl = document.createElement('p');
        pEl.textContent = p;
        body.appendChild(pEl);
      });
    }

    if(s.bullets && s.bullets.length){
      const ul = document.createElement('ul');
      s.bullets.forEach(b=>{
        const li = document.createElement('li');
        li.textContent = b;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    slideWrap.appendChild(body);

    if(s.speaker_line){
      const sp = document.createElement('div');
      sp.className = 'speaker';
      sp.textContent = s.speaker_line;
      slideWrap.appendChild(sp);
    }

    if(s.notes){
      const notes = document.createElement('div');
      notes.className = 'notes';
      notes.id = 'notesBox';
      notes.textContent = s.notes;
      notes.style.display = notesShown ? 'block' : 'none';
      slideWrap.appendChild(notes);
    }

    deckEl.appendChild(slideWrap);
    updateProgress();
  }

  function updateProgress(){
    progressEl.textContent = (index+1) + ' / ' + slides.length;
  }

  function go(n){
    index = Math.max(0, Math.min(slides.length-1, n));
    renderCurrent();
  }

  prevBtn.addEventListener('click', ()=> go(index-1));
  nextBtn.addEventListener('click', ()=> go(index+1));
  notesToggle.addEventListener('click', ()=>{
    notesShown = !notesShown;
    const nb = document.getElementById('notesBox');
    if(nb) nb.style.display = notesShown ? 'block' : 'none';
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight' || e.key === 'PageDown') go(index+1);
    if(e.key === 'ArrowLeft' || e.key === 'PageUp') go(index-1);
  });

  // simple swipe support
  let touchStartX = null;
  deckEl.addEventListener('touchstart', (e)=>{ if(e.touches && e.touches[0]) touchStartX = e.touches[0].clientX; });
  deckEl.addEventListener('touchend', (e)=>{
    if(touchStartX == null) return;
    const dx = (e.changedTouches[0].clientX - touchStartX);
    if(Math.abs(dx) > 40){ if(dx < 0) go(index+1); else go(index-1); }
    touchStartX = null;
  });

  // load and init
  fetchContent().then(data=>{
    if(!data){ deckEl.innerHTML = '<div class="slide"><div class="title">Failed to load deck</div></div>'; return; }
    deckTitleEl.textContent = data.meta.title || 'Deck';
    slides = data.slides || [];
    if(slides.length === 0){ deckEl.innerHTML = '<div class="slide"><div class="title">No slides</div></div>'; return; }
    go(0);
  });
});