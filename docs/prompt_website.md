# Prompt — Website DGO: Rover Perseverance

> Copy everything below into Claude Code, in an empty project folder.
> Before you start, put the milestones PowerPoint in `referencias/` (for example `referencias/milestones.pptx`). If you already have STEP/GLB files or renders, put them in `referencias/cad/` and `referencias/media/`.

---

## 1. Context

Build a website for our university course **DGO — Design Generativo e Otimização** (Mechanical Engineering, Universidade de Aveiro). There are 3 of us in the group.

- **Language of the site:** European Portuguese (PT-PT). Use "equipa", "ecrã", "utilizador" and "modelação", never Brazilian forms.
- **Audience:** the professor and our classmates.
- **Main goal:** show **what we are modelling and how we got there**.
- **How we are graded:** the professor grades **storytelling**, **creativity** and **the way the model and the work are presented**. Every design decision should serve one of those three.

**The project:** a 3D CAD model of NASA's **Perseverance** rover (Mars 2020 mission), split into subsystems:

| # | Subsystem | Real name / key parts |
|---|---|---|
| 1 | Mast and main camera | Remote Sensing Mast · Mastcam-Z (+ SuperCam) |
| 2 | Robotic arm and drill | Robotic Arm · Turret · coring drill |
| 3 | Suspension and wheels | Rocker-bogie · 6 wheels with 52.5 cm diameter |
| 4 | Chassis | Warm Electronics Box · Rover Equipment Deck |
| 5 | Plutonium generator | MMRTG (Multi-Mission Radioisotope Thermoelectric Generator) |

Optional subsystems if we have time (show them as "extra", without breaking the layout):
- the internal sampling system (Adaptive Caching Assembly: Bit Carousel + Sample Handling Arm);
- the high-gain antenna.

**Read `referencias/milestones.pptx` first.** It contains our split into milestones **M0, M1 and M2**. Use it as the source of truth for the timeline and the tasks of each milestone. If any information is missing (dates, weeks, who did what), fill it with clear placeholders `[A CONFIRMAR: …]` and do not make it up.

---

## 2. Site structure

Make it a **single page with smooth scrolling** and a fixed navigation bar that highlights the current section. Use these sections, in this order:

1. **Início**
2. **História e Contexto**
3. **Objetivo**
4. **O Nosso Projeto**, the main section, with 4 sub-sections:
   - **O Porquê da Escolha**
   - **M0**
   - **M1**
   - **M2**
5. **Equipa**

Add a **progress bar** at the top showing how far down the page the reader is. Also add a **sub-navigation** for the 4 parts of "O Nosso Projeto" that stays visible while that section is on screen.

---

## 3. Section details

### 3.1 Início (hero)
- **Scroll-driven render.** The rover appears large and **moves as the user scrolls**: it rotates on itself, gets closer, and opens into an exploded view by the end of the hero. Two possible implementations:
  - **(a) Preferred:** load the GLB with Three.js and tie the camera/rotation to scroll progress with GSAP ScrollTrigger (pinned hero, about 200–300 vh of scroll).
  - **(b) Fallback:** an image sequence (frames `hero/frame_0001.webp`…) drawn on a `<canvas>`, Apple-style, synced to scroll.
- **Text:** a large title (e.g. "Perseverance. Peça a peça."), a one-line subtitle, the course name and the year.
- **Buttons:**
  - **"Explorar o modelo 3D"**, which jumps to the viewer.
  - **"Descarregar CAD"** (see 3.6).

### 3.2 História e Contexto
- An interactive **timeline** of the mission:
  - 4 Dec 2012: the mission is announced.
  - 30 Jul 2020: launch on an Atlas V 541.
  - 18 Feb 2021: landing in Jezero crater.
  - 19 Apr 2021: first flight of Ingenuity.
  - 6 Sep 2021: first rock sample.
  - Jul 2024: Cheyava Falls / the Sapphire Canyon sample.
  - Dec 2024: reaching the crater rim.
- **Key numbers** shown as animated counters: 1025 kg · 3 m long · 6 wheels · 7 instruments · 43 sample tubes.
- A short block on **"7 minutes of terror"** (EDL: entry at ~19,500 km/h, parachute, Terrain-Relative Navigation, sky crane). Include a **slot for a NASA video**: a link or embed to the official landing video.
- **Rule:** verify every figure against NASA/JPL sources before you write it. Cite the sources at the end of the page.

