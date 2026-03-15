const PIX_KEY = '51166889840';

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const assunto = document.getElementById('assunto').value;
            const mensagem = document.getElementById('mensagem').value;

            const text = `*Novo contato - Flora Belle*\n\n*Nome:* ${nome}\n*Email:* ${email}\n*Telefone:* ${telefone}\n*Assunto:* ${assunto}\n*Mensagem:* ${mensagem}`;
            
            const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
            
            alert('Mensagem enviada com sucesso! Em breve entraremos em contato.');
            contactForm.reset();
        });
    }

    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', formatPhone);
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

let cart = [];

function loadCart() {
    const saved = localStorage.getItem('florabelle_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('florabelle_cart', JSON.stringify(cart));
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    
    const btn = event.target;
    btn.textContent = 'Adicionado!';
    btn.style.background = '#4caf50';
    btn.style.color = '#fff';
    
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar';
        btn.style.background = 'transparent';
        btn.style.color = 'var(--primary)';
    }, 1000);
    
    setTimeout(() => {
        const cartModal = document.getElementById('cartModal');
        cartModal.classList.add('active');
    }, 300);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
}

function updateQuantity(name, change) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(name);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart-container">
                <i class="fas fa-shopping-basket"></i>
                <p>Seu carrinho está vazio</p>
                <button class="btn-continue" onclick="toggleCart()">Continuar Comprando</button>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                </div>
                <div class="item-subtotal">
                    R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
                <button class="remove-item" onclick="removeFromCart('${item.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
}

function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    window.location.href = 'pagamento.html';
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
}

function renderCheckoutForm() {
    const checkoutBody = document.getElementById('checkoutBody');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    checkoutBody.innerHTML = `
        <div class="checkout-summary">
            <h4>Resumo do Pedido</h4>
            <div class="summary-items">
                ${cart.map(item => `
                    <div class="summary-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                `).join('')}
            </div>
            <div class="summary-total">
                <span>Total:</span>
                <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
        </div>
        <form class="checkout-form" id="checkoutForm" onsubmit="finalizeOrder(event)">
            <div class="form-group">
                <label for="checkoutNome">Nome Completo *</label>
                <input type="text" id="checkoutNome" required placeholder="Seu nome completo">
            </div>
            <div class="form-group">
                <label for="checkoutTelefone">Telefone *</label>
                <input type="tel" id="checkoutTelefone" required placeholder="(11) 99999-9999">
            </div>
            <div class="form-group">
                <label for="checkoutEndereco">Endereço de Entrega *</label>
                <input type="text" id="checkoutEndereco" required placeholder="Rua, número, bairro, cidade">
            </div>
            <div class="form-group">
                <label for="checkoutObs">Observações</label>
                <textarea id="checkoutObs" placeholder="Data/horário de entrega, cartão, etc."></textarea>
            </div>
            <button type="submit" class="btn-finalize" id="checkoutBtn">
                <i class="fas fa-credit-card"></i> Gerar PIX
            </button>
        </form>
    `;
    
    const checkoutTelefone = document.getElementById('checkoutTelefone');
    if (checkoutTelefone) {
        checkoutTelefone.addEventListener('input', formatPhone);
    }
}

function finalizeOrder(event) {
    event.preventDefault();
    
    const nome = document.getElementById('checkoutNome').value;
    const telefone = document.getElementById('checkoutTelefone').value;
    const endereco = document.getElementById('checkoutEndereco').value;
    const observacao = document.getElementById('checkoutObs').value;
    
    if (!nome || !telefone || !endereco) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        items: cart,
        nome,
        telefone,
        endereco,
        observacao,
        total,
        data: new Date().toLocaleString('pt-BR')
    };
    
    localStorage.setItem('florabelle_last_order', JSON.stringify(orderData));
    
    renderPixPayment(orderData);
}

function renderPixPayment(orderData) {
    const checkoutBody = document.getElementById('checkoutBody');
    
    checkoutBody.innerHTML = `
        <div class="pix-payment">
            <div class="pix-header">
                <i class="fas fa-qrcode"></i>
                <h4>Pagamento via PIX</h4>
            </div>
            
            <div class="pix-amount">
                <span class="label">Valor a pagar:</span>
                <span class="amount">R$ ${orderData.total.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div class="pix-key-container">
                <span class="label">Chave PIX (CPF):</span>
                <div class="pix-key">
                    <span id="pixKey">${PIX_KEY}</span>
                    <button class="copy-btn" onclick="copyPixKey()">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
            </div>
            
            <div class="pix-instructions">
                <h5>Como pagar:</h5>
                <ol>
                    <li>Abra seu aplicativo de banco</li>
                    <li>Escolha opção PIX</li>
                    <li>Copie a chave acima ou escaneie o QR</li>
                    <li>Confirme o pagamento de R$ ${orderData.total.toFixed(2).replace('.', ',')}</li>
                </ol>
            </div>
            
            <div class="order-confirmation">
                <h5>Dados do Pedido:</h5>
                <p><strong>Nome:</strong> ${orderData.nome}</p>
                <p><strong>Telefone:</strong> ${orderData.telefone}</p>
                <p><strong>Endereço:</strong> ${orderData.endereco}</p>
                <p><strong>Itens:</strong> ${orderData.items.length}</p>
            </div>
            
            <div class="pix-actions">
                <button class="btn-whatsapp-confirm" onclick="confirmPayment()">
                    <i class="fab fa-whatsapp"></i> Confirmar Pagamento
                </button>
                <button class="btn-new-order" onclick="newOrder()">
                    <i class="fas fa-plus"></i> Novo Pedido
                </button>
            </div>
            
            <p class="pix-note">
                <i class="fas fa-info-circle"></i>
                Após o pagamento, envie o comprovante pelo WhatsApp para confirmar o pedido.
            </p>
        </div>
    `;
}

function copyPixKey() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    });
}

function confirmPayment() {
    const orderData = JSON.parse(localStorage.getItem('florabelle_last_order'));
    
    let message = `*🌸 CONFIRMAÇÃO DE PAGAMENTO - Flora Belle*\n\n`;
    message += `*📋 DADOS DO CLIENTE*\n`;
    message += `Nome: ${orderData.nome}\n`;
    message += `Telefone: ${orderData.telefone}\n`;
    message += `Endereço: ${orderData.endereco}\n`;
    if (orderData.observacao) message += `Obs: ${orderData.observacao}\n`;
    message += `\n*🛒 ITENS DO PEDIDO*\n`;
    
    orderData.items.forEach(item => {
        const subtotal = item.price * item.quantity;
        message += `• ${item.name}\n  Qtd: ${item.quantity} x R$ ${item.price.toFixed(2).replace('.', ',')} = R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
    });
    
    message += `\n*💰 TOTAL PAGO: R$ ${orderData.total.toFixed(2).replace('.', ',')}*\n`;
    message += `\n*💳 PAGAMENTO: PIX (${PIX_KEY})*`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    alert('Obrigado! Agora você será direcionado para o WhatsApp para enviar o comprovante.');
}

function newOrder() {
    clearCart();
    closeCheckout();
}
