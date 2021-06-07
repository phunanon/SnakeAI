function draw(
    { brain, body, head, food, ate, age }: LiveSnake,
    title: string,
    board: CanvasRenderingContext2D,
    info: CanvasRenderingContext2D,
) {
    const [height, width] = [body.length, body[0].length];
    board.clearRect(0, 0, board.canvas.width, board.canvas.height);
    board.save();
    board.scale(board.canvas.width / width, board.canvas.height / height);

    //Draw Snake body & head
    body.forEach((row, y) =>
        row.forEach((dot, x) => {
            board.fillStyle = `rgb(0, ${(dot / (ate + 2)) * 200}, 0)`;
            dot && board.fillRect(x, y, 1, 1);
        }),
    );
    board.fillStyle = "rgb(0, 200, 0)";
    board.fillRect(head.x, head.y, 1, 1);

    //Draw food
    board.fillStyle = "#d00";
    board.fillRect(food.x, food.y, 1, 1);

    //Draw info
    info.clearRect(0, 0, info.canvas.width, info.canvas.height);
    info.fillStyle = "#fff";
    info.font = "14px Arial";
    info.fillText(`${title}`, 12, 20);
    info.fillText(`ate ${ate}, age ${age}`, 12, 38);

    drawBrain(brain, info);

    board.restore();
}

function drawBrain(brain: Brain, info: CanvasRenderingContext2D) {
    const margin = 1.2;
    info.save();
    info.translate(32, 48);
    info.scale(30, 30);
    info.font = ".75px monospace";
    const matrix = [brain.inputs, ...brain.layers.map(l => l.outputs ?? [])];
    matrix.forEach((l, x) =>
        l.forEach((r, y) => {
            //Biggest
            if (x == l.length - 1 && r == Math.max(...l)) {
                info.fillStyle = "#fff";
                info.fillRect(x * margin - 0.1, y * margin - 0.1, margin, margin);
            }
            //Output
            let R = r < 0 ? r * -255 : 0,
                G = r > 0 ? r * 255 : 0;
            info.fillStyle = `rgb(${R}, ${G}, ${0})`;
            info.fillRect(x * margin, y * margin, 1, 1);
            //Show cardinals for first and last layers
            if (x != 0 && x != l.length - 1) {
                return;
            }
            info.fillStyle = "#000";
            info.fillText(
                "NESW"[y % 4],
                x * margin + 0.25,
                y * margin + 0.75,
            );
        }),
    );
    info.restore();
}
