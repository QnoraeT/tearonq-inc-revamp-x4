import { gameVars } from "./loadSave";
import { lerp } from "./misc/calc";

const draw = document.getElementById('canvas')! as HTMLCanvasElement;
const pen = draw.getContext("2d")!;
const particles: Array<{
    type: number, 
    dir: number,
    x: number,
    y: number,
    maxLife: number,
    life: number,
    size: number,
    defGhost: number
}> = [];

let stats = {
    norm: 0
}

export const drawing = () => {
    draw.width = window.innerWidth;
    draw.height = window.innerHeight;

    stats.norm += gameVars.delta;
    if (stats.norm >= 0.1) {
        if (stats.norm >= 10) {
            stats.norm = 0.1;
        }

        for (let atmps = 0; atmps < 10 && stats.norm >= 0.1; atmps++) {
            stats.norm -= 0.1;

            let obj = {
                type: 0, 
                dir: (Math.round(Math.random()) - 0.5) * 2,
                x: 0,
                y: Math.random() * 60,
                maxLife: 2.0 + 1.5 * Math.random(),
                life: 0,
                size: 12 + 8 * Math.random(),
                defGhost: 32 + 32 * Math.random()
            }

            obj.life = obj.maxLife;
            obj.x = obj.dir === 1 ? -100 : (draw.width + 100);
    
            particles.push(obj);
        }
    }
    // stats.kua += gameVars.delta
    // if (stats.kua >= 0.1) {
    //     if (stats.kua >= 10) {
    //         stats.kua = 0.1
    //     }

    //     for (let atmps = 0; atmps < 10 && stats.kua >= 0.1; atmps++) {
    //         stats.kua -= 0.1

    //         let obj = {
    //             type: 1, 
    //             dir: (Math.round(Math.random()) - 0.5) * 2,
    //             y: Math.random() * 60,
    //             maxLife: 2.0 + 1.5 * Math.random(),
    //             size: 12 + 8 * Math.random(),
    //             defGhost: 32 + 32 * Math.random()
    //         }

    //         obj.life = obj.maxLife kuaGain
    //         obj.x = obj.dir === 1 ? element.getBoundingClientRect().x
    
    //         particles.push(obj)
    //     }
    // }

    for (let i = 0; i < particles.length; i++) {
        switch (particles[i].type) {
            case 0:
                particles[i].life -= gameVars.delta
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                    break;
                }
                particles[i].x += gameVars.delta * (particles[i].dir * (particles[i].life + 1)) * ((1 + 2 * Math.random()) / 3) * 100;
                particles[i].y += gameVars.delta * (4 * (Math.random() - 0.5));
                particles[i].y = lerp(1 - (0.75 ** gameVars.delta), particles[i].y, 30);

                pen.beginPath();
                let alpha = particles[i].defGhost * particles[i].life / particles[i].maxLife;
                pen.fillStyle = `hsla(0, 100%, 100%, ${alpha / 255})`;

                pen.arc(particles[i].x,
                    particles[i].y,
                    particles[i].size,
                    0,
                    2 * Math.PI);
                pen.fill();
                break;
            default:
                throw new Error(`Particle type ${particles[i].type} is not a valid type :c`);
        }
        // dots[i][4] += Math.random() - 0.5;
        // dots[i][5] += Math.random() - 0.5;
        // dots[i][4] = lerp(1 - (0.9 ** delta), dots[i][4], 0);
        // dots[i][5] = lerp(1 - (0.9 ** delta), dots[i][5], 0);
        // dots[i][1] += dots[i][3] * delta * dots[i][4];
        // dots[i][2] += dots[i][3] * delta * dots[i][5];

        // pen.beginPath();
        // let alpha;
        // if (dots[i][0] === 0) {
        //     alpha = 20 + (4 * Math.cos((sessionTime + 11 * i) / 50));
        // } else {
        //     alpha = 160 + (64 * Math.cos((sessionTime + 11 * i) / 50));
        // }
        // pen.fillStyle = `hsla(${sessionTime + (i * (dots[i][0] === 0 ? 1 : 0.1))}, 100%, 50%, ${alpha / 255})`;
        // let j = Math.cos((sessionTime * dots[i][3] + i) / (2 * Math.PI));
        // pen.arc((Math.abs(dots[i][1] % 3800) - 700),
        //     (Math.abs(dots[i][2] % 2400) - 700),
        //     dots[i][0] == 0 ? (300 + 100 * j) : (10 + 4 * j),
        //     0,
        //     2 * Math.PI);
        // pen.fill();
    }
}