/**
 * embeddings.js
 * Visualizes large 2D embedding spaces, clusters, linear transformations, and interactive quizzes.
 * Designed for projector readability: large objects (26px icons, r=10 dots), non-overlapping labels,
 * dynamic distance lines on hover, and 75% visual real estate.
 */

const EMBEDDING_DATA = [
  // Fruits
  { word: "Apple", x: 5.2, y: 5.4, category: "fruit", color: "#ef4444", icon: "🍎", labelPos: "left" },
  { word: "Banana", x: 6.8, y: 5.6, category: "fruit", color: "#eab308", icon: "🍌", labelPos: "right" },
  { word: "Strawberry", x: 5.0, y: 3.8, category: "fruit", color: "#f43f5e", icon: "🍓", labelPos: "left" },
  { word: "Cherry", x: 6.8, y: 3.8, category: "fruit", color: "#e11d48", icon: "🍒", labelPos: "right" },
  
  // Sports
  { word: "Soccer", x: 1.0, y: 6.4, category: "sports", color: "#10b981", icon: "⚽", labelPos: "right" },
  { word: "Basketball", x: 2.2, y: 5.2, category: "sports", color: "#f97316", icon: "🏀", labelPos: "right" },
  { word: "Tennis", x: 1.0, y: 4.0, category: "sports", color: "#84cc16", icon: "🎾", labelPos: "right" },
  
  // Vehicles
  { word: "Bicycle", x: 4.2, y: 1.4, category: "vehicle", color: "#06b6d4", icon: "🚲", labelPos: "left" },
  { word: "Truck", x: 5.8, y: 2.2, category: "vehicle", color: "#3b82f6", icon: "🚚", labelPos: "top" },
  { word: "Car", x: 6.8, y: 0.9, category: "vehicle", color: "#6366f1", icon: "🚗", labelPos: "right" },

  // Tech (for Quiz 2 / polysemy demonstration)
  { word: "Laptop", x: 1.2, y: 2.2, category: "tech", color: "#8b5cf6", icon: "💻", labelPos: "right" },
  { word: "Android", x: 1.2, y: 1.0, category: "tech", color: "#22c55e", icon: "🤖", labelPos: "right" },
  { word: "Microsoft", x: 2.5, y: 1.0, category: "tech", color: "#0ea5e9", icon: "🪟", labelPos: "right" }
];

class EmbeddingGrid {
  constructor(svgId, options = {}) {
    this.svg = document.getElementById(svgId);
    if (!this.svg) return;
    this.width = options.width || 860;
    this.height = options.height || 520;
    this.padding = options.padding || 55;
    this.minX = options.minX || 0;
    this.maxX = options.maxX || 8;
    this.minY = options.minY || 0;
    this.maxY = options.maxY || 8;
    this.enableHoverConnections = options.enableHoverConnections || false;
    this.slideId = options.slideId || 3;
    this.showTech = options.showTech || false;
    this.scaleX = (this.width - 2 * this.padding) / (this.maxX - this.minX);
    this.scaleY = (this.height - 2 * this.padding) / (this.maxY - this.minY);

    this.points = [];
    this.activeTransform = { rotate: 0, stretchX: 1, stretchY: 1 };
    this.init();
  }

  toSvgX(x) {
    return this.padding + (x - this.minX) * this.scaleX;
  }

  toSvgY(y) {
    return this.height - this.padding - (y - this.minY) * this.scaleY;
  }

  fromSvgCoords(svgX, svgY) {
    const x = ((svgX - this.padding) / this.scaleX) + this.minX;
    const y = (((this.height - this.padding - svgY) / this.scaleY) + this.minY);
    return { x: Math.max(0, Math.min(this.maxX, x)), y: Math.max(0, Math.min(this.maxY, y)) };
  }

  init() {
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    this.render();
  }

