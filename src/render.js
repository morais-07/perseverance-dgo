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
import destinos from './content/destinos.json';
import { esc, tbc, slot, icon, asset, fmt } from './lib/util.js';

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
    <a class="brand" href="#/" aria-label="Início — DGO"><span class="logo-slot" aria-hidden="true"></span><b>PRV·2026</b></a>
    <nav class="nav" id="nav" aria-label="Principal">
      ${site.nav.map((n) => `<a href="#${n.rota}" data-sec="${n.id}">${esc(n.rotulo)}</a>`).join('')}
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
      <div class="hero-corner tl" aria-hidden="true">PRV-000 · ESC 1:20 · FOLHA 1/7</div>
      <div class="hero-corner tr" aria-hidden="true">${esc(site.modeloRotulo.toUpperCase())}</div>
      <div class="hero-copy">
        <h1><span>${esc(site.titulo)}</span><span>${esc(site.tituloLinha2)}</span></h1>
        <p class="sub">${esc(site.subtitulo)}</p>
        <p class="meta"><span>${esc(site.curso)}</span><span>${esc(site.instituicao)}</span><span>${esc(site.ano)}</span></p>
      </div>
      <div class="hero-actions">
        <a class="btn" href="#/m0/montagem/viewer-bloco">${esc(site.botoes.explorar)}</a>
        ${downloadButton('ghost')}
      </div>
      <div class="hero-tele" aria-hidden="true">
        <span class="t-title">${esc(site.telemetria.rotulo)}</span>
        <span>${esc(site.telemetria.rotacao)} <b data-tele="rot">000°</b></span>
        <span>${esc(site.telemetria.zoom)} <b data-tele="zoom">1.0×</b></span>
        <span>${esc(site.telemetria.explosao)} <b data-tele="ex">0 %</b></span>
        <span>SOL <b data-sol>—</b></span>
      </div>
      <div class="hero-status" role="status" hidden></div>
      <button type="button" class="hero-motion" hidden></button>
      <div class="hero-cue" aria-hidden="true"><span>SCROLL</span><i></i></div>
    </div>`;
}

export function downloadButton(variant = '') {
  const d = site.download;
  const dis = !d.disponivel;
  return `<a class="btn ${variant}" href="${dis ? '#/equipa' : esc(d.ficheiro)}" ${dis ? 'aria-disabled="true" data-nodownload="1"' : 'download'} title="${esc(dis ? d.nota : 'Descarregar o pacote CAD')}">
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
    ${titleblock('PRV-HIS-002', '2/7')}
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
        <p class="ext-link"><a href="${esc(h.edl.video.link)}" target="_blank" rel="noopener noreferrer">${icon.play}<span>${esc(h.edl.video.titulo)}</span><span class="ext-arrow" aria-hidden="true">↗</span></a></p>
        <p class="note">${esc(h.edl.video.nota)}</p>
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
        <p class="tiny">g<sub>Terra</sub> = 9,81 m/s² · g<sub>Marte</sub> ≈ 3,73 m/s² · peso = m·g</p>
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
    ${titleblock('PRV-PRJ-003', '3/7')}
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
    ${sectionHead('projeto', 'O nosso projeto', 'Uma história em quatro atos', 'Do problema ao resultado: a escolha do rover, a modelação e montagem, a parametrização e a otimização da suspensão. É assim que contamos o semestre.')}
    <div class="arc rv">
      <a href="#/projeto/porque"><span class="k">ATO I</span><span class="h">O problema</span><span class="p">Porquê o Perseverance?</span></a>
      <a href="#/m0"><span class="k">ATO II</span><span class="h">Modelação e montagem</span><span class="p">M0 · modelar tudo e montar o rover</span></a>
      <a href="#/m1"><span class="k">ATO III</span><span class="h">Parametrização</span><span class="p">M1 · estratégias computacionais</span></a>
      <a href="#/m2"><span class="k">ATO IV</span><span class="h">Otimização</span><span class="p">M2 · otimizar a suspensão</span></a>
    </div>
  </div>`;
}

export function renderSubnav() {
  return site.subnav.map((s) => `<a href="#${s.rota}" data-sec="${s.id}">${esc(s.rotulo)}</a>`).join('');
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
      <p class="tema">Tema da aula: ${esc(w.tema)}</p>
      ${w.texto.map((t) => `<p>${tbc(t)}</p>`).join('')}
      ${w.ligacao ? `<p class="ext-link"><a href="${asset(w.ligacao.ficheiro)}" target="_blank" rel="noopener noreferrer">${esc(w.ligacao.rotulo)}</a></p>` : ''}
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
      <div class="sub-id"><span>${esc(p.codigo)}</span><a class="metodo-tag" href="#/m0/estrategia/metodo-${p.metodo}" title="Ver o método de modelação">MÉTODO ${esc(p.metodo)}</a></div>
      <h3>${esc(p.nome)}</h3>
      <p class="real">${esc(p.nomeReal)}</p>
      <p class="who"><b>${esc(partes.responsavelRotulo)}:</b> ${esc(p.responsavel)}</p>
      <p>${esc(p.funcao)}</p>
      ${figs(p.numeros)}
    </div>
    ${p.demo ? `<div class="part-demo"><h4>${esc(p.demo.titulo)}</h4><p>${esc(p.demo.texto)}</p><div class="rb" data-rb></div></div>` : ''}
  </article>`;
}

