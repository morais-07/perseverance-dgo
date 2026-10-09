// Constrói o HTML de todas as secções a partir de src/content/*.json (a equipa só edita os JSON).
import site from './content/site.json';
import historia from './content/historia.json';
import objetivo from './content/objetivo.json';
import porque from './content/porque.json';
import m0 from './content/m0.json';
import m1 from './content/m1.json';
import m2 from './content/m2.json';
import equipa from './content/equipa.json';
import partes from './content/partes.json';
import ia from './content/ia.json';
import subs from './content/subsistemas.json';
import { esc, tbc, slot, icon, asset } from './lib/util.js';

// Uma semana = um ficheiro em src/content/semanas/sNN.json
const weekFiles = import.meta.glob('./content/semanas/*.json', { eager: true, import: 'default' });
const semanas = Object.values(weekFiles).sort((a, b) => a.semana - b.semana);



const sectionHead = (id, eyebrow, title, lead = '') => `
  <header class="sec-head rv">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h2 id="${id}-t">${esc(title)}</h2>
    ${lead ? `<p class="lead">${tbc(lead)}</p>` : ''}
  </header>`;

const titleblock = (code, folha) => `
  <div class="titleblock" aria-hidden="true"><span>DOC</span><span>${esc(code)}</span><span>FOLHA</span><span>${esc(folha)}</span><span>REV</span><span>A</span></div>`;

const figs = (numeros) =>
  numeros.length
    ? `<div class="figs">${numeros
        .map((n) => `<div class="fig"><span class="v">${esc(n.valor)}<small>${esc(n.unidade)}</small></span><span class="l">${esc(n.rotulo)}</span></div>`)
        .join('')}</div>`
    : '';

/* ───────── Barra de topo ───────── */
export function renderTopbar() {
  return `
    <a class="brand" href="#inicio" aria-label="Início — DGO"><span class="logo-slot" aria-hidden="true"></span><b>PRV·2026</b></a>
    <nav class="nav" id="nav" aria-label="Principal">
      ${site.nav.map((n) => `<a href="#${n.id}" data-sec="${n.id}">${esc(n.rotulo)}</a>`).join('')}
    </nav>
    <span class="sol-chip" aria-live="off">SOL <b data-sol>—</b></span>`;
}

/* ───────── Hero ───────── */
export function renderHero() {
  return `
    <div class="hero-pin">
      <div class="hero-grid" aria-hidden="true"></div>
      <img class="hero-fallback" src="./media/m0/render_rover.webp" alt="Render do rover Perseverance modelado pela equipa." width="1200" height="800" fetchpriority="high" />
      <canvas aria-hidden="true"></canvas>
      <div class="hero-labels" aria-hidden="true"></div>
      <div class="hero-corner tl" aria-hidden="true">PRV-000 · ESC 1:20 · FOLHA 1/6</div>
      <div class="hero-corner tr" data-prov aria-hidden="true">${esc(site.modeloProvisorio.toUpperCase())}</div>
      <div class="hero-copy">
        <h1><span>${esc(site.titulo)}</span><span>${esc(site.tituloLinha2)}</span></h1>
        <p class="sub">${esc(site.subtitulo)}</p>
        <p class="meta"><span>${esc(site.curso)}</span><span>${esc(site.instituicao)}</span><span>${esc(site.ano)}</span></p>
      </div>
      <div class="hero-actions">
        <a class="btn" href="#viewer">${esc(site.botoes.explorar)}</a>
        ${downloadButton('ghost')}
      </div>
      <div class="hero-tele" aria-hidden="true">
        <span class="t-title">${esc(site.telemetria.rotulo)}</span>
        <span>${esc(site.telemetria.rotacao)} <b data-tele="rot">000°</b></span>
        <span>${esc(site.telemetria.zoom)} <b data-tele="zoom">1.0×</b></span>
        <span>${esc(site.telemetria.explosao)} <b data-tele="ex">0 %</b></span>
        <span>SOL <b data-sol>—</b></span>
      </div>
      <div class="hero-cue" aria-hidden="true"><span>SCROLL</span><i></i></div>
    </div>`;
}

