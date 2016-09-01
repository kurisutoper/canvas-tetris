var queue = [];

var current_drop = 0;

var lines_cleared = 0, score = 0;

var board_memory = new Array(20);
for(var i = 0; i < 20; ++i) {
    board_memory[i] = '          ';
}

String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index)+character+this.substr(index+character.length);
}

function droppingBlock(type) {
    this.form = ['    ',
                 '    ',
                 '    ',
                 '    '];

    this.pos = [4,0];
    this.type = type;

    switch(type) {
        case 'li':
            this.form[1] = '----';
        break;

        case 'sq':
            this.form[0] = '--  ';
            this.form[1] = '--  ';
        break;

        case 'fs':
            this.form[0] = ' -- ';
            this.form[1] = '--  ';
        break;

        case 'bs':
            this.form[0] = '--  ';
            this.form[1] = ' -- ';
        break;

        case 'fl':
            this.form[0] = ' -  ';
            this.form[1] = ' -  ';
            this.form[2] = ' -- ';
        break;

        case 'bl':
            this.form[0] = ' -  ';
            this.form[1] = ' -  ';
            this.form[2] = '--  ';
        break;

        case 'te':
            this.form[0] = ' -  ';
            this.form[1] = '--- ';
        break;
    }

    this.rotatedForm = function rotatedForm() {
        var rotated = ['    ',
                       '    ',
                       '    ',
                       '    '];

        if(this.type == 'li') {
            for(var i = 0; i < 4; ++i) {
                for(var j = 0; j < 4; ++j) {
                    if(this.form[i][j] == '-') {
                        rotated[j] = rotated[j].replaceAt(i, '-');
                    }
                }
            }
        }
        else if(this.type == 'sq') {
            //we don't rotate square blocks.
            rotated = this.form;
        }
        else {
            //transpose
            for(var i = 0; i < 3; ++i) {
                for(var j = 0; j < 3; ++j) {
                    if(this.form[i][j] == '-') {
                        rotated[j] = rotated[j].replaceAt(i, '-');
                    }
                }
            }

            //swap columns
            for(var i = 0; i < 3; ++i) {
                var rotarray = rotated[i].split('');
                rotarray.pop();

                rotated[i] = rotarray.reverse().join('')+' ';
            }
        }
        return rotated;
    }
}

