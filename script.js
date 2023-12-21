

const container = document.getElementById('container');
const button = document.getElementById('button');

const boxes = await fetch('./data/blockParameters.json').then((response) => response.json()).catch(error => console.error('Failed to load JSON:', error));
const contSize = { w: 600, h: 600 };

button.addEventListener('click', () => packRectangles(boxes));



function packRectangles(boxes) {

    boxes.sort((a, b) => b.h - a.h);

    const spaces = [{ x: 0, y: 0, w: contSize.w, h: contSize.h }];
    const packed = [];
    const notPacked = [];

    for (const box of boxes) {
        let placed = false;

        for (let i = spaces.length - 1; i >= 0; i--) {
            const space = spaces[i];

            if (box.w > space.w || box.h > space.h) continue;

            packed.push(Object.assign({}, box, { x: space.x, y: space.y }));

            if (box.w === space.w && box.h === space.h) {

                const last = spaces.pop();
                if (i < spaces.length) spaces[i] = last;

            } else if (box.h === space.h) {

                space.x += box.w;
                space.w -= box.w;

            } else if (box.w === space.w) {

                space.y += box.h;
                space.h -= box.h;

            } else {

                spaces.push({
                    x: space.x + box.w,
                    y: space.y,
                    w: space.w - box.w,
                    h: box.h
                });
                space.y += box.h;
                space.h -= box.h;
            }

            placed = true;
            break;
        }

        if (!placed) {
            // Блок не розміщений в контейнері
            notPacked.push(box);
            // console.log('Block not packed:', box);
        }
    }

    // console.log({ packed, spaces, notPacked });
    console.log({
        total: boxes.length,
        packed: packed.length,
        notPacked: notPacked.length,
    })
    renderBlocks(packed);
};


function renderBlocks(packed) {

    for (let pack of packed) {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.style.width = pack.w + 'px';
        blockElement.style.height = pack.h + 'px';
        blockElement.style.left = pack.x + 'px';
        blockElement.style.top = pack.y + 'px';
        container.appendChild(blockElement);
    }

};