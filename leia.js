// Auto Page Turner para Árvore/Leia SP
// Versão otimizada para React SPAs

(function() {
    'use strict';
    
    // Configurações
    const config = {
        interval: 5000, // Tempo entre páginas em ms
        maxRetries: 3, // Tentativas de encontrar botão
        waitForLoad: 1000, // Tempo de espera após clicar
    };
    
    let autoTurnInterval;
    let isRunning = false;
    let controlPanel;
    let currentPage = 1;
    
    // Função para aguardar elemento aparecer
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    }
    
    // Função para encontrar o botão específico da Árvore
    function findNavigationButtons() {
        // Primeiro, tenta o seletor específico que você forneceu
        const specificSelectors = [
            'button.sc-lkltAP.joPNDs',
            'button[data-testid="bonsai-icon-caret-right"]',
            'span[data-testid="bonsai-icon-caret-right"]',
            '[data-testid="bonsai-icon-caret-right"]'
        ];
        
        for (let selector of specificSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const button = element.tagName === 'BUTTON' ? element : element.closest('button');
                if (button && !button.disabled && button.offsetParent !== null) {
                    console.log('Botão encontrado via seletor específico:', selector);
                    return button;
                }
            }
        }
        
        // Busca por classe específica sc-lkltAP
        const scButtons = document.querySelectorAll('button[class*="sc-lkltAP"]');
        for (let btn of scButtons) {
            if (btn.offsetParent !== null && !btn.disabled) {
                console.log('Botão encontrado via classe sc-lkltAP');
                return btn;
            }
        }
        
        // Busca por data-testid caret-right
        const caretButtons = document.querySelectorAll('[data-testid*="caret-right"]');
        for (let element of caretButtons) {
            const button = element.tagName === 'BUTTON' ? element : element.closest('button');
            if (button && !button.disabled && button.offsetParent !== null) {
                console.log('Botão encontrado via caret-right');
                return button;
            }
        }
        
        // Busca genérica por botões com ícone de seta para direita
        const allButtons = document.querySelectorAll('button');
        for (let btn of allButtons) {
            const hasCaretIcon = btn.innerHTML.includes('caret-right') || 
                               btn.innerHTML.includes('data-testid="bonsai-icon-caret-right"');
            
            if (hasCaretIcon && !btn.disabled && btn.offsetParent !== null) {
                console.log('Botão encontrado via busca genérica');
                return btn;
            }
        }
        
        console.log('Nenhum botão de navegação encontrado');
        return null;
    }
    
    // Função para virar página
    async function turnPage() {
        try {
            const nextButton = findNavigationButtons();
            
            if (nextButton) {
                // Simula clique real
                nextButton.focus();
                nextButton.click();
                
                // Dispara eventos adicionais para SPAs
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                nextButton.dispatchEvent(clickEvent);
                
                currentPage++;
                console.log(`Página ${currentPage} - Navegação executada`);
                updateControlPanel();
                
                // Aguarda o carregamento da nova página
                await new Promise(resolve => setTimeout(resolve, config.waitForLoad));
                return true;
            } else {
                console.log('Botão de próxima página não encontrado');
                // Tenta aguardar o botão aparecer
                const button = await waitForElement('button', 2000);
                if (button) {
                    return turnPage();
                }
                stopAutoTurn();
                return false;
            }
        } catch (error) {
            console.error('Erro ao virar página:', error);
            return false;
        }
    }
    
    // Iniciar auto virada
    function startAutoTurn() {
        if (isRunning) return;
        
        isRunning = true;
        console.log(`Auto Page Turner iniciado (${config.interval/1000}s por página)`);
        
        // Primeira execução imediata
        setTimeout(() => {
            autoTurnInterval = setInterval(turnPage, config.interval);
        }, 1000);
        
        updateControlPanel();
    }
    
    // Parar auto virada
    function stopAutoTurn() {
        if (!isRunning) return;
        
        clearInterval(autoTurnInterval);
        isRunning = false;
        console.log('Auto Page Turner pausado');
        updateControlPanel();
    }
    
    // Criar painel de controle
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'arvoreAutoPageTurner';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            min-width: 250px;
            backdrop-filter: blur(10px);
        `;
        
        panel.innerHTML = `
            <div style="margin-bottom: 15px; font-weight: bold; text-align: center; font-size: 16px;">
                📖 Auto Leitor Árvore
            </div>
            <div style="margin-bottom: 10px; text-align: center; opacity: 0.9;">
                Página atual: <span id="currentPageDisplay">${currentPage}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px;">
                    Intervalo: <span id="intervalDisplay">${config.interval/1000}s</span>
                </label>
                <input type="range" id="intervalSlider" min="2000" max="20000" value="${config.interval}" step="1000" 
                       style="width: 100%; accent-color: white;">
            </div>
            <div style="text-align: center; display: flex; gap: 10px;">
                <button id="toggleButton" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 2px solid rgba(255,255,255,0.3);
                    padding: 10px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    flex: 1;
                    transition: all 0.3s ease;
                ">▶ Iniciar</button>
                <button id="testButton" style="
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 2px solid rgba(255,255,255,0.2);
                    padding: 10px 15px;
                    border-radius: 25px;
                    cursor: pointer;
                ">🔄</button>
                <button id="closeButton" style="
                    background: rgba(255,0,0,0.3);
                    color: white;
                    border: 2px solid rgba(255,0,0,0.3);
                    padding: 10px 15px;
                    border-radius: 25px;
                    cursor: pointer;
                ">✕</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Event listeners
        const toggleButton = panel.querySelector('#toggleButton');
        const testButton = panel.querySelector('#testButton');
        const closeButton = panel.querySelector('#closeButton');
        const intervalSlider = panel.querySelector('#intervalSlider');
        const intervalDisplay = panel.querySelector('#intervalDisplay');
        
        toggleButton.onclick = () => {
            if (isRunning) {
                stopAutoTurn();
            } else {
                startAutoTurn();
            }
        };
        
        testButton.onclick = () => {
            console.log('🔍 Teste de navegação...');
            const button = findNavigationButtons();
            if (button) {
                console.log('✅ Botão encontrado:', button);
                console.log('Classes:', button.className);
                console.log('HTML:', button.innerHTML);
                turnPage();
            } else {
                console.log('❌ Botão não encontrado');
                // Debug: mostrar todos os botões disponíveis
                const allButtons = document.querySelectorAll('button');
                console.log('🔍 Botões disponíveis na página:', allButtons.length);
                allButtons.forEach((btn, index) => {
                    if (btn.innerHTML.includes('caret') || btn.className.includes('sc-')) {
                        console.log(`Botão ${index}:`, btn.className, btn.innerHTML.substring(0, 100));
                    }
                });
            }
        };
        
        closeButton.onclick = () => {
            stopAutoTurn();
            panel.remove();
        };
        
        intervalSlider.oninput = (e) => {
            config.interval = parseInt(e.target.value);
            intervalDisplay.textContent = `${config.interval/1000}s`;
            
            if (isRunning) {
                stopAutoTurn();
                startAutoTurn();
            }
        };
        
        // Tornar o painel arrastável
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        
        panel.addEventListener('mousedown', (e) => {
            if (e.target === panel || e.target.closest('#arvoreAutoPageTurner > div:first-child')) {
                isDragging = true;
                initialX = e.clientX - currentX;
                initialY = e.clientY - currentY;
                panel.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            panel.style.cursor = 'default';
        });
        
        return panel;
    }
    
    // Atualizar painel de controle
    function updateControlPanel() {
        if (!controlPanel) return;
        
        const toggleButton = controlPanel.querySelector('#toggleButton');
        const currentPageDisplay = controlPanel.querySelector('#currentPageDisplay');
        
        if (currentPageDisplay) {
            currentPageDisplay.textContent = currentPage;
        }
        
        if (isRunning) {
            toggleButton.innerHTML = '⏸ Pausar';
            toggleButton.style.background = 'rgba(255,165,0,0.3)';
        } else {
            toggleButton.innerHTML = '▶ Iniciar';
            toggleButton.style.background = 'rgba(255,255,255,0.2)';
        }
    }
    
    // Verificar se já existe uma instância
    if (document.getElementById('arvoreAutoPageTurner')) {
        console.log('Auto Page Turner já está ativo');
        return;
    }
    
    // Aguardar o carregamento completo da aplicação React
    setTimeout(() => {
        controlPanel = createControlPanel();
        console.log('🚀 Auto Page Turner para Árvore carregado!');
        console.log('📖 Use o painel de controle para gerenciar a leitura automática');
        console.log('🔄 Botão de teste disponível para verificar a navegação');
    }, 2000);
    
})();
