
var cellClass = ["empty_cell", "h_cell", "n_cell"]

PLAYER1 = 1;

pos = []
N = 12;
M = 12;
maxCount = 0;
step = 0;
moveCell = { x: -1, y: 0};
movePosipblePos = [];

function isLife(v, player) {
    return v == player ? 1 : 0;
}
function getCellState(i, j, p) {
    return isLife(pos[((i + N - 1) % N ) % N][(j + M - 1) % M], p)
        + isLife(pos[((i + N - 1) % N ) % N][j], p)
        + isLife(pos[((i + N - 1) % N ) % N][(j + 1) % M], p)
        + isLife(pos[i][(j + M - 1) % M], p)
        + isLife(pos[i][(j + 1) % M], p)
        + isLife(pos[((i + 1) % N ) % N][(j + M - 1) % M], p)
        + isLife(pos[((i + 1) % N ) % N][j], p)
        + isLife(pos[((i + 1) % N ) % N][(j + 1) % M], p);
}
function initTable(n, m, pos) {
    $("#gameTable > tbody").html("");
    var count = 0;
    for (var i = 0; i < n; i++) {
        tr = $('<tr/>')
        for (var j = 0; j < m; j++) {
            var cellState = getCellState(i, j, 1);
            td = $("<td class='" + cellClass[pos[i][j]] + "' row='" + i + "' col='" + j + "'" +
                (pos[i][j] == PLAYER1 ? (" style =' opacity: " + 1 + "'>" + cellState) : ">-") + "</td>")
            if (pos[i][j] == PLAYER1) {
                td.animate({
                    opacity: (cellState < 2 ? 0.4 : cellState > 3 ? 0.6 : 1),
                }, 1000)
            } else if( pos[i][j] == 0 && typeof movePosipblePos["" + i + j] != "undefined" ) {
                td = $("<td class=" + "'move_cell'"
                    + " row='" + i + "'"
                    + " col='" + j + "'"
                    + " style=" + "' opacity: 0.3'" +
                    ">*" + "</td>")
            } /*else if (pos[i][j] == 0 && cellState == 3) { // posible add cell pos
                td = $("<td class=" + "'step_cell'"
                    + " row='" + i + "'"
                    + " col='" + j + "'"
                    + " style=" + "' opacity: 0.3'" +
                    ">" + "</td>")
            }*/ else if (pos[i][j] == 0 && (cellState == 4 || cellState == 5)) {
                td = $("<td class=" + "'burn_cell'"
                    + " row='" + i + "'"
                    + " col='" + j + "'"
                    + " style=" + "' opacity: 1'" +
                    ">+" + "</td>")
            }

            $(tr).css("height", 100 / N);
            $(tr).css("width", 100 / M);
            $(tr).append(td);
            count = count + (pos[i][j] > 0 ? 1 : 0);
        }
        $('#gameTable').append(tr);
    }
    var size = $(window).height() * 0.8;
    $('#gameTable').width(size);
    $('#gameTable').height(size);
    maxCount = maxCount > count ? maxCount : count;
    $('#maxCount').text("Score: " + maxCount);
    $('#step').text("Step: " + step);
    $('#count').text("Live cell: " + count);

    $("#gameTable td").click(function () {
        onClickCell(this, parseInt($(this).attr("row")), parseInt($(this).attr("col")));
    });
}

function cellNewStateImun(k, l, pos, type) {
    s = 0;
    for (var i = k - 1; i <= k + 1; i++) {
        for (var j = l - 1; j <= l + 1; j++) {
            s = s + (pos[(i + N) % N][(j + M) % M] == type ? 1 : 0);
        }
    }
    // burn
    if ((pos[k][l] == 0) && ((s == 4 || s == 5) && s < 7)) {
        return type;
    }

    //live
    if ((pos[k][l] == type) && (s >= 2 + 1 && s < 7 + 1)) {
        return type;
    }
    //kill other
    if ((pos[k][l] != 0) && (pos[k][l] != type)) {
        if (s >= 4) {
            return 0;
        }
        return pos[k][l];
    }

    return 0;
}


function cellNewState(k, l, pos, type) {
    if (type == PLAYER1) {
        return cellNewStateImun(k, l, pos, type);
    }
    s = 0;
    for (var i = k - 1; i <= k + 1; i++) {
        for (var j = l - 1; j <= l + 1; j++) {
            s = s + (pos[(i + N) % N][(j + M) % M] == type ? 1 : 0);
        }
    }
    //burn
    if ((pos[k][l] == 0) && (s >= 4)) {
        return type;
    }
    /*if ((pos[k][l] == type) && (s == (3 + 1) || s == (2 + 1) )) {
     return type;
     }*/
    //live
    if ((pos[k][l] == type) && (s >= (2 + 1) )) {
        return type;
    }

    //kill other
    if ((pos[k][l] != 0) && (pos[k][l] != type)) {
        if (s >= 4) {
            return 0;
        }
        return pos[k][l];
    }

    return 0;
}

function nextStep(n, m, pos, type) {
    var posNew = pos.map(function (arr) {
        return arr.slice();
    });
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            posNew[i][j] = cellNewState(i, j, pos, type);
        }
    }
    return posNew.map(function (arr) {
        return arr.slice();
    });
}

