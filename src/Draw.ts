function draw(
    { body, head, food, ate, age }: LiveSnake,
    message: string,
    board: CanvasRenderingContext2D,
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
    document.title = `ate ${ate}, age ${age}, ${message}`;

    board.restore();
}
