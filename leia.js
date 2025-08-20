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
    
    // Função para encontrar APENAS o botão de próxima página (direita)
    function findNavigationButtons() {
        // Busca TODOS os botões com caret e filtra o mais à DIREITA
        const caretRightButtons = [];
        
        // Primeiro, coleta todos os botões com caret-right
        const caretRightSpans = document.querySelectorAll('span[data-testid="bonsai-icon-caret-right"]');
        
        caretRightSpans.forEach(span => {
            const button = span.closest('button');
            if (button && !button.disabled && button.offsetParent !== null) {
                const rect = button.getBoundingClientRect();
                caretRightButtons.push({
                    button: button,
                    x: rect.left,
                    rect: rect
                });
            }
        });
        
        if (caretRightButtons.length === 0) {
            console.log('❌ Nenhum botão caret-right encontrado');
            return null;
        }
        
        // Se há apenas um botão caret-right, usa ele
        if (caretRightButtons.length === 1) {
            console.log('✅ Único botão caret-right encontrado');
            return caretRightButtons[0].button;
        }
        
        // Se há múltiplos, pega o mais à DIREITA (maior posição X)
        caretRightButtons.sort((a, b) => b.x - a.x);
        const rightmostButton = caretRightButtons[0];
        
        console.log(`✅ Botão mais à direita selecionado (X: ${rightmostButton.x})`);
        console.log('Debug - Todos os botões caret-right:');
        caretRightButtons.forEach((item, index) => {
            console.log(`  ${index}: X=${item.x}, Width=${item.rect.width}`);
        });
        
        return rightmostButton.button;
    }
    
    // Função para virar página (com verificação extra)
    async function turnPage() {
        try {
            const nextButton = findNavigationButtons();
            
            if (nextButton) {
                // VERIFICAÇÃO FINAL: garantir que é realmente o botão da direita
                const rect = nextButton.getBoundingClientRect();
                const screenWidth = window.innerWidth;
                const isOnRightSide = rect.left > screenWidth * 0.5;
                
                if (!isOnRightSide) {
                    console.log('⚠️ Botão não está do lado direito da tela - cancelando');
                    return false;
                }
                
                // Aguarda um pouco para garantir estabilidade
                await new Promise(resolve => setTimeout(resolve, 200));
                
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
                console.log(`✅ Página ${currentPage} - Avançou (X: ${rect.left})`);
                updateControlPanel();
                
                // Aguarda o carregamento da nova página
                await new Promise(resolve => setTimeout(resolve, config.waitForLoad));
                return true;
            } else {
                console.log('❌ Botão de próxima página não encontrado');
                stopAutoTurn();
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao virar página:', error);
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
            console.log('🔍 Teste de navegação - Buscando PRÓXIMA página...');
            const button = findNavigationButtons();
            if (button) {
                console.log('✅ Botão PRÓXIMA encontrado:', button);
                console.log('Classes:', button.className);
                console.log('Posição:', button.getBoundingClientRect());
                console.log('HTML (primeiros 200 chars):', button.innerHTML.substring(0, 200));
                
                // Verifica se realmente é o botão correto
                const isRightButton = button.innerHTML.includes('caret-right');
                const isNotLeftButton = !button.innerHTML.includes('caret-left');
                
                console.log('✅ É botão direita?', isRightButton);
                console.log('✅ NÃO é botão esquerda?', isNotLeftButton);
                
                if (isRightButton && isNotLeftButton) {
                    turnPage();
                } else {
                    console.log('⚠️ Botão pode estar incorreto - não clicando');
                }
            } else {
                console.log('❌ Botão de PRÓXIMA não encontrado');
                
                // Debug: mostrar TODOS os botões com caret
                const allCaretButtons = document.querySelectorAll('[data-testid*="caret"]');
                console.log('🔍 Botões com caret encontrados:', allCaretButtons.length);
                allCaretButtons.forEach((element, index) => {
                    const button = element.closest('button');
                    const testId = element.getAttribute('data-testid');
                    const rect = element.getBoundingClientRect();
                    console.log(`Caret ${index}: ${testId} - Posição X: ${rect.left} - Botão:`, button?.className || 'sem botão');
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
