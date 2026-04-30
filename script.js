const equipmentData = [
    {
        id: 1,
        name: 'Kosiarka Spalinowa STIGA',
        category: 'koszenie',
        price: 80,
        image: 'https://images.unsplash.com/photo-1592424001807-6bbacc7265be?auto=format&fit=crop&w=600&q=80',
        desc: 'Niezawodna przy średnich i dużych trawnikach.'
    },
    {
        id: 2,
        name: 'Wertykulator Elektryczny',
        category: 'koszenie',
        price: 50,
        image: 'https://images.unsplash.com/photo-1581452445892-22ed15f7b8f3?auto=format&fit=crop&w=600&q=80',
        desc: 'Zadbaj o napowietrzenie trawnika.'
    },
    {
        id: 3,
        name: 'Kosa Spalinowa MAKITA',
        category: 'przycinanie',
        price: 60,
        image: 'https://images.unsplash.com/photo-1589006981881-22adfcbae796?auto=format&fit=crop&w=600&q=80',
        desc: 'Do precyzyjnego przycinania na obrzeżach.'
    },
    {
        id: 4,
        name: 'Nożyce do Żywopłotu',
        category: 'przycinanie',
        price: 45,
        image: 'https://images.unsplash.com/photo-1416879598555-2594a1d47bea?auto=format&fit=crop&w=600&q=80',
        desc: 'Idealnie równe cięcie krzewów i żywopłotów.'
    },
    {
        id: 5,
        name: 'Myjka Ciśnieniowa KÄRCHER',
        category: 'czyszczenie',
        price: 70,
        image: 'https://images.unsplash.com/photo-1628189689445-667dc9e4de73?auto=format&fit=crop&w=600&q=80',
        desc: 'Błyskawiczne czyszczenie kostki i tarasów.'
    },
    {
        id: 6,
        name: 'Odkurzacz do Liści',
        category: 'czyszczenie',
        price: 40,
        image: 'https://images.unsplash.com/photo-1509376694697-bde17b5f2590?auto=format&fit=crop&w=600&q=80',
        desc: 'Porządek w ogrodzie podczas jesieni.'
    }
];

// State
let state = {
    selectedEquipment: null,
    startDate: null,
    endDate: null,
    days: 1,
    delivery: false
};

// Elements
const grid = document.getElementById('equipment-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const modal = document.getElementById('booking-modal');
const closeModal = document.getElementById('close-modal');
const mImg = document.getElementById('modal-equipment-img');
const mName = document.getElementById('modal-equipment-name');
const mRate = document.getElementById('modal-daily-rate');
const inputStart = document.getElementById('start-date');
const inputEnd = document.getElementById('end-date');
const chkDelivery = document.getElementById('delivery-option');
const elDays = document.getElementById('calc-days');
const elTotal = document.getElementById('total-cost');
const elBtnTotal = document.getElementById('btn-total');
const form = document.getElementById('reservation-form');

const successOverlay = document.getElementById('success-message');
const successName = document.getElementById('success-name');
const closeSuccess = document.getElementById('close-success');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Generate Catalog
    renderEquipment('all');

    // Set min dates for inputs
    const today = new Date().toISOString().split('T')[0];
    inputStart.min = today;
    inputStart.value = today;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    inputEnd.min = today;
    inputEnd.value = tomorrow.toISOString().split('T')[0];

    calculatePrice();
});

// Render Equipment
function renderEquipment(category) {
    grid.innerHTML = '';
    const filtered = category === 'all' ? equipmentData : equipmentData.filter(e => e.category === category);

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="equip-img">
            <div class="equip-content">
                <span class="equip-category">${item.category}</span>
                <h3>${item.name}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.desc}</p>
                <div class="equip-price">${item.price} <span>zł / dzień</span></div>
                <button class="equip-btn" onclick="openModal(${item.id})">Wypożycz to</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filter Actions
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderEquipment(btn.getAttribute('data-filter'));
    });
});

// Modal Logic
window.openModal = function (id) {
    const item = equipmentData.find(e => e.id === id);
    if (!item) return;

    state.selectedEquipment = item;

    // Update UI
    mImg.src = item.image;
    mName.textContent = item.name;
    mRate.textContent = item.price;

    // Recalculate
    calculatePrice();

    // Show
    document.body.style.overflow = 'hidden';
    modal.classList.add('active');
}

function closeHandler() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => {
        successOverlay.classList.remove('active');
        form.reset();
        // reset dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        inputStart.value = today;
        inputEnd.value = tomorrow.toISOString().split('T')[0];
    }, 300);
}

closeModal.addEventListener('click', closeHandler);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeHandler();
});

// Calculator Logic
function calculatePrice() {
    if (!state.selectedEquipment) return;

    const start = new Date(inputStart.value);
    const end = new Date(inputEnd.value);

    // Handle invalid dates
    if (end < start) {
        inputEnd.value = inputStart.value;
        end.setTime(start.getTime());
    }

    const diffTime = Math.abs(end - start);
    let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Minimum 1 day
    if (days === 0) days = 1;

    state.days = days;
    state.startDate = start;
    state.endDate = end;
    state.delivery = chkDelivery.checked;

    // Price calculation
    let total = days * state.selectedEquipment.price;
    if (state.delivery) {
        total += 50;
    }

    // Animate Price Change
    animateValue(elTotal, parseInt(elTotal.innerText) || 0, total, 300);
    animateValue(elDays, parseInt(elDays.innerText) || 0, days, 300);
    elBtnTotal.textContent = total + ' zł';
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end; // ensure exact value
        }
    };
    window.requestAnimationFrame(step);
}

// Event Listeners for Calculator
inputStart.addEventListener('change', calculatePrice);
inputEnd.addEventListener('change', calculatePrice);
chkDelivery.addEventListener('change', calculatePrice);

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;

    // Simulate API Call
    const btn = document.getElementById('submit-reservation');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Przetwarzanie...';
    lucide.createIcons();

    setTimeout(() => {
        successName.textContent = name;
        successOverlay.classList.add('active');
        btn.innerHTML = originalText;
    }, 1000);
});

closeSuccess.addEventListener('click', closeHandler);

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});