  render() {
    this.svg.innerHTML = '';

    // Defs for glowing drop shadows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="glow-${this.svg.id}" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#070b14" />
        <stop offset="100%" stop-color="#0d1527" />
      </linearGradient>
    `;
    this.svg.appendChild(defs);

    // Background rect
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', this.width);
    bg.setAttribute('height', this.height);
    bg.setAttribute('fill', 'url(#gridGrad)');
    bg.setAttribute('rx', '14');
    this.svg.appendChild(bg);

    // Grid lines group
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid-lines');

    for (let x = this.minX; x <= this.maxX; x += 1) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.toSvgX(x));
      line.setAttribute('y1', this.padding - 10);
      line.setAttribute('x2', this.toSvgX(x));
      line.setAttribute('y2', this.height - this.padding);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);

      // X Axis tick labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', this.toSvgX(x));
      label.setAttribute('y', this.height - this.padding + 22);
      label.setAttribute('fill', 'rgba(148, 163, 184, 0.75)');
      label.setAttribute('font-size', '13');
      label.setAttribute('font-weight', '600');
      label.setAttribute('font-family', 'monospace');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = x;
      gridGroup.appendChild(label);
    }

    for (let y = this.minY; y <= this.maxY; y += 1) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.padding);
      line.setAttribute('y1', this.toSvgY(y));
      line.setAttribute('x2', this.width - this.padding + 10);
      line.setAttribute('y2', this.toSvgY(y));
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);

      // Y Axis tick labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', this.padding - 16);
      label.setAttribute('y', this.toSvgY(y) + 5);
      label.setAttribute('fill', 'rgba(148, 163, 184, 0.75)');
      label.setAttribute('font-size', '13');
      label.setAttribute('font-weight', '600');
      label.setAttribute('font-family', 'monospace');
      label.setAttribute('text-anchor', 'end');
      label.textContent = y;
      gridGroup.appendChild(label);
    }

    // Main Axes
    const axesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    axesGroup.innerHTML = `
      <line x1="${this.padding}" y1="${this.height - this.padding}" x2="${this.width - this.padding + 20}" y2="${this.height - this.padding}" stroke="#38bdf8" stroke-width="2.5" />
      <line x1="${this.padding}" y1="${this.height - this.padding}" x2="${this.padding}" y2="${this.padding - 20}" stroke="#38bdf8" stroke-width="2.5" />
      <polygon points="${this.width - this.padding + 28},${this.height - this.padding} ${this.width - this.padding + 16},${this.height - this.padding - 6} ${this.width - this.padding + 16},${this.height - this.padding + 6}" fill="#38bdf8" />
      <polygon points="${this.padding},${this.padding - 28} ${this.padding - 6},${this.padding - 16} ${this.padding + 6},${this.padding - 16}" fill="#38bdf8" />
      <text x="${this.width - this.padding + 32}" y="${this.height - this.padding + 5}" fill="#38bdf8" font-size="14" font-weight="bold" font-family="monospace">Dim 1 (x)</text>
      <text x="${this.padding}" y="${this.padding - 36}" fill="#38bdf8" font-size="14" font-weight="bold" font-family="monospace" text-anchor="middle">Dim 2 (y)</text>
    `;
    this.svg.appendChild(gridGroup);
    this.svg.appendChild(axesGroup);

    // Dynamic Connections group (for Slide 4 nearest neighbor lines)
    this.connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.connectionsGroup);

    // Points group
    this.pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.pointsGroup);

    // Render Data Points
    EMBEDDING_DATA.forEach(item => {
      if (!this.showTech && item.category === 'tech') return;
      this.renderPoint(item);
    });
  }

  applyTransformation(rotateDeg, stretchX, stretchY) {
    this.activeTransform = { rotate: rotateDeg, stretchX, stretchY };
    this.pointsGroup.innerHTML = '';
    this.connectionsGroup.innerHTML = '';

    const centerX = 3.5;
    const centerY = 3.5;
    const rad = (rotateDeg * Math.PI) / 180;

    EMBEDDING_DATA.forEach(item => {
      if (!this.showTech && item.category === 'tech') return;

      let dx = (item.x - centerX) * stretchX;
      let dy = (item.y - centerY) * stretchY;

      let rx = dx * Math.cos(rad) - dy * Math.sin(rad);
      let ry = dx * Math.sin(rad) + dy * Math.cos(rad);

      let transformedX = rx + centerX;
      let transformedY = ry + centerY;

      this.renderPoint({
        ...item,
        x: transformedX,
        y: transformedY,
        originalX: item.x,
        originalY: item.y
      });
    });
  }

  renderPoint(item) {
    const cx = this.toSvgX(item.x);
    const cy = this.toSvgY(item.y);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `point-node point-${item.word.toLowerCase()}`);
    group.style.cursor = 'pointer';

    // 1. Outer Glow Aura (Projector Visibility: r=22)
    const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aura.setAttribute('cx', cx);
    aura.setAttribute('cy', cy);
    aura.setAttribute('r', '22');
    aura.setAttribute('fill', item.color);
    aura.setAttribute('opacity', '0.22');
    group.appendChild(aura);

    // 2. Inner Dot (r=10 with crisp white stroke)
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', '10');
    dot.setAttribute('fill', item.color);
    dot.setAttribute('stroke', '#ffffff');
    dot.setAttribute('stroke-width', '2.5');
    dot.setAttribute('filter', `url(#glow-${this.svg.id})`);
    group.appendChild(dot);

    // 3. Large Emoji Icon (26px)
    const textIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    let iconX = cx;
    let iconY = cy - 16;
    textIcon.setAttribute('x', iconX);
    textIcon.setAttribute('y', iconY);
    textIcon.setAttribute('font-size', '26');
    textIcon.setAttribute('text-anchor', 'middle');
    textIcon.textContent = item.icon;
    group.appendChild(textIcon);

    // 4. Intelligent Label Positioning (No overlapping!)
    const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    let textAnchor = 'start';
    let labelX = cx + 18;
    let labelY = cy - 2;
    let badgeX = cx + 18;
    let badgeY = cy + 16;

    if (item.labelPos === 'left') {
      textAnchor = 'end';
      labelX = cx - 18;
      labelY = cy - 2;
      badgeX = cx - 18;
      badgeY = cy + 16;
    } else if (item.labelPos === 'top') {
      textAnchor = 'middle';
      labelX = cx;
      labelY = cy - 44;
      badgeX = cx;
      badgeY = cy - 28;
    }

    // Word Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', labelX);
    label.setAttribute('y', labelY);
    label.setAttribute('fill', '#ffffff');
    label.setAttribute('font-size', '16');
    label.setAttribute('font-weight', '700');
    label.setAttribute('font-family', 'sans-serif');
    label.setAttribute('text-anchor', textAnchor);
    label.textContent = item.word;
    labelGroup.appendChild(label);

    // Vector Coordinate Tag
    const coordText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    coordText.setAttribute('x', badgeX);
    coordText.setAttribute('y', badgeY);
    coordText.setAttribute('fill', '#38bdf8');
    coordText.setAttribute('font-size', '13');
    coordText.setAttribute('font-weight', '600');
    coordText.setAttribute('font-family', 'monospace');
    coordText.setAttribute('text-anchor', textAnchor);
    coordText.textContent = `[${item.x.toFixed(1)}, ${item.y.toFixed(1)}]`;
    labelGroup.appendChild(coordText);

    group.appendChild(labelGroup);

    // 5. Interactive Hover
    group.addEventListener('mouseenter', () => {
      aura.setAttribute('r', '32');
      aura.setAttribute('opacity', '0.5');
      dot.setAttribute('r', '13');

      // Update Slide 3 Inspector
      const word3 = document.getElementById('inspector-word-3');
      const coords3 = document.getElementById('inspector-coords-3');
      const cat3 = document.getElementById('inspector-cat-3');
      if (word3) word3.innerHTML = `${item.icon} ${item.word}`;
      if (coords3) coords3.textContent = `Vector: [${item.x.toFixed(1)}, ${item.y.toFixed(1)}]`;
      if (cat3) cat3.innerHTML = `Cluster: <strong style="color:${item.color}">${item.category.toUpperCase()}</strong>`;

      // Update Slide 4 Inspector
      const inspector4 = document.getElementById('embedding-inspector-text');
      if (inspector4) {
        inspector4.innerHTML = `
          <div style="font-size:1.2rem; font-weight:800; color:#fff;">${item.icon} ${item.word}</div>
          <div style="font-family:monospace; font-size:1.05rem; color:#38bdf8; margin:0.2rem 0;">Vector: [${item.x.toFixed(1)}, ${item.y.toFixed(1)}]</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">Semantic Cluster: <strong style="color:${item.color}">${item.category.toUpperCase()}</strong></div>
        `;
      }

      // Slide 4: Draw glowing connections to nearby items in the same category!
      if (this.enableHoverConnections && this.connectionsGroup) {
        this.connectionsGroup.innerHTML = '';
        const sameCluster = EMBEDDING_DATA.filter(other => other.category === item.category && other.word !== item.word);

        sameCluster.forEach(other => {
          const ox = this.toSvgX(other.x);
          const oy = this.toSvgY(other.y);
          const dist = Math.sqrt(Math.pow(item.x - other.x, 2) + Math.pow(item.y - other.y, 2));

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', cx);
          line.setAttribute('y1', cy);
          line.setAttribute('x2', ox);
          line.setAttribute('y2', oy);
          line.setAttribute('stroke', item.color);
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '6 4');
          line.setAttribute('opacity', '0.75');
          this.connectionsGroup.appendChild(line);

          // Distance badge
          const midX = (cx + ox) / 2;
          const midY = (cy + oy) / 2;
          const distTag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          distTag.setAttribute('x', midX);
          distTag.setAttribute('y', midY - 6);
          distTag.setAttribute('fill', '#ffffff');
          distTag.setAttribute('font-size', '11');
          distTag.setAttribute('font-weight', 'bold');
          distTag.setAttribute('font-family', 'monospace');
          distTag.setAttribute('text-anchor', 'middle');
          distTag.textContent = `d=${dist.toFixed(1)}`;
          this.connectionsGroup.appendChild(distTag);
        });
      }
    });

    group.addEventListener('mouseleave', () => {
      aura.setAttribute('r', '22');
      aura.setAttribute('opacity', '0.22');
      dot.setAttribute('r', '10');
      if (this.connectionsGroup) this.connectionsGroup.innerHTML = '';
    });

    this.pointsGroup.appendChild(group);
  }
}

