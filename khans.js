const APP = {
  ver: "1.2.0",
  user: {
    id: 0
  },
  cfg: {
    mod: true,
    auto: false,
    questionSpoof: true,
    darkMode: true,
    autoSpeed: 750,
    speedOptions: [750, 1000, 1250, 1500]
  }
};

// Load external libraries
async function loadScript(url) {
  const response = await fetch(url);
  const script = await response.text();
  eval(script);
}

async function loadCss(url) {
  return new Promise(resolve => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

// Toast notification function
function sendToast(message, duration = 5000, position = "bottom") {
  if (typeof Toastify !== 'undefined') {
    Toastify({
      text: message,
      duration,
      gravity: position,
      position: "center",
      stopOnFocus: true,
      style: { background: "#000000" }
    }).showToast();
  } else {
    console.log("Toast:", message);
  }
}

// Audio player function
const playAudio = src => {
  new Audio(src).play();
};

class UI {
  static init() {
    const _0x3d849d = document.createElement("div");
    _0x3d849d.id = "khanDestroyer-panel";
    Object.assign(_0x3d849d.style, {
      position: "fixed",
      top: "10px",
      right: "15px",
      width: "200px",
      background: "linear-gradient(145deg, #1a1a1a, #111)",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      padding: "12px",
      zIndex: "9999",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      border: "1px solid #333",
      maxWidth: "90%"
    });
    _0x3d849d.innerHTML = `
            <style>
                .khandestroyer-header {
                    color: #fff;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #333;
                    cursor: pointer;
                    user-select: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .khandestroyer-header:after {
                    content: "â–¼";
                    font-size: 12px;
                    margin-left: 5px;
                    transition: transform 0.3s ease;
                }
                .khandestroyer-header.collapsed:after {
                    transform: rotate(-90deg);
                }
                .khandestroyer-content {
                    transition: max-height 0.3s ease, opacity 0.3s ease;
                    max-height: 500px;
                    opacity: 1;
                    overflow: hidden;
                }
                .khandestroyer-content.collapsed {
                    max-height: 0;
                    opacity: 0;
                }
                .khandestroyer-version {
                    color: #666;
                    font-size: 12px;
                    font-weight: normal;
                }
                .khandestroyer-opt {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #fff;
                    padding: 8px;
                    margin: 3px 0;
                }
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 22px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #333;
                    transition: .4s;
                    border-radius: 22px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background: linear-gradient(145deg, #6200ea, #7c4dff);
                }
                input:checked + .slider:before {
                    transform: translateX(22px);
                }
                .khandestroyer-credit {
                    color: #666;
                    font-size: 11px;
                    text-align: center;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #333;
                }
                .speed-slider-container {
                    width: 100%;
                    margin-top: 5px;
                    padding: 0 2px;
                    box-sizing: border-box;
                    overflow: visible;
                }
                .speed-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 5px;
                    background: #333;
                    outline: none;
                    margin: 10px 0;
                }
                .speed-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, #6200ea, #7c4dff);
                    cursor: pointer;
                }
                .speed-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(145deg, #6200ea, #7c4dff);
                    cursor: pointer;
                    border: none;
                }
                .speed-value {
                    display: none;
                }
                /* Removendo as classes relacionadas Ã s marcaÃ§Ãµes de velocidade */
                .speed-ticks {
                    display: none;
                }
                .speed-tick {
                    display: none;
                }
                .speed-ticks {
                    padding: 0;
                }
                .speed-tick {
                    font-size: 7px;
                }
                }
            </style>
            <div class="khandestroyer-header">
                KhanDestroyer <span class="khandestroyer-version">${APP.ver}</span>
            </div>
            <div class="khandestroyer-content">
                <div class="khandestroyer-opt">
                    <span>Auto Complete</span>
                    <label class="switch">
                        <input type="checkbox" id="autoCheck">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="khandestroyer-opt">
                    <span>Question Spoof</span>
                    <label class="switch">
                        <input type="checkbox" id="spoofCheck" checked>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="khandestroyer-opt">
                    <span>Dark Mode</span>
                    <label class="switch">
                        <input type="checkbox" id="darkModeCheck" checked>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="khandestroyer-opt" id="speedControlContainer" style="display: none;">
                    <span>Velocidade</span>
                    <div style="width: 100%; display: flex; align-items: center; padding-left: 10px; box-sizing: border-box;">
                        <div class="speed-slider-container">
                            <input type="range" min="0" max="3" value="0" class="speed-slider" id="speedSlider">
                            <div class="speed-value" id="speedValue" style="display: none;">750ms</div>
                        </div>
                    </div>
                </div>
                <div class="khandestroyer-credit">by iUnknownBr</div>
            </div>
        `;
    document.body.appendChild(_0x3d849d);
    
    // Adicionar evento de clique ao cabeÃ§alho para encolher/expandir o menu
    const header = document.querySelector('.khandestroyer-header');
    const content = document.querySelector('.khandestroyer-content');
    
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      content.classList.toggle('collapsed');
      
      // Salvar o estado do menu no localStorage
      const isCollapsed = header.classList.contains('collapsed');
      localStorage.setItem('khanDestroyer-collapsed', isCollapsed);
      
      // Mostrar toast informativo
      sendToast(isCollapsed ? "ðŸ”¼ Menu recolhido" : "ðŸ”½ Menu expandido", 1000);
    });
    
    // Verificar se o menu estava recolhido anteriormente
    const wasCollapsed = localStorage.getItem('khanDestroyer-collapsed') === 'true';
    if (wasCollapsed) {
      header.classList.add('collapsed');
      content.classList.add('collapsed');
    }
    
    // Setup event listeners
    document.getElementById("autoCheck").onchange = event => {
      APP.cfg.auto = event.target.checked;
      document.getElementById("speedControlContainer").style.display = APP.cfg.auto ? "flex" : "none";
      sendToast(APP.cfg.auto ? "âœ… Auto Complete Enabled" : "âŒ Auto Complete Disabled", 2000);
    };
    
    // Configurar o slider de velocidade
    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");
    
    // Definir o valor inicial do slider
    const initialIndex = APP.cfg.speedOptions.indexOf(APP.cfg.autoSpeed);
    speedSlider.value = initialIndex >= 0 ? initialIndex : 0;
    
    // Adicionar evento de mudanÃ§a ao slider
    speedSlider.oninput = () => {
      const index = parseInt(speedSlider.value);
      const speed = APP.cfg.speedOptions[index];
      APP.cfg.autoSpeed = speed;
      speedValue.textContent = speed + "ms";
    };
    
    // Adicionar evento de mudanÃ§a completa para mostrar toast
    speedSlider.onchange = () => {
      const index = parseInt(speedSlider.value);
      const speed = APP.cfg.speedOptions[index];
      sendToast(`â±ï¸ Velocidade alterada para ${speed}ms`, 2000);
    };

    
    document.getElementById("spoofCheck").onchange = event => {
      APP.cfg.questionSpoof = event.target.checked;
      sendToast(APP.cfg.questionSpoof ? "âœ… Question Spoof Enabled" : "âŒ Question Spoof Disabled", 2000);
    };
    
    document.getElementById("darkModeCheck").onchange = event => {
      APP.cfg.darkMode = event.target.checked;
      if (typeof DarkReader !== 'undefined') {
        if (APP.cfg.darkMode) {
          DarkReader.enable();
          sendToast("ðŸŒ‘ Dark Mode Enabled", 2000);
        } else {
          DarkReader.disable();
          sendToast("â˜€ï¸ Dark Mode Disabled", 2000);
        }
      } else {
        console.error("DarkReader nÃ£o estÃ¡ disponÃ­vel");
        sendToast("âš ï¸ Dark Mode nÃ£o disponÃ­vel. Recarregue a pÃ¡gina.", 3000);
      }
    };
    
    // Ativar Dark Mode por padrÃ£o
    if (APP.cfg.darkMode && typeof DarkReader !== 'undefined') {
      DarkReader.enable();
    }
  }
}

