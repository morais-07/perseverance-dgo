# Do CAD ao site: exportar o modelo para GLB

O site mostra modelos em **GLB** (glTF binário). O CAD (Fusion) exporta **STEP**, **FBX** ou **OBJ**; é preciso converter para GLB e otimizar.

**Metas de tamanho:** modelo completo **< 15 MB**; cada subsistema **< 3 MB**.

## 0. O que o site espera

| Ficheiro (em `public/`) | Para quê |
|---|---|
| `models/perseverance_dgo.glb` | Modelo completo. Se existir, **substitui automaticamente** o modelo provisório da NASA (e a etiqueta «Modelo provisório» desaparece). |
| `models/subsistemas/<id>.glb` | (Opcional) GLB só de um subsistema para o mini viewer da M1. `<id>` = `mastro`, `braco`, `suspensao`, `chassis`, `mmrtg`. |
| `downloads/perseverance_cad.zip` | Pacote CAD para o botão «Descarregar CAD». Depois de existir, põe `"disponivel": true` em `src/content/site.json` → `download`. |

### Nós com nome (obrigatório para isolar/explodir)

No GLB completo, cada subsistema tem de ser um **nó de topo** cujo nome **começa** por:

`mastro` · `braco` · `suspensao` · `chassis` · `mmrtg`

(e opcionalmente `antena`, `aca` para os extras). Exemplos válidos: `mastro`, `suspensao_rocker_esq`, `chassis.001`. Tudo o que não tiver um destes prefixos é colocado no `chassis`.

A escala é normalizada automaticamente (o rover fica com ~3 unidades), por isso **mm ou m não importam**. Eixos: **Y para cima**, frente do rover em **+Z** (convenção glTF). Se o modelo vier «deitado», corrige na exportação (Blender: *Y Up* ligado).

## 1. STEP → GLB (duas rotas)

### Rota A — FreeCAD (mais direta)

1. Abre o `.step` no FreeCAD.
2. Organiza a árvore: um *Part* ou *Group* por subsistema, com os nomes acima.
3. Seleciona tudo → *File → Export…* → `.glb`/`.gltf` (ou exporta `.obj` e converte no Blender).
4. Dica: em *Preferences → Import-Export → Mesh Formats* define a tolerância de malha (0,1–0,3 mm costuma chegar).

### Rota B — Blender (melhor controlo de materiais)

1. Instala um *add-on* de importação STEP (por exemplo *STEP Importer / CAD Importer*), ou converte o STEP para `.obj`/`.stl` no FreeCAD.
2. Importa. Agrupa cada subsistema debaixo de um *Empty* com o nome certo (`mastro`, `braco`, …).
3. Aplica escala e rotação (*Ctrl+A → All Transforms*) e limpa geometria duplicada (*Merge by Distance*).
4. Atribui materiais simples (Principled BSDF: cor, metalicidade, rugosidade).
5. *File → Export → glTF 2.0 (.glb)*:
   - **Format:** glTF Binary (.glb)
   - **+Y Up:** ligado
   - **Apply Modifiers:** ligado
   - **Compression (Draco):** pode ligar aqui, ou fazer no passo 2 com `gltf-transform`.

## 2. Otimizar com `gltf-transform`

```bash
npm install --global @gltf-transform/cli
```

Passagem completa (juntar malhas, remover lixo, simplificar, comprimir geometria e texturas):

```bash
gltf-transform optimize entrada.glb public/models/perseverance_dgo.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 2048
```

Se o ficheiro ainda for pesado:

```bash
# simplificar a malha (0.5 = metade dos triângulos; ajusta com cuidado)
gltf-transform simplify entrada.glb saida.glb --ratio 0.5 --error 0.001
# alternativa a Draco, com descompressão mais rápida no browser:
gltf-transform optimize entrada.glb saida.glb --compress meshopt
```

> **Nota:** o site já inclui os descodificadores **Draco** (`public/draco/`) e **Meshopt**, por isso qualquer das duas compressões funciona.

Ver o resultado e o tamanho:

```bash
gltf-transform inspect public/models/perseverance_dgo.glb
```

## 3. Um GLB por subsistema (opcional, para a M1)

Exporta cada subsistema isolado e otimiza-o para **< 3 MB**:

```bash
gltf-transform optimize mastro.glb public/models/subsistemas/mastro.glb --compress draco --texture-compress webp --texture-size 1024
```

Se não existir, o mini viewer isola o subsistema a partir do modelo completo (funciona sempre).

## 4. Pacote CAD para download

1. Junta os `.step` e os ficheiros nativos (`.f3d`, …) numa pasta.
2. Cria `public/downloads/perseverance_cad.zip`.
3. Atualiza `src/content/site.json`: `"disponivel": true`, o `formato` (ex.: «STEP + SLDPRT») e o `tamanho` (ex.: «38 MB»).
4. **Se o ZIP tiver mais de 50 MB:** não o metas no repositório. Ver o README → «Ficheiros grandes (GitHub Releases / Git LFS)».

## 5. Testar

```bash
npm run dev
```

Abre o site, vai ao visualizador (M2) e confirma: os cinco subsistemas aparecem nos botões, «Isolar» e «Vista explodida» funcionam e a etiqueta «Modelo provisório — NASA» desapareceu.