const metodoCard = (mt) => `<article class="metodo rv" id="metodo-${esc(mt.id)}">
  <header><span class="mt-id">MÉTODO ${esc(mt.id)}</span><h4>${esc(mt.nome)}</h4><p class="mt-quem">${esc(mt.quem)}</p></header>
  <p class="mt-resumo">${esc(mt.resumo)}</p>
  <ol class="mt-passos">${mt.passos.map((s) => `<li><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div></li>`).join('')}</ol>
  <p class="mt-van">${esc(mt.vantagem)}</p>
</article>`;

export const m0Head = () => `${titleblock('PRV-M00-004', '4/7')}${msHead('m0', m0, 'Ato II — modelação e montagem')}`;

export const m0Semanas = () => `<div class="block"><h3 class="rv">${esc(m0.semanasTitulo)}</h3>${weeksOf('M0')}</div>`;

export function m0Estrategia() {
  const e = m0.estrategia;
  return `<div class="block"><h3 class="rv">${esc(m0.estrategiaTitulo)}</h3>
      <div class="estrategia-intro lead rv">${e.intro.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
      <div class="metodos">${e.metodos.map(metodoCard).join('')}</div>
    </div>
    <div class="block"><h3 class="rv">${esc(partes.titulo)}</h3><p class="rv">${esc(partes.texto)}</p>
      <div class="parts">${partes.partes.map(partCard).join('')}</div>
    </div>`;
}

export function m0Montagem() {
  const d = m0;
  return `<div class="block" id="viewer-bloco"><h3 class="rv">${esc(d.montagemTitulo)}</h3><p class="rv">${esc(d.montagemTexto)}</p>
      ${d.montagemFalta ? `<p class="rv">${tbc(d.montagemFalta)}</p>` : ''}
      ${renderViewer()}
      <p class="note rv" style="margin-top:12px">${esc(subs.modeloFinal.nota)}</p>
    </div>
    <div class="block"><h3 class="rv">${esc(d.renderRover.titulo)}</h3>
      <div class="slots-2 rv">${slot(d.renderRover.imagem)}${slot(d.renderRover.video)}</div></div>`;
}

export function m0Processo() {
  const d = m0;
  const g = d.generativo;
  return `<div class="block"><h3 class="rv">${esc(d.processoTitulo)}</h3>
      <ol class="flow rv" style="list-style:none;padding:0;margin:0 0 var(--s7)">${d.fluxo.map((f) => `<li><span class="n">${esc(f.codigo)}</span><span class="r">${esc(f.rotulo)}</span></li>`).join('')}</ol>
      <div class="two-col rv">
        <div><h3>${esc(d.divisaoTitulo)}</h3>
          <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Contacto</th><th>Subsistemas</th></tr></thead>
            <tbody>${equipa.membros.map((m) => `<tr><th scope="row">${esc(m.nome)} <span class="mono">(${esc(m.mec)})</span></th><td><a href="mailto:${esc(m.email)}" style="color:inherit">${esc(m.email)}</a></td><td>${esc(m.subsistemas.join(', '))}</td></tr>`).join('')}</tbody></table></div>
          <p class="note">${esc(d.divisaoNota)}</p></div>
        <div><h3>${esc(d.ferramentasTitulo)}</h3>
          <div class="table-wrap"><table><tbody>${d.ferramentas.map((f) => `<tr><th scope="row">${esc(f.tipo)}</th><td>${esc(f.nome)}</td></tr>`).join('')}</tbody></table></div></div>
      </div>
    </div>
    <div class="block" id="generativo"><h3 class="rv">${esc(g.titulo)}</h3>
      <p class="rv">${esc(g.intro)}</p><p class="note rv">${esc(g.credito)}</p>
      <h4 class="rv sub-titulo">${esc(g.pilaresTitulo)}</h4>
      <div class="pilares rv">${g.pilares.map((p, i) => `<div class="pilar"><span class="pl-n">0${i + 1}</span><h4>${esc(p.titulo)}</h4><span class="pl-sub">${esc(p.sub)}</span><p>${esc(p.texto)}</p></div>`).join('')}</div>
      <div class="reestrut rv"><h4>${esc(g.reestruturacaoTitulo)}</h4><p>${esc(g.reestruturacao)}</p></div>
      <h4 class="rv sub-titulo">${esc(g.proximosTitulo)}</h4>
      <ol class="wip-list rv">${g.proximos.map((x) => `<li><span><b>${esc(x.titulo)}.</b> ${esc(x.texto)}</span></li>`).join('')}</ol>
    </div>`;
}

