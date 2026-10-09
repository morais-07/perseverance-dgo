# Conteúdo em falta

Lista **gerada automaticamente** (`npm run slots`) a partir dos ficheiros em `src/content/`. Cada espaço do site mostra, **a vermelho**, o que falta e o nome exato do ficheiro esperado; basta pôr o ficheiro na pasta `public/` indicada e ele aparece sozinho (sem alterar código).

Total: 17 · já preenchidos: 7

| Estado | Ficheiro (dentro de `public/`) | Secção | Descrição | Dimensões |
|---|---|---|---|---|
| ✅ existe | `media/m0/levantamento_de_forma.webp` | M0 · Levantamento de forma | levantamento de forma: esquema do método de engenharia inversa. | 1600×900 |
| ⬜ em falta | `media/m0/render_rover.webp` | M0 · Render do rover (imagem) | render do rover completo montado. | 1920×1080 |
| ⬜ em falta | `media/m0/render_rover.mp4` | M0 · Render do rover (vídeo) | [VÍDEO: rover renderizado, com as juntas a mover-se — a juntar] | 1920×1080 · MP4 (H.264) |
| ⬜ em falta | `media/m0/mastro_cad.webp` | M0 · Mastro (câmara) (CAD 3D) | CAD 3D: mastro (câmara) (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/chassis_cad.webp` | M0 · Chassis (CAD 3D) | CAD 3D: chassis (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/braco_cad.webp` | M0 · Braço (CAD 3D) | CAD 3D: braço (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/broca_cad.webp` | M0 · Broca (CAD 3D) | CAD 3D: broca (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/suspensao_cad.webp` | M0 · Suspensão (CAD 3D) | CAD 3D: suspensão (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/rodas_cad.webp` | M0 · Rodas (CAD 3D) | CAD 3D: rodas (render ou captura do Fusion). | 1600×900 |
| ⬜ em falta | `media/m0/mmrtg_cad.webp` | M0 · MMRTG (CAD 3D) | CAD 3D: mmrtg (render ou captura do Fusion). | 1600×900 |
| ✅ existe | `models/perseverance_dgo.glb` | M0 · Montagem completa (CAD da equipa) | GLB do rover completo com nós nomeados: mastro, braco, suspensao, chassis, mmrtg. < 15 MB. Ver docs/exportar-modelo.md. | < 15 MB |
| ✅ existe | `media/m0/slide_semana_02.webp` | Semana 2 (M0) | Slide da semana 2 (apresentação de 1 slide, 3 minutos). | 1920×1080 |
| ✅ existe | `media/m0/slide_semana_03.webp` | Semana 3 (M0) | Slide da semana 3 (apresentação de 1 slide, 3 minutos). | 1920×1080 |
| ✅ existe | `media/equipa/david_coelho.webp` | Equipa · David Coelho | Fotografia de David Coelho (retrato, fundo neutro). | 800×1000 |
| ✅ existe | `media/equipa/nuno_mourinha.webp` | Equipa · Nuno Mourinha | Fotografia de Nuno Mourinha (retrato, fundo neutro). | 800×1000 |
| ✅ existe | `media/equipa/rafael_morais.webp` | Equipa · Rafael Morais | Fotografia de Rafael Morais (retrato, fundo neutro). | 800×1000 |
| ⬜ em falta | `downloads/perseverance_cad.zip` | Download CAD | Pacote com os ficheiros STEP e nativos. Se > 50 MB, usar GitHub Releases ou Git LFS (ver README). | — |

## Formatos recomendados

- **Imagens e slides:** WebP (qualidade 80–85), ≤ 300 KB cada. Largura mínima 1600 px nas imagens 16:9. Para converter PNG/JPG: `npm run imagens`.
- **Vídeos:** MP4 (H.264), 10–20 s, sem áudio, ≤ 8 MB.
- **Modelos:** GLB com Draco ou Meshopt; texturas WebP/KTX2.

## Texto em falta

Procura `FALTA` e `A CONFIRMAR` em `src/content/`. No site, tudo o que falta aparece **a vermelho**.