function drawBoard() {
    var ctx = context;
    var width = canvas.width,
        height = canvas.height;
    var endHoriz = width*0.7,
        startHoriz = width*0.1;

    ctx.clearRect(0, 0, width, height);

    //total board's background
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, width, height);

    //the cell-area's background
    ctx.fillStyle = 'black';
    ctx.fillRect(startHoriz, 0, endHoriz-startHoriz, height);

    //the cell-area's horizontal borders
    ctx.strokeStyle = 'gray';
    var incr = (endHoriz-startHoriz)/10;
    for(var i = startHoriz; i <= endHoriz; i += incr) {
        ctx.beginPath();
            ctx.moveTo(i, height);
            ctx.lineTo(i, 0);
        ctx.stroke();
    }

    //the cell-area's vertical borders
    ctx.strokeStyle = 'gray';
    var incr = height/20;
    for(var i = 0; i <= height; i += incr) {
        ctx.beginPath();
            ctx.moveTo(startHoriz, i);
            ctx.lineTo(endHoriz, i);
        ctx.stroke();
    }

    //the current drop block
    if(current_drop != 0) {
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'gray';
        for(var i = 0; i < 4; ++i) {
            for(var j = 0; j < 4; ++j) {
                if(current_drop.form[i][j] == '-') {
                    ctx.fillRect((current_drop.pos[0]+j)*(endHoriz-startHoriz)/10+startHoriz,
                                 (current_drop.pos[1]+i)*height/20,
                                 (endHoriz-startHoriz)/10, height/20);
                    ctx.strokeRect((current_drop.pos[0]+j)*(endHoriz-startHoriz)/10+startHoriz,
                                   (current_drop.pos[1]+i)*height/20,
                                   (endHoriz-startHoriz)/10, height/20);

                }
            }   
        }
    }

    //the board memory layout
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'gray';
    for(var i = 0; i < 20; ++i) {
        for(var j = 0; j < 10; ++j) {
            if(board_memory[i][j] == '-') {
                ctx.fillRect(j*(endHoriz-startHoriz)/10+startHoriz,
                             i*height/20, (endHoriz-startHoriz)/10, height/20);
                ctx.strokeRect(j*(endHoriz-startHoriz)/10+startHoriz,
                             i*height/20, (endHoriz-startHoriz)/10, height/20);
            }
        }
    }

    //the block queue area
    ctx.strokeStyle = 'black';
    ctx.strokeRect(endHoriz+width/40, height/5+height/30, width/4, height*3/4);

    for(var q = 0; q < queue.length; ++q) {
        //create a box for each block preview
        ctx.strokeStyle = 'red';
        ctx.strokeRect(endHoriz+width/20, (q+1)*height/5+height/14-height/60*q, width/5, height*1/8);

        var startx = endHoriz+width/20,
            starty = (q+1)*height/5+height/14-height/60*q;

        //create the block preview
        ctx.fillStyle = 'red';
        switch(queue[q]) {
            case 'sq':
                ctx.strokeStyle = 'black'
                ctx.fillRect(startx+width/18, starty+height/38, width/12, height/15);
                ctx.strokeRect(startx+width/18, starty+height/38, width/12, height/15);

                ctx.strokeStyle = 'black';
                    ctx.beginPath();
                    ctx.moveTo(startx+width/18+width/24, starty+height/38);
                    ctx.lineTo(startx+width/18+width/24, starty+height/38+height/15);
                ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(startx+width/18, starty+height/38+height/30);
                    ctx.lineTo(startx+width/18+width/12, starty+height/38+height/30);
                ctx.stroke();
            break;

            case 'fl':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/18, starty+height/75, width/24, height/10);
                ctx.strokeRect(startx+width/18, starty+height/75, width/24, height/10);
                ctx.fillRect(startx+width/18+width/24, starty+height/75+height/15, width/24, height/30);
                ctx.strokeRect(startx+width/18+width/24, starty+height/75+height/15, width/24, height/30);

                ctx.strokeStyle = 'black';
                    ctx.beginPath();
                    ctx.moveTo(startx+width/18, starty+height/75+height/30);
                    ctx.lineTo(startx+width/18+width/24, starty+height/74+height/30);
                ctx.stroke();

                ctx.strokeStyle = 'black';
                    ctx.beginPath();
                    ctx.moveTo(startx+width/18, starty+height/75+height/15);
                    ctx.lineTo(startx+width/18+width/24, starty+height/74+height/15);
                ctx.stroke();
            break;

            case 'bl':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/18+width/24, starty+height/75, width/24, height/10);
                ctx.strokeRect(startx+width/18+width/24, starty+height/75, width/24, height/10);
                ctx.fillRect(startx+width/18, starty+height/75+height/15, width/24, height/30);
                ctx.strokeRect(startx+width/18, starty+height/75+height/15, width/24, height/30);

                ctx.strokeStyle = 'black';
                    ctx.beginPath();
                    ctx.moveTo(startx+width/18+width/24, starty+height/75+height/30);
                    ctx.lineTo(startx+width/18+width/12, starty+height/74+height/30);
                ctx.stroke();

                ctx.strokeStyle = 'black';
                    ctx.beginPath();
                    ctx.moveTo(startx+width/18+width/24, starty+height/75+height/15);
                    ctx.lineTo(startx+width/18+width/12, starty+height/75+height/15);
                ctx.stroke();
            break;

            case 'fs':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/25+width/24, starty+height/38, width/12, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38, width/12, height/30);
                ctx.fillRect(startx+width/25, starty+height/38+height/30, width/12, height/30);
                ctx.strokeRect(startx+width/25, starty+height/38+height/30, width/12, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38,width/24, height/15);
            break;

            case 'bs':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/25, starty+height/38, width/12, height/30);
                ctx.strokeRect(startx+width/25, starty+height/38, width/12, height/30);
                ctx.fillRect(startx+width/25+width/24, starty+height/38+height/30, width/12, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38+height/30, width/12, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38,width/24, height/15);
            break;

            case 'li':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/60, starty+height/25, width/6, height/30);
                ctx.strokeRect(startx+width/60, starty+height/25, width/6, height/30);

                ctx.beginPath();
                    ctx.moveTo(startx+width/60+width/24, starty+height/25);
                    ctx.lineTo(startx+width/60+width/24, starty+height/25+height/30);
                ctx.stroke();

                ctx.beginPath();
                    ctx.moveTo(startx+width/60+width/12, starty+height/25);
                    ctx.lineTo(startx+width/60+width/12, starty+height/25+height/30);
                ctx.stroke();

                ctx.beginPath();
                    ctx.moveTo(startx+width/60+width/8, starty+height/25);
                    ctx.lineTo(startx+width/60+width/8, starty+height/25+height/30);
                ctx.stroke();
            break;

            case 'te':
                ctx.strokeStyle = 'black';
                ctx.fillRect(startx+width/25, starty+height/38+height/30, width/8, height/30);
                ctx.strokeRect(startx+width/25, starty+height/38+height/30, width/8, height/30);
                ctx.fillRect(startx+width/25+width/24, starty+height/38, width/24, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38, width/24, height/30);
                ctx.strokeRect(startx+width/25+width/24, starty+height/38, width/24, height/15);
            break;
        }
    }

    //the score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+score, endHoriz+width/40, height/20);

    //lines cleared
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Lines: '+lines_cleared, endHoriz+width/40, height/10);

    //speed
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Speed: '+(Math.floor(lines_cleared/20)+1)+'x', endHoriz+width/40, 3*height/20);
}