/** Rota (#/…) de uma semana, para ligações antigas do tipo #semana-5. */
export function weekRoute(n) {
  const w = semanas.find((x) => x.semana === Number(n));
  return w ? `/${w.fase.toLowerCase()}/semanas/semana-${w.semana}` : null;
}

/* M1 */
const wipBlock = (d) => `
  <div class="wip rv">
    <span class="wip-badge">${esc(d.wip.estado)}</span>
    <p>${esc(d.wip.texto)}</p>
    <h3>${esc(d.wip.titulo)}</h3>
    <ul class="wip-list">${d.wip.planeado.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>`;

export const m1Head = () => `${titleblock('PRV-M01-005', '5/7')}${msHead('m1', m1, 'Ato III — parametrização')}`;

/** Caixa «Decisão e porquê», para mostrar as escolhas da equipa. */
const decisaoBox = (d) => `<aside class="m1-decisao"><h5>${esc(m1.suspensao.decisaoTitulo)}${d.data ? ` <span class="mono">${esc(d.data)}</span>` : ''}</h5><p>${esc(d.texto)}</p></aside>`;

/** Botões de download ou de ligação de uma secção. Sem `destino`, ficam desativados e avisam que ainda não estão disponíveis. */
function botoes(lista) {
  const t = m1.transferencias;
  return `<div class="m1-botoes rv">${lista
    .map((b) => {
      const ic = b.tipo === 'link' ? '<span class="ext-arrow" aria-hidden="true">↗</span>' : icon.down;
      if (!b.destino) return `<a class="btn ghost" href="#/m1" aria-disabled="true" data-nodownload="1" data-aviso="${esc(t.aviso)}">${ic}<span>${esc(b.rotulo)}<span class="btn-meta">${esc(t.estado)}</span></span></a>`;
      const alvo = b.tipo === 'link' ? `href="${esc(b.destino)}" target="_blank" rel="noopener noreferrer"` : `href="${asset(b.destino)}" download`;
      return `<a class="btn ghost" ${alvo}>${ic}<span>${esc(b.rotulo)}${b.meta ? `<span class="btn-meta">${esc(b.meta)}</span>` : ''}</span></a>`;
    })
    .join('')}</div>`;
}

/** Figura que se pode ampliar (usa a mesma caixa de luz das galerias). */
const fig = (grupo, file, alt, legenda = '') => `<figure class="m1-fig rv">
    <button type="button" class="gal-t" data-gal="${grupo}" data-full="${esc(file)}" data-alt="${esc(alt)}" aria-label="Ampliar: ${esc(alt)}"><img src="${asset(file)}" alt="" loading="lazy" decoding="async" /></button>
    ${legenda ? `<figcaption>${esc(legenda)}</figcaption>` : ''}
  </figure>`;

