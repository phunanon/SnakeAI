function draw(
    { brain, body, head, food, ate, age }: LiveSnake,
    message: string,
    board: CanvasRenderingContext2D,
    info: CanvasRenderingContext2D,
) {
    const [height, width] = [body.length, body[0].length];
    board.clearRect(0, 0, board.canvas.width, board.canvas.height);
    board.save();
    board.scale(board.canvas.width / width, board.canvas.height / height);

    //Draw Snake body & head
    board.fillStyle = "#000";
    body.forEach((row, y) => row.forEach((dot, x) => dot && board.fillRect(x, y, 1, 1)));
    board.fillRect(head.x, head.y, 1, 1);

    //Draw food
    board.fillStyle = "#d00";
    board.fillRect(food.x, food.y, 1, 1);

    //Draw info
    info.clearRect(0, 0, info.canvas.width, info.canvas.height);
    info.fillStyle = "#000";
    info.font = "12px Arial";
    info.fillText(`ate ${ate}, age ${age}, ${message}`, 12, 24);

    drawBrain(brain, info);

    board.restore();
}

function drawBrain(brain: Brain, info: CanvasRenderingContext2D) {
    const margin = 1.2;
    info.save();
    info.translate(32, 48);
    info.scale(24, 24);
    brain.forEach((l, x) =>
        l.forEach((n, y) => {
            let r = n.bias;
            let R = (r < 0 ? r * -255 : 0), G = (r > 0 ? r * 255 : 0);
            info.fillStyle = `rgb(${255 - G}, ${255 - R}, ${255 - R - G})`;
            info.fillRect(x * margin, y * margin, 1, 1);
        }),
    );
    info.restore();
}
