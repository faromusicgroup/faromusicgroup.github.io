// Song pages (_includes/lyrics.html). Chords, written inline in the lyrics as [Am] or [LAm]: show/hide, transpose,
// and ABC / Do Re Mi notation, which defaults to the song's language (`lang` in its front matter): ABC for English,
// Do Re Mi otherwise. Show/hide, and a visitor's notation per default, are remembered.
// The PDF button prints the song sheet (_includes/song-sheet.html), as shown on screen: transposed, in either notation.
(function () {
  var lyrics = document.querySelector('.lyrics');
  var controls = document.querySelector('.song-controls');
  var toggle = document.getElementById('chords-toggle'); // only on songs with chords
  // A line of only chords (an instrumental part) shows and hides with the chords, with the blank line after it.
  // A word with chords never breaks at a chord when a long line wraps, and its chords wrap along with it.
  lyrics.innerHTML = lyrics.innerHTML
    .replace(/^(?:[ \t]*<span class="chord">[^<]*<\/span>)+[ \t]*(?:\n|$)\n*/gm, '<span class="chord-line">$&</span>')
    .replace(/(?:[^\s<>]|<span class="chord">[^<]*<\/span>)+/g, function (word) {
      var chordsOnly = /^(?:<span class="chord">[^<]*<\/span>)+$/.test(word);
      return word.indexOf('<span') < 0 || chordsOnly ? word : '<span class="chord-word">' + word + '</span>';
    });
  var chords = [].slice.call(lyrics.querySelectorAll('.chord'));
  var original = chords.map(function (chord) { return chord.textContent; });
  var songNotation = !lyrics.lang || /^en/i.test(lyrics.lang) ? 'abc' : 'doremi', saved = 'chord-notation-' + songNotation;
  var shown = !!toggle && load('chords') === 'on', notation = load(saved) || songNotation, steps = 0;

  // A note: a syllable (DO, Do) or a letter (C), then an optional accidental (#, b, or songbook-style s).
  // "Fadd9"/"Faug" are F chords, not Fa; "sus" is never a sharp.
  var NOTE = /(?:(DO|Do|RE|Re|MI|Mi|FA|Fa|SOL|Sol|LA|La|SI|Si)(?!dd|ug)|([A-G]))(#|b|s(?!us))?/g;
  var LETTERS = 'CDEFGAB', SYLLABLES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], NATURAL = [0, 2, 4, 5, 7, 9, 11];
  var SHARPS = 'C C# D D# E F F# G G# A A# B'.split(' '), FLATS = 'C Db D Eb E F Gb G Ab A Bb B'.split(' ');
  var TONIC = { major: 'CDDEEFFGAABB', minor: 'CCDEEFFGGABB' }; // letter of each key by pitch: Db, Eb, Ab, Bb / C#m, G#m

  // A written note: its letter (0 = C … 6 = B) and pitch (0 = C … 11 = B).
  function parse(syllable, letter, accidental) {
    var i = syllable ? SYLLABLES.indexOf(syllable[0] + syllable.slice(1).toLowerCase()) : LETTERS.indexOf(letter);
    return { letter: i, pitch: (NATURAL[i] + (accidental === 'b' ? 11 : accidental ? 1 : 0)) % 12 };
  }

  // The song's key is its first chord.
  var key = { letter: 0, pitch: 0, minor: false };
  original.some(function (text) {
    var m = new RegExp(NOTE.source).exec(text);
    if (m) {
      key = parse(m[1], m[2], m[3]);
      key.minor = /^m(?!aj)/.test(text.slice(m.index + m[0].length));
    }
    return m;
  });

  function spell(letter, p) {
    var accidental = (p - NATURAL[letter] + 18) % 12 - 6;
    var name = LETTERS[letter] + (accidental > 0 ? '#' : accidental < 0 ? 'b' : '');
    if (Math.abs(accidental) > 1 || /^(E#|B#|Cb|Fb)$/.test(name)) name = (accidental > 0 ? SHARPS : FLATS)[p];
    return notation === 'doremi' ? SYLLABLES[LETTERS.indexOf(name[0])] + name.slice(1) : name;
  }

  // Every note's letter moves as much as the key's, so chords keep their spelling (E/G# in C → F#/A# in D),
  // and the new key is spelled the usual way (Bb, not A#).
  function render() {
    if (!toggle) return;
    var tonic = TONIC[key.minor ? 'minor' : 'major'][(key.pitch + steps + 12) % 12];
    var shift = LETTERS.indexOf(tonic) - key.letter + 7;
    chords.forEach(function (chord, i) {
      chord.textContent = original[i].replace(NOTE, function (m, syllable, letter, accidental) {
        var note = parse(syllable, letter, accidental);
        return spell((note.letter + shift) % 7, (note.pitch + steps + 12) % 12);
      });
    });
    document.getElementById('chord-steps').textContent = steps > 0 ? '+' + steps : steps < 0 ? '−' + -steps : '0';
    [lyrics, controls].forEach(function (el) { el.classList.toggle('show-chords', shown); });
    press(toggle, shown);
    controls.querySelectorAll('[data-notation]').forEach(function (b) { press(b, b.dataset.notation === notation); });
    if (shown) layout();
  }

  function press(button, on) {
    button.classList.toggle('special', on);
    button.setAttribute('aria-pressed', on);
  }

  // Chords sit above the text, so two close together could overlap: push the later one right.
  function layout() {
    var gap = parseFloat(getComputedStyle(lyrics).fontSize) / 2, range = document.createRange(), prev;
    chords.forEach(function (chord) {
      chord.style.left = '';
      range.selectNodeContents(chord); // the chord's text, which overflows its zero-width box
      var box = range.getBoundingClientRect();
      if (prev && Math.abs(box.top - prev.top) < 1 && box.left < prev.right + gap) {
        chord.style.left = prev.right + gap - box.left + 'px';
        box = range.getBoundingClientRect();
      }
      prev = box;
    });
  }

  function load(name) { try { return localStorage.getItem(name); } catch (e) { return null; } }
  function save(name, value) { try { localStorage.setItem(name, value); } catch (e) {} }

  // The song sheet: its font (Jost), QR codes for the song's links, and the `printing` layout (_sheet.scss), which is
  // set on screen too while printing so the chords are measured and placed for the printed page.
  // On songs with chords the PDF button asks "with chords or lyrics only?"; the browser's own print prints the page
  // as shown (printChords null).
  var dialog = document.getElementById('pdf-dialog'), printChords = null;

  function printSheet(withChords) {
    printChords = withChords;
    var fonts = document.fonts ? ['300 1em Jost', '400 1em Jost', 'italic 400 1em Jost', '600 1em Jost'] : [];
    var print = function () { window.print(); };
    Promise.all(fonts.map(function (font) { return document.fonts.load(font); })).then(print, print);
  }

  function drawQRCodes() {
    if (typeof qrcode !== 'function') return;
    document.querySelectorAll('[data-qr]:empty').forEach(function (box) {
      var qr = qrcode(0, 'M');
      qr.addData(box.dataset.qr);
      qr.make();
      box.innerHTML = qr.createSvgTag({ scalable: true, margin: 0 });
    });
  }

  window.addEventListener('beforeprint', function () {
    document.body.classList.add('printing');
    drawQRCodes();
    if (printChords !== null) lyrics.classList.toggle('show-chords', printChords);
    if (lyrics.classList.contains('show-chords')) layout();
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('printing');
    printChords = null;
    lyrics.classList.toggle('show-chords', shown); // back to what the page showed
    if (shown) layout();
  });

  if (dialog) {
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); // the backdrop
    dialog.addEventListener('close', function () {
      if (dialog.returnValue) printSheet(dialog.returnValue === 'chords');
      dialog.returnValue = '';
    });
  }

  controls.addEventListener('click', function (e) {
    var button = e.target.closest('button');
    if (!button) return;
    if (button.id === 'song-pdf') return dialog && dialog.showModal ? dialog.showModal() : printSheet(null);
    if (button === toggle) save('chords', (shown = !shown) ? 'on' : 'off');
    else if (button.dataset.step) steps = (steps + Number(button.dataset.step)) % 12;
    else save(saved, notation = button.dataset.notation);
    render();
  });
  window.addEventListener('resize', function () { if (shown) layout(); });
  controls.hidden = false;
  render();
})();
