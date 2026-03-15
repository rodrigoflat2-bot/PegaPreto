document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupDeliveryDate();
    detectLocation();
    populateOrderSummary();
    
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatPhone);
    }
    
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', formatCep);
    }
});

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 2) {
            value = `(${value}`;
        } else if (value.length <= 3) {
            value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else if (value.length <= 8) {
            value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        } else {
            value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
        }
    }
    e.target.value = value;
}

function formatCep(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    e.target.value = value;
}

let cart = [];

function loadCart() {
    const saved = localStorage.getItem('florabelle_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    if (cart.length === 0) {
        window.location.href = 'index.html';
    }
}

function setupDeliveryDate() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 1);
    
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    };
    
    const dateStr = deliveryDate.toLocaleDateString('pt-BR', options);
    const dateElement = document.getElementById('deliveryDate');
    
    if (dateElement) {
        dateElement.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    }
}

function detectLocation() {
    const locationText = document.getElementById('locationText');
    
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const city = data.city || 'Cidade';
            const region = data.region || 'Estado';
            const country = data.country_name || 'Brasil';
            
            locationText.innerHTML = `<i class="fas fa-map-marker-alt"></i> Entregando para: ${city}, ${region} - ${country}`;
        })
        .catch(error => {
            fetch('http://ip-api.com/json/')
                .then(response => response.json())
                .then(data => {
                    const city = data.city || 'Cidade';
                    const region = data.regionName || 'Estado';
                    const country = data.country || 'Brasil';
                    
                    locationText.innerHTML = `<i class="fas fa-map-marker-alt"></i> Entregando para: ${city}, ${region} - ${country}`;
                    
                    if (data.regionName) {
                        document.getElementById('estado').value = data.regionName;
                    }
                    if (data.city) {
                        document.getElementById('cidade').value = data.city;
                    }
                })
                .catch(err => {
                    locationText.innerHTML = `<i class="fas fa-map-marker-alt"></i> Detectando localização...`;
                });
        });
}

function populateOrderSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item-checkout">
            <span class="item-name">${item.name}</span>
            <span class="item-qty">x${item.quantity}</span>
            <span class="item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    localStorage.setItem('florabelle_order_total', subtotal.toFixed(2));
}

function copyPixKey() {
    const pixKey = '123456789';
    navigator.clipboard.writeText(pixKey).then(() => {
        const btn = document.querySelector('.copy-pix-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copiar Chave';
        }, 2000);
    });
}

function showPixPopup() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const overlay = document.createElement('div');
    overlay.className = 'pix-popup-overlay';
    overlay.id = 'pixPopup';
    overlay.innerHTML = `
        <div class="pix-popup">
            <div class="pix-popup-header">
                <i class="fas fa-qrcode"></i>
                <h2>Pagamento via PIX</h2>
            </div>
            
            <div class="pix-popup-amount">
                <span>Valor Total:</span>
                <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong>
            </div>
            
            <div class="pix-popup-key">
                <span>Copie esta chave PIX:</span>
                <div class="key-display">
                    <strong>123456789</strong>
                    <button class="copy-pix-btn" onclick="copyPixKey()">
                        <i class="fas fa-copy"></i> Copiar Chave
                    </button>
                </div>
            </div>
            
            <div class="pix-popup-instructions">
                <h4>Como pagar:</h4>
                <ol>
                    <li>Abra o app do seu banco</li>
                    <li>Escolha "PIX" e "Transferir"</li>
                    <li>Cole a chave PIX copiada acima</li>
                    <li>Confirme o valor de <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong></li>
                    <li>Efetue o pagamento</li>
                </ol>
            </div>
            
            <div class="pix-popup-actions">
                <button class="btn-paid" onclick="confirmPixPayment()">
                    <i class="fas fa-check-circle"></i> Já Paguei
                </button>
                <button class="btn-cancel" onclick="cancelOrder()">
                    <i class="fas fa-times"></i> Cancelar Pedido
                </button>
            </div>
            
            <p class="pix-popup-note">
                <i class="fas fa-info-circle"></i>
                Após o pagamento, você será redirecionado para confirmar seu pedido
            </p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('active');
    }, 100);
}

function copyPixKey() {
    navigator.clipboard.writeText('123456789').then(() => {
        const btn = document.querySelector('.copy-pix-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copiar Chave';
        }, 2000);
    });
}

function confirmPixPayment() {
    completeOrder();
    document.getElementById('pixPopup').remove();
}

function cancelOrder() {
    if (confirm('Tem certeza que deseja cancelar o pedido?')) {
        document.getElementById('pixPopup').remove();
        localStorage.removeItem('florabelle_cart');
        window.location.href = 'index.html';
    }
}

function completeOrder() {
    const form = document.getElementById('paymentForm');
    const requiredFields = form.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ff5252';
            isValid = false;
        } else {
            field.style.borderColor = '#eee';
        }
    });
    
    if (!isValid) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;
    
    if (senha && senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    if (senha && senha !== confirmaSenha) {
        alert('As senhas não conferem!');
        return;
    }
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const complemento = document.getElementById('complemento').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const uf = document.getElementById('uf').value;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const deliveryDate = document.getElementById('deliveryDate').textContent;
    
    const orderData = {
        id: 'FB' + Date.now(),
        data: new Date().toLocaleString('pt-BR'),
        cliente: {
            nome,
            email,
            telefone,
            senha: senha ? 'Cadastrada' : null
        },
        endereco: {
            cep,
            endereco,
            numero,
            complemento,
            bairro,
            cidade,
            uf
        },
        entrega: {
            data: deliveryDate,
            tipo: 'Normal'
        },
        items: cart,
        total,
        pagamento: {
            metodo: 'PIX',
            chave: '123456789',
            status: 'Pendente'
        }
    };
    
    localStorage.setItem('florabelle_last_order', JSON.stringify(orderData));
    
    localStorage.removeItem('florabelle_cart');
    
    window.location.href = 'obrigado.html';
}
