

const container = document.getElementById('container');
const button = document.getElementById('button');
const outputEl = document.getElementById('textContentOutput');

const boxesData = await fetch('./data/blockParameters.json').then((response) => response.json()).catch(error => console.error('Failed to load JSON:', error));

let boxes = [];
const contSize = {
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.9,
};

button.addEventListener('click', () => packRectangles(boxes));


(function addingDataToArray(boxesData) {

    const colorMap = new Map();

    boxes = boxesData.map((box, initialOrder) => {
        const key = `${box.width}-${box.height}`;
        const keyRevers = `${box.height}-${box.width}`;
        let color;
        const uniqueColorArray = Array.from(colorMap.values());

        if (colorMap.has(key) || colorMap.has(keyRevers)) {
            // Якщо колір вже існує для даного розміру, використовуємо його
            color = colorMap.get(key);
        } else {
            // Якщо колір ще не існує для даного розміру, генеруємо новий унікальний
            color = generateUniqueColor(uniqueColorArray);
            colorMap.set(key, color);
            colorMap.set(keyRevers, color);
        }

        return { ...box, initialOrder, color };
    });
})(boxesData);


function packRectangles(boxes) {

    turnAndSort(boxes);

    const spaces = [{ x: 0, y: 0, width: contSize.width, height: contSize.height }];
    const packed = [];
    const notPacked = [];

    for (const box of boxes) {
        let placed = false;

        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i];

            if (box.width > space.width || box.height > space.height) continue;

            packed.push(Object.assign({}, box, { x: space.x, y: space.y }));

            if (box.width === space.width && box.height === space.height) {

                const last = spaces.pop();
                if (i < spaces.length) spaces[i] = last;

            } else if (box.height === space.height) {

                space.x += box.width;
                space.width -= box.width;

            } else if (box.width === space.width) {

                space.y += box.height;
                space.height -= box.height;

            } else {

                spaces.push({
                    x: space.x + box.width,
                    y: space.y,
                    width: space.width - box.width,
                    height: box.height
                });
                space.y += box.height;
                space.height -= box.height;
            }

            placed = true;
            break;
        }

        if (!placed) {
            notPacked.push(box);
            // console.log('Block not packed:', box);
        }
    }

    console.log({ packed, spaces, notPacked });
    // console.log({
    //     total: boxes.length,
    //     packed: packed.length,
    //     notPacked: notPacked.length,
    // });
    outputEl.textContent =
        `Total: ${boxes.length} boxes;
        packed:${packed.length};
        notPacked: ${notPacked.length}.
        Other results are shown in the console.`;

    renderBlocks(packed);
};

function renderBlocks(packed) {

    for (let pack of packed) {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.style.background = pack.color;
        blockElement.style.width = pack.width + 'px';
        blockElement.style.height = pack.height + 'px';
        blockElement.style.left = pack.x + 'px';
        blockElement.style.top = pack.y + 'px';

        const paragraphElement = document.createElement('p');
        paragraphElement.textContent = pack.initialOrder;

        blockElement.appendChild(paragraphElement);
        container.appendChild(blockElement);
    }

};

function turnAndSort(boxes) {
    boxes.map(box => {
        if (box.width > box.height) {
            [box.width, box.height] = [box.height, box.width];
        }
        return box;
    });
    boxes.sort((a, b) => b.height - a.height);
}

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function generateUniqueColor(uniqueColorArray) {
    let newColor;
    do {
        newColor = getRandomHexColor();
    } while (uniqueColorArray.includes(newColor));
    return newColor;
};