### 3.3 Objetivo
- What we set out to do: model the rover in CAD, split it into subsystems, and apply **generative design and optimisation** methods (the core of the course).
- **3–4 objective cards**, for example:
  1. Model it faithfully.
  2. Analyse the subsystems.
  3. Optimise at least one part (generative design / topology optimisation).
  4. Present the model interactively.
- **Success criteria** for each objective (how we know we achieved it).

### 3.4 O Nosso Projeto: a story, week by week
This is the core of the site. It must read like a **story** with a beginning, a middle and an end: problem → decisions → difficulties → solutions → result.

**Format:** a vertical **week-by-week timeline** (Semana 1, Semana 2, …) grouped by milestone (M0, M1, M2). Each week has:
- a title;
- 2–4 lines on what we did;
- a **visual slot** (image, GIF, video or mini 3D viewer);
- a "**Decisão**" or "**Dificuldade**" tag when it applies.

Map the weeks from the PowerPoint. If the PPT has no weeks, propose a sensible split and mark it `[A CONFIRMAR]`.

**O Porquê da Escolha**
- Why Perseverance: it brings together mobility, mechanisms, energy, thermal control and instrumentation in one machine. It has public NASA documentation and suits a decomposition into subsystems.
- **A comparison table** of the alternatives we considered, with criteria (complexity, available information, optimisation potential, visual appeal) → the winner. Leave the alternatives as `[A CONFIRMAR]`.

**M0 — Planning and strategy**
- **Modelling strategy:**
  - top-down vs bottom-up;
  - master skeleton / layout sketch;
  - naming conventions;
  - how the team shared the files.
- **Process analysis:**
  - a **diagram of the workflow** (research → reference sketches → part modelling → subsystem assembly → general assembly → optimisation → render/export);
  - a work breakdown per person;
  - risks and how we mitigated them.
- **Tools:** CAD software, rendering, version control. Use placeholders `[Software CAD]`, etc.

**M1 — Subsystem modelling**
- One **card per subsystem**, each with:
  - its function;
  - its main components;
  - 3 key figures (e.g. wheel: Ø52.5 cm);
  - modelling simplifications and assumptions;
  - a **mini interactive 3D viewer** of that subsystem only;
  - the CAD feature tree or progress screenshots.
- **"Antes / depois" slider** (reference photo vs our model), drag to compare.

**M2 — Assembly, optimisation and final result**
- The **full assembly** in the main 3D viewer (see 3.6).
- **Generative design / optimisation** (an important section for DGO). Pick at least one part as the case study, for example the **rocker arm** of the suspension or a **wheel**. Show:
  - design space, loads, constraints and objective (minimise mass subject to stress/displacement limits);
  - the iterations (a slider or carousel through the generations);
  - a results table: **initial vs optimised mass, % reduction, maximum stress, safety factor**, all as `[A CONFIRMAR]` until we have real values;
  - a simple chart of mass across iterations.
- **Final renders** and a **turntable video** slot.
- **Lessons learned:** what went well, what we would change, and next steps.

### 3.5 Equipa
- **3 cards** with photo, name, role in the project, the subsystems each person was responsible for, and student number.
- Use placeholders `[Nome]`, `[Função]`, `[nº mec.]`, `[email@ua.pt]`.
- Add a small **contribution matrix** (people × subsystems/tasks).

### 3.6 3D model, interaction and download
- **Main viewer.** Use **`<model-viewer>`** (Google) or Three.js with GLTFLoader + Draco. It must have:
  - orbit, zoom and pan;
  - auto-rotation that stops when the user interacts;
  - **clickable hotspots** for each subsystem → a side panel with a description and the figures;
  - **subsystem buttons** that isolate, highlight or hide each part (requires a GLB with named nodes: `mastro`, `braco`, `suspensao`, `chassis`, `mmrtg`);
  - an **exploded-view** button (animate each subsystem along its own direction);
  - fullscreen and reset view;
  - a loading indicator, and a static image fallback if WebGL is not available.
- **Web formats.** Export **GLB** (glTF binary), compressed with Draco or Meshopt and textures in KTX2/WebP. Target **< 15 MB** for the full model and **< 3 MB** for each subsystem.
- **Conversion.** Write a short `docs/exportar-modelo.md` explaining how to go from our CAD to GLB:
  - STEP → Blender (STEP import add-on) or FreeCAD → GLB;
  - `gltf-transform` to optimise.
- **"Descarregar CAD" button.** Download `downloads/perseverance_cad.zip`, containing the STEP files and the native files `[A CONFIRMAR formato]`. Show the file size and format next to the button. If the file is large (>50 MB), plan for **GitHub Releases** or Git LFS and explain how in the README.

---

