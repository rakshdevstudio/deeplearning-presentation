# Attention Mechanism & Transformer Architecture

An interactive presentation deck built with HTML5, CSS3, SVG, and Vanilla JavaScript, teaching the **Attention Mechanism** through visual intuition and interactive simulations.

Developed for **St. Joseph's University, Bengaluru**.

---

## 👥 Team Members

- **Rakshith C** — Roll No: 33
- **Lakshmi S H** — Roll No: 32

---

## 🎯 Pedagogical Flow

$$\text{SEE IT} \longrightarrow \text{UNDERSTAND IT} \longrightarrow \text{NAME IT} \longrightarrow \text{FORMALIZE IT}$$

1. **Title & Neural Network Particle Web**
2. **The Core Question**: Ambiguity resolution in *"The animal didn't cross the street because it was tired"*
3. **What is an Embedding?**: 2D coordinate space and vector representations
4. **Embedding Space & Transformations**: Semantic clusters, distance links, and linear projections
5. **Embedding Quiz**: Interactive classroom challenge predicting embedding locations
6. **From Embeddings to Relationships**: All-to-all curved token arcs
7. **What Attention Does**: Attention = Weighted Focus spotlight
8. **Attention Scores**: Raw dot-product affinities ($QK^T$)
9. **Attention Weights**: Softmax normalization summing to 1.00 (100%)
10. **Query, Key, and Value**: The 3 pieces behind attention
11. **Calculating Attention**: 6-step interactive stepper
12. **Attention Formula**: Interactive formula breakdown $\text{Attention}(Q,K,V) = \text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$
13. **Contextual Representation**: Static vs context-aware tokens
14. **Why Attention Won**: 5 core advantages of Transformers
15. **Where Attention Gets Expensive**: $O(N^2)$ quadratic complexity visualizer
16. **Final Pipeline**: Complete end-to-end token journey

---

## ⌨️ Controls & Navigation

- **Next Slide**: <kbd>→</kbd>, <kbd>Space</kbd>, or mouse wheel down
- **Previous Slide**: <kbd>←</kbd> or mouse wheel up
- **First / Last Slide**: <kbd>Home</kbd> / <kbd>End</kbd>
- **Presentation Mode**: <kbd>P</kbd> or <kbd>F</kbd>
- **Shortcuts Modal**: <kbd>?</kbd>
- **Presenter Notes**: Click the **💡 Explain this** button on any slide

---

## 🚀 Running Locally

No build tools or dependencies are required. Simply open `index.html` directly in your browser, or run:

```bash
# Using Node.js
node server.js
# Then open http://localhost:3000
```
