/* ==========================================================================
   INOVAÇÃO NA MOBILIDADE URBANA — CAMINHO SEGURO (LÓGICA PRINCIPAL)
   ========================================================================== */

// Coordenadas centrais (Rancho Alegre - PR / Exemplo)
const MAP_CENTER = [-23.0762, -50.9161];
let map, userRoutePolyline;

// Perguntas do Quiz
const quizQuestions = [
  {
    question: "Ao circular de patinete à noite, qual o procedimento correto?",
    options: [
      "Usar roupas escuras para passar despercebido.",
      "Usar capacete, luzes dianteira/traseira e elementos refletivos.",
      "Circular pela calçada em velocidade máxima.",
      "Utilizar fones de ouvido no volume máximo."
    ],
    correct: 1,
    explanation: "A visibilidade noturna é vital. Luzes e refletivos evitam colisões graves com veículos."
  },
  {
    question: "Qual a prioridade no trânsito em áreas de convivência e travessias?",
    options: [
      "Os patinetes elétricos.",
      "Os automóveis e caminhões.",
      "Os pedestres.",
      "Quem estiver em maior velocidade."
    ],
    correct: 2,
    explanation: "O pedestre é a ponta mais vulnerável do trânsito e sempre possui a preferência de passagem."
  },
  {
    question: "É permitido transportar passageiros ou caronas no patinete elétrico?",
    options: [
      "Sim, desde que ambos usem capacete.",
      "Não, pois desestabiliza o veículo e altera o centro de gravidade.",
      "Sim, apenas em distâncias curtas.",
      "Livre em vias de baixa velocidade."
    ],
    correct: 1,
    explanation: "Patinetes são projetados estritamente para uso individual. Caronas aumentam drasticamente o risco de quedas."
  },
  {
    question: "O que deve ser feito antes de realizar uma curva ou mudança de faixa?",
    options: [
      "Acelerar para concluir a curva rapidamente.",
      "Sinalizar a intenção com os braços e verificar o tráfego em volta.",
      "Buzinar continuadamente sem olhar para trás.",
      "Frear bruscamente no meio da pista."
    ],
    correct: 1,
    explanation: "A sinalização com os braços alerta motoristas e outros ciclistas sobre sua direção."
  },
  {
    question: "Como agir ao se aproximar de uma cruzamento com pouca visibilidade?",
    options: [
      "Manter a velocidade e cruzar direto.",
      "Reduzir a velocidade, parar se necessário e fazer contato visual com os motoristas.",
      "Subir na calçada em alta velocidade.",
      "Tocar a buzina e acelerar."
    ],
    correct: 1,
    explanation: "A prudência e a parada preventiva evitam acidentes em esquinas cegas."
  }
];

let currentQuizIndex = 0;
let quizScore = 0;

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initCharts();
  renderQuizQuestion();
});

// NAVEGAÇÃO DE ABAS
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  const selectedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
    btn.getAttribute('onclick').includes(tabId)
  );
  if (selectedBtn) selectedBtn.classList.add('active');

  const selectedTab = document.getElementById(`tab-${tabId}`);
  if (selectedTab) selectedTab.classList.add('active');

  if (tabId === 'mapa' && map) {
    setTimeout(() => { map.invalidateSize(); }, 200);
  }
}