var canvas, context;
function loadGame(gcanvas) {
    canvas = gcanvas;
    context = canvas.getContext('2d');

    var choices = ['li', 'fs', 'bs', 'te', 'fl', 'bl', 'sq'];
    for(var i = 0; i < 4; ++i) { 
        queue.push(choices[Math.floor(7*Math.random()+1)-1]);
    }

    window.addEventListener('keydown', movePiece, false);
    clock();
}

//keycodes: left - 37, right - 39, down - 40, up - 38
function movePiece(evt) {
    var kcode = evt.keyCode;
    var clearLeft = true, clearRight = true;
  
    if(kcode >= 37 && kcode <= 40 || kcode == 32) {
        evt.preventDefault();
    }

    //strafing/drop
    if(current_drop != 0 && (kcode == 37 || kcode == 39 || kcode == 40)) {
        for(var i = 0; i < 4; ++i) {
            for(var j = 0; j < 4; ++j) {
                if(current_drop.form[i][j] == '-') {
                    if(j+1+current_drop.pos[0] >= 10 || board_memory[i+current_drop.pos[1]][j+1+current_drop.pos[0]] == '-') {
                        clearRight = false;
                    }
                    if(j-1+current_drop.pos[0] < 0 || board_memory[i+current_drop.pos[1]][j+current_drop.pos[0]-1] == '-') {
                        clearLeft = false;
                    }
                }
            }
        }
        if(kcode == '37' && clearLeft) {
            current_drop.pos[0] -= 1;
        }
        else if(kcode == '39' && clearRight) {
            current_drop.pos[0] += 1;
        }
        else if(kcode == '40' && currentDropCanFall()) {
            current_drop.pos[1] += 1;
        }

        drawBoard();
    }
    //rotation
    else if(current_drop != 0 && kcode == 38) {
        var able_to_rotate = true;
        var rotated = current_drop.rotatedForm();

        for(var i = 0; i < 4; ++i) {
            for(var j = 0; j < 4; ++j) {
                if(rotated[i][j] == '-') {
                    if(board_memory[i+current_drop.pos[1]][j+current_drop.pos[0]] == '-' ||
                       i+current_drop.pos[1] < 0 || i+current_drop.pos[1] >= 20 ||
                       j+current_drop.pos[0] < 0 || j+current_drop.pos[0] >= 10) {
                        able_to_rotate = false;
                    }
                }
            }
         }
        if(able_to_rotate) {
            current_drop.form = current_drop.rotatedForm();
            drawBoard();
        }
    }
    //hard drop
    else if(current_drop != 0 && kcode == 32) {
        while(currentDropCanFall()) {
            current_drop.pos[1] += 1;
        }
        drawBoard();
    }
}

