// Auto Page Turner para Leia SP
// Uso: Cole este código em um arquivo no GitHub e execute via bookmarklet

(function() {
    'use strict';
    
    // Configurações
    const config = {
        interval: 5000, // Tempo entre páginas em ms (5 segundos)
        autoStart: false, // Se deve iniciar automaticamente
        showControls: true // Se deve mostrar controles na tela
    };
    
    let autoTurnInterval;
    let isRunning = false;
    let controlPanel;
    
    // Função para encontrar o botão de próxima página
    function findNextButton() {
        // Seletores comuns para botões de próxima página
        const selectors = [
            'button[aria-label*="próx"]',
            'button[aria-label*="next"]',
            'button[title*="próx"]',
            'button[title*="next"]',
            '.next-page',
            '.page-next',
            '[data-testid*="next"]',
            'button:contains("Próxima")',
            'button:contains("→")',
            'button:contains("▶")'
        ];
        
        for (let selector of selectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled) {
                return button;
            }
        }
        
        // Busca por botões com texto relacionado
        const buttons = document.querySelectorAll('button, a');
        for (let btn of buttons) {
            const text = btn.textContent.toLowerCase();
            const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
            
            if (text.includes('próx') || text.includes('next') || 
                ariaLabel.includes('próx') || ariaLabel.includes('next') ||
                text.includes('→') || text.includes('▶')) {
                return btn;
            }
        }
        
        return null;
    }
    
    // Função para virar página
    function turnPage() {
        const nextButton = findNextButton();
        if (nextButton) {
            nextButton.click();
            console.log('Página virada automaticamente');
            return true;
        } else {
            console.log('Botão de próxima página não encontrado');
            stopAutoTurn();
            return false;
        }
    }
    
    // Iniciar auto virada
    function startAutoTurn() {
        if (isRunning) return;
        
        isRunning = true;
        autoTurnInterval = setInterval(turnPage, config.interval);
        console.log(`Auto Page Turner iniciado (${config.interval/1000}s por página)`);
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
        panel.id = 'autoPageTurner';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            min-width: 200px;
        `;
        
        panel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; text-align: center;">
                📖 Auto Page Turner
            </div>
            <div style="margin-bottom: 10px;">
                Intervalo: <input type="range" id="intervalSlider" min="1000" max="15000" value="${config.interval}" step="500" style="width: 100%;">
                <span id="intervalDisplay">${config.interval/1000}s</span>
            </div>
            <div style="text-align: center;">
                <button id="toggleButton" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 5px;
                ">▶ Iniciar</button>
                <button id="closeButton" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                ">✕</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Event listeners
        const toggleButton = panel.querySelector('#toggleButton');
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
        
        return panel;
    }
    
    // Atualizar painel de controle
    function updateControlPanel() {
        if (!controlPanel) return;
        
        const toggleButton = controlPanel.querySelector('#toggleButton');
        if (isRunning) {
            toggleButton.innerHTML = '⏸ Pausar';
            toggleButton.style.background = '#ff9800';
        } else {
            toggleButton.innerHTML = '▶ Iniciar';
            toggleButton.style.background = '#4CAF50';
        }
    }
    
    // Verificar se já existe uma instância
    if (document.getElementById('autoPageTurner')) {
        console.log('Auto Page Turner já está ativo');
        return;
    }
    
    // Inicializar
    if (config.showControls) {
        controlPanel = createControlPanel();
    }
    
    if (config.autoStart) {
        setTimeout(startAutoTurn, 1000);
    }
    
    console.log('Auto Page Turner carregado! Use o painel de controle para gerenciar.');
    
})();
