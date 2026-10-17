// estos casos revisan que no se mezclen equipos y jugadores individuales
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import { datosOriginales, perfiles } from '../src/data/datos.js';
import { arenaService } from '../src/services/arenaService.js';
import { esTorneoIndividual, validarInscripcion } from '../src/utils/logica.js';

const perfil = perfiles.find(p => p.id === 'jugador-elegible');
const formulario = { torneoId: '3', tipo: 'equipo', participanteId: '5', correo: 'prueba@example.com', acepta: true, seed: '' };
function preparar() {
  const db = JSON.parse(JSON.stringify(datosOriginales));
  const torneo = db.torneos.find(t => t.id === 3);
  torneo.estado = 'Abierto';
  torneo.cierre = '2099-10-20';
  db.inscripciones = db.inscripciones.filter(i => i.torneoId !== 3);
  return db;
}

describe('modalidad de los torneos', () => {
  it('reconoce solo, individual y uno contra uno sin mirar el nombre del juego', () => {
    for (const modalidad of ['UHC - solo', 'Individual', '1 vs 1', '1v1']) expect(esTorneoIndividual({ modalidad })).toBeTrue();
    for (const modalidad of ['5 vs 5', 'Dúos', '']) expect(esTorneoIndividual({ modalidad })).toBeFalse();
    expect(esTorneoIndividual(null)).toBeFalse();
  });
  it('bloquea equipos nuevos en un torneo individual', () => {
    const db = preparar();
    const errores = validarInscripcion(db, formulario, perfil);
    expect(Object.keys(errores)).toEqual(['modalidad']);
    expect(errores.modalidad).toContain('individual');
  });
  it('vuelve a bloquear el equipo al guardar y no modifica los datos', () => {
    const db = preparar();
    const cantidad = db.inscripciones.length;
    expect(() => arenaService.inscribir(db, formulario, perfil)).toThrowError(/individual/);
    expect(db.inscripciones.length).toBe(cantidad);
  });
  it('permite al jugador individual en ese mismo torneo', () => {
    const db = preparar();
    const resultado = arenaService.inscribir(db, { ...formulario, tipo: 'jugador' }, perfil);
    expect(resultado.registro.jugadorId).toBe(5);
    expect(resultado.registro.equipoId).toBeNull();
  });
  it('sigue bloqueando al jugador suelto en un torneo de equipos', () => {
    const db = preparar();
    const torneo = db.torneos.find(t => t.id === 2);
    torneo.cierre = '2099-10-20';
    expect(validarInscripcion(db, { ...formulario, torneoId: '2', tipo: 'jugador' }, perfil).modalidad).toContain('equipo');
  });
});

describe('formulario en un torneo individual', () => {
  let contenedor, raiz;
  beforeEach(() => {
    contenedor = document.createElement('div');
    document.body.appendChild(contenedor);
    raiz = createRoot(contenedor);
    spyOn(window, 'scrollTo');
    spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    spyOn(Storage.prototype, 'setItem');
    spyOn(arenaService, 'cargar').and.resolveTo(preparar());
  });
  afterEach(async () => { await act(async () => raiz.unmount()); contenedor.remove(); });
  async function elegir(selector, valor) {
    await act(async () => { const campo = contenedor.querySelector(selector); campo.value = valor; campo.dispatchEvent(new Event('change', { bubbles: true })); });
  }
  it('desactiva el envío como equipo y deja confirmar al cambiar a jugador', async () => {
    await act(async () => raiz.render(<MemoryRouter initialEntries={['/inscripcion.html?id=3']}><App /></MemoryRouter>));
    await elegir('#selector-perfil', 'jugador-elegible');
    await elegir('#ins-participante', '5');
    await act(async () => {
      const correo = contenedor.querySelector('#ins-correo');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(correo, 'prueba@example.com');
      correo.dispatchEvent(new Event('input', { bubbles: true }));
      contenedor.querySelector('input[type="checkbox"]').click();
    });
    expect(contenedor.querySelector('button[type="submit"]').disabled).toBeTrue();
    expect(contenedor.textContent).toContain('Este torneo es individual');
    await act(async () => contenedor.querySelector('input[value="jugador"]').click());
    await elegir('#ins-participante', '5');
    expect(contenedor.querySelector('button[type="submit"]').disabled).toBeFalse();
    await act(async () => contenedor.querySelector('button[type="submit"]').click());
    expect(contenedor.textContent).toContain('Inscripción registrada');
  });
});
