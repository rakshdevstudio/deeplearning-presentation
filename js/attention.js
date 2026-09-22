/**
 * attention.js
 * Visualizations for:
 * - Slide 2 & 7: "The animal didn't cross the street because it was tired" beam & connection inspector
 * - Slide 6: "It is really complicated to understand text" curved relationship arc web
 * - Slide 8: Attention scores comparison (Query "it" vs keys)
 * - Slide 9: Softmax normalization transition (Raw scores -> Softmax -> Weights summing to 1.00)
 * - Slide 10: Embedding -> Linear Projections -> Q, K, V vector split animation
 * - Slide 11: Interactive 6-step attention calculation stepper
 * - Slide 12: Interactive Attention formula breakdown
 * - Slide 13: Weighted sum interactive vector synthesizer (Value vectors merging into Context)
 * - Slide 14: Contextual representation Before & After
 * - Slide 15: Scaled Dot-Product architecture interactive flow
 * - Slide 17: O(N^2) Quadratic complexity matrix & comparison visualizer
 * - Slide 18: End-to-end token journey through the entire pipeline
 */

// Sentence for Slides 2, 7, 8, 9, 14
const ANIMAL_SENTENCE = [
  { text: "The", key: "the_1", rawScore: 1.2, weight: 0.02, role: "low" },
  { text: "animal", key: "animal", rawScore: 8.8, weight: 0.65, role: "high" },
  { text: "didn't", key: "didnt", rawScore: 0.8, weight: 0.01, role: "low" },
  { text: "cross", key: "cross", rawScore: 2.1, weight: 0.03, role: "low" },
  { text: "the", key: "the_2", rawScore: 1.0, weight: 0.01, role: "low" },
  { text: "street", key: "street", rawScore: 4.5, weight: 0.08, role: "med" },
  { text: "because", key: "because", rawScore: 2.4, weight: 0.03, role: "low" },
  { text: "it", key: "it", rawScore: 0.0, weight: 0.00, role: "query" },
  { text: "was", key: "was", rawScore: 1.5, weight: 0.02, role: "low" },
  { text: "tired", key: "tired", rawScore: 6.2, weight: 0.15, role: "med" }
];

// Sentence for Slide 6 (Directly from Serrano Academy PDF page 8)
const COMPLICATED_SENTENCE = [
  "It", "is", "really", "complicated", "to", "understand", "text"
];

/* ==========================================================================
   SLIDE 2: THE CORE QUESTION CONNECTIONS (DYNAMIC BOUNDING BOXES)
   ========================================================================== */