class Core {
  static init() {
    // InicializaÃ§Ã£o sequencial das funcionalidades
    this.setupMod();
    this.setupAuto();
  }
  
  static async loadExternalLibraries() {
    try {
      await loadCss("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
      await loadScript("https://cdn.jsdelivr.net/npm/toastify-js");
      await loadScript("https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js");
      
      // Configurar o DarkReader apÃ³s carregÃ¡-lo
      if (typeof DarkReader !== 'undefined') {
        DarkReader.setFetchMethod(window.fetch);
        if (APP.cfg.darkMode) {
          DarkReader.enable();
        }
      } else {
        console.error("DarkReader nÃ£o foi carregado corretamente");
      }
      
      // Verificar se Toastify foi carregado antes de usar
      if (typeof Toastify !== 'undefined') {
        sendToast("ðŸŒ¿ Script loaded successfully!");
      } else {
        console.error("Toastify nÃ£o foi carregado corretamente");
      }
      
      console.clear();
    } catch (error) {
      console.error("Erro ao carregar bibliotecas externas:", error);
    }
  }
  
  static setupMod() {
    const messages = [
      "ðŸ”¥ Games Destroyer On Top[Discord](https://discord.gg/gamesdest)!",
      "ðŸ¤ Made by [@iUnknownBr](https://guns.lol/iunknownbr)."
    ];
    
    const originalFetch = window.fetch;
    window.fetch = async function (_0xb0b6f5, _0x45b6eb) {
      const _0x238f50 = await originalFetch.apply(this, arguments);
      const _0xc057f3 = _0x238f50.clone();
      
      try {
        const _0x46e77b = await _0xc057f3.text();
        let _0x3cbec8 = JSON.parse(_0x46e77b);
        
        if (_0x3cbec8?.data?.assessmentItem?.item?.itemData) {
          let _0x3ca1c5 = JSON.parse(_0x3cbec8.data.assessmentItem.item.itemData);
          
          if (_0x3ca1c5.question.content[0] === _0x3ca1c5.question.content[0].toUpperCase() && APP.cfg.questionSpoof) {
            _0x3ca1c5.answerArea = {
              calculator: false
            };
            
            _0x3ca1c5.question.content = messages[Math.floor(Math.random() * messages.length)] + "[[â˜ƒ radio 1]]";
            _0x3ca1c5.question.widgets = {
              "radio 1": {
                type: "radio",
                alignment: "default",
                static: false,
                graded: true,
                options: {
                  choices: [{
                    content: "âœ…",
                    correct: true
                  }],
                  randomize: false,
                  multipleSelect: false,
                  displayCount: null,
                  hasNoneOfTheAbove: false,
                  onePerLine: true,
                  deselectEnabled: false
                }
              }
            };
            
            _0x3cbec8.data.assessmentItem.item.itemData = JSON.stringify(_0x3ca1c5);
            sendToast("ðŸ”“ Question Bypassed", 1000);
            
            const _0x1aa163 = {
              status: _0x238f50.status,
              statusText: _0x238f50.statusText,
              headers: _0x238f50.headers
            };
            
            return new Response(JSON.stringify(_0x3cbec8), _0x1aa163);
          }
        }
      } catch (_0x2e758e) {}
      
      return _0x238f50;
    };
  }
  
  static async setupAuto() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    const classNames = ["_1tuo6xk", "_ssxvf9l", "_1f0fvyce", "_rz7ls7u", "_1yok8f4", "_1e5cuk2a", "_s6zfc1u", "_4i5p5ae", "_1r8cd7xe"];
    const checkAnswerSelector = "[data-testid=\"exercise-check-answer\"]";
    
    function findAndClickByClass(className) {
      const element = document.getElementsByClassName(className)[0];
      if (element) {
        element.click();
        if (element.textContent === "Mostrar resumo") {
          sendToast("ðŸŽ‰ Exercise completed!", 3000);
          playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav");
        }
      }
      return !!element;
    }
    
    // FunÃ§Ã£o otimizada para processar elementos
    async function processElements() {
      if (!APP.cfg.auto) return;
      
      // Processar todos os botÃµes de classe conhecida
      for (const className of classNames) {
        findAndClickByClass(className);
        await delay(APP.cfg.autoSpeed / 5);
      }
      
      // Verificar e clicar no botÃ£o de verificar resposta
      const checkAnswerButton = document.querySelector(checkAnswerSelector);
      if (checkAnswerButton) {
        checkAnswerButton.click();
        await delay(APP.cfg.autoSpeed / 5);
      }
    }
    
    // Loop principal otimizado
    while (true) {
      await processElements();
      await delay(APP.cfg.autoSpeed / 3);
    }
  }
}

// InicializaÃ§Ã£o otimizada - primeiro carregamos as bibliotecas, depois inicializamos a UI e o Core
async function initApp() {
  try {
    await Core.loadExternalLibraries();
    UI.init();
    Core.init();
    console.log(`KhanDestroyer v${APP.ver} iniciado com sucesso!`);
    sendToast(`ðŸš€ KhanDestroyer v${APP.ver} iniciado!`, 3000);
  } catch (error) {
    console.error("Erro ao inicializar KhanDestroyer:", error);
    sendToast("âš ï¸ Erro ao inicializar KhanDestroyer", 5000);
  }
}

initApp();