// INICIALIZAÇÃO DO MAPA (LEAFLET)
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  map = L.map('map').setView(MAP_CENTER, 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  const points = [
    {
      lat: -23.0762,
      lng: -50.9161,
      title: "Entrada Principal do Colégio",
      type: "low",
      desc: "Área de desaceleração. Sinalização presente, porém exige atenção ao fluxo de embarque/desembarque."
    },
    {
      lat: -23.0750,
      lng: -50.9150,
      title: "Cruzamento Sem Visibilidade",
      type: "high",
      desc: "Ponto crítico: Vegetação alta e carros estacionados ocultam patinetes em aproximação."
    },
    {
      lat: -23.0775,
      lng: -50.9175,
      title: "Trecho Recomendado — Rota Segura",
      type: "green",
      desc: "Via com tráfego calmo e boa pavimentação, recomendada para mobilidade ativa."
    }
  ];

  points.forEach(pt => {
    let color = pt.type === 'high' ? 'red' : pt.type === 'green' ? 'green' : 'gold';
    const marker = L.circleMarker([pt.lat, pt.lng], {
      color: color,
      fillColor: color,
      fillOpacity: 0.8,
      radius: 10
    }).addTo(map);

    marker.on('click', () => {
      document.getElementById('point-details').innerHTML = `
        <h4 style="color: var(--dark-navy); margin-bottom: 6px;">${pt.title}</h4>
        <p style="font-size: 0.88rem;">${pt.desc}</p>
      `;
    });
  });
}

// INICIALIZAÇÃO DOS GRÁFICOS (CHART.JS)
function initCharts() {
  const ctxEpi = document.getElementById('chartEpis');
  if (ctxEpi) {
    new Chart(ctxEpi, {
      type: 'doughnut',
      data: {
        labels: ['Usa Sempre', 'Usa Às Vezes', 'Raramente / Nunca'],
        datasets: [{
          data: [25, 35, 40],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctxRiscos = document.getElementById('chartRiscos');
  if (ctxRiscos) {
    new Chart(ctxRiscos, {
      type: 'bar',
      data: {
        labels: ['Falta de Visibilidade', 'Excesso de Velocidade', 'Calçadas Irregulares', 'Ausência de Faixa'],
        datasets: [{
          label: '% dos Entrevistados',
          data: [42, 28, 18, 12],
          backgroundColor: '#0284c7'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// QUIZ
function renderQuizQuestion() {
  const body = document.getElementById('quiz-body');
  if (!body) return;

  const q = quizQuestions[currentQuizIndex];
  document.getElementById('quiz-progress-text').innerText = `Pergunta ${currentQuizIndex + 1} de ${quizQuestions.length}`;
  document.getElementById('quiz-progress-bar').style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;

  body.innerHTML = `
    <div class="quiz-question-title">${q.question}</div>
    <div class="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option-btn" onclick="checkAnswer(${i})">${opt}</button>
      `).join('')}
    </div>
    <div id="quiz-feedback" class="quiz-feedback hidden"></div>
  `;
}

function checkAnswer(index) {
  const q = quizQuestions[currentQuizIndex];
  const feedback = document.getElementById('quiz-feedback');
  const buttons = document.querySelectorAll('.quiz-option-btn');
  
  buttons.forEach(btn => btn.disabled = true);

  if (index === q.correct) {
    quizScore++;
    feedback.className = "quiz-feedback correct";
    feedback.innerHTML = `<strong>Correto!</strong> ${q.explanation}`;
  } else {
    feedback.className = "quiz-feedback incorrect";
    feedback.innerHTML = `<strong>Incorreto.</strong> ${q.explanation}`;
  }

  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
      renderQuizQuestion();
    } else {
      showQuizResult();
    }
  }, 2500);
}

function showQuizResult() {
  document.getElementById('quiz-body').classList.add('hidden');
  const res = document.getElementById('quiz-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <h3 style="color: var(--dark-navy);">Quiz Concluído!</h3>
    <p style="font-size: 1.1rem; margin: 12px 0;">Você acertou <strong>${quizScore}</strong> de <strong>${quizQuestions.length}</strong> questões.</p>
    <button class="btn btn-primary" onclick="resetQuiz()"><i class="ph ph-arrows-counter-clockwise"></i> Tentar Novamente</button>
  `;
}

function resetQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('quiz-body').classList.remove('hidden');
  renderQuizQuestion();
}

// FORMULÁRIO DE REGISTRO DE PONTOS
function handleReportSubmit(e) {
  e.preventDefault();
  alert('Obrigado! O ponto de risco foi registrado e enviado para análise da equipe do projeto.');
  document.getElementById('form-report').reset();
}