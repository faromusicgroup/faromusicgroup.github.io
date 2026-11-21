// Song chords: written inline in the lyrics as [Am], rendered as <span class="chord"> by _includes/lyrics.html.
(function () {
  var lyrics = document.querySelector('.lyrics');
  var chords = lyrics.querySelectorAll('.chord');
  var toggle = document.getElementById('chords-toggle');

  // Chords float above the text, so two close together can overlap: push the later one right.
  function layout() {
    var gap = parseFloat(getComputedStyle(lyrics).fontSize) / 2, prev;
    chords.forEach(function (chord) {
      chord.style.marginLeft = '';
      var box = chord.getBoundingClientRect();
      if (prev && Math.abs(box.top - prev.top) < 1 && box.left < prev.right + gap) {
        chord.style.marginLeft = prev.right + gap - box.left + 'px';
        box = chord.getBoundingClientRect();
      }
      prev = box;
    });
  }

  function show(on) {
    lyrics.classList.toggle('show-chords', on);
    toggle.classList.toggle('special', on);
    toggle.setAttribute('aria-pressed', on);
    if (on) layout();
  }

  toggle.addEventListener('click', function () { show(!lyrics.classList.contains('show-chords')); });
  window.addEventListener('resize', function () { if (lyrics.classList.contains('show-chords')) layout(); });
  document.querySelector('.chord-controls').hidden = false;
})();