function currentDropCanFall() {
    for(var i = 0; i < 4; ++i) {
        for(var j = 0; j < 4; ++j) {
            if(current_drop.form[i][j] == '-') {
                if(i+current_drop.pos[1]+1 >= 20) {
                    return false;
                }
                else if(board_memory[current_drop.pos[1]+i+1][current_drop.pos[0]+j] == '-') {
                    return false;
                }
            }
        }
    }
    return true;
}

function clock() {
    //block currently in-use
    if(current_drop == 0) {
        current_drop = new droppingBlock(queue.shift())

        var choices = ['li', 'fs', 'bs', 'te', 'fl', 'bl', 'sq'];
        queue.push(choices[Math.floor(7*Math.random()+1)-1]);

        //check if new block is blocked (game over)
        for(var i = 0; i < 4; ++i) {
            for(var j = 0; j < 4; ++j) {
                if(current_drop.form[i][j] == '-') {
                    if(board_memory[i+current_drop.pos[1]][j+current_drop.pos[0]] == '-') {
                        alert('GAME OVER!');
                        current_drop = 0;
                        return 0;
                    }
                }
            }
        }
    }

    //in-use block falling
    if(currentDropCanFall()) {
        current_drop.pos[1] += 1;
    }
    else {
        /* Since the current drop block can't fall,
          store it in the board memory and load
          the next drop block. */

        for(var i = 0; i < 4; ++i) {
            for(var j = 0; j < 4; ++j) {
                if(current_drop.form[i][j] == '-') {
                    board_memory[current_drop.pos[1]+i] = board_memory[current_drop.pos[1]+i].replaceAt(current_drop.pos[0]+j, '-');
                }
            }
        }

        current_drop = 0;

        /* check for line clearing */
        //stores the indices (rows) of lines to clear
        var to_clear = [];
        for(var i = 0; i < 20; ++i) {
            var clear = true;
            for(var j = 0; j < 10; ++j) {
                if(board_memory[i][j] == ' ') {
                    clear = false;
                    break;
                }
            }
            if(clear) {
                to_clear.push(i);
            }
        }
        
        if(to_clear.length > 0) {
            /* draw the clear light, purge row, and return; 
            the function will clear the clear light next cycle */

            var width = canvas.width,
                height = canvas.height;
            var endHoriz = width*0.7,
                startHoriz = width*0.1;

            context.fillStyle = 'white';
            for(var i = 0; i < to_clear.length; ++i) {
                context.fillRect(startHoriz, to_clear[i]*height/20,
                                 endHoriz-startHoriz, height/20);
            }

            //removing cleared lines
            for(var i = 0; i < to_clear.length; ++i) {
                /* subtracting i from the to_clear to compensate
                 for the index shift of removing lines */
                board_memory.splice(to_clear[i]-i,1);
            }

            //shifting the blocks above clears down
            for(var i = 0; i < to_clear.length; ++i) {
                board_memory.unshift('          ');
            }

            lines_cleared += to_clear.length;
            score += to_clear.length*(Math.floor(lines_cleared/20)+1)*50;

            setTimeout(clock, 100);
            return 0;
        }
    }

    //pretty stuff
    drawBoard();

    setTimeout(clock, 500/Math.floor(1+lines_cleared/20));
}
