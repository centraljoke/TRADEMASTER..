
const state = {
  mode: 'demo',
  demoBalance: 5300,
  realBalance: 0,
  dailyPL: 0,
  trades: [],
  price: 10482.65,
  points: Array.from(
    {length:36},
    (_,i) => 10450 + Math.sin(i/3)*18 + i*0.7
  )
};

const $ = id => document.getElementById(id);

const money = n => '$' + Number(n).toLocaleString(
  'en-US',
  {
    minimumFractionDigits:2,
    maximumFractionDigits:2
  }
);

let chart;

function renderWallet() {
  const demo = state.mode === 'demo';

  $('balance').textContent = money(
    demo ? state.demoBalance : state.realBalance
  );

  $('balanceFoot').textContent = demo
    ? 'Virtual demo funds · not withdrawable'
    : 'Verified real funds only';

  $('accountType').textContent = demo ? 'DEMO' : 'REAL';

  $('dailyPL').textContent = money(state.dailyPL);

  $('demoWallet').textContent = money(state.demoBalance);
  $('realWallet').textContent = money(state.realBalance);

  $('demoMode').classList.toggle('active',demo);
  $('realMode').classList.toggle('active',!demo);

  $('modeNote').textContent = demo
    ? 'Practice with virtual funds'
    : 'Real wallet · funding required';

  $('accountNotice').innerHTML = demo
    ? '<b>DEMO ENVIRONMENT</b> — Your $5,300 is virtual practice credit.'
    : '<b>REAL ACCOUNT</b> — Real wallet balance is $0.00. Trading is disabled pending verified broker integration.';

  $('riseBtn').disabled = !demo;
  $('fallBtn').disabled = !demo;

  $('tradeMessage').textContent = demo
    ? 'Select an amount and choose a direction.'
    : 'Real trading is not enabled in this prototype.';
}

function setMode(mode) {
  state.mode = mode;
  renderWallet();
}

$('demoMode').addEventListener('click', () => setMode('demo'));
$('realMode').addEventListener('click', () => setMode('real'));

$('stake').addEventListener('input', () => {
  const amount = Math.max(0,Number($('stake').value) || 0);
  $('payout').textContent = money(amount * 1.9);
});

function addTrade(direction) {
  if (state.mode !== 'demo') return;

  const stake = Number($('stake').value);

  if (!Number.isFinite(stake) || stake <= 0) {
    $('tradeMessage').textContent = 'Enter a valid stake.';
    return;
  }

  if (stake > state.demoBalance) {
    $('tradeMessage').textContent = 'Insufficient demo funds.';
    return;
  }

  state.demoBalance -= stake;

  const trade = {
    market: $('marketSelect').value,
    contract: $('contract').value,
    direction,
    stake,
    status: 'SIMULATED',
    time: new Date().toLocaleTimeString()
  };

  state.trades.unshift(trade);

  $('tradeMessage').textContent =
    `Demo ${direction} order recorded for ${money(stake)}.`;

  renderWallet();
  renderHistory();
}

$('riseBtn').addEventListener('click', () => addTrade('RISE'));
$('fallBtn').addEventListener('click', () => addTrade('FALL'));

function renderHistory() {
  const body = $('historyBody');

  if (!state.trades.length) {
    body.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">No trades yet.</td>
      </tr>`;
    return;
  }

  body.innerHTML = state.trades.slice(0,12).map(t => `
    <tr>
      <td>${t.market}</td>
      <td>${t.contract}</td>
      <td>${t.direction}</td>
      <td>${money(t.stake)}</td>
      <td>${t.status}</td>
      <td>${t.time}</td>
    </tr>
  `).join('');
}

function initChart() {
  const ctx = $('priceChart').getContext('2d');

  chart = new Chart(ctx,{
    type:'line',

    data:{
      labels:state.points.map((_,i) => i),

      datasets:[{
        data:state.points,
        borderColor:'#5798ff',
        backgroundColor:'rgba(66,133,244,.10)',
        fill:true,
        tension:.32,
        pointRadius:0,
        borderWidth:2
      }]
    },

    options:{
      responsive:true,
      maintainAspectRatio:false,

      plugins:{
        legend:{display:false}
      },

      scales:{
        x:{display:false},

        y:{
          ticks:{
            color:'#8192ad',
            font:{size:9}
          },
          grid:{
            color:'rgba(130,150,180,.10)'
          }
        }
      }
    }
  });
}

function tick() {
  const move = (Math.random()-.48)*8;

  state.price = Math.max(1,state.price+move);

  state.points.push(state.price);
  state.points.shift();

  $('currentPrice').textContent =
    state.price.toLocaleString('en-US',{
      minimumFractionDigits:2,
      maximumFractionDigits:2
    });

  const pct = (move/state.price*100).toFixed(2);

  $('priceChange').textContent =
    (move>=0?'+':'') + pct + '%';

  if (chart) {
    chart.data.datasets[0].data = [...state.points];
    chart.update('none');
  }
}

$('marketSelect').addEventListener('change',() => {
  state.price = 9000 + Math.random()*3000;

  state.points = state.points.map(
    (_,i) => state.price + Math.sin(i/3)*20
  );
});

$('scanBtn').addEventListener('click',() => {
  const strength = Math.floor(50+Math.random()*45);
  const up = Math.random() > .5;

  $('signalText').textContent = up
    ? 'Positive momentum sample'
    : 'Negative momentum sample';

  $('signalMeter').style.width = strength+'%';
  $('signalStrength').textContent = strength+'%';
});

$('depositBtn').addEventListener('click',() => {
  alert(
    'Real deposits are not connected yet. ' +
    'Connect a licensed broker and verified payment provider first.'
  );
});

$('menuBtn').addEventListener('click',() => {
  $('sidebar').classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click',() => {
    $('sidebar').classList.remove('open');

    document.querySelectorAll('.nav-link').forEach(item => {
      item.classList.remove('selected');
    });

    link.classList.add('selected');
  });
});

renderWallet();
initChart();

setInterval(tick,1800);