## 4. Placeholders until we have our own footage

We do not have our own renders or videos yet. Fill the site with **clearly labelled examples** so we can see where each thing goes.

- **3D model**
  - Use the **official NASA Perseverance 3D model** (NASA 3D Resources, public domain, GLB) as the provisional model.
  - Write down the exact URL you used.
  - Show the label **"Modelo provisório — NASA"** until we replace it.
- **Images**
  - Use official NASA/JPL-Caltech images (science.nasa.gov, Planetary Photojournal) for context and the "antes/depois" slider.
  - Credit each one with "Imagem: NASA/JPL-Caltech".
- **Videos**
  - Link or embed official NASA/JPL videos (the landing, Ingenuity).
  - For our own videos, which do not exist yet, use a frame with the label "**[VÍDEO: turntable do conjunto final — a gravar]**".
- **Our renders and CAD screenshots**
  - Use placeholder boxes in the site style.
  - Each box gets the **expected file name**, e.g. `media/m1/suspensao_render.webp`, and a description of what should go there.
- **List of slots.** Create `docs/conteudo-em-falta.md` with **every slot** to fill: file → section → description → suggested dimensions.
- **Downloads.** Keep everything in the repo (`/media/referencias/`) so the site works offline. Check the licences: NASA material is generally public domain, but "NASA" logos must not be used as our own branding.

---

## 5. Visual design and creativity

- **Visual identity**
  - "Mars at engineering scale": dark background (night/space) alternating with light technical sections, Martian orange as the accent.
  - Technical typography, e.g. a display font plus a monospace font for figures and labels, as in an engineering drawing.
- **Engineering details as decoration with meaning**
  - title-block captions, part numbers ("PRV-SUS-001"), dimension lines in SVG on top of images;
  - a millimetre grid in the background of some sections;
  - real units everywhere.
- **Motion**
  - subtle scroll-reveal animations;
  - counters;
  - the hero rover;
  - the exploded view;
  - respect `prefers-reduced-motion`.
- **Creative ideas to consider** (implement 2–3 and leave the others as suggestions in the README):
  - a "Sol" counter (Martian days) in the footer, computed from the landing date;
  - a mini "Mars vs Earth" scale: the rover's weight on Mars (38% of g);
  - an interactive **rocker-bogie** demo in SVG, where the user drags an obstacle and the suspension adapts;
  - a "Diário de bordo" (log) with the most important decisions;
  - an **easter egg**: the parachute's binary code ("Dare Mighty Things").
- **Accessibility**
  - good contrast;
  - alt text on every image;
  - keyboard navigation in the viewer and the sliders.

---

## 6. Technical requirements

- **Stack:** **Vite + vanilla JS** (or Astro, if you think it is better) with **Three.js / model-viewer** and **GSAP ScrollTrigger**. No heavy frameworks without a reason.
- **Fully static**, so it can be published on **GitHub Pages** (or Netlify/Vercel). Include:
  - the deploy workflow (`.github/workflows/deploy.yml`);
  - instructions in the README.
- **Responsive:** works on mobile. On mobile, the scroll-driven hero can be simplified to a static image or a short video.
- **Performance:**
  - lazy-load the 3D models (load only when visible);
  - modern image formats (WebP/AVIF);
  - Lighthouse ≥ 85 for performance on desktop.
- **Team editing:**
  - **all text in `src/content/*.json` or `.md` files**, one per section and per week, so the 3 of us can edit text without touching code;
  - explain in the README how to add a new week, a new image or a new model.
- **Folder structure:**
  - `public/models/`
  - `public/media/{hero,historia,m0,m1,m2,equipa}/`
  - `public/downloads/`
  - `src/content/`
  - `docs/`

---

## 7. How to work

1. **Read and summarise.** Read `referencias/milestones.pptx` and summarise what it says about M0/M1/M2. Show me the **proposed week-by-week split** before you build "O Nosso Projeto".
2. **Propose before building.** Propose the **visual direction** (palette, fonts, a hero sketch) and the folder structure, briefly.
3. **Build in stages:**
   - layout and navigation;
   - hero with scroll;
   - 3D viewer;
   - project sections;
   - polish.
4. **Test after each stage.** Run the site locally and check:
   - desktop and mobile;
   - the viewer;
   - the download;
   - the scroll animations.
5. **Hand over** with:
   - the local URL;
   - the deploy steps;
   - `docs/conteudo-em-falta.md`;
   - a list of the `[A CONFIRMAR]` items.

**Do not make up** project data (masses, stresses, dates, names). Use a visible placeholder whenever we have not given you the value.