function initCoreQuestionVisual() {
  const svg = document.getElementById('core-question-svg-canvas');
  const heroBox = document.querySelector('.sentence-hero-box');
  const queryEl = document.getElementById('cq-token-it');
  if (!svg || !heroBox || !queryEl) return;

  function drawConnections() {
    // Ensure element is visible and has layout
    const svgRect = svg.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    svg.setAttribute('width', svgRect.width);
    svg.setAttribute('height', svgRect.height);
    svg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);
    svg.innerHTML = '';

    // Filter definition for glowing effect
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="cq-glow-orange" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="cq-glow-purple" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    const qRect = queryEl.getBoundingClientRect();
    // Query start point: top center of "it"
    const qX = (qRect.left + qRect.width / 2) - svgRect.left;
    const qY = qRect.top - svgRect.top;

    const targets = [
      {
        id: 'cq-token-animal',
        color: '#f97316',
        glowId: 'cq-glow-orange',
        width: 4.5,
        opacity: 1,
        tier: 'high',
        badge: 'HIGH RELEVANCE (0.65)',
        badgeBg: 'rgba(249, 115, 22, 0.95)',
        badgeColor: '#070b14',
        arcMultiplier: 1.05
      },
      {
        id: 'cq-token-tired',
        color: '#a855f7',
        glowId: 'cq-glow-purple',
        width: 3.0,
        opacity: 0.85,
        tier: 'med',
        badge: 'CONTEXT (0.20)',
        badgeBg: 'rgba(168, 85, 247, 0.9)',
        badgeColor: '#ffffff',
        arcMultiplier: 0.75
      },
      {
        id: 'cq-token-street',
        color: '#38bdf8',
        glowId: null,
        width: 1.8,
        opacity: 0.4,
        tier: 'low',
        badge: 'LOW (0.10)',
        badgeBg: 'rgba(15, 23, 42, 0.85)',
        badgeColor: '#94a3b8',
        arcMultiplier: 0.55
      }
    ];

    targets.forEach(t => {
      const el = document.getElementById(t.id);
      if (!el) return;

      const tRect = el.getBoundingClientRect();
      const tX = (tRect.left + tRect.width / 2) - svgRect.left;
      const tY = tRect.top - svgRect.top;

      const span = Math.abs(qX - tX);
      const arcRise = Math.max(75, Math.min(170, span * 0.35)) * t.arcMultiplier;

      // Control points for tangent vertical rise
      const cp1X = qX;
      const cp1Y = qY - arcRise;
      const cp2X = tX;
      const cp2Y = tY - arcRise;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // 1. Aura glow path for HIGH relevance
      if (t.tier === 'high') {
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        aura.setAttribute('d', `M ${qX} ${qY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tX} ${tY}`);
        aura.setAttribute('fill', 'none');
        aura.setAttribute('stroke', t.color);
        aura.setAttribute('stroke-width', '12');
        aura.setAttribute('opacity', '0.25');
        aura.setAttribute('filter', 'url(#cq-glow-orange)');
        g.appendChild(aura);
      }

      // 2. Main curved path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${qX} ${qY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tX} ${tY}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', t.color);
      path.setAttribute('stroke-width', t.width);
      path.setAttribute('opacity', t.opacity);
      if (t.glowId) path.setAttribute('filter', `url(#${t.glowId})`);
      if (t.tier === 'low') path.setAttribute('stroke-dasharray', '5 4');
      g.appendChild(path);

      // 3. Animated dash overlay for active signal feel
      if (t.tier === 'high') {
        const pulsePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pulsePath.setAttribute('d', `M ${qX} ${qY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tX} ${tY}`);
        pulsePath.setAttribute('fill', 'none');
        pulsePath.setAttribute('stroke', '#ffffff');
        pulsePath.setAttribute('stroke-width', '2.5');
        pulsePath.setAttribute('stroke-dasharray', '8 16');
        pulsePath.setAttribute('opacity', '0.9');
        pulsePath.style.animation = 'dash-flow 1.2s linear infinite';
        g.appendChild(pulsePath);
      }

      // 4. Exact anchor pin dots at word boundaries
      const qDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      qDot.setAttribute('cx', qX);
      qDot.setAttribute('cy', qY);
      qDot.setAttribute('r', t.tier === 'high' ? '5.5' : '4');
      qDot.setAttribute('fill', t.color);
      qDot.setAttribute('stroke', '#ffffff');
      qDot.setAttribute('stroke-width', '1.5');
      g.appendChild(qDot);

      const tDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tDot.setAttribute('cx', tX);
      tDot.setAttribute('cy', tY);
      tDot.setAttribute('r', t.tier === 'high' ? '5.5' : '4');
      tDot.setAttribute('fill', t.color);
      tDot.setAttribute('stroke', '#ffffff');
      tDot.setAttribute('stroke-width', '1.5');
      g.appendChild(tDot);

      // 5. Arc apex badge callout (positioned safely above words)
      const apexX = (qX + tX) / 2;
      const apexY = Math.min(qY, tY) - arcRise * 0.78;

      const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const badgeW = t.tier === 'high' ? 140 : (t.tier === 'med' ? 105 : 75);
      const badgeH = 22;

      badgeGroup.innerHTML = `
        <rect x="${apexX - badgeW / 2}" y="${apexY - badgeH / 2}" width="${badgeW}" height="${badgeH}" rx="11" fill="${t.badgeBg}" stroke="${t.color}" stroke-width="1" />
        <text x="${apexX}" y="${apexY + 4}" fill="${t.badgeColor}" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">${t.badge}</text>
      `;
      g.appendChild(badgeGroup);

      svg.appendChild(g);
    });
  }

  // Bind responsive observers
  window.addEventListener('resize', () => requestAnimationFrame(drawConnections));

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => requestAnimationFrame(drawConnections));
    ro.observe(heroBox);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(drawConnections, 100));
  }

  window.addEventListener('slideChange', (e) => {
    if (e.detail && e.detail.slideNumber === 2) {
      setTimeout(drawConnections, 50);
      setTimeout(drawConnections, 300);
    }
  });

  setTimeout(drawConnections, 200);
  setTimeout(drawConnections, 600);
}

