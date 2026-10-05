# Perseverance, peça a peça — website DGO 2026/27

Website do grupo na UC **43449 — Design Generativo e Otimização** (Mestrado em Engenharia Aeroespacial, Universidade de Aveiro).
Mostra **o que estamos a modelar (o rover Perseverance, da missão Mars 2020) e como lá chegámos**, semana a semana, de M0 a M2.

Página única em **PT-PT**, estática (funciona em GitHub Pages), feita com **Vite + JavaScript puro + Three.js + GSAP ScrollTrigger**. Funciona offline: as fontes, os descodificadores 3D, o modelo e as imagens estão no repositório.

---

## 1. Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera a pasta dist/
npm run preview    # serve o dist/ para testar a versão final
```

Requer Node 18+ (testado em Node 24).

## 2. Como editar (sem mexer em código)

**Todo o texto vive em `src/content/`**:

| Ficheiro | O que contém |
|---|---|
| `site.json` | Título do hero, navegação, botão de CAD (formato, tamanho, `disponivel`), rodapé |
| `historia.json` | Cronologia, números-chave, «sete minutos de terror», fontes |
| `objetivo.json` | Os 4 objetivos e os critérios de sucesso |
| `porque.json` | Porquê o Perseverance + tabela de alternativas |
| `m0.json`, `m1.json`, `m2.json` | Textos e tabelas de cada milestone |
| `semanas/s01.json … s14.json` | **Uma semana por ficheiro** |
| `subsistemas.json` | Os 5 subsistemas (função, componentes, números, simplificações) e o mapa de nós do modelo |
| `equipa.json` | Cartões da equipa e matriz de contribuições |
| | `partes.json` | As 7 partes modeladas (mastro, chassis, braço, broca, suspensão, rodas, MMRTG): responsável, função, números |
| `ia.json` | Declaração de utilização de IA (obrigatória no guião) |

Tudo o que ainda não sabemos está marcado como **`[A CONFIRMAR: …]`** e aparece no site com um destaque laranja tracejado, para nunca passar despercebido. Para procurar o que falta: `Ctrl+Shift+F` por `A CONFIRMAR`.

### Adicionar uma semana nova

1. Copia `src/content/semanas/s05.json` para `s15.json`.
2. Muda `semana`, `data`, `fase` (`M0`, `M1` ou `M2`), `titulo`, `texto` e o `slot.file`.
3. `etiqueta` pode ser `"Decisão"`, `"Dificuldade"` ou `null`. `apresentacao: true` destaca a semana (usa-o nas semanas de entrega).

A semana aparece sozinha na secção da fase certa, por ordem de `semana`.

### Adicionar uma imagem, GIF ou vídeo

Cada espaço de media mostra **o nome exato do ficheiro** que espera. Põe o ficheiro em `public/media/…` com esse nome e ele aparece sozinho, sem tocar em código. A lista completa está em [`docs/conteudo-em-falta.md`](docs/conteudo-em-falta.md) (regenera com `npm run slots`).

- Formato recomendado: WebP. Para converter PNG/JPG: `npm run imagens` (usa `-- --apagar` para apagar os originais).
- Para um slot novo num JSON: `{ "kind": "image", "file": "media/m1/x.webp", "desc": "…", "size": "1600×900", "alt": "texto alternativo" }`.
- Imagens NASA: indicar sempre `"credito": "Imagem: NASA/JPL-Caltech"`. Ver `public/media/referencias/CREDITOS.md`.

### Trocar o modelo 3D provisório pelo nosso

Segue [`docs/exportar-modelo.md`](docs/exportar-modelo.md). Resumo: exportar GLB com nós de topo chamados `mastro`, `braco`, `suspensao`, `chassis`, `mmrtg`, otimizar com `gltf-transform` e guardar em `public/models/perseverance_dgo.glb`. O site passa a usá-lo e a etiqueta «Modelo provisório — NASA» desaparece. Para o botão de download, ver o mesmo documento.

## 3. Publicar (GitHub Pages)

1. Cria um repositório no GitHub e envia o código (`git init`, `git add .`, `git commit`, `git push`) para o ramo `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` para `main` corre `.github/workflows/deploy.yml`, constrói o site e publica-o em `https://<utilizador>.github.io/<repositório>/`.

O `vite.config.js` usa `base: './'`, por isso funciona em qualquer subpasta, em Netlify (`npm run build`, pasta `dist`) ou Vercel sem alterações.

### Ficheiros grandes (GitHub Releases / Git LFS)

O GitHub recusa ficheiros > 100 MB e avisa acima de 50 MB. Se `perseverance_cad.zip` passar dos **50 MB**:

- **GitHub Releases (recomendado):** cria uma *Release*, anexa o ZIP e copia o URL de download. Em `src/content/site.json`, muda `download.ficheiro` para esse URL (pode ser absoluto) e `disponivel` para `true`.
- **Git LFS:** `git lfs install`, `git lfs track "public/downloads/*.zip"`, `git add .gitattributes` e depois adiciona o ZIP normalmente. (O GitHub Pages serve ficheiros LFS, mas há quota de largura de banda.)

## 4. O que está implementado

