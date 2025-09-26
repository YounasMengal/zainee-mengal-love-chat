let board = Array(9).fill(null);
let xTurn = true;
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');

function render(){
  boardEl.innerHTML = '';
  board.forEach((v, i)=>{
    const c = document.createElement('div');
    c.className = 'cell';
    c.textContent = v || '';
    c.addEventListener('click', ()=>move(i));
    boardEl.appendChild(c);
  });
}

function winner(b){
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b1,c] of lines){
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  return b.every(Boolean) ? 'draw' : null;
}

function move(i){
  if (board[i] || winner(board)) return;
  board[i] = xTurn ? 'X' : 'O';
  xTurn = !xTurn;
  const w = winner(board);
  if (w === 'draw') statusEl.textContent = `It's a draw!`;
  else if (w) statusEl.textContent = `${w} wins!`;
  else statusEl.textContent = `Player ${xTurn? 'X':'O'}'s turn`;
  render();
}

function resetGame(){
  board = Array(9).fill(null); xTurn = true; statusEl.textContent = `Player X's turn`; render();
}

window.resetGame = resetGame;
render();