/* ==========================================================================
   SLIDE 6: RAINBOW CHORD RELATIONSHIP ARCS ("It is really complicated...")
   ========================================================================== */
function initChordSentence() {
  const svg = document.getElementById('chord-svg');
  if (!svg) return;

  const words = COMPLICATED_SENTENCE;
  const width = 1000;
  const height = 480;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const startX = 100;
  const spacing = (width - 200) / (words.length - 1);
  const posY = 380;

  // Render Word Nodes along baseline
  const wordPositions = words.map((w, idx) => ({
    word: w,
    x: startX + idx * spacing,
    y: posY,
    index: idx
  }));

  // Pairwise relationship strengths (PDF-style circular arcs)
  const relationships = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const dist = Math.abs(i - j);
      let strength = 0.35 + Math.sin(i * 1.5 + j * 0.8) * 0.3;
      // Strong relations: complicated <-> understand, really <-> complicated, It <-> understand
      if ((words[i] === "really" && words[j] === "complicated") ||
          (words[i] === "complicated" && words[j] === "understand") ||
          (words[i] === "understand" && words[j] === "text") ||
          (words[i] === "It" && words[j] === "understand")) {
        strength = 0.9;
      }
      relationships.push({ from: i, to: j, strength });
    }
  }

  const colors = ["#00f0ff", "#38bdf8", "#818cf8", "#a855f7", "#ec4899", "#f97316", "#22c55e"];

  function renderArcs(selectedIdx = null) {
    svg.innerHTML = '';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f0ff" />
        <stop offset="50%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#f97316" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Draw curved arcs above the baseline
    relationships.forEach(rel => {
      const p1 = wordPositions[rel.from];
      const p2 = wordPositions[rel.to];
      const span = Math.abs(p2.x - p1.x);
      const arcHeight = Math.min(300, span * 0.65);
      const controlY = posY - arcHeight;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${p1.x} ${p1.y - 15} Q ${(p1.x + p2.x) / 2} ${controlY} ${p2.x} ${p2.y - 15}`);
      path.setAttribute('fill', 'none');

      let strokeColor = colors[(rel.from + rel.to) % colors.length];
      let opacity = rel.strength * 0.55;
      let strokeWidth = rel.strength * 3.5;

      if (selectedIdx !== null) {
        if (rel.from === selectedIdx || rel.to === selectedIdx) {
          opacity = 0.95;
          strokeWidth = rel.strength * 5;
          strokeColor = "#00f0ff";
        } else {
          opacity = 0.08;
          strokeWidth = 1;
        }
      }

      path.setAttribute('stroke', strokeColor);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('opacity', opacity);
      svg.appendChild(path);
    });

    // Draw word nodes
    wordPositions.forEach(p => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      const isSelected = (selectedIdx === p.index);

      // Node background pill
      const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pill.setAttribute('x', p.x - 45);
      pill.setAttribute('y', p.y - 18);
      pill.setAttribute('width', '90');
      pill.setAttribute('height', '36');
      pill.setAttribute('rx', '18');
      pill.setAttribute('fill', isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(15, 23, 42, 0.85)');
      pill.setAttribute('stroke', isSelected ? '#00f0ff' : 'rgba(56, 189, 248, 0.3)');
      pill.setAttribute('stroke-width', isSelected ? '2' : '1');
      g.appendChild(pill);

      // Node Text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', p.x);
      text.setAttribute('y', p.y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', isSelected ? '#ffffff' : '#cbd5e1');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', isSelected ? '700' : '500');
      text.setAttribute('font-family', 'sans-serif');
      text.textContent = p.word;
      g.appendChild(text);

      g.addEventListener('mouseenter', () => {
        renderArcs(p.index);
        const infoEl = document.getElementById('chord-info-banner');
        if (infoEl) infoEl.innerHTML = `Observing relationships for <strong>"${p.word}"</strong>. Notice how attention measures connections to every other token.`;
      });

      g.addEventListener('mouseleave', () => {
        renderArcs(null);
        const infoEl = document.getElementById('chord-info-banner');
        if (infoEl) infoEl.textContent = `Hover over any word to reveal its network of relationships.`;
      });

      svg.appendChild(g);
    });
  }

  renderArcs(null);
}

/* ==========================================================================
   SLIDE 7: ATTENTION = WEIGHTED FOCUS (Animated Beams)
   ========================================================================== */
function initAttentionBeamVisual() {
  const svg = document.getElementById('attention-beam-svg');
  if (!svg) return;

  const width = 780;
  const height = 440;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const words = ANIMAL_SENTENCE;
  const queryIndex = 7; // "it"

  const qPos = { x: width / 2, y: 100 };
  const spacing = (width - 120) / (words.length - 1);
  const bottomY = 360;

  const wordNodes = words.map((w, i) => ({
    ...w,
    index: i,
    x: 60 + i * spacing,
    y: bottomY
  }));

  function renderBeams(focusIndex = queryIndex) {
    svg.innerHTML = '';

    // Defs for glowing filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <radialGradient id="queryGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#00f0ff" stop-opacity="0" />
      </radialGradient>
    `;
    svg.appendChild(defs);

    // Beams from Query "it" to each target word
    wordNodes.forEach(node => {
      if (node.index === focusIndex) return;

      const beam = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const midY = (qPos.y + node.y) / 2;
      const d = `M ${qPos.x} ${qPos.y + 15} Q ${(qPos.x + node.x) / 2} ${midY} ${node.x} ${node.y - 20}`;
      beam.setAttribute('d', d);
      beam.setAttribute('fill', 'none');

      let strokeColor = 'rgba(148, 163, 184, 0.2)';
      let strokeWidth = 1.5;
      let opacity = 0.25;

      if (node.key === 'animal') {
        strokeColor = '#f97316';
        strokeWidth = 6;
        opacity = 0.95;
      } else if (node.key === 'tired') {
        strokeColor = '#a855f7';
        strokeWidth = 3.5;
        opacity = 0.8;
      } else if (node.key === 'street') {
        strokeColor = '#3b82f6';
        strokeWidth = 2.5;
        opacity = 0.5;
      }

      beam.setAttribute('stroke', strokeColor);
      beam.setAttribute('stroke-width', strokeWidth);
      beam.setAttribute('opacity', opacity);
      svg.appendChild(beam);
    });

    // Draw Top Query Node ("it")
    const qGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    qGroup.innerHTML = `
      <circle cx="${qPos.x}" cy="${qPos.y}" r="38" fill="url(#queryGlow)" />
      <rect x="${qPos.x - 55}" y="${qPos.y - 22}" width="110" height="44" rx="22" fill="#0d1527" stroke="#00f0ff" stroke-width="2.5" />
      <text x="${qPos.x}" y="${qPos.y + 6}" fill="#00f0ff" font-size="18" font-weight="bold" font-family="monospace" text-anchor="middle">Query: "it"</text>
    `;
    svg.appendChild(qGroup);

    // Draw Bottom Target Nodes
    wordNodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isTarget = node.key === 'animal';
      const isContext = node.key === 'tired';

      let bg = 'rgba(15, 23, 42, 0.8)';
      let stroke = 'rgba(255, 255, 255, 0.15)';
      let textFill = '#94a3b8';

      if (isTarget) {
        bg = 'rgba(249, 115, 22, 0.2)';
        stroke = '#f97316';
        textFill = '#fff';
      } else if (isContext) {
        bg = 'rgba(168, 85, 247, 0.2)';
        stroke = '#a855f7';
        textFill = '#fff';
      }

      g.innerHTML = `
        <rect x="${node.x - 30}" y="${node.y - 16}" width="60" height="32" rx="6" fill="${bg}" stroke="${stroke}" stroke-width="${isTarget ? 2 : 1}" />
        <text x="${node.x}" y="${node.y + 4}" fill="${textFill}" font-size="12" font-weight="${isTarget ? 'bold' : 'normal'}" text-anchor="middle">${node.text}</text>
      `;

      if (isTarget) {
        g.innerHTML += `<text x="${node.x}" y="${node.y + 32}" fill="#f97316" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">HIGH FOCUS</text>`;
      } else if (isContext) {
        g.innerHTML += `<text x="${node.x}" y="${node.y + 32}" fill="#a855f7" font-size="10" font-family="monospace" text-anchor="middle">MEDIUM</text>`;
      }

      svg.appendChild(g);
    });
  }

  renderBeams();
}