function nextStepAll() {
    ++step;
    pos = nextStep(N, M, pos, 1);
    addLifeCell(0, 0, M, 2, true)
    pos = nextStep(N, M, pos, 2);
}
function initMovePosibleCell() {
    movePosipblePos = [];
    for(var i = -1; i <=1; ++i ) {
        for(var j = -1; j <=1; ++j) {
            var xCur = (moveCell.x + i + N) % N;
            var yCur = (moveCell.y + j + M) % M;
            var ij = "" + xCur + yCur;
            if(pos[xCur][yCur] != 1) {
                movePosipblePos[ij] = {x: xCur, y: yCur};
            }
        }
    }
}

function move(row, col, player) {
    pos[moveCell.x][moveCell.y] = 0;
    pos[row][col] = player;
    moveCell = { x: -1, y: 0};
    movePosipblePos = [];
}

function onClickCell(td, row, col) {
    var cellState = getCellState(row, col, 1);
    if (pos[row][col] == 0 && cellState == 3) {
        newValue = (pos[row][col] + 1) % 2;
        pos[row][col] = newValue;
        initTable(N, M, pos);
        /* $("#gameTable").animate({
         opacity: '0.3',
         });*/
        nextStepAll();
        pos[row][col] = newValue;
        initTable(N, M, pos);
    } else if(pos[row][col] == PLAYER1) {
        moveCell = {x: row, y: col};
        initMovePosibleCell();
        initTable(N, M, pos);
    } else if (typeof movePosipblePos["" + row + col] != "undefined") {
        move(row, col, PLAYER1);
        initTable(N, M, pos);
        nextStepAll();
        pos[row][col] = PLAYER1;
        initTable(N, M, pos);
    }
    /*$("#gameTable").animate({
     opacity: '1.0',
     });*/
}

function addLifeCell(i0, j0, cellSize, player, isCheckState) {
    var curFigSize = 0;
    var probablyPos = [];
    var probablyPosIndex = [];
    for (var i = 0; i < cellSize; ++i) {
        for (var j = 0; j < cellSize; ++j) {
            var ij = "" + i + j;
            if (pos[i0 + i][j0 + j] == player) {
                curFigSize = curFigSize + 1;
            } else if (pos[i0 + i][j0 + j] == 0 && probablyPosIndex.indexOf(ij) == -1 &&
                (pos[i0 + i][j0 + (j + 1) % cellSize] == player ||
                pos[i0 + (i + 1) % cellSize][j0 + j] == player ||
                pos[i0 + (i + cellSize - 1) % cellSize][j0 + j] == player ||
                pos[i0 + i][j0 + (j + cellSize - 1) % cellSize] == player )) {
                var cellState = getCellState(i, j, player);
                if (cellState == 3 || isCheckState == false) {
                    probablyPos[ij] = {x: i0 + i, y: j0 + j};
                    probablyPosIndex[probablyPosIndex.length] = ij;
                }
            }
        }
    }
    var p = probablyPos[probablyPosIndex[Math.floor((Math.random() * probablyPosIndex.length))]];
    if (typeof p != "undefined") {
        pos[p.x][p.y] = player;
    }
    ++curFigSize;
    return curFigSize;
}

function initFig(i0, j0, cellSize, figSize, player) {
    var curFigSize = addLifeCell(i0, j0, cellSize, player, false);
    if (curFigSize < figSize) {
        initFig(i0, j0, cellSize, figSize, player);
    }
}

function initPos(n, m, pos) {
    for (var i = 0; i < n; ++i) {
        pos[i] = new Array();
        for (var j = 0; j < m; ++j) {
            pos[i][j] = 0;
        }
    }
    var cellSize = 6;
    var figSize = 5;
    var figCount = 2;
    var figs = [];
    var k = n / cellSize;
    var l = m / cellSize;
    var playerCount = 2;
    for (var i = 0; i < k; ++i) {
        figs[i] = new Array();
        for (var j = 0; j < l; ++j) {
            figs[i][j] = 0;
        }
    }

    for (var player = 0; player < playerCount; ++player) {
        for (var fig = 0; fig < figCount;) {
            var i = Math.floor((Math.random() * k));
            var j = Math.floor((Math.random() * l));
            if (figs[i][j] == 0) {
                ++fig;
                figs[i][j] = player + 1;
                pos[i * cellSize + cellSize / 2][j * cellSize + cellSize / 2] = player + 1;
                var dir = Math.floor((Math.random() * 2));
                if (dir == 0) {
                    pos[i * cellSize + cellSize / 2][j * cellSize + cellSize / 2 + 1] = player + 1;
                } else {
                    pos[i * cellSize + cellSize / 2 + 1][j * cellSize + cellSize / 2] = player + 1;
                }
                initFig(i * cellSize, j * cellSize, cellSize, figSize, player + 1);
            }
        }
    }
}

$(document).ready(function () {
    initPos(N, M, pos);
    initTable(N, M, pos)

    $("#nextStep").click(function () {
        nextStepAll();
        initTable(N, M, pos);
    });
})
