// Limpeza ao mudar de página: cada módulo regista aqui o que tem de parar (animações, contextos WebGL, observadores).
const cleanups = new Set();

/** Regista uma função a executar quando o utilizador sai da página atual. */
export function onLeave(fn) {
  cleanups.add(fn);
  return fn;
}

export function runCleanups() {
  cleanups.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.warn('[limpeza]', err);
    }
  });
  cleanups.clear();
}
