/* ============================
   C&W Quiz Arena — Application Logic
   KBC Style — Enhanced Edition
   ============================ */

// ── Particle Background ──
class ParticleBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.init();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 8000), 120);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.7 ? '#FFD700' : (Math.random() > 0.5 ? '#E31837' : '#ffffff')
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background gradient
    const grad = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, 0,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7
    );
    grad.addColorStop(0, '#0a0a25');
    grad.addColorStop(0.4, '#080818');
    grad.addColorStop(0.7, '#050510');
    grad.addColorStop(1, '#020208');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = currentOpacity;
      this.ctx.fill();

      // Glow
      if (p.size > 1.2) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = currentOpacity * 0.1;
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

// ── Confetti Effect ──
class ConfettiEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pieces = [];
    this.running = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launch() {
    this.pieces = [];
    const colors = ['#FFD700', '#E31837', '#00e676', '#2979ff', '#ff6d00', '#e040fb', '#ffffff', '#FFE44D'];
    for (let i = 0; i < 200; i++) {
      this.pieces.push({
        x: Math.random() * this.canvas.width,
        y: -20 - Math.random() * 300,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }
    this.running = true;
    this.animate();
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let allDone = true;
    for (const p of this.pieces) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      p.speedY += 0.05;
      if (p.y > this.canvas.height - 50) p.opacity -= 0.02;

      if (p.opacity > 0) {
        allDone = false;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      }
    }

    if (allDone) {
      this.running = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }
}

// ── Enhanced Sound Engine (Web Audio API) ──
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
    this.suspenseNodes = null;
    this.suspensePlaying = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
    if (this.muted || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  playChord(notes, duration, type = 'sine', volume = 0.15, delay = 0) {
    notes.forEach(freq => this.playTone(freq, duration, type, volume, delay));
  }

  // ── KBC-Authentic Sound Effects ──

  playSelect() {
    // Quick sparkle blip
    this.playTone(1200, 0.06, 'sine', 0.1);
    this.playTone(1500, 0.04, 'sine', 0.06, 0.03);
  }

  playLock() {
    // "Lock kiya jaaye" — dramatic ascending with chord resolve
    this.playTone(220, 0.15, 'triangle', 0.15, 0);
    this.playTone(330, 0.15, 'triangle', 0.15, 0.12);
    this.playTone(440, 0.15, 'triangle', 0.18, 0.24);
    this.playTone(554, 0.15, 'triangle', 0.2, 0.36);
    // Final resolving chord
    this.playChord([440, 554, 660], 0.4, 'sine', 0.12, 0.5);
    // Dramatic bass hit
    this.playTone(110, 0.4, 'sine', 0.15, 0.48);
  }

  playCorrect() {
    // Triumphant ascending fanfare with harmonics
    this.playTone(523, 0.12, 'sine', 0.18, 0);
    this.playTone(659, 0.12, 'sine', 0.18, 0.08);
    this.playTone(784, 0.12, 'sine', 0.2, 0.16);
    this.playTone(1047, 0.35, 'sine', 0.22, 0.24);
    // Sparkle overtones
    this.playTone(2094, 0.2, 'sine', 0.06, 0.3);
    this.playTone(1568, 0.2, 'sine', 0.06, 0.35);
    // Chord bed
    this.playChord([523, 659, 784], 0.5, 'sine', 0.08, 0.24);
  }

  playWrong() {
    // Ominous descending minor with dissonance
    this.playTone(440, 0.2, 'sawtooth', 0.1, 0);
    this.playTone(415, 0.2, 'sawtooth', 0.1, 0.15);
    this.playTone(349, 0.25, 'sawtooth', 0.1, 0.3);
    this.playTone(262, 0.5, 'sawtooth', 0.1, 0.45);
    // Low rumble
    this.playTone(80, 0.6, 'sine', 0.12, 0.3);
  }

  playTick() {
    // Sharp clock tick
    this.playTone(2000, 0.02, 'square', 0.05);
    this.playTone(1000, 0.02, 'square', 0.03, 0.01);
  }

  playQuestionAppear() {
    // Whoosh + reveal chime
    this.playTone(200, 0.15, 'sine', 0.06, 0);
    this.playTone(400, 0.1, 'sine', 0.08, 0.05);
    this.playTone(600, 0.08, 'sine', 0.1, 0.1);
    this.playTone(880, 0.15, 'sine', 0.12, 0.15);
    // Sparkle
    this.playTone(1760, 0.1, 'sine', 0.04, 0.2);
  }

  playFanfare() {
    // Grand victory fanfare — multi-layered
    const melody = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
    melody.forEach((f, i) => {
      this.playTone(f, 0.2, 'sine', 0.16, i * 0.1);
    });
    // Harmony layer
    setTimeout(() => {
      this.playChord([523, 659, 784], 0.6, 'sine', 0.08, 0);
      this.playChord([659, 784, 1047], 0.6, 'sine', 0.08, 0.3);
      this.playChord([784, 1047, 1319], 0.8, 'sine', 0.08, 0.6);
    }, 200);
  }

  playTimeUp() {
    // Alarm-like warning
    this.playTone(800, 0.15, 'square', 0.1, 0);
    this.playTone(600, 0.15, 'square', 0.1, 0.15);
    this.playTone(400, 0.15, 'square', 0.1, 0.3);
    this.playTone(200, 0.4, 'sawtooth', 0.12, 0.45);
  }

  playStart() {
    // Grand entrance — KBC intro feel
    this.playTone(130, 0.2, 'sine', 0.12, 0);
    this.playTone(196, 0.15, 'sine', 0.12, 0.12);
    this.playTone(262, 0.15, 'sine', 0.15, 0.24);
    this.playTone(330, 0.15, 'sine', 0.15, 0.36);
    this.playTone(392, 0.15, 'sine', 0.18, 0.48);
    this.playTone(523, 0.3, 'sine', 0.2, 0.6);
    // Sparkle finish
    this.playTone(1047, 0.15, 'sine', 0.08, 0.7);
    this.playTone(1319, 0.15, 'sine', 0.06, 0.8);
    this.playTone(1568, 0.2, 'sine', 0.04, 0.9);
    // Bass foundation
    this.playTone(65, 0.8, 'sine', 0.1, 0.4);
  }

  playCountdown() {
    // Dramatic 3-2-1 style beeps
    this.playTone(800, 0.1, 'sine', 0.15);
  }

  playMilestone() {
    // Reached a milestone on the ladder
    this.playChord([523, 659, 784], 0.4, 'sine', 0.12, 0);
    this.playTone(1047, 0.3, 'sine', 0.1, 0.2);
    this.playTone(1319, 0.2, 'sine', 0.06, 0.35);
  }

  // ── Background Suspense Drone (KBC Tension Music) ──

  startSuspense() {
    if (this.muted || !this.ctx || this.suspensePlaying) return;
    this.ensureContext();

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);

    // Low bass drone
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, this.ctx.currentTime);

    // Slightly detuned for richness
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(77, this.ctx.currentTime);

    // Higher harmonic — minor feel
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(150, this.ctx.currentTime);
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    // Tension note (minor third above)
    const osc4 = this.ctx.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(90, this.ctx.currentTime);
    const osc4Gain = this.ctx.createGain();
    osc4Gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    // LFO for slow pulsing — creates heartbeat-like tension
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.5, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.012, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    osc1.connect(masterGain);
    osc2.connect(masterGain);
    osc3.connect(osc3Gain);
    osc3Gain.connect(masterGain);
    osc4.connect(osc4Gain);
    osc4Gain.connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    osc4.start();
    lfo.start();

    this.suspenseNodes = { osc1, osc2, osc3, osc4, lfo, masterGain, osc3Gain, osc4Gain, lfoGain };
    this.suspensePlaying = true;
  }

  stopSuspense() {
    if (!this.suspenseNodes || !this.suspensePlaying) return;
    try {
      const { osc1, osc2, osc3, osc4, lfo, masterGain } = this.suspenseNodes;
      masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        try { osc1.stop(); osc2.stop(); osc3.stop(); osc4.stop(); lfo.stop(); } catch (e) {}
      }, 600);
    } catch (e) {}
    this.suspensePlaying = false;
    this.suspenseNodes = null;
  }

  toggle() {
    this.muted = !this.muted;
    if (this.muted) this.stopSuspense();
    return this.muted;
  }
}

