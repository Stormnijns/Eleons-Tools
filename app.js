let pokemonData = [];
let typeChart = {};
const team = new Array(6).fill(null);


async function loadData() {
    pokemonData = await fetch('data/eleons.json').then(r => r.json());
    typeChart = await fetch('data/types.json').then(r => r.json());
    setupInputs();
    populateDex();
    updateResults();
    buildTypeChartTable(); // ✅ add this
}


function setupInputs() {
    document.querySelectorAll('.slot').forEach((slot, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';


        const icon = document.createElement('img');
        icon.style.visibility = 'hidden';


        const input = document.createElement('input');
        input.maxLength = 32;


        const box = document.createElement('div');
        box.className = 'autocomplete';
        box.style.display = 'none';


        input.addEventListener('input', () => handleInput(input, icon, box, index));
        input.addEventListener('blur', () => setTimeout(() => box.style.display = 'none', 150));


        wrapper.appendChild(icon);
        wrapper.appendChild(input);
        slot.appendChild(wrapper);
        slot.appendChild(box);
    });
}


function handleInput(input, icon, box, index) {
    const value = input.value.toLowerCase();
    box.innerHTML = '';


    if (!value) {
        icon.style.visibility = 'hidden';
        team[index] = null;
        updateResults();
        return;
    }


    const matches = pokemonData.filter(p => p.name.toLowerCase().startsWith(value));


    matches.forEach(p => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<img src="images/${p.name}.png"><span>${p.name}</span>`;


        div.onclick = () => selectPokemon(p, input, icon, box, index);
        box.appendChild(div);
    });


    box.style.display = matches.length ? 'block' : 'none';
}


function selectPokemon(p, input, icon, box, index) {
    input.value = p.name;
    icon.src = `images/${p.name}.png`;
    icon.style.visibility = 'visible';
    team[index] = p;
    box.style.display = 'none';
    updateResults();
}


function populateDex() {
    const dex = document.getElementById('dexList');


    pokemonData.forEach(p => {
        const div = document.createElement('div');
        div.className = 'option';
        div.innerHTML = `<img src="images/${p.name}.png"><span>${p.name}</span>`;
        dex.appendChild(div);
    });
}


function updateResults() {
    const totals = {};
    Object.keys(typeChart).forEach(type => totals[type] = 0);


    team.filter(Boolean).forEach(p => {
        p.types.forEach(ptype => {
            Object.entries(typeChart[ptype]["chart-data"]).forEach(([target, value]) => {
                totals[target] += value;
            });
        });
    });


    const effective = [];
    const weak = [];
    const neutral = [];


    Object.entries(totals).forEach(([type, value]) => {
        if (value > 0) effective.push(type);
        else if (value < 0) weak.push(type);
        else neutral.push(type);
    });

    const allTypes = Object.keys(totals);

    function formatResult(list) {
        if (list.length === 0) return 'Nothing';
        if (list.length === allTypes.length) return 'Everything';
        return list.join(', ');
    }

    document.getElementById('effective').textContent = formatResult(effective);
    document.getElementById('weak').textContent = formatResult(weak);
    document.getElementById('neutral').textContent = formatResult(neutral);

}

function buildTypeChartTable() {
    const container = document.getElementById('typeChartContainer');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'type-table';

    const types = Object.keys(typeChart);

    // ===== HEADER ROW (ATTACK TYPES) =====
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // corner cell

    types.forEach(type => {
        const th = document.createElement('th');
        th.textContent = type.toUpperCase();
        th.style.background = typeChart[type].color || '#000';
        th.style.color = '#fff';
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    // ===== DEFENSE ROWS =====
    types.forEach(defType => {
        const row = document.createElement('tr');

        const label = document.createElement('th');
        label.textContent = defType.toUpperCase();
        label.className = 'type-label';
        label.style.background = typeChart[defType].color || '#000';
        label.style.color = '#fff';
        row.appendChild(label);

        types.forEach(atkType => {
            const value = typeChart[defType]["chart-data"][atkType];
            const cell = document.createElement('td');

            cell.textContent = value === 0.5 ? '½' : value;

            cell.className =
                value === 0 ? 'cell-0' :
                    value === 0.5 ? 'cell-05' :
                        value === 2 ? 'cell-2' :
                            'cell-1';

            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
}



loadData();