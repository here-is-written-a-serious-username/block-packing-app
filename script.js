const boxes = [
    { w: 50, h: 400 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 50, h: 100 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 50, h: 100 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 50, h: 100 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 50, h: 100 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 50, h: 100 },
    { w: 80, h: 60 },
    { w: 40, h: 120 },
    { w: 60, h: 80 },
    { w: 100, h: 50 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
    { w: 55, h: 105 },
    { w: 75, h: 55 },
    { w: 45, h: 110 },
    { w: 65, h: 85 },
    { w: 95, h: 45 },
];

const contSize = { w: 600, h: 600 };

const container = document.getElementById('container');

function aaa(boxes) {

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
    bbb(packed);
};


function bbb(packed) {

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

aaa(boxes);