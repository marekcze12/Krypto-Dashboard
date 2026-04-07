const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1';
let vsechnyMince = [];

async function nactiData() {
    const listElement = document.getElementById('list-kryptomen');
    
    // Zobrazení Skeletonů
    listElement.innerHTML = Array(12).fill(`
        <div class="karta">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
        </div>
    `).join('');

    try {
        const odpoved = await fetch(API_URL);
        if (!odpoved.ok) throw new Error('API limit nebo chyba sítě');
        
        vsechnyMince = await odpoved.json();
        vykresliKryptomeny(vsechnyMince);
        ulozCas();

    } catch (chyba) {
        listElement.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--down); padding: 40px;">
                <h3>Chyba při načítání dat</h3>
                <p>${chyba.message}</p>
            </div>
        `;
    }
}

function vykresliKryptomeny(pole) {
    const listElement = document.getElementById('list-kryptomen');
    listElement.innerHTML = pole.map(mince => {
        const vPlusu = mince.price_change_percentage_24h >= 0;
        return `
            <div class="karta">
                <img src="${mince.image}" alt="${mince.name}">
                <h3>${mince.name} <small style="color: var(--text-dim)">${mince.symbol.toUpperCase()}</small></h3>
                <p class="cena">${formatujMenu(mince.current_price)}</p>
                <span class="zmena ${vPlusu ? 'nahoru' : 'dolu'}">
                    ${vPlusu ? '▲' : '▼'} ${mince.price_change_percentage_24h.toFixed(2)} %
                </span>
            </div>
        `;
    }).join('');
}

function formatujMenu(cislo) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cislo);
}

function ulozCas() {
    const cas = new Date().toLocaleTimeString('cs-CZ');
    document.getElementById('info-cas').innerText = `Poslední aktualizace: ${cas}`;
}

// Event Listenery
document.getElementById('btn-obnovit').addEventListener('click', nactiData);

document.getElementById('hledat-vstup').addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    const filtrovane = vsechnyMince.filter(m => 
        m.name.toLowerCase().includes(text) || m.symbol.toLowerCase().includes(text)
    );
    vykresliKryptomeny(filtrovane);
});

document.getElementById('razeni-select').addEventListener('change', (e) => {
    const volba = e.target.value;
    let kopie = [...vsechnyMince];
    if (volba === 'price_desc') kopie.sort((a, b) => b.current_price - a.current_price);
    if (volba === 'change_desc') kopie.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    if (volba === 'market_cap_desc') kopie.sort((a, b) => b.market_cap - a.market_cap);
    vykresliKryptomeny(kopie);
});

nactiData();