/* ==========================================================================
   SLIDE 8 & 9: ATTENTION SCORES & SOFTMAX NORMALIZATION
   ========================================================================== */
function initAttentionScoresAndSoftmax() {
  const container8 = document.getElementById('scores-container-8');
  const container9 = document.getElementById('softmax-container-9');

  const words = ANIMAL_SENTENCE.filter(w => w.key !== 'it');

  if (container8) {
    container8.innerHTML = '';
    words.forEach(item => {
      const row = document.createElement('div');
      row.className = 'score-row';
      const pct = (item.rawScore / 10) * 100;
      let barClass = '';
      if (item.key === 'animal') barClass = 'high';
      else if (item.key === 'tired') barClass = 'med';

      row.innerHTML = `
        <div class="score-word-label ${item.key === 'animal' ? 'highlight-word' : ''}">${item.text}</div>
        <div class="score-bar-bg">
          <div class="score-bar-fill ${barClass}" style="width: ${pct}%;"></div>
        </div>
        <div class="score-value">${item.rawScore.toFixed(1)}</div>
      `;
      container8.appendChild(row);
    });
  }

  if (container9) {
    container9.innerHTML = '';
    words.forEach(item => {
      const row = document.createElement('div');
      row.className = 'score-row';
      const pct = item.weight * 100;
      let barClass = '';
      if (item.key === 'animal') barClass = 'high';
      else if (item.key === 'tired') barClass = 'med';

      row.innerHTML = `
        <div class="score-word-label ${item.key === 'animal' ? 'highlight-word' : ''}">${item.text}</div>
        <div class="score-bar-bg">
          <div class="score-bar-fill ${barClass}" style="width: ${pct}%;"></div>
        </div>
        <div class="score-value">${(item.weight * 100).toFixed(0)}% (${item.weight.toFixed(2)})</div>
      `;
      container9.appendChild(row);
    });
  }
}

