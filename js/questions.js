// ╔══════════════════════════════════════════════════════════════╗
// ║  questions.js — EDITA ESTE ARCHIVO para personalizar        ║
// ║  las preguntas, opciones, pesos y rangos de nivel           ║
// ╚══════════════════════════════════════════════════════════════╝

const SURVEY_QUESTIONS = [

  // ── PREGUNTA 1 ────────────────────────────────────────────────
{
  pregunta: "¿Cómo arrancó la semana?",
  opciones: [
    { texto: "Bien, llegué puntual y hasta desayuné.",                                                                    peso: 1 },
    { texto: "Se me pegaron las cobijas, pero llegué.",                                                                   peso: 3 },
    { texto: "Por culpa del trancón llegué tarde y el profe ya había llamado a lista.",                                     peso: 5 },
  ]
},

// ── PREGUNTA 2 ────────────────────────────────────────────────
{
  pregunta: "¿Cómo está el cuerpo hoy?",
  opciones: [
    { texto: "Descansado, como si el fin de semana hubiera servido de algo.",                                             peso: 1 },
    { texto: "Tenso del cuello, pero nada que un estiramiento no cure.",                                                  peso: 3 },
    { texto: "El cuerpo pide cama y el horario pide otra cosa.",                                                          peso: 5 },
  ]
},

// ── PREGUNTA 3 ────────────────────────────────────────────────
{
  pregunta: "El profe acaba de poner una tarea extra para el viernes. ¿Qué piensas?",
  opciones: [
    { texto: "\"Listo, no hay problema.\"",                                                                               peso: 1 },
    { texto: "\"Ugh, bueno... le meto.\"",                                                                                peso: 3 },
    { texto: "\"¿En serio? Ya tenía tres entregas esa semana.\"",                                                         peso: 5 },
  ]
},

// ── PREGUNTA 4 ────────────────────────────────────────────────
{
  pregunta: "¿Cómo estuvo la noche?",
  opciones: [
    { texto: "Dormí de una, ni me moví.",                                                                                 peso: 1 },
    { texto: "Dormí, pero soñé con parciales y entregas.",                                                                peso: 3 },
    { texto: "Sin poder dormir, esperando que el grupo contestara el chat para el trabajo final. Nunca contestaron.",     peso: 5 },
  ]
},

// ── PREGUNTA 5 ────────────────────────────────────────────────
{
  pregunta: "Tienes 40 minutos libres entre clases. ¿Qué pasa?",
  opciones: [
    { texto: "Los disfruto, como algo y descanso sin remordimiento.",                                                     peso: 1 },
    { texto: "Descanso, pero la cabeza sigue dando vueltas.",                                                             peso: 3 },
    { texto: "Abro el computador porque siento que no puedo darme ese lujo.",                                             peso: 5 },
  ]
},

// ── PREGUNTA 6 ────────────────────────────────────────────────
{
  pregunta: "¿Cómo va el grupo de trabajo?",
  opciones: [
    { texto: "Todos ponen, nos organizamos bien.",                                                                        peso: 1 },
    { texto: "Hay uno que siempre desaparece, pero el resto responde.",                                                   peso: 3 },
    { texto: "El grupo existe en el nombre. Al final uno termina haciéndolo todo.",                                       peso: 5 },
  ]
},

// ── PREGUNTA 7 ────────────────────────────────────────────────
{
  pregunta: "Cuando piensas en lo que falta del semestre...",
  opciones: [
    { texto: "Lo veo tranquilo, voy al día.",                                                                             peso: 1 },
    { texto: "Hay cosas acumuladas, pero se puede.",                                                                      peso: 3 },
    { texto: "Siento que el semestre me está ganando la pelea.",                                                          peso: 5 },
  ]
},

// ── PREGUNTA 8 ────────────────────────────────────────────────
{
  pregunta: "Si tu semana fuera un meme, ¿cuál sería?",
  opciones: [
    { texto: "El perro tomando tinto tranquilo mientras todo está bien. 🐶☕",                                             peso: 1 },
    { texto: "El de 'todo está bien' con el cuarto en llamas de fondo. 🔥",                                               peso: 3 },
    { texto: "El niño llorando con el cartel que dice 'ayuda'. 😭",                                                       peso: 5 },
  ]
},

];

// ── RANGOS DE NIVEL ────────────────────────────────────────────
// Ajusta min/max para hacer cada nivel más o menos sensible
const NIVEL_RANGOS = [
  { nivel: 1, min: 1.0, max: 1.8 },
  { nivel: 2, min: 1.9, max: 2.6 },
  { nivel: 3, min: 2.7, max: 3.4 },
  { nivel: 4, min: 3.5, max: 4.2 },
  { nivel: 5, min: 4.3, max: 5.0 },
];

function calcularNivel(respuestas) {
  const promedio = respuestas.reduce((a, b) => a + b, 0) / respuestas.length;
  const encontrado = NIVEL_RANGOS.find(r => promedio >= r.min && promedio <= r.max);
  return encontrado ? encontrado.nivel : 3;
}

window.SURVEY_QUESTIONS = SURVEY_QUESTIONS;
window.calcularNivel    = calcularNivel;
