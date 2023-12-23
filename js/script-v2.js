const button = document.getElementById('button');
const outputEl = document.getElementById('textContentOutput');
const canvas = document.getElementById('bin');
const ctx = canvas.getContext('2d');

const boxesData = await fetch('./data/blockParameters.json').then((response) => response.json()).catch(error => console.error('Failed to load JSON:', error));
button.addEventListener('click', () => packRectangles());
const debouncedPackRectangles = debounce(() => packRectangles(), 300);
window.addEventListener('resize', debouncedPackRectangles);

let boxes = [];
let invalidBoxes = [];
let contSize = {
    width: 0,
    height: 0,
};

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

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    fits_in(outer) {
        return outer.w >= this.w && outer.h >= this.h;
    }
    same_size_as(other) {
        return this.w == other.w && this.h == other.h;
    }
}

class Node {
    constructor() {
        this.left = null;
        this.right = null;
        this.rect = null;
        this.filled = false;
    }
    insert_rect(rect) {
        if (this.left != null)
            return this.left.insert_rect(rect) || this.right.insert_rect(rect);

        if (this.filled)
            return null;

        if (!rect.fits_in(this.rect))
            return null;

        if (rect.same_size_as(this.rect)) {
            this.filled = true;
            return this;
        }

        this.left = new Node();
        this.right = new Node();

        const width_diff = this.rect.w - rect.w;
        const height_diff = this.rect.h - rect.h;

        const me = this.rect;

        if (width_diff > height_diff) {
            // split literally into left and right, putting the rect on the left.
            this.left.rect = new Rect(me.x, me.y, rect.w, me.h);
            this.right.rect = new Rect(me.x + rect.w, me.y, me.w - rect.w, me.h);
        }
        else {
            // split into top and bottom, putting rect on top.
            this.left.rect = new Rect(me.x, me.y, me.w, rect.h);
            this.right.rect = new Rect(me.x, me.y + rect.h, me.w, me.h - rect.h);
        }
        return this.left.insert_rect(rect);
    }
    clear() {
        this.left = null;
        this.right = null;
        this.rect = null;
        this.filled = false;
    }
}

const packRectangles = function () {
    contSize = {
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.9,
    };
    canvas.width = contSize.width;
    canvas.height = contSize.height;
    const start_node = new Node();
    start_node.rect = new Rect(0, 0, contSize.width, contSize.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    turnAndSort(boxes);
    addingColor(boxes);
    const packed = [];
    const notPacked = [];

    for (const box of boxes) {
        const rect = new Rect(0, 0, box.width, box.height);

        const node = start_node.insert_rect(rect);
        if (node) {
            const r = node.rect;

            ctx.fillStyle = box.color;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(r.x, r.y, r.w, r.h);
            ctx.fillRect(r.x, r.y, r.w, r.h);

            const centerX1 = r.x + r.w / 2;
            const centerY1 = r.y + r.h / 2 - 1;
            const radius = 12;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX1, centerY1, radius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = r.x + r.w / 2;
            const centerY = r.y + r.h / 2;
            ctx.fillText(box.initialOrder, centerX, centerY)

            packed.push(box);
        } else {
            notPacked.push(box);
        }
    }
    start_node.clear();

    console.log({ packed, notPacked })
    const result = transformObjectForOutputResult(packed);
    console.log(result);

    outputEl.textContent =
        `Total: ${boxes.length} boxes;
        packed:${packed.length};
        notPacked: ${notPacked.length}.
        Other results are shown in the console.`;
};

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

function turnAndSort(boxes) {
    boxes.map(box => {
        if (box.width > box.height) {
            [box.width, box.height] = [box.height, box.width];
        }
        return box;
    });
    boxes.sort((a, b) => b.height - a.height);
}

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