/* ==========================================================================
   SLIDE 11: STEP-BY-STEP ATTENTION STEPPER (6 STEPS)
   ========================================================================== */
const ATTENTION_STEPS = [
  {
    step: 1,
    title: "1 — Create Q, K & V Vectors",
    formula: "Q = X · W_Q  |  K = X · W_K  |  V = X · W_V",
    desc: "Input embeddings are projected into three distinct spaces via linear transformation matrices.",
    graphic: `
      <div style="display:flex; gap:1.5rem; align-items:center; justify-content:center; width:100%;">
        <div style="padding:1rem; background:rgba(0,240,255,0.1); border:1px solid #00f0ff; border-radius:8px; text-align:center;">
          <div style="color:#00f0ff; font-weight:bold; font-size:1.4rem;">Q</div>
          <div style="font-size:0.75rem; color:#94a3b8;">Query Vector</div>
        </div>
        <div style="padding:1rem; background:rgba(168,85,247,0.1); border:1px solid #a855f7; border-radius:8px; text-align:center;">
          <div style="color:#a855f7; font-weight:bold; font-size:1.4rem;">K</div>
          <div style="font-size:0.75rem; color:#94a3b8;">Key Vector</div>
        </div>
        <div style="padding:1rem; background:rgba(34,197,94,0.1); border:1px solid #22c55e; border-radius:8px; text-align:center;">
          <div style="color:#22c55e; font-weight:bold; font-size:1.4rem;">V</div>
          <div style="font-size:0.75rem; color:#94a3b8;">Value Vector</div>
        </div>
      </div>
    `
  },
  {
    step: 2,
    title: "2 — Calculate Relevance Scores (Q · Kᵀ)",
    formula: "Scores = Q × Kᵀ",
    desc: "Compute the dot product between the query of the current token and the keys of all tokens.",
    graphic: `
      <div style="text-align:center;">
        <div style="font-family:monospace; font-size:1.2rem; color:#38bdf8;">[Q_it] · [K_word]ᵀ = Relevance Score</div>
        <div style="margin-top:0.8rem; font-size:0.85rem; color:#94a3b8;">High score when vectors point in similar directions.</div>
      </div>
    `
  },
  {
    step: 3,
    title: "3 — Scale the Scores by √d_k",
    formula: "Scaled = (Q × Kᵀ) / √d_k",
    desc: "Divide scores by the square root of the key dimension (e.g. √64 = 8) to prevent vanishing gradients during softmax.",
    graphic: `
      <div style="text-align:center; padding:1rem; background:rgba(59,130,246,0.1); border-radius:8px; border:1px solid #3b82f6;">
        <div style="font-size:1.8rem; color:#60a5fa; font-family:monospace;">÷ √dₖ</div>
        <div style="font-size:0.85rem; color:#94a3b8; margin-top:0.5rem;">Prevents extremely large values that flatten softmax gradients.</div>
      </div>
    `
  },
  {
    step: 4,
    title: "4 — Apply Softmax",
    formula: "Attention Weights = Softmax(Scaled Scores)",
    desc: "Exponentiate and normalize the scaled scores so they become probability distribution weights summing to 1.0 (100%).",
    graphic: `
      <div style="display:flex; flex-direction:column; gap:0.5rem; width:80%;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-family:monospace;">
          <span>animal: 0.65</span> <span>tired: 0.20</span> <span>street: 0.10</span>
        </div>
        <div style="height:12px; background:linear-gradient(90deg, #f97316 65%, #a855f7 85%, #3b82f6 95%, #64748b 100%); border-radius:6px;"></div>
        <div style="text-align:center; font-size:0.8rem; color:#22c55e;">∑ Weights = 1.00 (100%)</div>
      </div>
    `
  },
  {
    step: 5,
    title: "5 — Weighted Sum of Values",
    formula: "Z = ∑ (Weightᵢ × Vᵢ)",
    desc: "Multiply each value vector V by its attention weight and sum them together.",
    graphic: `
      <div style="text-align:center; font-family:monospace; font-size:1rem; color:#cbd5e1;">
        <span style="color:#f97316;">0.65 × V_animal</span> + <span style="color:#a855f7;">0.20 × V_tired</span> + <span style="color:#3b82f6;">0.10 × V_street</span>
      </div>
    `
  },
  {
    step: 6,
    title: "6 — Contextual Representation Produced",
    formula: "Output = Contextualized Vector",
    desc: "The resulting vector now encodes 'it' enriched with the knowledge that it refers to the tired animal.",
    graphic: `
      <div style="padding:1.2rem; background:rgba(34,197,94,0.15); border:1px solid #22c55e; border-radius:12px; text-align:center;">
        <div style="color:#4ade80; font-weight:bold; font-size:1.3rem;">✨ Context-Aware Token "it"</div>
        <div style="font-size:0.85rem; color:#94a3b8; margin-top:0.4rem;">Embodies both identity and surrounding context!</div>
      </div>
    `
  }
];

