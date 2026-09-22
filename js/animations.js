/**
 * animations.js
 * Particle neural network background, explanation modal content, and general visual utilities.
 */

// Slide explanation content database
const SLIDE_EXPLANATIONS = {
  1: {
    title: "The Big Picture",
    body: `Attention is the revolutionary mechanism that allows modern language models to dynamically connect words regardless of their distance in a sentence. Traditional RNNs processed words sequentially like reading left-to-right, often forgetting early words. Attention connects all words simultaneously in parallel.`
  },
  2: {
    title: "The Ambiguity Problem",
    body: `When humans read <em>"The animal didn't cross the street because it was tired"</em>, we instinctively know <strong>"it"</strong> refers to the animal, not the street. For a machine, <strong>"it"</strong> is ambiguous. Attention allows the model to compute a relevance score between <strong>"it"</strong> and every other word, successfully routing information from <strong>"animal"</strong> into the representation of <strong>"it"</strong>.`
  },
  3: {
    title: "Vectors as Meaning",
    body: `Computers cannot calculate with letters directly; they need numbers. An <strong>embedding</strong> assigns a list of coordinates (a vector) to each word. In this simplified 2D space, words that share properties land close together. Real models use 768, 1024, or 4096 dimensions to capture nuanced semantic relationships.`
  },
  4: {
    title: "Clusters & Transformations",
    body: `Notice how fruits cluster together, sports equipment clusters together, and vehicles form their own cluster. When we train neural networks, <strong>linear transformations</strong> (matrix multiplications) can rotate, stretch, or project these coordinates into specialized spaces (like Query, Key, and Value spaces) to test for specific relationships.`
  },
  5: {
    title: "Embedding Space Geometry",
    body: `Because coordinates capture meaning, a model places <strong>Apple</strong> right inside the fruit cluster when context is culinary. In Quiz 2, observe the polysemy: when the context is tech (laptop, Android, Microsoft), <strong>Apple</strong> must shift towards the technology cluster! Attention is precisely what gives words this flexible, context-dependent shift.`
  },
  6: {
    title: "All-to-All Relationships",
    body: `In natural language, syntax and meaning are deeply intertwined. In the sentence <em>"It is really complicated to understand text"</em>, every single token can attend to every other token. The curved arcs represent candidate attention pathways. In a Transformer, every token simultaneously assesses its relationship with all others.`
  },
  7: {
    title: "Attention as a Spotlight",
    body: `Attention is not an all-or-nothing switch; it is a <strong>soft weighting</strong>. The model assigns a percentage of its focus to each word. For <strong>"it"</strong>, <strong>"animal"</strong> receives the highest weight, <strong>"tired"</strong> provides supporting context, while grammatical words like <strong>"the"</strong> or irrelevant nouns receive minimal focus.`
  },
  8: {
    title: "Computing Relevance Scores",
    body: `How do we mathematically measure if two words relate? We take the <strong>Dot Product</strong> of their vectors: \\(Q \\cdot K^T\\). If two vectors point in similar directions in space, their dot product is large and positive. If they are orthogonal or opposite, the score is low or negative.`
  },
  9: {
    title: "Softmax Normalization",
    body: `Raw dot-product scores can be any number (e.g., 14.2, 4.1, -2.5). To turn them into probability weights that sum exactly to 1.0 (100%), we apply the <strong>Softmax</strong> function: \\(\\frac{e^{s_i}}{\\sum e^{s_j}}\\). Exponentiation magnifies top scores, sharpening the model's focus on the most relevant tokens.`
  },
  10: {
    title: "Query, Key, and Value",
    body: `Think of a YouTube search or filing system:
    <br>• <strong>Query (Q):</strong> What you type into the search bar.
    <br>• <strong>Key (K):</strong> The video titles and tags matched against your search.
    <br>• <strong>Value (V):</strong> The actual video content you watch once a match is found.
    <br>Each word produces its own Q, K, and V by multiplying its embedding by learned weight matrices \\(W_Q, W_K, W_V\\).`
  },
  11: {
    title: "The 6-Step Attention Pipeline",
    body: `Step through the complete calculation:
    <br>1. Linear projections generate Q, K, V.
    <br>2. Multiply \\(Q K^T\\) to get raw affinities.
    <br>3. Divide by \\(\\sqrt{d_k}\\) to stabilize gradients.
    <br>4. Apply Softmax to produce probabilities summing to 1.
    <br>5. Weight Value vectors \\(V\\) by these probabilities.
    <br>6. Output the enriched contextual token.`
  },
  12: {
    title: "The Famous Formula Breakdown",
    body: `$$\\text{Attention}(Q,K,V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
    <br>This compact equation is the core engine of ChatGPT, Claude, Gemini, and all modern LLMs. Click any component above to inspect its exact mathematical role.`
  },
  13: {
    title: "Blending Values (Weighted Sum)",
    body: `The final contextual representation is literally a recipe:
    <br>$$\\text{Output} = 0.65 \\times V_{\\text{animal}} + 0.20 \\times V_{\\text{tired}} + 0.10 \\times V_{\\text{street}} + \\dots$$
    <br>Tokens that matched strongly contribute the majority of their content vector, while irrelevant tokens contribute almost nothing.`
  },
  14: {
    title: "Static vs Contextualized",
    body: `Before attention, the token <strong>"it"</strong> had the exact same dictionary embedding regardless of whether the sentence was about an animal, a laptop, or a thunderstorm. After attention, <strong>"it"</strong> has absorbed features from <strong>"animal"</strong> and <strong>"tired"</strong>, turning it into a rich representation that uniquely means "the tired animal".`
  },
  15: {
    title: "Architecture & Multi-Head",
    body: `In Scaled Dot-Product Attention, the operations run as efficient GPU matrix multiplications. In <strong>Multi-Head Attention</strong>, we run \\(h\\) independent attention heads simultaneously (e.g., 8 or 16 heads). One head can track grammatical subject-verb links, while another head tracks pronoun antecedents!`
  },
  16: {
    title: "Why Attention Won the AI Race",
    body: `Before Transformers (2017), RNNs and LSTMs suffered from sequential bottlenecks: token 100 couldn't be processed until tokens 1 through 99 were computed. Attention allows <strong>complete parallelization</strong> across GPU thousands of cores and connects distant tokens in a single step.`
  },
  17: {
    title: "The \\(O(N^2)\\) Quadratic Bottleneck",
    body: `Because every token compares itself to every other token, a sequence of length \\(N\\) requires \\(N \\times N = N^2\\) comparisons. For 1,000 tokens, that's 1 million operations. For 100,000 tokens, that's 10 billion operations! This quadratic scaling is why ultra-long context windows require specialized hardware and algorithmic innovations.`
  },
  18: {
    title: "End-to-End Synthesis",
    body: `From raw text to embedding vectors, through linear projections into Query, Key, and Value, dot-product relevance, softmax weights, and value blending, attention allows neural networks to construct deep, human-like linguistic understanding.`
  }
};