// ── Prize Ladder Data ──
const PRIZE_LADDER = [
  '₹1 Crore', '₹50 Lakh', '₹25 Lakh', '₹12,50,000',
  '₹6,40,000', '₹3,20,000', '₹1,60,000', '₹80,000',
  '₹40,000', '₹20,000', '₹10,000', '₹5,000',
  '₹3,000', '₹2,000', '₹1,000'
];

// ── Main Quiz App ──
class QuizApp {
  constructor() {
    this.currentView = 'view-home';
    this.quizData = null;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.selectedAnswer = null;
    this.answers = [];
    this.participantName = '';
    this.timerInterval = null;
    this.timeLeft = 60;
    this.timerDuration = 60;
    this.isAnswerLocked = false;
    this.isParticipantMode = false;

    // Init particles, confetti, sound
    this.particles = new ParticleBackground(document.getElementById('particles-canvas'));
    this.confetti = new ConfettiEffect(document.getElementById('confetti-canvas'));
    this.sound = new SoundEngine();

    this.bindEvents();
    this.checkURLForQuiz();
  }

  // ── View Management ──
  showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.add('active');
      this.currentView = viewId;
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Event Binding ──
  bindEvents() {
    // Home
    document.getElementById('btn-create-quiz').addEventListener('click', () => {
      this.initCreator();
      this.showView('view-creator');
    });

    // Creator
    document.getElementById('btn-add-question').addEventListener('click', () => this.addQuestion());
    document.getElementById('btn-generate-link').addEventListener('click', () => this.generateShareLink());
    document.getElementById('btn-back-home').addEventListener('click', () => this.showView('view-home'));

    // Gate
    document.getElementById('btn-start-quiz').addEventListener('click', () => this.handleStartQuiz());
    document.getElementById('participant-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleStartQuiz();
    });

    // Player
    document.getElementById('btn-lock-answer').addEventListener('click', () => this.lockAnswer());
    document.getElementById('btn-next-question').addEventListener('click', () => this.nextQuestion());

    // Results
    document.getElementById('btn-results-home').addEventListener('click', () => {
      if (this.isParticipantMode) {
        // Participants can't go to home/creator — just close or show thank you
        this.showToast('Thank you for participating! 🌟');
      } else {
        window.location.hash = '';
        this.showView('view-home');
      }
    });