class AttentionStepper {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.bindEvents();
    this.renderStep(1);
  }

  bindEvents() {
    const prevBtn = document.getElementById('stepper-prev-btn');
    const nextBtn = document.getElementById('stepper-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentStep > 1) this.renderStep(this.currentStep - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < this.totalSteps) this.renderStep(this.currentStep + 1);
      });
    }

    // Step nodes
    for (let i = 1; i <= 6; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (node) {
        node.addEventListener('click', () => this.renderStep(i));
      }
    }
  }

  renderStep(stepNum) {
    this.currentStep = stepNum;
    const data = ATTENTION_STEPS[stepNum - 1];

    const titleEl = document.getElementById('stepper-title');
    const formulaEl = document.getElementById('stepper-formula');
    const descEl = document.getElementById('stepper-desc');
    const visEl = document.getElementById('stepper-vis');
    const badgeEl = document.getElementById('stepper-badge');

    if (titleEl) titleEl.textContent = data.title;
    if (formulaEl) formulaEl.textContent = data.formula;
    if (descEl) descEl.textContent = data.desc;
    if (visEl) visEl.innerHTML = data.graphic;
    if (badgeEl) badgeEl.textContent = `STEP ${stepNum} OF ${this.totalSteps}`;

    // Update node styles
    for (let i = 1; i <= 6; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (!node) continue;
      node.className = 'step-node';
      if (i === stepNum) node.classList.add('active');
      else if (i < stepNum) node.classList.add('completed');
    }
  }
}

/* ==========================================================================
   SLIDE 12: INTERACTIVE FORMULA BREAKDOWN
   ========================================================================== */