// Initialize Particle Canvas on Slide 1
class NetworkCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 55;
    this.mouse = { x: null, y: null, radius: 140 };
    this.animationFrameId = null;

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    const colors = ['#00f0ff', '#38bdf8', '#a855f7', '#818cf8'];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.3
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse repulsion/attraction
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x -= Math.cos(angle) * force * 1.5;
          p.y -= Math.sin(angle) * force * 1.5;
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Draw connecting lines
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          const lineAlpha = (1 - dist / 130) * 0.22;
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.globalAlpha = lineAlpha;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
    this.ctx.globalAlpha = 1;
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

// Explain modal controller
function setupExplainModal() {
  const modal = document.getElementById('explain-modal');
  const openBtn = document.getElementById('explain-btn');
  const closeBtn = document.getElementById('explain-close-btn');
  const titleEl = document.getElementById('explain-title');
  const bodyEl = document.getElementById('explain-body');

  if (!modal || !openBtn) return;

  function updateExplainContent(slideNumber) {
    const data = SLIDE_EXPLANATIONS[slideNumber] || {
      title: "Slide Concept",
      body: "Explore the visual and mathematical intuition on this slide."
    };
    if (titleEl) titleEl.innerHTML = `💡 ${data.title}`;
    if (bodyEl) bodyEl.innerHTML = data.body;
  }

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentSlide = window.presentationDeck ? window.presentationDeck.currentSlide : 1;
    updateExplainContent(currentSlide);
    modal.classList.toggle('open');
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modal.classList.remove('open');
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (modal.classList.contains('open') && !modal.contains(e.target) && e.target !== openBtn) {
      modal.classList.remove('open');
    }
  });

  // Hook into slide change
  window.addEventListener('slideChange', (e) => {
    const slideNumber = e.detail ? e.detail.slideNumber : 1;
    updateExplainContent(slideNumber);
  });
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  new NetworkCanvas('hero-network-canvas');
  setupExplainModal();
});
