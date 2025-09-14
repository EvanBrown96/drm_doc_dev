import type { Case } from "./types";
import Cube from 'cubejs';

function gen_setup(the_case: Case): string {
    let scramble = the_case.solutions[0].solution + " " + randomDrState();
    const cube = new Cube();
    cube.move(scramble)
    let solution = cube.solve()
    return solution;
}

function randomDrState() {
    // too lazy to implement proper scrambler so random moves yay
    let qt = ["U", "U'", "D", "D'"]
    let ht = ["F2", "B2", "R2", "L2"]
    let moves = []
    for(let i = 0; i < 250; i++) {
        moves.push(qt[Math.floor(Math.random()*qt.length)]);
        moves.push(ht[Math.floor(Math.random()*ht.length)]);
    }
    return moves.join(" ")
}

function invert(scramble) {
    let moves = scramble.split(" ").reverse()
    let moves_out = []
    for(let m of moves) {
        if(m[-1] == "2") moves_out.push(m);
        else if(m[-1] == "'") moves_out.push(m[0]);
        else moves_out.push(m + "'")
    }
    return moves_out.join(" ")
}

export { gen_setup };