export function downloadButton(variant = '') {
  const d = site.download;
  const dis = !d.disponivel;
  return `<a class="btn ${variant}" href="${dis ? '#equipa' : esc(d.ficheiro)}" ${dis ? 'aria-disabled="true" data-nodownload="1"' : 'download'} title="${esc(dis ? d.nota : 'Descarregar o pacote CAD')}">
      ${icon.down}<span>${esc(site.botoes.descarregar)}<span class="btn-meta">${tbc(d.formato)} · ${tbc(d.tamanho)}</span></span></a>`;
}

/* ───────── Sobre este projeto ───────── */
const bold = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
export function renderSobre() {
  const o = site.sobre;
  return `<div class="wrap sobre">
    <p class="eyebrow rv">${esc(o.rotulo)}</p>
    <p class="sobre-txt rv">${bold(o.texto)}</p>
    <p class="sobre-uc rv mono">${esc(o.uc)}</p>
  </div>`;
}

/* ───────── História ───────── */
export function renderHistoria() {
  const h = historia;
  return `<div class="wrap">
    ${titleblock('PRV-HIS-002', '2/6')}
    ${sectionHead('historia', 'História e contexto', h.titulo, h.intro)}
    <h3 class="rv">${esc(h.timelineTitulo)}</h3>
    <div class="tl rv" data-tl>
      <div class="tl-rail" role="tablist" aria-label="Eventos da missão">
        ${h.eventos.map((e, i) => `<button class="tl-tab" role="tab" id="tl-t${i}" aria-controls="tl-p" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><span class="d">${esc(e.rotulo)}</span><span class="t">${esc(e.titulo)}</span></button>`).join('')}
      </div>
      <div class="tl-panel" id="tl-p" role="tabpanel" aria-live="polite" aria-labelledby="tl-t0"></div>
    </div>
    <div class="numbers rv" aria-label="Números-chave">
      ${h.numeros.map((n) => `<div class="num"><div class="v"><span data-count="${n.valor}">0</span>${n.unidade ? `<small>${esc(n.unidade)}</small>` : ''}</div><div class="l">${esc(n.rotulo)}</div></div>`).join('')}
    </div>
    <div class="edl rv">
      <div class="edl-lead">
        <h3>${esc(h.edl.titulo)}</h3>
        <p>${esc(h.edl.texto)}</p>
        <div class="video-slot" style="background-image:linear-gradient(rgba(11,11,16,.55),rgba(11,11,16,.8)),url('./media/historia/jezero_delta.webp')">
          <a href="${esc(h.edl.video.link)}" target="_blank" rel="noopener noreferrer">
            <span class="play">${icon.play}</span><strong>${esc(h.edl.video.titulo)}</strong><span class="note">${esc(h.edl.video.nota)}</span>
          </a>
        </div>
      </div>
      <ol class="edl-steps" style="list-style:none;margin:0;padding:0">
        ${h.edl.passos.map((p) => `<li class="edl-step"><div><h4>${esc(p.rotulo)}</h4><p>${esc(p.texto)}</p></div><span class="val">${esc(p.valor)}</span></li>`).join('')}
      </ol>
    </div>
    <div class="mve rv" id="mve">
      <div>
        <h3>O mesmo rover, pesos diferentes</h3>
        <p>Em Marte a gravidade à superfície é cerca de 38 % da terrestre: o mesmo rover de 1025 kg pesa muito menos. É por isso que a suspensão e o braço não precisam de ser dimensionados como se estivessem na Terra.</p>
        <p class="tiny">g<sub>Terra</sub> = 9,81 m/s² · g<sub>Marte</sub> ≈ 3,71 m/s² · peso = m·g</p>
      </div>
      <div class="bars" data-mve></div>
    </div>
    <div class="sources rv">
      <h3>${esc(h.fontesTitulo)}</h3>
      <ol>${h.fontes.map((f) => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.rotulo)}</a></li>`).join('')}</ol>
      <p class="note">${tbc(h.verificar)}</p>
    </div>
  </div>`;
}

export const historiaEvents = historia.eventos;
export const historiaNumbers = historia.numeros;

/* ───────── Objetivo ───────── */
export function renderObjetivo() {
  const o = objetivo;
  return `<div class="wrap">
    ${titleblock('PRV-OBJ-003', '3/6')}
    ${sectionHead('objetivo', 'Objetivo', o.titulo, o.texto)}
    <div class="obj-grid">
      ${o.cartoes.map((c) => `<article class="obj rv"><span class="code">${esc(c.codigo)} · ${esc(c.fase)}</span><h3>${esc(c.titulo)}</h3><p>${esc(c.texto)}</p>
        <div class="crit"><h4>${esc(o.criteriosTitulo)}</h4><ul>${c.criterios.map((k) => `<li><span>${tbc(k)}</span></li>`).join('')}</ul></div></article>`).join('')}
    </div>
  </div>`;
}

/* ───────── O Nosso Projeto ───────── */
export function renderProjetoIntro() {
  return `<div class="wrap">
    ${titleblock('PRV-PRJ-004', '4/6')}
    ${sectionHead('projeto', 'O nosso projeto', 'Uma história em quatro atos', 'Do problema ao resultado: a escolha do rover, a modelação e montagem, a parametrização e a otimização da suspensão. É assim que contamos o semestre.')}
    <div class="arc rv">
      <a href="#porque"><span class="k">ATO I</span><span class="h">O problema</span><span class="p">Porquê o Perseverance?</span></a>
      <a href="#m0"><span class="k">ATO II</span><span class="h">Modelação e montagem</span><span class="p">M0 · modelar tudo e montar o rover</span></a>
      <a href="#m1"><span class="k">ATO III</span><span class="h">Parametrização</span><span class="p">M1 · estratégias computacionais</span></a>
      <a href="#m2"><span class="k">ATO IV</span><span class="h">Otimização</span><span class="p">M2 · otimizar a suspensão</span></a>
    </div>
  </div>`;
}

export function renderSubnav() {
  return site.subnav.map((s) => `<a href="#${s.id}" data-sec="${s.id}">${esc(s.rotulo)}</a>`).join('');
}

export function renderPorque() {
  const p = porque;
  return `<div class="wrap">
    ${sectionHead('porque', 'Ato I — o problema', p.titulo)}
    <h3 class="rv">${esc(p.caminhoTitulo)}</h3>
    <ol class="path rv">${p.caminho.map((c) => `<li><span class="n">${esc(c.passo)}</span><h4>${esc(c.titulo)}</h4><p>${esc(c.texto)}</p></li>`).join('')}</ol>
    <h3 class="rv">${esc(p.razoesTitulo)}</h3>
    <div class="why rv">${p.texto.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    <div class="reasons rv">${p.razoes.map((r) => `<div class="reason"><h4>${esc(r.titulo)}</h4><p>${esc(r.texto)}</p></div>`).join('')}</div>
    <h3 class="rv">${esc(p.comparacaoTitulo)}</h3>
    <div class="table-wrap rv"><table>
      <caption>Comparação de alternativas</caption>
      <thead><tr>${p.colunas.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${p.alternativas.map((a) => `<tr class="${a.vencedora ? 'win' : ''}"><th scope="row">${esc(a.nome)}</th><td>${esc(a.motivo)}</td><td>${esc(a.decisao)}</td></tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

/* semanas */
const galeria = (w) => `<div class="gal" role="group" aria-label="Slides da apresentação (${w.galeria.length})">${w.galeria
  .map((g, i) => `<button type="button" class="gal-t" data-gal="semana-${w.semana}" data-full="${esc(g.file)}" data-alt="${esc(g.alt)}" aria-label="Ampliar slide ${i + 1}: ${esc(g.alt)}"><img src="${asset(g.file.replace('.webp', '_t.webp'))}" alt="" loading="lazy" decoding="async" width="480" height="270" /><span>${i + 1}</span></button>`)
  .join('')}</div>`;

function weekHtml(w) {
  const tag = w.etiqueta ? `<span class="tag ${w.etiqueta === 'Dificuldade' ? 'dificuldade' : 'decisao'}">${esc(w.etiqueta)}</span>` : '';
  const apres = w.apresentacao ? '<span class="tag apres">Apresentação</span>' : '';
  return `<article class="week rv ${w.apresentacao ? 'pres' : ''}" id="semana-${w.semana}">
    <div>
      <div class="wk-top"><b>SEMANA ${String(w.semana).padStart(2, '0')}</b><span class="dt">${esc(w.data)} · ${esc(w.fase)}</span>${tag}${apres}</div>
      <h4>${esc(w.titulo)}</h4>
      <p class="tema"><span class="sr">Tema da aula: </span>${esc(w.tema)}</p>
      ${w.texto.map((t) => `<p>${tbc(t)}</p>`).join('')}
    </div>
    ${w.galeria ? galeria(w) : w.slot ? slot(w.slot) : '<div class="noslide">Sem slide nesta semana</div>'}
  </article>`;
}
const weeksOf = (fase) => `<div class="weeks">${semanas.filter((w) => w.fase === fase).map(weekHtml).join('')}</div>`;

const msHead = (id, d, ato) => `
  <header class="ms-head rv">
    <div class="ms-code" aria-hidden="true">${esc(d.codigo)}</div>
    <div><p class="per">${esc(ato)} · ${esc(d.periodo)}</p><h2 id="${id}-t">${esc(d.titulo)}</h2></div>
  </header>
  <p class="lead rv">${tbc(d.intro)}</p>`;

function partCard(p) {
  const cad = { kind: 'image', file: `media/m0/${p.id}_cad.webp`, desc: `CAD 3D: ${p.nome.toLowerCase()} (render ou captura do Fusion).`, size: '1600×900', alt: `CAD 3D: ${p.nome}.` };
  return `<article class="part rv" id="sub-${p.id}">
    <div class="part-media">${slot(cad, { cota: p.cota })}</div>
    <div class="part-body">
      <div class="sub-id"><span>${esc(p.codigo)}</span></div>
      <h3>${esc(p.nome)}</h3>
      <p class="real">${esc(p.nomeReal)}</p>
      <p class="who"><b>${esc(partes.responsavelRotulo)}:</b> ${esc(p.responsavel)}</p>
      <p>${esc(p.funcao)}</p>
      ${figs(p.numeros)}
      <div><h4>Abordagem de modelação</h4><p>${tbc(`[FALTA: texto sobre a abordagem seguida na modelação: ${p.nome.toLowerCase()}]`)}</p></div>
    </div>
    ${p.demo ? `<div class="part-demo"><h4>${esc(p.demo.titulo)}</h4><p>${esc(p.demo.texto)}</p><div class="rb" data-rb></div></div>` : ''}
  </article>`;
}

export function renderM0() {
  const d = m0;
  return `<div class="wrap">
    ${titleblock('PRV-M00-005', '5/6')}
    ${msHead('m0', d, 'Ato II — modelação e montagem')}
    <div class="block"><h3 class="rv">${esc(d.semanasTitulo)}</h3>${weeksOf('M0')}</div>
    <div class="block"><h3 class="rv">${esc(d.estrategiaTitulo)}</h3>
      <div class="strat rv">${d.estrategia.map((s) => `<div class="strat-item"><h4>${esc(s.titulo)}</h4><p>${tbc(s.texto)}</p></div>`).join('')}</div>
    </div>
    <div class="block two-col rv">
      <div><h3>${esc(d.inversaTitulo)}</h3><p>${tbc(d.inversa.texto)}</p></div>
      ${slot(d.inversa.slot)}
    </div>
    <div class="block"><h3 class="rv">${esc(partes.titulo)}</h3><p class="rv">${esc(partes.texto)}</p>
      <div class="parts">${partes.partes.map(partCard).join('')}</div>
    </div>
    <div class="block" id="viewer-bloco"><h3 class="rv">${esc(d.montagemTitulo)}</h3><p class="rv">${esc(d.montagemTexto)}</p>
      ${d.montagemFalta ? `<p class="rv">${tbc(d.montagemFalta)}</p>` : ''}
      ${renderViewer()}
      <p class="note rv" data-viewer-note style="margin-top:12px">Modelo provisório: <a href="${esc(subs.modeloProvisorio.origem)}" target="_blank" rel="noopener noreferrer" style="color:var(--mars)">NASA 3D Resources — Mars 2020 Perseverance Rover</a> (${esc(subs.modeloProvisorio.licenca)}).</p>
    </div>
    <div class="block"><h3 class="rv">${esc(d.renderRover.titulo)}</h3>
      <div class="slots-2 rv">${slot(d.renderRover.imagem)}${slot(d.renderRover.video)}</div></div>
    <div class="block"><h3 class="rv">${esc(d.processoTitulo)}</h3>
      <ol class="flow rv" style="list-style:none;padding:0;margin:0 0 var(--s7)">${d.fluxo.map((f) => `<li><span class="n">${esc(f.codigo)}</span><span class="r">${esc(f.rotulo)}</span></li>`).join('')}</ol>
      <div class="two-col rv">
        <div><h3>${esc(d.divisaoTitulo)}</h3>
          <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Contacto</th><th>Subsistemas</th></tr></thead>
            <tbody>${equipa.membros.map((m) => `<tr><th scope="row">${esc(m.nome)} <span class="mono">(${esc(m.mec)})</span></th><td><a href="mailto:${esc(m.email)}" style="color:inherit">${esc(m.email)}</a></td><td>${esc(m.subsistemas.join(', '))}</td></tr>`).join('')}</tbody></table></div>
          <p class="note">${esc(d.divisaoNota)}</p></div>
        <div><h3>${esc(d.riscosTitulo)}</h3><div class="table-wrap"><table><thead><tr><th>Risco</th><th>Mitigação</th></tr></thead><tbody>${d.riscos.map((r) => `<tr><td>${tbc(r.risco)}</td><td>${tbc(r.mitigacao)}</td></tr>`).join('')}</tbody></table></div></div>
      </div>
      <div class="rv" style="margin-top:var(--s7)"><h3>${esc(d.ferramentasTitulo)}</h3>
        <div class="table-wrap"><table><tbody>${d.ferramentas.map((f) => `<tr><th scope="row">${esc(f.tipo)}</th><td>${esc(f.nome)}</td></tr>`).join('')}</tbody></table></div></div>
    </div>
  </div>`;
}

/* M1 */
function subCard(s) {
  const render = { kind: 'image', file: `media/m1/${s.id}_render.webp`, desc: `Render do subsistema «${s.nome}», fundo neutro, vista de três quartos.`, size: '1600×900', alt: `Render do subsistema ${s.nome} no modelo CAD da equipa.` };
  const arvore = { kind: 'image', file: `media/m1/${s.id}_arvore.webp`, desc: `Captura da árvore de operações (feature tree) de «${s.nome}», ou capturas do progresso.`, size: '1200×800', alt: `Árvore de operações do CAD do subsistema ${s.nome}.` };
  const cota = s.cota || null;
  return `<article class="sub-card rv" id="sub-${s.id}">
    <div class="sub-media">
      <div class="sub-pane" data-pane="3d">
        <div class="mini" data-sub="${s.id}" style="min-height:340px">
          <div class="mini-load"><span class="m">${esc(subs.modeloProvisorio ? 'Viewer 3D do subsistema' : '')}</span><button type="button">Carregar viewer 3D</button></div>
          <div class="mini-ui" aria-hidden="true"><span><b>${esc(s.codigo)}</b></span><span>${esc(m1.viewerMini.arrastar)}</span><span>${esc(m1.viewerMini.provisorio)}</span></div>
        </div>
      </div>
      <div class="sub-pane" data-pane="render" hidden>${slot(render, { cota })}</div>
      <div class="sub-pane" data-pane="tree" hidden>${slot(arvore)}</div>
      <div class="sub-tabs" role="tablist" aria-label="Vistas de ${esc(s.nome)}">
        <button role="tab" aria-selected="true" data-tab="3d">3D</button>
        <button role="tab" aria-selected="false" data-tab="render">Render</button>
        <button role="tab" aria-selected="false" data-tab="tree">Árvore CAD</button>
      </div>
    </div>
    <div class="sub-body">
      <div class="sub-id"><span>${esc(s.codigo)}</span><span>SUBSISTEMA ${String(s.n).padStart(2, '0')}</span></div>
      <h3>${esc(s.nome)}</h3>
      <p class="real">${esc(s.nomeReal)}</p>
      <p>${esc(s.funcao)}</p>
      <div><h4>Componentes</h4><ul class="chips">${s.componentes.map((c) => `<li>${tbc(c)}</li>`).join('')}</ul></div>
      <div><h4>Números-chave</h4>${figs(s.numeros)}</div>
      <div><h4>Simplificações e pressupostos</h4><ul class="simp">${s.simplificacoes.map((c) => `<li>${tbc(c)}</li>`).join('')}</ul></div>
    </div>
  </article>`;
}

const wipBlock = (d) => `
  <div class="wip rv">
    <span class="wip-badge">${esc(d.wip.estado)}</span>
    <p>${esc(d.wip.texto)}</p>
    <h3>${esc(d.wip.titulo)}</h3>
    <ul class="wip-list">${d.wip.planeado.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>`;

export function renderM1() {
  const d = m1;
  if (d.wip?.ativo) {
    return `<div class="wrap">
    ${titleblock('PRV-M01-006', '5/6')}
    ${msHead('m1', d, 'Ato III — parametrização')}
    ${wipBlock(d)}
  </div>`;
  }
  const ad = d.antesDepois;
  return `<div class="wrap">
    ${titleblock('PRV-M01-006', '5/6')}
    ${msHead('m1', d, 'Ato III — parametrização')}
    <div class="block"><h3 class="rv">M1 · semana a semana</h3>${weeksOf('M1')}</div>
    <div class="block"><h3 class="rv">${esc(d.cartoesTitulo)}</h3><div class="sub-grid">${subs.subsistemas.map(subCard).join('')}</div></div>
    <div class="block"><h3 class="rv">${esc(d.extrasTitulo)}</h3><p class="note rv">${esc(d.extrasNota)}</p>
      <div class="extra-grid rv">${subs.extras.filter((e) => e.id === 'aca' || e.id === 'antena').map((e) => `<div class="extra"><span class="badge">EXTRA · ${esc(e.codigo)}</span><h4>${esc(e.nome)}</h4><p class="mono" style="font-size:.74rem">${esc(e.nomeReal)}</p><p>${tbc(e.funcao)}</p></div>`).join('')}</div></div>
    <div class="block"><h3 class="rv">${esc(ad.titulo)}</h3><p class="rv">${esc(ad.texto)}</p>
      <div class="ba rv" data-ba role="group" aria-label="Comparação antes e depois">
        <div class="ba-frame">
          <div class="layer">${slot({ ...ad.antes, kind: 'image' })}</div>
          <div class="layer after">${slot(ad.depois)}</div>
          <span class="ba-lab l">${esc(ad.rotuloAntes)}</span><span class="ba-lab r">${esc(ad.rotuloDepois)}</span>
          <div class="ba-handle" aria-hidden="true"></div>
          <input type="range" min="0" max="100" value="50" aria-label="Arrastar para comparar a fotografia real e o nosso modelo" />
        </div>
      </div>
    </div>
    <div class="block"><h3 class="rv">${esc(d.parametrico.titulo)}</h3>
      <div class="two-col rv"><div><p>${tbc(d.parametrico.texto)}</p>
        <div class="table-wrap param-table"><table><thead><tr><th>Parâmetro</th><th>Valor</th><th>Unidade</th></tr></thead><tbody>${d.parametrico.parametros.map((p) => `<tr><th scope="row">${tbc(p.nome)}</th><td>${tbc(p.valor)}</td><td>${tbc(p.unidade)}</td></tr>`).join('')}</tbody></table></div></div>
        ${slot(d.parametrico.slot)}</div></div>
    <div class="block"><h3 class="rv">${esc(d.simulacao.titulo)}</h3><p class="rv">${tbc(d.simulacao.texto)}</p>
      <div class="slots-2 rv">${d.simulacao.slots.map((s) => slot(s)).join('')}</div></div>
  </div>`;
}

/* M2 */
export function renderM2() {
  const d = m2;
  const o = d.otimizacao;
  if (d.wip?.ativo) {
    return `<div class="wrap">
    ${titleblock('PRV-M02-007', '5/6')}
    ${msHead('m2', d, 'Ato IV — otimização')}
    ${wipBlock(d)}
  </div>`;
  }
  return `<div class="wrap">
    ${titleblock('PRV-M02-007', '5/6')}
    ${msHead('m2', d, 'Ato IV — otimização')}
    <div class="block"><h3 class="rv">M2 · semana a semana</h3>${weeksOf('M2')}</div>
    <div class="block"><h3 class="rv">${esc(o.titulo)}</h3>
      <p class="rv"><strong>Peça em estudo:</strong> ${tbc(o.pecaCaso)}</p>
      <div class="opt-grid rv">${o.problema.map((p) => `<div class="opt-cell"><div class="k">${esc(p.rotulo)}</div><p>${tbc(p.valor)}</p></div>`).join('')}</div>
      <h3 class="rv" style="margin-top:var(--s7)">${esc(o.iteracoesTitulo)}</h3>
      <div class="gens rv" data-gens>
        <div><div class="gen-view" data-genview></div>
          <div class="gen-ctrl"><button class="icon-btn" data-prev aria-label="Geração anterior">${icon.prev}</button>
            <input type="range" min="1" max="${o.iteracoes.length}" value="1" aria-label="Escolher a geração" />
            <button class="icon-btn" data-next aria-label="Geração seguinte">${icon.next}</button></div>
          <p class="note">${esc(o.iteracoesNota)}</p></div>
        <div class="chart" data-chart></div>
      </div>
      <h3 class="rv" style="margin-top:var(--s7)">${esc(o.resultadosTitulo)}</h3>
      <div class="table-wrap rv"><table class="res-table"><thead><tr><th>Grandeza</th><th>Valor</th><th>Unidade</th></tr></thead>
        <tbody>${o.resultados.map((r) => `<tr><th scope="row">${esc(r.rotulo)}</th><td>${tbc(r.valor)}</td><td>${esc(r.unidade)}</td></tr>`).join('')}</tbody></table></div>
      <div class="two-col rv" style="margin-top:var(--s7)"><div><h3>${esc(o.posProcessamento.titulo)}</h3><p>${tbc(o.posProcessamento.texto)}</p></div>${slot(o.posProcessamento.slot)}</div>
    </div>
    <div class="block"><h3 class="rv">${esc(d.renders.titulo)}</h3>
      <div class="render-grid rv"><div class="big">${slot(d.renders.slots[0])}</div>${slot(d.renders.slots[1])}${slot(d.renders.slots[2])}<div class="big">${slot(d.renders.video)}</div></div></div>
    <div class="block"><h3 class="rv">${esc(d.licoes.titulo)}</h3>
      <div class="lessons rv">
        <div class="lesson"><h4>O que correu bem</h4><ul>${d.licoes.correu.map((x) => `<li>${tbc(x)}</li>`).join('')}</ul></div>
        <div class="lesson"><h4>O que mudaríamos</h4><ul>${d.licoes.mudariamos.map((x) => `<li>${tbc(x)}</li>`).join('')}</ul></div>
        <div class="lesson"><h4>Próximos passos</h4><ul>${d.licoes.proximos.map((x) => `<li>${tbc(x)}</li>`).join('')}</ul></div>
      </div></div>
  </div>`;
}

function renderViewer() {
  return `<div class="viewer rv" id="viewer" role="region" aria-label="Visualizador 3D do rover">
    <canvas tabindex="0" aria-label="Modelo 3D do rover. Setas rodam, + e − ampliam, 0 repõe a vista, E explode."></canvas>
    <div class="v-hotspots"></div>
    <div class="v-ui v-prov" hidden>${esc(site.modeloProvisorio)}</div>
    <div class="v-ui v-chips" role="group" aria-label="Subsistemas">
      ${subs.subsistemas.map((s) => `<div class="chip" data-id="${s.id}"><button type="button" data-act="select" aria-pressed="false"><span class="swatch" style="background:${s.cor}"></span><i>${String(s.n).padStart(2, '0')}</i>${esc(s.nome)}</button><button type="button" class="eye" aria-pressed="false" aria-label="Ocultar ${esc(s.nome)}">${icon.eye}</button></div>`).join('')}
      <button type="button" class="all chips-all">MOSTRAR TUDO</button>
    </div>
    <div class="v-ui v-tools" role="toolbar" aria-label="Ferramentas do visualizador">
      <button class="icon-btn" data-act="reset" aria-label="Repor vista" title="Repor vista (0)">${icon.reset}</button>
      <button class="icon-btn" data-act="explode" aria-pressed="false" aria-label="Vista explodida" title="Vista explodida (E)">${icon.explode}</button>
      <button class="icon-btn" data-act="rotate" aria-pressed="true" aria-label="Rotação automática" title="Rotação automática">${icon.rotate}</button>
      <button class="icon-btn" data-act="zoom-in" aria-label="Ampliar" title="Ampliar (+)">${icon.plus}</button>
      <button class="icon-btn" data-act="zoom-out" aria-label="Afastar" title="Afastar (−)">${icon.minus}</button>
      <button class="icon-btn" data-act="fullscreen" aria-pressed="false" aria-label="Ecrã inteiro" title="Ecrã inteiro">${icon.full}</button>
    </div>
    <p class="v-ui v-hint">Arrastar: rodar · Rolar: ampliar · Botão direito / dois dedos: deslocar · ● Hotspots: informação</p>
    <aside class="v-info" aria-live="polite" aria-label="Informação do subsistema"></aside>
    <div class="v-load" role="status"><span>A carregar o modelo 3D…</span><div class="meter"><i></i></div><span class="pct">0 %</span></div>
    <div class="v-fallback"><img src="./media/m0/render_rover.webp" alt="Render do rover Perseverance modelado pela equipa." /><p class="mono" style="font-size:.74rem;color:var(--dust)">WebGL indisponível — a mostrar imagem estática.</p></div>
  </div>`;
}

/* ───────── Equipa ───────── */
export function renderEquipa() {
  const e = equipa;
  return `<div class="wrap">
    ${titleblock('PRV-EQP-008', '6/6')}
    ${sectionHead('equipa', 'Equipa', e.titulo, e.texto)}
    <div class="team">${e.membros.map((m) => `<article class="member rv">${slot(m.foto, { ar: 'ar-4-5' })}<div class="body"><span class="role">${tbc(m.funcao)}</span><h3>${tbc(m.nome)}</h3>
      <div class="meta"><span>${tbc(m.mec)}</span><span>${tbc(m.email)}</span></div><h4>Subsistemas</h4><ul class="chips">${m.subsistemas.map((s) => `<li>${tbc(s)}</li>`).join('')}</ul></div></article>`).join('')}</div>
    <div class="block"><h3 class="rv">${esc(e.matrizTitulo)}</h3>
      <div class="table-wrap rv"><table class="matrix"><thead><tr><th>Pessoa</th>${e.matrizColunas.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${e.matriz.map((row, i) => `<tr><th scope="row">${tbc(e.membros[i].nome)}</th>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="note">${esc(e.matrizNota)}</p></div>
  </div>`;
}

/* ───────── Rodapé ───────── */
export function renderRodape() {
  return `<div class="wrap">
    <section class="ia rv" aria-labelledby="ia-t">
      <div><h3 id="ia-t">${esc(ia.titulo)}</h3><p>${esc(ia.texto)}</p></div>
      <dl>${ia.itens.map((i) => `<dt>${esc(i.rotulo)}</dt><dd>${tbc(i.valor)}${i.links ? `<span class="dl-links">${i.links.map((l) => `<a href="${asset(l.ficheiro)}" download>${icon.down}${esc(l.rotulo)}</a>`).join('')}</span>` : ''}</dd>`).join('')}</dl>
    </section>
    <div class="foot-row">
      <div>
        <div class="foot-logo logo-slot" aria-hidden="true"></div>
        <p style="margin-top:16px">${esc(site.rodape.texto)}</p>
        <p>${esc(site.docentes)}</p>
        <p>${esc(site.rodape.creditos)}</p>
        <p class="hint">${esc(site.rodape.dica)}</p>
      </div>
      <div class="sol" aria-label="Contador de Sol">
        <div class="big" data-sol>—</div>
        <div class="lbl">Sol marciano · missão Perseverance</div>
        <div class="sub">Dia solar contado desde a aterragem (18 fev 2021, Sol 0). 1 Sol = 24 h 39 min 35 s.</div>
      </div>
    </div>
  </div>`;
}

export function renderEgg() {
  return `<div class="card">
    <h2 id="egg-t">Dare Mighty Things</h2>
    <p>O paraquedas do Perseverance escondia uma mensagem em código binário, em faixas laranja e brancas, e as coordenadas do JPL. Aqui está a mensagem em ASCII de 7 bits, uma letra por bloco.</p>
    <div class="chute" data-chute></div>
    <button class="btn" data-egg-close>Fechar</button>
  </div>`;
}