    // Modal
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('btn-copy-link').addEventListener('click', () => this.copyShareLink());
    document.getElementById('btn-share-whatsapp').addEventListener('click', () => this.shareWhatsApp());
    document.getElementById('btn-share-email').addEventListener('click', () => this.shareEmail());
    document.getElementById('btn-share-teams').addEventListener('click', () => this.shareTeams());

    // Close modal on overlay click
    document.getElementById('share-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('share-modal')) this.closeModal();
    });

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', () => {
      this.sound.init();
      const isMuted = this.sound.toggle();
      document.getElementById('sound-toggle').textContent = isMuted ? '🔇' : '🔊';
      document.getElementById('sound-toggle').classList.toggle('muted', isMuted);
      if (!isMuted) this.showToast('🔊 Sound ON');
      else this.showToast('🔇 Sound OFF');
    });
  }

  // ── Check URL for Quiz Data ──
  async checkURLForQuiz() {
    const hash = window.location.hash.substring(1);
    if (hash && hash.length > 2) {
      this.isParticipantMode = true;
      const btnCreate = document.getElementById('btn-create-quiz');
      if (btnCreate) btnCreate.style.display = 'none';

      // Show Gate View in Loading state
      this.showView('view-gate');
      this.showGateLoading();

      let quizPayload = null;

      // Case 1: Cloud storage blob ID (e.g. #id=019ff0... or #019ff0...)
      let blobId = null;
      if (hash.startsWith('id=')) {
        blobId = hash.substring(3);
      } else if (hash.match(/^[0-9a-fA-F-]{20,}/)) {
        blobId = hash;
      }

      if (blobId) {
        try {
          const res = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`);
          if (res.ok) {
            quizPayload = await res.json();
          }
        } catch (e) {
          console.error('Failed to fetch quiz from cloud storage:', e);
        }
      }

      // Case 2: Compressed URL hash (e.g. #data=... or compressed string)
      if (!quizPayload) {
        try {
          let rawData = hash;
          if (hash.startsWith('data=')) rawData = hash.substring(5);
          const json = LZString.decompressFromEncodedURIComponent(rawData);
          if (json) {
            quizPayload = JSON.parse(json);
          }
        } catch (e) {
          console.error('Failed to parse compressed quiz:', e);
        }
      }

      // If valid quiz payload retrieved
      if (quizPayload && quizPayload.questions && quizPayload.questions.length > 0) {
        this.quizData = quizPayload;
        this.timerDuration = this.quizData.timerSeconds || 60;
        this.showGateView();
        return;
      }

      // If quiz failed to load, show Error screen (never fall back to Home!)
      this.showGateError();
      return;
    }

    // No hash present — show host/creator Home screen
    this.showView('view-home');
  }

  // ── Quiz Creator ──
  initCreator() {
    this.questions = [];
    document.getElementById('quiz-title').value = '';
    document.getElementById('quiz-timer').value = 60;
    document.getElementById('questions-container').innerHTML = '';
    // Add first question by default
    this.addQuestion();
  }

  addQuestion() {
    const index = this.questions.length;
    if (index >= 15) {
      this.showToast('Maximum 15 questions allowed');
      return;
    }

    this.questions.push({
      text: '',
      type: 'objective',
      image: null,
      options: ['', '', '', ''],
      correctAnswer: 0,
      expectedAnswer: '',
      marks: 10
    });

    this.renderQuestionCard(index);
  }

  renderQuestionCard(index) {
    const q = this.questions[index];
    const container = document.getElementById('questions-container');

    const card = document.createElement('div');
    card.className = 'form-card question-card-creator';
    card.id = `question-card-${index}`;
    card.innerHTML = `
      <div class="form-card-header">
        <h3>
          <span class="question-number">${index + 1}</span>
          Question ${index + 1}
        </h3>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="toggle-wrapper">
            <span class="toggle-label ${q.type === 'objective' ? 'active-label' : ''}">MCQ</span>
            <label class="toggle-switch">
              <input type="checkbox" data-index="${index}" class="type-toggle" ${q.type === 'subjective' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label ${q.type === 'subjective' ? 'active-label' : ''}">Text</span>
          </div>
          ${index > 0 ? `<button class="btn-icon danger" data-remove="${index}" title="Remove question">✕</button>` : ''}
        </div>
      </div>

      <div class="form-group">
        <label>Question Text</label>
        <textarea data-index="${index}" class="q-text-input" placeholder="Type your question here...">${q.text}</textarea>
      </div>

      <div class="form-group">
        <label>Image (Optional)</label>
        <div class="image-upload-area" id="image-upload-${index}">
          <div class="upload-icon">📷</div>
          <div class="upload-text">Click or drag to upload an image</div>
          <input type="file" accept="image/*" data-index="${index}" class="image-input">
        </div>
        <div id="image-preview-${index}"></div>
      </div>

      <div class="objective-fields" id="objective-fields-${index}" style="${q.type === 'subjective' ? 'display:none' : ''}">
        <div class="form-group">
          <label>Answer Options</label>
          <div class="options-grid">
            ${['A', 'B', 'C', 'D'].map((letter, oi) => `
              <div class="option-input-wrapper">
                <span class="option-label-badge">${letter}</span>
                <input type="text" data-index="${index}" data-option="${oi}" class="option-input" placeholder="Option ${letter}" value="${q.options[oi] || ''}">
              </div>
            `).join('')}
          </div>
        </div>
        <div class="correct-answer-row">
          <label>Correct Answer</label>
          <select data-index="${index}" class="correct-select">
            <option value="0" ${q.correctAnswer === 0 ? 'selected' : ''}>A</option>
            <option value="1" ${q.correctAnswer === 1 ? 'selected' : ''}>B</option>
            <option value="2" ${q.correctAnswer === 2 ? 'selected' : ''}>C</option>
            <option value="3" ${q.correctAnswer === 3 ? 'selected' : ''}>D</option>
          </select>
        </div>
      </div>

      <div class="subjective-fields" id="subjective-fields-${index}" style="${q.type === 'objective' ? 'display:none' : ''}">
        <div class="form-group">
          <label>Expected Answer (for auto-scoring)</label>
          <textarea data-index="${index}" class="expected-answer-input" placeholder="Type the expected answer...">${q.expectedAnswer || ''}</textarea>
        </div>
      </div>

      <div class="form-group" style="margin-top: 16px;">
        <label>Marks for this question</label>
        <input type="number" data-index="${index}" class="marks-input" min="1" max="100" value="${q.marks}">
      </div>
    `;

    container.appendChild(card);
    this.bindQuestionEvents(card, index);
  }

  bindQuestionEvents(card, index) {
    // Type toggle
    card.querySelector('.type-toggle').addEventListener('change', (e) => {
      const isSubjective = e.target.checked;
      this.questions[index].type = isSubjective ? 'subjective' : 'objective';
      document.getElementById(`objective-fields-${index}`).style.display = isSubjective ? 'none' : '';
      document.getElementById(`subjective-fields-${index}`).style.display = isSubjective ? '' : 'none';

      // Update toggle labels
      const labels = card.querySelectorAll('.toggle-label');
      labels[0].classList.toggle('active-label', !isSubjective);
      labels[1].classList.toggle('active-label', isSubjective);
    });

    // Question text
    card.querySelector('.q-text-input').addEventListener('input', (e) => {
      this.questions[index].text = e.target.value;
    });

    // Option inputs
    card.querySelectorAll('.option-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const oi = parseInt(e.target.dataset.option);
        this.questions[index].options[oi] = e.target.value;
      });
    });

    // Correct answer select
    const correctSelect = card.querySelector('.correct-select');
    if (correctSelect) {
      correctSelect.addEventListener('change', (e) => {
        this.questions[index].correctAnswer = parseInt(e.target.value);
      });
    }

    // Expected answer (subjective)
    const expectedInput = card.querySelector('.expected-answer-input');
    if (expectedInput) {
      expectedInput.addEventListener('input', (e) => {
        this.questions[index].expectedAnswer = e.target.value;
      });
    }

    // Marks
    card.querySelector('.marks-input').addEventListener('input', (e) => {
      this.questions[index].marks = parseInt(e.target.value) || 10;
    });

    // Image upload
    card.querySelector('.image-input').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleImageUpload(index, e.target.files[0]);
      }
    });

    // Remove button
    const removeBtn = card.querySelector('[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.removeQuestion(index));
    }
  }

  handleImageUpload(index, file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 350px width/height to keep payload light
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        const maxDim = 350;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((maxDim / w) * h);
            w = maxDim;
          } else {
            w = Math.round((maxDim / h) * w);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        this.questions[index].image = dataUrl;

        // Show preview
        const previewContainer = document.getElementById(`image-preview-${index}`);
        previewContainer.innerHTML = `
          <div class="image-preview-wrapper">
            <img src="${dataUrl}" class="image-preview" alt="Preview">
            <button class="remove-image" data-index="${index}">✕</button>
          </div>
        `;
        previewContainer.querySelector('.remove-image').addEventListener('click', () => {
          this.questions[index].image = null;
          previewContainer.innerHTML = '';
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeQuestion(index) {
    this.questions.splice(index, 1);
    // Re-render all questions
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    this.questions.forEach((_, i) => this.renderQuestionCard(i));
  }

  // ── Generate Share Link ──
  async generateShareLink() {
    const title = document.getElementById('quiz-title').value.trim();
    if (!title) {
      this.showToast('Please enter a quiz title');
      return;
    }

    const timerSeconds = parseInt(document.getElementById('quiz-timer').value) || 60;

    // Validate questions
    const validQuestions = this.questions.filter(q => q.text.trim() !== '');
    if (validQuestions.length === 0) {
      this.showToast('Add at least one question');
      return;
    }

    // Validate objective questions have options
    for (let i = 0; i < validQuestions.length; i++) {
      const q = validQuestions[i];
      if (q.type === 'objective') {
        const filledOptions = q.options.filter(o => o.trim() !== '');
        if (filledOptions.length < 2) {
          this.showToast(`Question ${i + 1}: At least 2 options required`);
          return;
        }
      }
    }

    const btnGenerate = document.getElementById('btn-generate-link');
    const originalHtml = btnGenerate.innerHTML;
    btnGenerate.innerHTML = '<span>⏳</span> Generating Link...';
    btnGenerate.disabled = true;

    const quizPayload = {
      id: this.generateId(),
      title: title,
      timerSeconds: timerSeconds,
      createdAt: Date.now(),
      questions: validQuestions.map(q => {
        const cleaned = {
          text: q.text.trim(),
          type: q.type,
          marks: q.marks || 10
        };
        if (q.image) cleaned.image = q.image;
        if (q.type === 'objective') {
          cleaned.options = q.options.map(o => o.trim()).filter(o => o !== '');
          cleaned.correctAnswer = Math.min(q.correctAnswer, cleaned.options.length - 1);
        } else {
          cleaned.expectedAnswer = (q.expectedAnswer || '').trim();
        }
        return cleaned;
      })
    };

    let shareUrl = '';

    // Primary: Save to Cloud Storage (jsonblob.com) for clean, short URLs
    try {
      const res = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(quizPayload)
      });

      if (res.ok) {
        let blobId = res.headers.get('x-jsonblob-id');
        if (!blobId) {
          const loc = res.headers.get('Location') || res.headers.get('location');
          if (loc) {
            const parts = loc.split('/');
            blobId = parts[parts.length - 1];
          }
        }
        if (blobId) {
          const baseUrl = window.location.href.split('#')[0];
          shareUrl = `${baseUrl}#id=${blobId}`;
        }
      }
    } catch (e) {
      console.warn('Could not store quiz on JSONBlob cloud:', e);
    }

    // Fallback: LZString URL compression if API request fails
    if (!shareUrl) {
      const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(quizPayload));
      const baseUrl = window.location.href.split('#')[0];
      shareUrl = `${baseUrl}#data=${compressed}`;
    }

    btnGenerate.innerHTML = originalHtml;
    btnGenerate.disabled = false;

    document.getElementById('share-link-input').value = shareUrl;
    this.currentShareUrl = shareUrl;
    this.openModal();
  }

  generateId() {
    return 'quiz_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }

  // ── Gate View ──
  showGateLoading() {
    const loadingEl = document.getElementById('gate-loading');
    const errorEl = document.getElementById('gate-error');
    const contentEl = document.getElementById('gate-content');
    if (loadingEl) loadingEl.style.display = '';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
  }

  showGateError() {
    const loadingEl = document.getElementById('gate-loading');
    const errorEl = document.getElementById('gate-error');
    const contentEl = document.getElementById('gate-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = '';
    if (contentEl) contentEl.style.display = 'none';
  }

  showGateView() {
    if (!this.quizData) return;
    const loadingEl = document.getElementById('gate-loading');
    const errorEl = document.getElementById('gate-error');
    const contentEl = document.getElementById('gate-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = '';

    document.getElementById('gate-quiz-title').textContent = this.quizData.title;
    document.getElementById('gate-quiz-meta').textContent =
      `${this.quizData.questions.length} Questions • ${this.quizData.questions.reduce((s, q) => s + (q.marks || 10), 0)} Total Marks • ${this.quizData.timerSeconds || 60}s per question`;
    document.getElementById('participant-name').value = '';
    document.getElementById('already-attempted-msg').style.display = 'none';
    document.getElementById('btn-start-quiz').style.display = '';
    document.querySelector('.gate-form').style.display = '';
    this.showView('view-gate');
  }

  handleStartQuiz() {
    const name = document.getElementById('participant-name').value.trim();
    if (!name) {
      this.showToast('Please enter your name');
      return;
    }

    this.participantName = name;

    // Check if already attempted
    const attemptKey = `cw_quiz_${this.quizData.id}_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const previousAttempt = localStorage.getItem(attemptKey);
    if (previousAttempt) {
      const prev = JSON.parse(previousAttempt);
      document.getElementById('btn-start-quiz').style.display = 'none';
      document.querySelector('.gate-form').style.display = 'none';
      document.getElementById('already-attempted-msg').style.display = '';
      document.getElementById('prev-score-display').textContent =
        `${prev.score} / ${prev.totalMarks}`;
      return;
    }

    this.startQuiz();
  }

  // ── Quiz Player ──
  startQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.isAnswerLocked = false;
    this.selectedAnswer = null;
    this.timerDuration = this.quizData.timerSeconds || 60;

    // Initialize and play start sound
    this.sound.init();
    this.sound.playStart();

    // Set player info
    const initials = this.participantName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('player-avatar').textContent = initials;
    document.getElementById('player-name-display').textContent = this.participantName;
    document.getElementById('total-q-num').textContent = `/ ${this.quizData.questions.length}`;

    // Build money ladder
    this.buildLadder();

    this.showView('view-player');
    // Start suspense music and first question after intro sound
    setTimeout(() => {
      this.sound.startSuspense();
      this.showQuestion(0);
    }, 1000);
  }

  buildLadder() {
    const ladderContainer = document.getElementById('ladder-items');
    const qCount = this.quizData.questions.length;

    const displayPrizes = PRIZE_LADDER.slice(0, qCount);

    let html = '';
    for (let i = 0; i < qCount; i++) {
      const qNum = qCount - i;
      const isMilestone = qNum === qCount || qNum === Math.ceil(qCount / 2) || qNum === 1;
      html += `
        <div class="ladder-item ${isMilestone ? 'milestone' : ''}" id="ladder-${qNum - 1}">
          <span class="ladder-q">Q${qNum}</span>
          <span class="ladder-prize">${displayPrizes[i] || `₹${qNum * 1000}`}</span>
        </div>
      `;
    }
    ladderContainer.innerHTML = html;
  }

  showQuestion(index) {
    const q = this.quizData.questions[index];
    if (!q) return;

    this.currentQuestionIndex = index;
    this.selectedAnswer = null;
    this.isAnswerLocked = false;

    // Update counter
    document.getElementById('current-q-num').textContent = index + 1;

    // Update ladder
    document.querySelectorAll('.ladder-item').forEach(item => item.classList.remove('current'));
    const ladderItem = document.getElementById(`ladder-${index}`);
    if (ladderItem) ladderItem.classList.add('current');

    // Show prize tag
    const prizeTag = document.getElementById('question-prize-tag');
    const qCount = this.quizData.questions.length;
    const displayPrizes = PRIZE_LADDER.slice(0, qCount);
    const prizeIndex = qCount - 1 - index;
    prizeTag.textContent = displayPrizes[prizeIndex] || `₹${(index + 1) * 1000}`;

    // Show question text
    document.getElementById('question-text').textContent = q.text;

    // Show image if present
    const imgEl = document.getElementById('question-image');
    if (q.image) {
      imgEl.src = q.image;
      imgEl.style.display = '';
    } else {
      imgEl.style.display = 'none';
    }

    // Show options or subjective input
    const optionsContainer = document.getElementById('options-container');
    const subjectiveWrapper = document.getElementById('subjective-wrapper');

    if (q.type === 'objective') {
      subjectiveWrapper.style.display = 'none';
      optionsContainer.style.display = '';
      const letters = ['A', 'B', 'C', 'D'];
      optionsContainer.innerHTML = q.options.map((opt, i) => `
        <button class="kbc-option" data-option="${i}" id="kbc-option-${i}">
          <div class="kbc-option-inner">
            <span class="option-letter">${letters[i]}:</span>
            <span class="option-text">${opt}</span>
          </div>
        </button>
      `).join('');

      // Bind option clicks
      optionsContainer.querySelectorAll('.kbc-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (this.isAnswerLocked) return;
          const optIndex = parseInt(btn.dataset.option);
          this.selectOption(optIndex);
        });
      });
    } else {
      optionsContainer.style.display = 'none';
      subjectiveWrapper.style.display = '';
      document.getElementById('subjective-answer').value = '';
    }

    // Reset buttons
    document.getElementById('btn-lock-answer').style.display = '';
    document.getElementById('btn-lock-answer').disabled = true;
    const lockBtn = document.getElementById('btn-lock-answer');
    lockBtn.innerHTML = '<span class="lock-icon">🔒</span><span class="lock-text">Lock It</span>';
    document.getElementById('btn-next-question').style.display = 'none';

    // Enable lock if subjective (since they can type anything)
    if (q.type === 'subjective') {
      const subInput = document.getElementById('subjective-answer');
      subInput.addEventListener('input', () => {
        document.getElementById('btn-lock-answer').disabled = subInput.value.trim() === '';
      });
    }

    // Start timer
    this.startTimer();

    // 🔊 Question appear sound
    this.sound.playQuestionAppear();

    // Animate question card
    const qCard = document.getElementById('question-card');
    qCard.style.animation = 'none';
    qCard.offsetHeight; // Force reflow
    qCard.style.animation = 'viewFadeIn 0.5s ease-out';
  }

  selectOption(optIndex) {
    if (this.isAnswerLocked) return;
    this.selectedAnswer = optIndex;

    // 🔊 Option select blip
    this.sound.playSelect();

    // Update visual
    document.querySelectorAll('.kbc-option').forEach(btn => {
      btn.classList.remove('selected');
    });
    document.getElementById(`kbc-option-${optIndex}`).classList.add('selected');

    // Enable lock button
    document.getElementById('btn-lock-answer').disabled = false;
  }

  lockAnswer() {
    if (this.isAnswerLocked) return;
    this.isAnswerLocked = true;
    this.clearTimer();

    // 🔊 Dramatic lock sound
    this.sound.playLock();

    const q = this.quizData.questions[this.currentQuestionIndex];
    let userAnswer, isCorrect;

    if (q.type === 'objective') {
      userAnswer = this.selectedAnswer;
      isCorrect = userAnswer === q.correctAnswer;

      // Disable all options
      document.querySelectorAll('.kbc-option').forEach(btn => btn.classList.add('disabled'));

      // Dramatic reveal after delay (KBC suspense moment)
      setTimeout(() => {
        // Show correct
        document.getElementById(`kbc-option-${q.correctAnswer}`).classList.add('correct');
        document.getElementById(`kbc-option-${q.correctAnswer}`).classList.remove('disabled');

        // Show wrong if different
        if (!isCorrect && userAnswer !== null && userAnswer !== undefined) {
          document.getElementById(`kbc-option-${userAnswer}`).classList.add('wrong');
          document.getElementById(`kbc-option-${userAnswer}`).classList.remove('disabled');
        }

        // 🔊 Correct or wrong reveal sound
        if (isCorrect) {
          this.sound.playCorrect();
          // Check if milestone
          const qCount = this.quizData.questions.length;
          if (this.currentQuestionIndex === qCount - 1 || this.currentQuestionIndex === Math.ceil(qCount / 2) - 1) {
            setTimeout(() => this.sound.playMilestone(), 500);
          }
        } else {
          this.sound.playWrong();
        }

        this.afterReveal(isCorrect);
      }, 2000); // Extra suspense delay
    } else {
      userAnswer = document.getElementById('subjective-answer').value.trim();
      const expected = (q.expectedAnswer || '').trim();
      isCorrect = expected !== '' && userAnswer.toLowerCase() === expected.toLowerCase();

      if (isCorrect) this.sound.playCorrect();
      else this.sound.playWrong();

      this.afterReveal(isCorrect);
    }

    // Record answer
    this.answers.push({
      questionIndex: this.currentQuestionIndex,
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      marks: isCorrect ? (q.marks || 10) : 0
    });

    // Update lock button
    document.getElementById('btn-lock-answer').style.display = 'none';
  }

  afterReveal(isCorrect) {
    // Update ladder
    const ladderItem = document.getElementById(`ladder-${this.currentQuestionIndex}`);
    if (ladderItem) {
      ladderItem.classList.remove('current');
      ladderItem.classList.add(isCorrect ? 'completed' : 'failed');
    }

    // Show next button
    const nextBtn = document.getElementById('btn-next-question');
    nextBtn.style.display = '';
    if (this.currentQuestionIndex >= this.quizData.questions.length - 1) {
      nextBtn.textContent = '🏆 See Results';
    } else {
      nextBtn.textContent = 'Next →';
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex >= this.quizData.questions.length - 1) {
      this.showResults();
    } else {
      this.showQuestion(this.currentQuestionIndex + 1);
    }
  }

  // ── Timer (Circular + Bar) ──
  startTimer() {
    this.clearTimer();
    this.timeLeft = this.timerDuration;

    const timerBar = document.getElementById('timer-bar');
    const timerProgress = document.getElementById('timer-progress');
    const timerDisplay = document.getElementById('timer-display');

    timerBar.style.width = '100%';
    timerBar.classList.remove('warning');
    timerProgress.classList.remove('warning');
    timerDisplay.classList.remove('warning');
    timerDisplay.textContent = this.timeLeft;

    // Set initial circle
    const circumference = 2 * Math.PI * 45; // r=45
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = 0;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      const pct = (this.timeLeft / this.timerDuration) * 100;

      // Update bar
      timerBar.style.width = `${pct}%`;

      // Update circle
      const offset = circumference * (1 - this.timeLeft / this.timerDuration);
      timerProgress.style.strokeDashoffset = offset;

      // Update display
      timerDisplay.textContent = this.timeLeft;

      if (this.timeLeft <= 10) {
        timerBar.classList.add('warning');
        timerProgress.classList.add('warning');
        timerDisplay.classList.add('warning');
        // 🔊 Tick sound in last 10 seconds
        this.sound.playTick();
      }

      if (this.timeLeft <= 0) {
        this.clearTimer();
        // Auto-lock with no answer
        if (!this.isAnswerLocked) {
          this.sound.playTimeUp();
          this.showToast('⏰ Time\'s up!');
          // Record as wrong
          const q = this.quizData.questions[this.currentQuestionIndex];
          this.answers.push({
            questionIndex: this.currentQuestionIndex,
            userAnswer: q.type === 'objective' ? this.selectedAnswer : '',
            isCorrect: false,
            marks: 0
          });
          this.isAnswerLocked = true;

          if (q.type === 'objective') {
            document.querySelectorAll('.kbc-option').forEach(btn => btn.classList.add('disabled'));
            document.getElementById(`kbc-option-${q.correctAnswer}`).classList.add('correct');
            document.getElementById(`kbc-option-${q.correctAnswer}`).classList.remove('disabled');
            if (this.selectedAnswer !== null && this.selectedAnswer !== undefined) {
              document.getElementById(`kbc-option-${this.selectedAnswer}`).classList.add('wrong');
            }
          }

          document.getElementById('btn-lock-answer').style.display = 'none';
          this.afterReveal(false);
        }
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ── Results ──
  showResults() {
    this.clearTimer();
    this.sound.stopSuspense();

    const totalMarks = this.quizData.questions.reduce((s, q) => s + (q.marks || 10), 0);
    const earnedMarks = this.answers.reduce((s, a) => s + a.marks, 0);
    const correctCount = this.answers.filter(a => a.isCorrect).length;
    const wrongCount = this.answers.length - correctCount;

    // Save attempt to localStorage
    const attemptKey = `cw_quiz_${this.quizData.id}_${this.participantName.toLowerCase().replace(/\s+/g, '_')}`;
    try {
      localStorage.setItem(attemptKey, JSON.stringify({
        score: earnedMarks,
        totalMarks: totalMarks,
        correct: correctCount,
        wrong: wrongCount,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // Choose trophy based on performance
    const percentage = (earnedMarks / totalMarks) * 100;
    let trophy = '🏆';
    if (percentage >= 80) trophy = '🏆';
    else if (percentage >= 50) trophy = '🥈';
    else if (percentage >= 30) trophy = '🥉';
    else trophy = '😢';

    document.getElementById('results-trophy').textContent = trophy;
    document.getElementById('results-player-name').textContent = this.participantName;

    // Animate score counter
    this.animateCounter('score-big', earnedMarks, 1500);
    document.getElementById('score-out-of').textContent = `out of ${totalMarks}`;
    document.getElementById('score-percentage').textContent = `${Math.round(percentage)}%`;

    // Animate score ring
    const scoreRing = document.getElementById('score-ring-progress');
    const ringCircumference = 2 * Math.PI * 52; // r=52
    scoreRing.style.strokeDasharray = ringCircumference;
    scoreRing.style.strokeDashoffset = ringCircumference;
    setTimeout(() => {
      const ringOffset = ringCircumference * (1 - percentage / 100);
      scoreRing.style.strokeDashoffset = ringOffset;
      // Color based on score
      if (percentage >= 80) scoreRing.style.stroke = '#00e676';
      else if (percentage >= 50) scoreRing.style.stroke = '#FFD700';
      else scoreRing.style.stroke = '#ff1744';
    }, 100);

    document.getElementById('breakdown-correct').textContent = correctCount;
    document.getElementById('breakdown-wrong').textContent = wrongCount;
    document.getElementById('breakdown-total').textContent = this.quizData.questions.length;

    // Build detail table
    const detailContainer = document.getElementById('results-detail');
    let detailHTML = '<div class="results-detail-header">📋 Question-wise Breakdown</div>';
    this.quizData.questions.forEach((q, i) => {
      const answer = this.answers[i];
      const status = answer && answer.isCorrect ? 'is-correct' : 'is-wrong';
      const statusIcon = answer && answer.isCorrect ? '✅' : '❌';
      const statusText = answer && answer.isCorrect ? `+${q.marks || 10}` : '0';

      let answerDetail = '';
      if (q.type === 'objective') {
        const userOpt = answer && answer.userAnswer !== null && answer.userAnswer !== undefined
          ? (q.options[answer.userAnswer] || 'Not answered')
          : 'Not answered';
        const correctOpt = q.options[q.correctAnswer];
        answerDetail = `Your answer: <strong>${userOpt}</strong> | Correct: <strong>${correctOpt}</strong>`;
      } else {
        const userAns = (answer && answer.userAnswer) || 'Not answered';
        answerDetail = `Your answer: <strong>${userAns}</strong> | Expected: <strong>${q.expectedAnswer || 'N/A'}</strong>`;
      }

      detailHTML += `
        <div class="result-row">
          <span class="result-q-num">Q${i + 1}</span>
          <span class="result-q-text">${q.text}</span>
          <span class="result-status ${status}">${statusIcon} ${statusText}</span>
          <div class="result-answer-detail">${answerDetail}</div>
        </div>
      `;
    });
    detailContainer.innerHTML = detailHTML;

    this.showView('view-results');

    // In participant mode, hide back button and show thank-you
    if (this.isParticipantMode) {
      document.getElementById('btn-results-home').textContent = '🌟 Thank You for Participating!';
      document.getElementById('btn-results-home').disabled = true;
      document.getElementById('btn-results-home').style.opacity = '0.7';
      document.getElementById('btn-results-home').style.cursor = 'default';
    }

    // Launch confetti + fanfare if good score
    if (percentage >= 50) {
      setTimeout(() => {
        this.confetti.launch();
        this.sound.playFanfare();
      }, 500);
    }
  }

  animateCounter(elementId, target, duration) {
    const el = document.getElementById(elementId);
    let start = 0;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Sharing ──
  openModal() {
    document.getElementById('share-modal').classList.add('active');
    document.getElementById('btn-copy-link').textContent = '📋 Copy';
    document.getElementById('btn-copy-link').classList.remove('copied');
  }

  closeModal() {
    document.getElementById('share-modal').classList.remove('active');
  }

  copyShareLink() {
    const input = document.getElementById('share-link-input');
    navigator.clipboard.writeText(input.value).then(() => {
      const btn = document.getElementById('btn-copy-link');
      btn.textContent = '✅ Copied!';
      btn.classList.add('copied');
      this.showToast('Link copied to clipboard!');
    }).catch(() => {
      // Fallback
      input.select();
      document.execCommand('copy');
      this.showToast('Link copied!');
    });
  }

  shareWhatsApp() {
    const url = document.getElementById('share-link-input').value;
    const title = this.quizData ? document.getElementById('quiz-title').value : 'Quiz Challenge';
    const text = `🎯 *C&W Quiz Arena*\n\n*${title}*\n\n🏆 Kaun Banega Champion?\nTake the quiz now 👇\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareEmail() {
    const url = document.getElementById('share-link-input').value;
    const title = document.getElementById('quiz-title').value || 'Quiz Challenge';
    const subject = `C&W Quiz Arena — ${title}`;
    const body = `Hi Team,\n\nYou've been invited to take the quiz: "${title}"\n\n🏆 Kaun Banega Champion? Test your knowledge now!\n\nClick the link below to start:\n${url}\n\n⏱️ Timed questions • 🔒 One attempt only\n\nGood luck! 🎯\n\n— Cushman & Wakefield`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  }

  shareTeams() {
    const url = document.getElementById('share-link-input').value;
    const title = document.getElementById('quiz-title').value || 'Quiz Challenge';
    const text = `🎯 C&W Quiz Arena — ${title}\n🏆 Kaun Banega Champion?\nTake the quiz now: ${url}`;
    // Microsoft Teams share URL
    const teamsUrl = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(text)}`;
    window.open(teamsUrl, '_blank');
  }

  // ── Toast ──
  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// ── Initialize App ──
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
