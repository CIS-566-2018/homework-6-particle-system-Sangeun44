import {vec3, vec4} from 'gl-matrix';
import {gl} from './globals';

export default class Particle {

    curr_pos : vec3;
    curr_vel : vec3;

    prev_pos : vec3;
    prev_vel : vec3;

    offset : vec3;
    color : vec4;

    acceleration : vec3;

    mass : number;

    constructor(curr_pos : vec3, curr_vel : vec3, offset : vec3, color: vec4, acceleration : vec3, mass : number) {
        
        this.curr_pos = curr_pos
        this.curr_vel = curr_vel;
        
        this.offset = offset;
        this.color = color;
        this.acceleration = acceleration;

        this.mass = mass;

        this.prev_pos = vec3.create();
        this.prev_vel =vec3.create();
    }

    //update with Verlet
    update(dT: number) {
            var new_Pos = vec3.create();
            var subtract_Pos = vec3.create();
            var first_Term = vec3.create();
            var second_Term = vec3.create();

            //(current - prev)
            vec3.subtract(subtract_Pos, this.curr_pos, this.prev_pos);
            //current + (current - prev)
            vec3.add(first_Term, this.curr_pos, subtract_Pos);
            //accel * (time^2)
            var dT2 = dT * dT; 
            vec3.scale(second_Term, this.acceleration, dT2);
            //final position, adding 
            vec3.add(new_Pos, first_Term, second_Term);

            //update prev and current positions
            this.prev_pos = this.curr_pos;
            this.curr_pos = new_Pos;

            var dist = vec3.dist(this.curr_pos, vec3.fromValues(0,100,0));
            var colorVec = this.colorGen(dist);
            this.color = vec4.fromValues(colorVec[0], colorVec[1], colorVec[2], 1.0);
    }

    colorGen(t : number) : vec3 {
        //cosine curve
        var a = vec3.fromValues(0.658, 0.088, 0.138);
        var b = vec3.fromValues(3.138, 2.338, 1.558);
        var c = vec3.fromValues(1.778, 0.488, 0.666);
        var d = vec3.fromValues(0.00, 0.33, 0.67);

        var mult1 = vec3.create();
        var add1 = vec3.create();
        var mult2Pi = vec3.create();

        vec3.scale(mult1, c, t);
        vec3.add(add1, mult1, d);
        vec3.scale(mult2Pi, add1, 2.0 * 3.1415);

        var cosVec = vec3.fromValues(Math.cos(mult2Pi[0]), Math.cos(mult2Pi[1]), Math.cos(mult2Pi[2]));
        
        var bCos = vec3.create();
        vec3.mul(bCos, b, cosVec);
        
        var final = vec3.create();
        vec3.add(final, a, bCos);
        
        return final;
    }

    // updates the acceleration
   applyForce(force: vec3) {
        var newAcceleration = vec3.create();
        vec3.scale(newAcceleration, force, 1 / this.mass);
        this.acceleration = newAcceleration;
   }
}

