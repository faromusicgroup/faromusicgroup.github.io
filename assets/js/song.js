// Song pages (_includes/lyrics.html) and the songbook (songbook.html). Chords are written inline in the lyrics as [Am]
// or [LAm] (_includes/lyrics-text.html). Song pages: show/hide, transpose, and ABC / Do Re Mi notation, which defaults
// to the song's language (`lang` in its front matter): ABC for English, Do Re Mi otherwise; show/hide, and a visitor's
// notation per default, are remembered. The songbook: every song in its language's notation, or all in one.
// The PDF button prints the sheet (_sass/components/_sheet.scss), with chords or lyrics only (#pdf-dialog).
(function () {
  var controls = document.querySelector('.song-controls'); // chord controls (not on songs without chords)
  var pdfButton = document.getElementById('song-pdf');
  var book = !!document.querySelector('.songbook');
  var toggle = document.getElementById('chords-toggle'); // only on song pages with chords
  var stepsLabel = document.getElementById('chord-steps');
  var notationNote = document.querySelector('[data-lang][data-abc][data-doremi]'); // the songbook's note on notation
  var dialog = document.getElementById('pdf-dialog');

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

  // One song's lyrics, prepared once. A line of only chords (an instrumental part) shows and hides with the chords,
  // with the blank line after it; a word with chords never breaks at a chord when a long line wraps, and its chords
  // wrap along with it. The song's key is its first chord, and its default notation comes from its language.
  function Song(lyrics) {
    lyrics.innerHTML = lyrics.innerHTML
      .replace(/^(?:[ \t]*<span class="chord">[^<]*<\/span>)+[ \t]*(?:\n|$)\n*/gm, '<span class="chord-line">$&</span>')
      .replace(/(?:[^\s<>]|<span class="chord">[^<]*<\/span>)+/g, function (word) {
        var chordsOnly = /^(?:<span class="chord">[^<]*<\/span>)+$/.test(word);
        return word.indexOf('<span') < 0 || chordsOnly ? word : '<span class="chord-word">' + word + '</span>';
      });
    var chords = [].slice.call(lyrics.querySelectorAll('.chord'));
    var song = {
      lyrics: lyrics,
      chords: chords,
      original: chords.map(function (chord) { return chord.textContent; }),
      notation: !lyrics.lang || /^en/i.test(lyrics.lang) ? 'abc' : 'doremi',
      key: { letter: 0, pitch: 0, minor: false }
    };
    song.original.some(function (text) {
      var m = new RegExp(NOTE.source).exec(text);
      if (m) {
        song.key = parse(m[1], m[2], m[3]);
        song.key.minor = /^m(?!aj)/.test(text.slice(m.index + m[0].length));
      }
      return m;
    });
    return song;
  }

  var songs = [].map.call(document.querySelectorAll('.lyrics'), Song);
  var saved = book ? null : 'chord-notation-' + songs[0].notation; // song pages remember a choice per default
  var shown = book || (!!toggle && load('chords') === 'on');
  var notation = book ? 'lang' : load(saved) || songs[0].notation, steps = 0; // 'lang': each song its own default

  function spell(letter, p, as) {
    var accidental = (p - NATURAL[letter] + 18) % 12 - 6;
    var name = LETTERS[letter] + (accidental > 0 ? '#' : accidental < 0 ? 'b' : '');
    if (Math.abs(accidental) > 1 || /^(E#|B#|Cb|Fb)$/.test(name)) name = (accidental > 0 ? SHARPS : FLATS)[p];
    return as === 'doremi' ? SYLLABLES[LETTERS.indexOf(name[0])] + name.slice(1) : name;
  }

  // Every note's letter moves as much as the key's, so chords keep their spelling (E/G# in C → F#/A# in D),
  // and the new key is spelled the usual way (Bb, not A#).
  function spellChords(song) {
    var as = notation === 'lang' ? song.notation : notation;
    var tonic = TONIC[song.key.minor ? 'minor' : 'major'][(song.key.pitch + steps + 12) % 12];
    var shift = LETTERS.indexOf(tonic) - song.key.letter + 7;
    song.chords.forEach(function (chord, i) {
      chord.textContent = song.original[i].replace(NOTE, function (m, syllable, letter, accidental) {
        var note = parse(syllable, letter, accidental);
        return spell((note.letter + shift) % 7, (note.pitch + steps + 12) % 12, as);
      });
    });
  }

  function showChords(on) {
    songs.forEach(function (song) { song.lyrics.classList.toggle('show-chords', on); });
  }

  function render() {
    songs.forEach(spellChords);
    showChords(shown);
    if (controls) {
      controls.classList.toggle('show-chords', shown);
      controls.querySelectorAll('[data-notation]').forEach(function (b) { press(b, b.dataset.notation === notation); });
    }
    if (stepsLabel) stepsLabel.textContent = steps > 0 ? '+' + steps : steps < 0 ? '−' + -steps : '0';
    if (toggle) toggle.textContent = shown ? toggle.dataset.hide : toggle.dataset.show; // the label says what it does
    if (notationNote) notationNote.textContent = notationNote.dataset[notation];
    if (shown && !book) layout(); // the songbook's songs are only laid out when printed
  }

  function press(button, on) {
    button.classList.toggle('special', on);
    button.setAttribute('aria-pressed', on);
  }

  // Chords sit above the text, so two close together could overlap: push the later one right. Every chord is
  // measured first and only then moved (moving one never moves another), so even the whole songbook takes one pass.
  function layout() {
    var range = document.createRange(), chords = [], prev;
    songs.forEach(function (song) {
      if (song.lyrics.classList.contains('show-chords')) chords.push.apply(chords, song.chords);
    });
    if (!chords.length) return;
    var gap = parseFloat(getComputedStyle(songs[0].lyrics).fontSize) / 2;
    chords.forEach(function (chord) { chord.style.left = ''; });
    var boxes = chords.map(function (chord) {
      range.selectNodeContents(chord); // the chord's text, which overflows its zero-width box
      return range.getBoundingClientRect();
    });
    boxes.forEach(function (box, i) {
      var left = box.left;
      if (prev && Math.abs(box.top - prev.top) < 1 && left < prev.right + gap) {
        left = prev.right + gap;
        chords[i].style.left = left - box.left + 'px';
      }
      prev = { top: box.top, right: left + box.width };
    });
  }

  function load(name) { try { return localStorage.getItem(name); } catch (e) { return null; } }
  function save(name, value) { try { localStorage.setItem(name, value); } catch (e) {} }

  // The sheet: its font (Jost), QR codes for the links, and the `printing` layout (_sheet.scss), which is set on
  // screen too while printing so the chords are measured and placed for the printed page. With songs that have
  // chords the PDF button asks "with chords or lyrics only?"; the browser's own print uses the page as shown.
  var printChords = null;

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
    showChords(printChords === null ? shown : printChords);
    layout();
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('printing');
    printChords = null;
    showChords(shown); // back to what the page showed
    if (shown && !book) layout();
  });

  if (dialog) {
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); // the backdrop
    dialog.addEventListener('close', function () {
      if (dialog.returnValue) printSheet(dialog.returnValue === 'chords');
      dialog.returnValue = '';
    });
  }

  pdfButton.addEventListener('click', function () {
    if (dialog && dialog.showModal) dialog.showModal();
    else printSheet(null);
  });
  pdfButton.hidden = false;

  if (controls) {
    controls.addEventListener('click', function (e) {
      var button = e.target.closest('button');
      if (!button) return;
      if (button === toggle) save('chords', (shown = !shown) ? 'on' : 'off');
      else if (button.dataset.step) steps = (steps + Number(button.dataset.step)) % 12;
      else if (button.dataset.notation) {
        notation = button.dataset.notation;
        if (saved) save(saved, notation);
      }
      render();
    });
    controls.hidden = false;
  }
  window.addEventListener('resize', function () { if (shown && !book) layout(); });
  render();
})();
