const container = document.getElementById('container');
const button = document.getElementById('button');
const outputEl = document.getElementById('textContentOutput');
const boxesData = await fetch('./data/blockParameters.json').then((response) => response.json()).catch(error => console.error('Failed to load JSON:', error));

let boxes = [];
let invalidBoxes = [];
let contSize = {
    width: 0,
    height: 0,
};

button.addEventListener('click', () => packRectangles(boxes));
const debouncedPackRectangles = debounce(() => packRectangles(boxes), 300);
window.addEventListener('resize', debouncedPackRectangles);


(function validateInputData(boxesData) {
    let boxesWithinitialOrder = boxesData.map((box, initialOrder) => {
        return { ...box, initialOrder };
    });

    boxesWithinitialOrder.forEach((box) => {
        if (
            typeof box === 'object' &&
            box.hasOwnProperty('width') &&
            box.hasOwnProperty('height') &&
            typeof box.width === 'number' &&
            typeof box.height === 'number' &&
            box.width >= 0 &&
            box.height >= 0
        ) {
            boxes.push(box);
        } else {
            invalidBoxes.push(box);
        }
        return boxes, invalidBoxes;
    });
    console.log('Valid Boxes:', boxes);
    console.log('Invalid Boxes:', invalidBoxes);
})(boxesData);


function packRectangles(boxes) {
    contSize = {
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.9,
    };

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
        }
    }

    console.log({ packed, spaces, notPacked });

    const result = transformObjectForOutputResult(packed);
    console.log(result);

    outputEl.textContent =
        `Total: ${boxes.length} boxes;
        packed:${packed.length};
        notPacked: ${notPacked.length}.
        Other results are shown in the console.`;

    renderBlocks(packed);
};

function renderBlocks(packed) {
    container.innerHTML = '';
    addingColor(packed);

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
};

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

function generateUniqueColor(uniqueColorArray) {
    let newColor;
    do {
        newColor = getRandomHexColor();
    } while (uniqueColorArray.includes(newColor));
    return newColor;
};

function addingColor(packed) {
    const colorMap = new Map();

    packed.forEach((pack) => {
        const key = `${pack.width}-${pack.height}`;
        let color;
        const uniqueColorArray = Array.from(colorMap.values());

        if (colorMap.has(key)) {
            color = colorMap.get(key);
        } else {
            color = generateUniqueColor(uniqueColorArray);
            colorMap.set(key, color);
        }
        pack.color = color;
    });
};

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

function transformObjectForOutputResult(inputObject) {
    const blockCoordinates = inputObject.map((inObject) => {
        const { x, y, width, height, initialOrder } = inObject;
        return {
            top: y,
            left: x,
            right: x + width,
            bottom: y + height,
            initialOrder,
        };
    });
    const totalBoxesArea = calculationTotalRectangleArea(inputObject);
    const resultArray = {
        fullness: "totalBoxesArea = " + totalBoxesArea + " px^2",
        blockCoordinates,
    };
    return resultArray;
};

function calculationTotalRectangleArea(rectangles) {
    const totalArea = rectangles.reduce((sum, rectangle) => {
        const area = rectangle.width * rectangle.height;
        return sum + area;
    }, 0);
    return totalArea;
}