- **Início:** o rover (GLB real da NASA) controlado pelo scroll: roda, aproxima-se e abre em vista explodida, com os cinco subsistemas etiquetados. Hero fixo ~260 % de ecrã. No telemóvel e com `prefers-reduced-motion` o hero é simplificado (imagem estática / pose final).
- **História e Contexto:** cronologia interativa (teclado: setas), números animados, «sete minutos de terror» com ligação ao vídeo oficial, peso na Terra vs Marte, fontes.
- **Sobre este projeto:** parágrafo introdutório antes da história (UC Design Generativo e Otimização). **Objetivo:** 5 cartões (modelar, parametrizar, otimizar a suspensão, website como relatório, renders).
- **O Nosso Projeto:** quatro atos. Ato I, o porquê da escolha (percurso: rover de raiz → ExoMars → Curiosity → Perseverance). Ato II, **M0 — modelação e montagem**: semanas, estratégia, uma secção por parte (mastro, chassis, braço, broca, suspensão com a **demo rocker-bogie**, rodas, MMRTG), a montagem completa no **visualizador 3D**, divisão do trabalho e ferramentas (Fusion, Blender). Ato III, **M1 — parametrização**, e Ato IV, **M2 — otimização da suspensão**: ambos «em desenvolvimento», com o plano (ver `wip` em `m1.json` e `m2.json`).
- **Equipa:** cartões e matriz de contribuições. **Rodapé:** declaração de IA, **contador de Sol**.
- **Visualizador 3D:** órbita/zoom/pan, rotação automática que pára ao interagir, hotspots clicáveis com painel lateral, isolar/destacar/ocultar subsistemas, vista explodida animada, ecrã inteiro, repor vista, indicador de carregamento e imagem estática se não houver WebGL. Teclado no canvas: setas rodam, `+`/`−` ampliam, `0` repõe, `E` explode.
- **Easter egg:** escreve `dare` em qualquer ponto da página.

### Ideias criativas que ficaram de fora (para quem quiser continuar)

- Linha do tempo de Sols do nosso projeto (semana ↔ Sol marciano).
- Modo «Marte»: alternar o tema para uma versão à luz do dia marciano (céu cor de butterscotch).
- Anotações de cotas SVG interativas sobre os renders finais, ligadas ao modelo paramétrico.
- Gerar automaticamente os renders turntable num GIF leve.

## 5. Verificações e diferenças em relação ao prompt inicial

- **Primeira amostra de rocha:** o prompt indicava 6 de setembro de 2021. Segundo a NASA/JPL, o núcleo «Montdenier» foi recolhido a **1 de setembro de 2021 (Sol 190)**; o site usa 1 de setembro.
- **Números confirmados em science.nasa.gov** (Rover Components e Science Instruments): massa 1025 kg; 3 m × 2,7 m × 2,2 m; 6 rodas de Ø 52,5 cm; braço de 2,1 m com 5 graus de liberdade; MMRTG ≈ 110 W, ≈ 45 kg, 4,8 kg de dióxido de plutónio; 43 tubos (5 de controlo); 7 instrumentos; Mastcam-Z a ≈ 2 m do solo, separação estereoscópica de 24,2 cm; SuperCam > 7 m.
- **Datas e valores da história confirmados** em fontes NASA/JPL (anúncio, lançamento, aterragem, Ingenuity, primeira amostra, bordo da cratera, entrada a ≈ 19 500 km/h, sky crane a ≈ 20 m); as fontes estão no fim da secção História.
- **M0 e M1 ajustados ao guião da UC:** o M0 inclui levantamento de forma (engenharia inversa) e superfícies; o M1 inclui modelação paramétrica, simulação estrutural e AGD, ao lado dos cartões de subsistema.
- **Peso e datas da UC** (M0 20 % a 8 out, M1 30 % a 5 nov, M2 40 % a 17 dez) vêm do guião e das slides da aula 1.
- **Modelo provisório:** `public/models/perseverance_nasa.glb` — NASA 3D Resources, *Mars 2020 Perseverance Rover* (Brian Kumanchik, NASA/JPL-Caltech, domínio público). URL: https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Mars%202020%20Perseverance%20Rover
- **Tudo o que falta aparece a vermelho** no site: texto em `[FALTA: …]` e caixas de imagem «FALTA IMAGEM» com o nome exato do ficheiro esperado.
- **Mapa de nós do modelo da NASA:** o mapeamento de nós para subsistemas (`nodesNasa` em `subsistemas.json`) foi feito pelo nome dos nós; pode haver peças pequenas no subsistema «errado». É só para o modelo provisório.
- **Ficheiros em falta de propósito:** `perseverance_dgo.glb`, `perseverance_cad.zip` e todos os renders, capturas e fotografias da equipa.
- **Logótipo:** o da NASA não é usado. O logótipo DGO foi extraído das slides da UC.

## 6. Estrutura

```
public/
  models/           perseverance_nasa.glb (provisório) · perseverance_dgo.glb (nosso) · subsistemas/*.glb
  media/{hero,historia,m0,m1,m2,equipa,logo,referencias}/
  downloads/        perseverance_cad.zip
  draco/            descodificadores (copiados do Three.js)
src/
  content/          TODO o texto (JSON)
  lib/              util.js · rover.js (carregamento, subsistemas, explosão)
  modules/          hero · viewer · mini · ui · rocker · gens
  render.js         constrói o HTML a partir dos JSON
  styles.css        tokens e estilos
scripts/            copiar-draco · gerar-slots · otimizar-imagens
docs/               exportar-modelo.md · conteudo-em-falta.md · prompt_website.md
referencias/        guião e slides da UC (PDF)
```