// Slide 5: Interactive Quiz
class EmbeddingQuiz {
  constructor(svgId) {
    this.svg = document.getElementById(svgId);
    if (!this.svg) return;
    this.grid = new EmbeddingGrid(svgId, { width: 860, height: 520, padding: 55, showTech: false });
    this.quizMode = 1; // 1 = Fruit Apple, 2 = Tech Apple
    this.userPoint = null;
    this.revealed = false;

    this.bindEvents();
    this.resetQuiz(1);
  }

  bindEvents() {
    this.svg.addEventListener('click', (e) => {
      if (this.revealed) return;
      const rect = this.svg.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * 860;
      const svgY = ((e.clientY - rect.top) / rect.height) * 520;
      const coords = this.grid.fromSvgCoords(svgX, svgY);
      this.placeUserPoint(coords.x, coords.y);
    });

    const resetBtn = document.getElementById('quiz-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetQuiz(this.quizMode));
    }

    const revealBtn = document.getElementById('quiz-reveal-btn');
    if (revealBtn) {
      revealBtn.addEventListener('click', () => this.revealAnswer());
    }

    const mode1Btn = document.getElementById('quiz-mode-1');
    const mode2Btn = document.getElementById('quiz-mode-2');

    if (mode1Btn && mode2Btn) {
      mode1Btn.addEventListener('click', () => {
        mode1Btn.classList.add('primary');
        mode1Btn.classList.remove('secondary');
        mode2Btn.classList.remove('primary');
        mode2Btn.classList.add('secondary');
        this.resetQuiz(1);
      });

      mode2Btn.addEventListener('click', () => {
        mode2Btn.classList.add('primary');
        mode2Btn.classList.remove('secondary');
        mode1Btn.classList.remove('primary');
        mode1Btn.classList.add('secondary');
        this.resetQuiz(2);
      });
    }
  }