export function m1Estrategia() {
  const e = m1.estrategia;
  return `<div class="block"><h3 class="rv">${esc(e.titulo)}</h3>
    <p class="m1-destaque rv">${esc(e.destaque)}</p><p class="rv">${esc(e.texto)}</p>
    <div class="m1-equipa">${e.equipa
      .map((m) => `<article class="rv"><h4>${esc(m.parte)}</h4><p class="m1-quem">${esc(m.nome)}</p><p class="m1-ferr">${esc(m.ferramenta)}</p><ul>${m.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></article>`)
      .join('')}</div>
    <p class="m1-fecho rv">${esc(e.fecho)}</p></div>`;
}

/** Texto com `nomes de variáveis` em código. */
const cod = (t) => tbc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
const comTitulo = (itens) => itens.map(([t, x]) => `<li><b>${esc(t)}</b> ${cod(x)}</li>`).join('');
const lista = (x) => `<ul>${x.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

/** Imagem com legenda: mostra o aviso habitual enquanto o ficheiro não existir. */
const imgLeg = (i) => `<figure class="m1-slot rv">${slot(i)}<figcaption>${cod(i.legenda)}</figcaption></figure>`;
const tabela = (legenda, colunas, linhas) => `<div class="table-wrap"><table>
    <caption class="sr">${esc(legenda)}</caption>
    <thead><tr>${colunas.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${linhas.map(([a, ...r]) => `<tr><th scope="row">${a}</th>${r.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
const subt = (t) => `<h4 class="m1-lista-t m1-sep-p">${esc(t)}</h4>`;

/** Início de cada componente: o mesmo em todos, para se ver logo que a página mudou de componente. */
const parteHead = (titulo, responsavel, botoesLista) => `<header class="m1-parte rv"><h3>${esc(titulo)}</h3><p class="m1-quem">${esc(responsavel)}</p>${botoes(botoesLista)}</header>`;

/** Um passo numerado, com a mesma estrutura em todos os componentes. */
const pilula = (n, t) => `<h4 class="m1-pilula"><span>${n}</span>${esc(t)}</h4>`;
function passoM1(n, { titulo, resumo, decisao = '', lado = '', abaixo = '', detalhe = '' }) {
  const texto = `${resumo}${decisao}`;
  return `<li class="m1-passo rv">
    ${pilula(n, titulo)}
    ${lado ? `<div class="m1-duas m1-duas-topo"><div>${texto}</div>${lado}</div>` : texto}
    ${abaixo}
    ${detalhe ? `<details class="m1-det"><summary>${esc(m1.suspensao.detalheBotao)}</summary>${detalhe}</details>` : ''}
  </li>`;
}
const p = (t) => `<p>${t}</p>`;

export function m1Braco() {
  const b = m1.braco;
  const v = b.valores;
  const t = b.passosTitulos;
  const destinosB = destinos.destinos;
  const passos = [
    { titulo: t[0], resumo: p(esc(b.texto)), lado: fig('m1-braco', 'media/m1/braco/modelo.webp', 'Modelo do braço no Fusion.') },
    { titulo: t[1], resumo: p(esc(b.desafio)), decisao: decisaoBox({ texto: b.decisao }) },
    {
      titulo: t[2],
      resumo: p(esc(b.regras)),
      lado: `<div class="m1-braco-foto">
        <figure class="m1-fig m1-foto"><button type="button" class="gal-t" data-gal="m1-braco" data-full="media/m1/braco/componentes.webp" data-alt="${esc(b.fotoAlt)}" aria-label="Ampliar: ${esc(b.fotoAlt)}"><img src="${asset('media/m1/braco/componentes.webp')}" alt="" loading="lazy" /></button></figure>
        <div><h5 class="m1-lista-t">${esc(b.legendaTitulo)}</h5><ul class="m1-legenda">${b.legenda.map(([n, c, cor]) => `<li><i style="background:${cor}" aria-hidden="true"></i><b>${esc(n)}:</b> ${esc(c)}</li>`).join('')}</ul><p class="note">${esc(b.legendaNota)}</p></div>
      </div>`,
      detalhe: `<div class="m1-listas"><div><h4>Para variar o alcance</h4>${lista(b.alcance)}<p class="note">${esc(b.alcanceNota)}</p></div><div><h4>Para variar a robustez</h4>${lista(b.robustez)}</div></div>${p(cod(b.furos))}`,
    },
    {
      titulo: t[3],
      resumo: p(esc(b.variantesTexto)),
      abaixo: `<div class="m1-grade m1-grade-braco">${destinosB.map((x) => fig('m1-bracos', `media/m1/braco/${x.id}.webp`, `Braço do rover para ${x.nome}.`, x.nome)).join('')}</div>`,
      detalhe: `${subt(v.titulo)}${p(esc(v.texto))}
        ${tabela(v.titulo, [v.coluna, ...destinosB.map((x) => x.nome)], v.linhas.map(([k, rot, dec]) => [esc(rot), ...destinosB.map((x) => `<span class="mono">${fmt(x.braco[k], dec && x.braco[k] % 1 ? dec : 0)}</span>`)]))}
        ${subt(v.justificacaoTitulo)}<p class="note">${esc(v.justificacaoNota)}</p>
        ${tabela(v.justificacaoTitulo, v.justificacaoColunas, destinosB.map((x) => [esc(x.nome), esc(v.justificacao[x.id])]))}`,
    },
  ];
  return `<div class="block">${parteHead(b.titulo, b.responsavel, m1.transferencias.braco)}
    <ol class="m1-passos">${passos.map((x, i) => passoM1(i + 1, x)).join('')}</ol></div>`;
}

export function m1Chassis() {
  const c = m1.chassis;
  const d = c.fusionDetalhe;
  const t = c.passosTitulos;
  const seeds = [['original', 'Design original (seed 0)'], ['6', 'Seed 6'], ['10', 'Seed 10'], ['846', 'Seed 846']];
  const comValores = destinos.destinos.filter((x) => x.chassis);
  const v = c.valores;
  const r = c.seeds.randomizer;
  const passos = [
    { titulo: t.dois, resumo: p(esc(c.texto)), abaixo: fig('m1-chassis', 'media/m1/chassis/fusion_e_beegraphy.webp', 'À esquerda, o chassis paramétrico do Fusion; à direita, o chassis orgânico do BeeGraphy.', 'À esquerda, o chassis do Fusion; à direita, o do BeeGraphy.') },
    {
      titulo: c.fusion.titulo,
      resumo: `${p(esc(d.intro))}${p(esc(c.fusion.texto))}`,
      lado: fig('m1-chassis', 'media/m1/chassis/fusion.webp', 'Chassis no Fusion, com o painel de parâmetros.'),
      detalhe: `${subt(d.valores.titulo)}<div class="m1-duas m1-duas-topo">${p(cod(d.valores.texto))}${imgLeg(d.valores.img)}</div>
        ${subt(d.alterar.titulo)}${p(esc(d.alterar.texto))}`,
    },
    {
      titulo: t.painel,
      resumo: p(esc(d.painel.texto)),
      lado: imgLeg(d.painel.img),
      detalhe: `${subt(d.painel.comandosLegenda)}${tabela(d.painel.comandosLegenda, d.painel.colunas, d.painel.comandos.map(([x, y]) => [esc(x), esc(y)]))}
        ${subt(d.painel.faixasTitulo)}${tabela(d.painel.faixasTitulo, d.painel.faixasColunas, d.painel.faixas.map(([x, y, z]) => [`<code>${esc(x)}</code>`, esc(y), esc(z)]))}`,
    },
    { titulo: t.configuracoes, resumo: p(esc(d.configuracoes.texto)), abaixo: `<div class="m1-grade m1-grade-det">${d.configuracoes.par.map(imgLeg).join('')}</div>` },
    {
      titulo: c.beegraphy.titulo,
      resumo: p(esc(c.beegraphy.texto)),
      lado: fig('m1-chassis', 'media/m1/chassis/nos.webp', 'Grafo de nós do chassis no BeeGraphy.'),
      detalhe: `${subt(c.construcao.titulo)}<ol class="m1-fluxo">${c.construcao.passos.map(([x, y]) => `<li><b>${esc(x)}</b><span>${esc(y)}</span></li>`).join('')}</ol>
        <p class="m1-sep-p">${esc(c.construcao.formulaTexto)}</p><pre class="m1-codigo"><code>${esc(c.construcao.formula)}</code></pre>`,
    },
    {
      titulo: t.difícil,
      resumo: p(esc(c.dificil.resumo)),
      decisao: `<aside class="m1-decisao"><h5>${esc(m1.suspensao.decisaoTitulo)}</h5><ul class="m1-marcas">${comTitulo(c.decisoes)}</ul></aside>`,
      detalhe: `<ul class="m1-marcas">${comTitulo(c.dificil.itens)}</ul>`,
    },
    {
      titulo: t.valores,
      resumo: p(esc(v.texto)),
      lado: fig('m1-chassis', 'media/m1/chassis/sliders.webp', 'Chassis no BeeGraphy, com os sliders dos parâmetros.'),
      detalhe: `<div class="m1-listas"><div><h4>O que pode mudar</h4>${lista(c.muda)}</div><div><h4>O que fica sempre igual</h4>${lista(c.fixo)}<p class="note">${esc(c.fixoNota)}</p></div></div>
        ${subt(v.titulo)}${tabela(v.titulo, ['Slider', ...comValores.map((x) => x.nome)], v.linhas.map(([k, rot, dec]) => [esc(rot), ...comValores.map((x) => `<span class="mono">${fmt(x.chassis[k], dec)}</span>`)]))}
        <p class="note m1-sep-p">${cod(v.iguais)}</p>
        ${subt(v.justificacaoTitulo)}<p class="note">${esc(v.justificacaoNota)}</p>
        ${tabela(v.justificacaoTitulo, ['Destino', v.justificacaoTitulo], comValores.map((x) => [esc(x.nome), esc(v.justificacao[x.id])]))}`,
    },
    {
      titulo: t.seeds,
      resumo: p(esc(c.seeds.texto)),
      abaixo: `<div class="m1-grade m1-grade-4">${seeds.map(([f, rot]) => fig('m1-seeds', `media/m1/chassis/seed_${f}.webp`, `Chassis gerado no BeeGraphy: ${rot}.`, rot)).join('')}</div>`,
      detalhe: `<div class="m1-duas m1-duas-topo">
          <div>${subt(r.titulo)}${p(cod(r.texto))}<pre class="m1-codigo"><code>${esc(r.passo)}</code></pre><ul class="m1-marcas">${r.notas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="m1-fig-pequena">${fig('m1-randomizer', 'media/m1/chassis/randomizer.webp', r.alt, r.legenda)}</div>
        </div>
        ${tabela('Intervalos do randomizer', ['Variável', 'Mínimo', 'Máximo', 'Passo'], r.intervalos.map(([n, a, b, x]) => [esc(n), `<span class="mono">${esc(a)}</span>`, `<span class="mono">${esc(b)}</span>`, `<span class="mono">${esc(x)}</span>`]))}
        ${subt(r.codigoBotao)}<pre class="m1-codigo"><code>${esc(r.codigo)}</code></pre>`,
    },
  ];
  return `<div class="block">${parteHead(c.titulo, c.responsavel, m1.transferencias.chassis)}
    <ol class="m1-passos">${passos.map((x, i) => passoM1(i + 1, x)).join('')}</ol></div>`;
}

export function m1Suspensao() {
  const s = m1.suspensao;
  const ordem = [...destinos.destinos].sort((a, b) => a.rover.massa - b.rover.massa);
  const maxM = Math.max(...ordem.map((x) => x.rover.massa));
  const orig = destinos.massaSuspensaoOriginal;
  const sinal = (v) => (v > 0 ? `+${v}` : `−${Math.abs(v)}`);
  const r = s.resultados;
  const c = s.conclusoes;
  const passo = (x, i) => {
    const [princ, ...resto] = x.media;
    return passoM1(i + 1, {
      titulo: x.titulo,
      resumo: p(esc(x.resumo)),
      decisao: decisaoBox(x.decisao),
      lado: fig(`m1-passo${i}`, princ.file, princ.alt, princ.legenda),
      detalhe: `<ul>${x.detalhe.map((y) => `<li>${esc(y)}</li>`).join('')}</ul>
        ${resto.length ? `<div class="m1-grade m1-grade-det">${resto.map((f) => fig(`m1-passo${i}`, f.file, f.alt, f.legenda)).join('')}</div>` : ''}`,
    });
  };
  return `<div class="block">${parteHead(s.titulo, s.responsavel, m1.transferencias.suspensao)}
    <p class="m1-destaque m1-apoio rv">${esc(s.apoio)}</p>
    <p class="rv">${esc(s.m0m1)} <a href="#/m0">${esc(s.m0m1Link)}</a>.</p>
    <ol class="m1-passos">${s.passos.map(passo).join('')}
      <li class="m1-passo rv">
        ${pilula(5, r.titulo)}
        <p>${esc(r.resumo)}</p>
        <div class="m1-duas m1-duas-topo" data-suspensao>
          <div>
            <p class="note">${esc(r.seletor)}</p>
            <div class="susp-sel" role="group" aria-label="Escolher o destino">
              <div class="susp-ref" aria-hidden="true"><span>${esc(r.original)}</span></div>
              ${ordem
                .map(
                  (x) => `<button type="button" class="susp-l" data-susp="${x.id}" data-nome="${esc(x.nome)}" data-legenda="${esc(`${x.nome}: ${fmt(x.rover.massa, 1)} kg, ${sinal(x.rover.delta)} % face ao original. Material: ${x.rover.material}.`)}" aria-pressed="false">
                  <span class="susp-n">${esc(x.nome)}</span><span class="susp-t" aria-hidden="true"><i style="width:${((x.rover.massa / maxM) * 100).toFixed(2)}%"></i></span><span class="susp-v mono">${fmt(x.rover.massa, 1)}</span><span class="susp-d mono">${sinal(x.rover.delta)} %</span></button>`,
                )
                .join('')}
            </div>
          </div>
          <figure class="m1-susp-fig"><img data-susp-img alt="" width="1653" height="1140" /><figcaption data-susp-cap aria-live="polite"></figcaption><p class="note">${esc(r.legenda)}</p></figure>
        </div>
        <details class="m1-det"><summary>${esc(s.detalheBotao)}</summary>
          <ul>${r.notas.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="table-wrap"><table>
            <caption class="sr">Resultados da suspensão por destino</caption>
            <thead><tr><th scope="col">Destino</th><th scope="col">Massa</th><th scope="col">Face aos ${fmt(orig, 1)} kg</th><th scope="col">Material</th><th scope="col">Família do joelho</th><th scope="col">Braço do joelho</th><th scope="col">FS 3D do joelho</th></tr></thead>
            <tbody>${ordem.map((x) => `<tr><th scope="row">${esc(x.nome)}</th><td class="mono">${fmt(x.rover.massa, 1)} kg</td><td class="mono">${sinal(x.rover.delta)} %</td><td>${esc(x.rover.material)}</td><td>${esc(x.rover.familia)}</td><td class="mono">${fmt(x.rover.braco, 2)} kg</td><td class="mono">${fmt(x.rover.fs, 2)}</td></tr>`).join('')}</tbody>
          </table></div>
          <div class="m1-grade m1-grade-det">${fig('m1-passo5', r.tabelaFig.file, r.tabelaFig.alt, r.tabelaFig.legenda)}</div>
        </details>
      </li>
      <li class="m1-passo rv">
        ${pilula(6, c.titulo)}
        <p>${esc(c.resumo)}</p>
        <div class="m1-limites"><h5>${esc(c.limitesTitulo)}</h5><ul>${c.limites.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <details class="m1-det"><summary>${esc(s.detalheBotao)}</summary>
          <ul class="m1-conc">${c.itens.map(([t, x]) => `<li><b>${esc(t)}</b> ${esc(x)}</li>`).join('')}</ul>
        </details>
        <p><a href="#/m2">${esc(c.proximo)}</a></p>
      </li>
    </ol></div>`;
}

export function m1Semanas() {
  return `<div class="block"><h3 class="rv">M1 · semana a semana</h3>${weeksOf('M1')}</div>`;
}

/* ───────── M1 · Escolhe a próxima viagem ───────── */
export function renderViagem() {
  const d = destinos;
  const first = d.destinos.find((x) => x.origem) || d.destinos[0];
  const lab = d.laboratorio;
  const hMax = d.salto.v0 ** 2 / (2 * Math.min(...d.destinos.map((x) => x.g)));
  const pista = (nome, g, id, img) => {
    const h = d.salto.v0 ** 2 / (2 * g);
    const t = (2 * d.salto.v0) / g;
    const tag = id ? 'button' : 'div';
    return `<${tag} ${id ? `type="button" data-id="${id}" style="--dc:${d.destinos.find((x) => x.id === id).cor}" aria-label="Escolher ${esc(nome)}: salto de ${fmt(h * 100, 0)} cm"` : ''} class="lab-lane ${id ? '' : 'ref'}" data-g="${g}">
      <span class="lab-track" style="--f:${(h / hMax).toFixed(3)}"><i class="lab-peak"><b>${fmt(h * 100, 0)} cm</b></i><img src="${asset(`media/m1/rovers/${img}/recorte.webp`)}" alt="" loading="lazy" /></span>
      <span class="lab-n">${esc(nome)}</span><span class="lab-t mono">${fmt(t, 2)} s no ar</span>
    </${tag}>`;
  };
  return `<div class="viagem" data-viagem>
    <div class="vg-head">
      <h3 id="viagem-t">${esc(d.titulo)}</h3>
      <p class="lead">${esc(d.intro)}</p>
    </div>

    <div class="vg-stage" data-stage>
      <div class="vg-ambient" aria-hidden="true"></div>
      <div class="vg-frame">
        <div class="vg-media" data-media></div>
        <video muted playsinline preload="metadata" aria-label="Vídeo do rover a andar neste destino."></video>
        <canvas hidden aria-label="Modelo 3D do rover. Arrasta para rodar."></canvas>
        <div class="vg-load" role="status" hidden></div>
        <p class="vg-hint" hidden>Arrasta para rodar o rover</p>
      </div>
      <div class="vg-over">
        <p class="vg-kicker" data-kicker></p>
        <h4 class="vg-nome" data-nome aria-live="polite"></h4>
        <p class="vg-leitura" data-leitura></p>
      </div>
      <div class="vg-ctrl">
        <div class="vg-modos" role="group" aria-label="Como ver o rover">
          <button type="button" data-modo="movimento">Em movimento</button>
          <button type="button" data-modo="vistas">Vistas</button>
          <button type="button" data-modo="3d">3D</button>
        </div>
        <button type="button" class="icon-btn vg-pause"></button>
      </div>
      <div class="vg-views" role="group" aria-label="Vista do render" hidden>
        ${[['principal', 'Frente'], ['lateral', 'Lado'], ['traseira', 'Trás']].map(([v, r]) => `<button type="button" data-vista="${v}">${esc(r)}</button>`).join('')}
      </div>
    </div>

    <div class="vg-rail" role="radiogroup" aria-label="${esc(d.escolhaRotulo)}">
      ${d.destinos
        .map(
          (x) => `<button type="button" role="radio" class="vg-dest" data-id="${x.id}" aria-checked="${x.id === first.id}" tabindex="${x.id === first.id ? 0 : -1}" style="--dc:${x.cor}">
        <img src="${asset(`media/m1/rovers/${x.id}/recorte.webp`)}" alt="" width="280" height="140" />
        <b>${esc(x.nome)}</b><span class="mono">${fmt(x.g, 2)} m/s²</span>
      </button>`,
        )
        .join('')}
    </div>

    <div class="vg-sheet" data-info aria-live="polite"></div>

    <div class="vg-lab">
      <div class="lab-head">
        <div><h3>${esc(lab.titulo)}</h3><p>${esc(lab.texto)}</p></div>
        <button type="button" class="btn" data-saltar>${esc(lab.botao)}</button>
      </div>
      <div class="lab-scroll"><div class="lab">
        ${pista(lab.terra, d.gTerra, null, 'marte')}
        ${d.destinos.map((x) => pista(x.nome, x.g, x.id, x.id)).join('')}
      </div></div>
      <p class="note">${esc(d.salto.nota)}</p>
    </div>

    <details class="vg-table">
      <summary>Ver a tabela completa dos destinos</summary>
      <div class="table-wrap"><table>
        <caption class="sr">Destinos da próxima viagem</caption>
        <thead><tr><th scope="col">Destino</th><th scope="col">Gravidade</th><th scope="col">Ambiente</th><th scope="col">Porque o escolhemos</th></tr></thead>
        <tbody>${d.destinos.map((x) => `<tr><th scope="row">${esc(x.nome)}</th><td class="mono">${fmt(x.g, 2)} m/s²</td><td>${esc(x.temperatura)}. ${esc(x.ambiente)}</td><td>${esc(x.porque)}</td></tr>`).join('')}</tbody>
      </table></div>
    </details>

    <details class="vg-table vg-fontes">
      <summary>${esc(d.fontesTitulo)}</summary>
      <p class="note">${esc(d.fontesNota)}</p>
      <ol>${d.fontes.map((f) => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.rotulo)}</a></li>`).join('')}</ol>
    </details>
  </div>`;
}

/* M2 */
export const m2Head = () => `${titleblock('PRV-M02-006', '6/7')}${msHead('m2', m2, 'Ato IV — otimização')}`;

export function m2Corpo() {
  const d = m2;
  const o = d.otimizacao;
  if (d.wip?.ativo) return wipBlock(d);
  return `<div class="block"><h3 class="rv">M2 · semana a semana</h3>${weeksOf('M2')}</div>
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
      </div></div>`;
}

function renderViewer() {
  return `<div class="viewer rv" id="viewer" role="region" aria-label="Visualizador 3D do rover">
    <canvas tabindex="0" aria-label="Modelo 3D do rover. Setas rodam, + e − ampliam, 0 repõe a vista, E explode."></canvas>
    <div class="v-hotspots"></div>
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
    ${titleblock('PRV-EQP-007', '7/7')}
    ${sectionHead('equipa', 'Equipa', e.titulo, e.texto)}
    <div class="team">${e.membros.map((m) => `<article class="member rv">${slot(m.foto, { ar: 'ar-4-5' })}<div class="body"><span class="role">${tbc(m.funcao)}</span><h3>${tbc(m.nome)}</h3>
      <div class="meta"><span>${tbc(m.mec)}</span><span>${tbc(m.email)}</span></div><h4>Subsistemas</h4><ul class="chips">${m.subsistemas.map((s) => `<li>${tbc(s)}</li>`).join('')}</ul></div></article>`).join('')}</div>
    <div class="block"><h3 class="rv">${esc(e.matrizTitulo)}</h3>
      <div class="table-wrap rv"><table class="matrix"><thead><tr><th>Pessoa</th>${e.matrizColunas.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${e.matriz.map((row, i) => `<tr><th scope="row">${tbc(e.membros[i].nome)}</th>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="note">${esc(e.matrizNota)}</p></div>
  </div>`;
}

/* ───────── Declaração de IA (só na página inicial) ───────── */
export const renderIA = () => `<div class="wrap">
    <section class="ia rv" aria-labelledby="ia-t">
      <div><h3 id="ia-t">${esc(ia.titulo)}</h3><p>${esc(ia.texto)}</p></div>
      <dl>${ia.itens.map((i) => `<dt>${esc(i.rotulo)}</dt><dd>${tbc(i.valor)}${i.links ? `<span class="dl-links">${i.links.map((l) => `<a href="${asset(l.ficheiro)}" download>${icon.down}${esc(l.rotulo)}</a>`).join('')}</span>` : ''}</dd>`).join('')}</dl>
    </section>
  </div>`;

/* ───────── Rodapé ───────── */
export function renderRodape() {
  return `<div class="wrap">
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
