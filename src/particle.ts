import {vec3, vec4} from 'gl-matrix';
import {gl} from './globals';

export default class Particles {

    curr_positions : Array<vec3>;
    curr_velocity : Array<vec3>;

    prev_positions : Array<vec3>;
    prev_velocity : Array<vec3>;

    offset : Array<vec3>;
    color : Array<vec4>;

    acceleration : Array<vec3>;

    mass : Array<number>;
    id : Array<number>;

    numPar : number; 

    constructor(numPar : number) {
        this.numPar = numPar;

        for(var i = 0; i < numPar; ++i) {
            var rand1 = Math.random();
            var rand2 = Math.random();

            this.curr_positions.push(vec3.fromValues(rand2, rand2, rand2));
            this.curr_velocity.push(vec3.fromValues(1,1,1)); 
            
            this.prev_positions.push(vec3.fromValues(rand1, rand1, rand1)); 
            this.prev_velocity.push(vec3.fromValues(1,1,1)); 
            
            this.offset.push(vec3.fromValues(1,1,1));
            this.color.push(vec4.fromValues(rand1/255, rand1/255, rand1/255, 1));
            
            this.acceleration.push(vec3.fromValues(1,1,1));
            this.mass.push(2.0);
            this.id.push(i);
        } 
    }

    //update with Verlet
    update(dt: number) {
        for(var i = 0; i < this.numPar; ++i) {
            var newPos = vec3.create();
            var subPos = vec3.create();
            var posTerm = vec3.create();
            var accelTerm = vec3.create();

            //p - p* (current - prev)
            vec3.subtract(subPos, this.curr_positions[i], this.prev_positions[i]);
            //p + (p - p*)
            vec3.add(posTerm, this.curr_positions[i], subPos);
            //a * (dt^2)
            var dt2 = dt * dt; 
            vec3.scale(accelTerm, this.acceleration[i], dt2);
            //p' = p + (p - p*) + a*(dt^2)
            vec3.add(newPos, posTerm, accelTerm);

            //update prev and current positions
            this.prev_positions[i] = this.curr_positions[i];
            this.curr_positions[i] = newPos;

            if(dt % 10) {
                var dist = vec3.dist(this.curr_positions[i], vec3.fromValues(0,0,0));
                var vec3color = this.colorGen(dist);
                this.color[i] = vec4.fromValues(vec3color[0], vec3color[1], vec3color[2], 1.0);
            }
        }
    }

    colorGen(t : number) : vec3 {
        var a = vec3.fromValues(0.658, 0.088, 0.138);
        var b = vec3.fromValues(3.138, 2.338, 1.558);
        var c = vec3.fromValues(1.778, 0.488, 0.666);
        var d = vec3.fromValues(0.00, 0.33, 0.67);

        var scale = vec3.create();
        var addCTD = vec3.create();
        var scale2Pi = vec3.create();

        vec3.scale(scale, c, t);
        vec3.add(addCTD, scale, d);
        vec3.scale(scale2Pi, addCTD, 2.0 * 3.1415);

        var cosVec = vec3.fromValues(Math.cos(scale2Pi[0]), Math.cos(scale2Pi[1]), Math.cos(scale2Pi[2]));
        
        var bCos = vec3.create();
        vec3.mul(bCos, b, cosVec);
        
        var toReturn = vec3.create();
        vec3.add(toReturn, a, bCos);
        
        return toReturn;
    }

    // updates the acceleration
   applyForce(f: vec3)
   {
       for(var i = 0; i < this.numPar; ++i) {
            var newAcc = vec3.create();
            vec3.scale(newAcc, f, 1 / this.mass[i]);
            this.acceleration[i] = newAcc;
       }
   }
}