  resetQuiz(mode) {
    this.quizMode = mode;
    this.revealed = false;
    this.userPoint = null;
    this.grid.showTech = (mode === 2);
    this.grid.render();

    // Hide Apple temporarily in Quiz 1 so user can guess
    const applePoint = this.svg.querySelector('.point-apple');
    if (applePoint) applePoint.remove();

    // Reset feedback
    const feedbackBox = document.getElementById('quiz-feedback-box');
    if (feedbackBox) {
      feedbackBox.className = 'quiz-feedback';
      feedbackBox.innerHTML = '';
      feedbackBox.style.display = 'none';
    }

    const promptWord = document.getElementById('quiz-target-word');
    if (promptWord) {
      if (mode === 1) {
        promptWord.innerHTML = `🍎 Apple <span style="font-size:0.8rem; font-weight:normal; color:#94a3b8;">(Fruit)</span>`;
      } else {
        promptWord.innerHTML = `🍏 Apple Inc. <span style="font-size:0.8rem; font-weight:normal; color:#94a3b8;">(Tech)</span>`;
      }
    }

    const oldMarkers = this.svg.querySelectorAll('.quiz-user-marker, .quiz-target-marker, .quiz-guide-line');
    oldMarkers.forEach(el => el.remove());
  }

  placeUserPoint(x, y) {
    this.userPoint = { x, y };
    const oldMarker = this.svg.querySelector('.quiz-user-marker');
    if (oldMarker) oldMarker.remove();

    const cx = this.grid.toSvgX(x);
    const cy = this.grid.toSvgY(y);

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('class', 'quiz-user-marker');
    marker.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="26" fill="rgba(0, 240, 255, 0.25)" />
      <circle cx="${cx}" cy="${cy}" r="10" fill="#00f0ff" stroke="#ffffff" stroke-width="2.5" />
      <rect x="${cx + 16}" y="${cy - 12}" width="145" height="24" rx="6" fill="#0f172a" stroke="#00f0ff" stroke-width="1" />
      <text x="${cx + 24}" y="${cy + 4}" fill="#00f0ff" font-size="12" font-weight="bold" font-family="monospace">YOUR CLICK [${x.toFixed(1)}, ${y.toFixed(1)}]</text>
    `;
    this.svg.appendChild(marker);

    // Target coordinates
    const targetX = (this.quizMode === 1) ? 5.2 : 1.6;
    const targetY = (this.quizMode === 1) ? 5.4 : 1.8;
    const dist = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

    const feedbackBox = document.getElementById('quiz-feedback-box');
    if (feedbackBox) {
      feedbackBox.style.display = 'block';
      if (dist < 1.6) {
        feedbackBox.className = 'quiz-feedback success';
        feedbackBox.innerHTML = `🎯 <strong>Spot on!</strong> (Distance: ${dist.toFixed(2)}) You placed Apple directly into ${this.quizMode === 1 ? 'the Fruit cluster' : 'the Technology cluster'}!`;
      } else if (dist < 3.2) {
        feedbackBox.className = 'quiz-feedback close';
        feedbackBox.innerHTML = `⚠️ <strong>Close!</strong> (Distance: ${dist.toFixed(2)}) Similar concepts group together. ${this.quizMode === 1 ? 'Fruits cluster near (5.2, 5.4)' : 'Tech clusters near (1.6, 1.8)'}.`;
      } else {
        feedbackBox.className = 'quiz-feedback far';
        feedbackBox.innerHTML = `❌ <strong>Too far!</strong> (Distance: ${dist.toFixed(2)}) Word embeddings encode meaning as geometry: fruits group with fruits, vehicles with vehicles.`;
      }
    }
  }

  revealAnswer() {
    this.revealed = true;
    const targetX = (this.quizMode === 1) ? 5.2 : 1.6;
    const targetY = (this.quizMode === 1) ? 5.4 : 1.8;

    const cx = this.grid.toSvgX(targetX);
    const cy = this.grid.toSvgY(targetY);

    const targetMarker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    targetMarker.setAttribute('class', 'quiz-target-marker');
    targetMarker.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="48" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="6 4" />
      <circle cx="${cx}" cy="${cy}" r="11" fill="#22c55e" stroke="#fff" stroke-width="2.5" />
      <rect x="${cx + 18}" y="${cy - 20}" width="165" height="40" rx="8" fill="#0f172a" stroke="#22c55e" stroke-width="1.5" />
      <text x="${cx + 26}" y="${cy - 4}" fill="#22c55e" font-size="13" font-weight="bold">TARGET: ${this.quizMode === 1 ? 'Fruit Cluster' : 'Tech Cluster'}</text>
      <text x="${cx + 26}" y="${cy + 13}" fill="#cbd5e1" font-size="11" font-family="monospace">Ideal [${targetX.toFixed(1)}, ${targetY.toFixed(1)}]</text>
    `;
    this.svg.appendChild(targetMarker);

    if (this.userPoint) {
      const userCx = this.grid.toSvgX(this.userPoint.x);
      const userCy = this.grid.toSvgY(this.userPoint.y);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('class', 'quiz-guide-line');
      line.setAttribute('x1', userCx);
      line.setAttribute('y1', userCy);
      line.setAttribute('x2', cx);
      line.setAttribute('y2', cy);
      line.setAttribute('stroke', '#a855f7');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-dasharray', '6 5');
      this.svg.appendChild(line);
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Slide 3 Large Grid
  window.embeddingGrid3 = new EmbeddingGrid('embedding-svg-3', { width: 860, height: 520, slideId: 3 });

  // Slide 4 Large Grid with hover connections & interactive rotation & stretch
  window.embeddingGrid4 = new EmbeddingGrid('embedding-svg-4', { width: 860, height: 520, slideId: 4, enableHoverConnections: true });

  const rotateSlider = document.getElementById('slider-rotate');
  const stretchXSlider = document.getElementById('slider-stretch-x');
  const stretchYSlider = document.getElementById('slider-stretch-y');
  const resetTransformBtn = document.getElementById('reset-transform-btn');

  function updateTransform() {
    if (!window.embeddingGrid4) return;
    const r = parseFloat(rotateSlider ? rotateSlider.value : 0);
    const sx = parseFloat(stretchXSlider ? stretchXSlider.value : 1);
    const sy = parseFloat(stretchYSlider ? stretchYSlider.value : 1);

    const rVal = document.getElementById('val-rotate');
    const sxVal = document.getElementById('val-stretch-x');
    const syVal = document.getElementById('val-stretch-y');

    if (rVal) rVal.textContent = `${r}°`;
    if (sxVal) sxVal.textContent = `${sx.toFixed(1)}x`;
    if (syVal) syVal.textContent = `${sy.toFixed(1)}x`;

    window.embeddingGrid4.applyTransformation(r, sx, sy);
  }

  if (rotateSlider) rotateSlider.addEventListener('input', updateTransform);
  if (stretchXSlider) stretchXSlider.addEventListener('input', updateTransform);
  if (stretchYSlider) stretchYSlider.addEventListener('input', updateTransform);

  if (resetTransformBtn) {
    resetTransformBtn.addEventListener('click', () => {
      if (rotateSlider) rotateSlider.value = 0;
      if (stretchXSlider) stretchXSlider.value = 1;
      if (stretchYSlider) stretchYSlider.value = 1;
      updateTransform();
    });
  }

  // Slide 5 Large Quiz
  window.embeddingQuiz = new EmbeddingQuiz('quiz-svg');
});