function initFormulaInteractions() {
  const parts = document.querySelectorAll('.formula-part');
  const cards = document.querySelectorAll('.breakdown-card');

  parts.forEach(part => {
    part.addEventListener('mouseenter', () => {
      const target = part.getAttribute('data-part');
      highlightPart(target);
    });
  });

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const target = card.getAttribute('data-part');
      highlightPart(target);
    });
  });

  function highlightPart(target) {
    parts.forEach(p => p.classList.toggle('active', p.getAttribute('data-part') === target));
    cards.forEach(c => c.classList.toggle('active', c.getAttribute('data-part') === target));
  }
}

/* ==========================================================================
   SLIDE 13: WEIGHTED SUM SIMULATION
   ========================================================================== */
function initWeightedSumVisual() {
  const svg = document.getElementById('weighted-sum-svg');
  if (!svg) return;

  const width = 600;
  const height = 440;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const values = [
    { label: "V_animal", weight: 0.65, color: "#f97316", y: 80 },
    { label: "V_tired", weight: 0.20, color: "#a855f7", y: 190 },
    { label: "V_street", weight: 0.10, color: "#3b82f6", y: 300 }
  ];

  const outX = 460;
  const outY = 190;

  function render() {
    svg.innerHTML = '';

    // Streams merging into output
    values.forEach(v => {
      const startX = 140;
      const startY = v.y;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = `M ${startX} ${startY} C ${startX + 150} ${startY}, ${outX - 150} ${outY}, ${outX} ${outY}`;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', v.color);
      path.setAttribute('stroke-width', v.weight * 16);
      path.setAttribute('opacity', '0.8');
      svg.appendChild(path);

      // Value input badge
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `
        <rect x="${startX - 110}" y="${startY - 20}" width="105" height="40" rx="8" fill="#0f172a" stroke="${v.color}" stroke-width="1.5" />
        <text x="${startX - 60}" y="${startY + 5}" fill="${v.color}" font-size="13" font-weight="bold" font-family="monospace" text-anchor="middle">${v.label}</text>
        <text x="${startX + 15}" y="${startY - 8}" fill="#fff" font-size="11" font-family="monospace">${(v.weight * 100).toFixed(0)}%</text>
      `;
      svg.appendChild(g);
    });

    // Output Context Vector
    const outG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    outG.innerHTML = `
      <circle cx="${outX + 50}" cy="${outY}" r="45" fill="rgba(34, 197, 94, 0.15)" stroke="#22c55e" stroke-width="2" />
      <text x="${outX + 50}" y="${outY - 6}" fill="#22c55e" font-size="13" font-weight="bold" font-family="monospace" text-anchor="middle">Context</text>
      <text x="${outX + 50}" y="${outY + 14}" fill="#e2e8f0" font-size="11" font-family="monospace" text-anchor="middle">Representation</text>
    `;
    svg.appendChild(outG);
  }

  render();
}

/* ==========================================================================
   SLIDE 17: O(N^2) QUADRATIC MATRIX VISUALIZER
   ========================================================================== */
function initQuadraticVisualizer() {
  const canvas = document.getElementById('matrix-canvas');
  const slider = document.getElementById('seq-length-slider');
  const lenDisplay = document.getElementById('seq-length-display');
  const opsDisplay = document.getElementById('seq-ops-display');

  if (!canvas || !slider) return;
  const ctx = canvas.getContext('2d');

  function updateMatrix(n) {
    if (lenDisplay) lenDisplay.textContent = `${n} Tokens`;
    if (opsDisplay) opsDisplay.textContent = `${n * n} Comparisons`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = canvas.width;
    const cellSize = size / n;

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        // High density visual representation
        ctx.fillStyle = (r === c) ? '#00f0ff' : 'rgba(168, 85, 247, 0.4)';
        ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }

  slider.addEventListener('input', (e) => {
    updateMatrix(parseInt(e.target.value, 10));
  });

  updateMatrix(parseInt(slider.value, 10));
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initCoreQuestionVisual();
  initChordSentence();
  initAttentionBeamVisual();
  initAttentionScoresAndSoftmax();
  window.attentionStepper = new AttentionStepper();
  initFormulaInteractions();
  initWeightedSumVisual();
  initQuadraticVisualizer();
});
