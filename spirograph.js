/*
 * spirograph.js
 */

const MODUL = 1;
const TEETH_LENGTH = Math.PI * MODUL;

class GearWheel {
    /**
     * Constructs a GearWheel that can be used as stator or rotator
     * 
     * @param {Number} teeth Number of teeth
     * @param {Number} excenter Distance from the center in mm 
     */
    constructor(teeth, excenter) {
        this.teeth = teeth;
        this.excenter = excenter;
    }

    /** 
     * Calculate the tooth pose of tooth n.
     *
     * The tooth pos consists of the position of the tooth and its angle.
     * This mehtod has to be overriden by subclasses.
     */
    toothPose(n) {
        return { x: 0, y:0, alpha: 0};
    }

    /**
     * Calculates the center position of the gearwheel at a teeth position pose at step n
     * 
     * @param {Pose} pose Pose of the teeth
     * @param {Number} n Step
     */
    center(pose1, n) {
        const pose2 = this.toothPose(n);
        const alpha = pose1.alpha + pose2.alpha;
        return {
            x: pose1.x - pose2.x * Math.cos(alpha) + pose2.y * Math.sin(alpha),
            y: pose1.y + pose2.x * Math.sin(alpha) + pose2.y * Math.cos(alpha)
        }
    }

    excenterPos(pose1, n) {
        const pose2 = this.toothPose(n);
        const alpha = pose1.alpha + pose2.alpha;
        const c = this.center(pose1, n);
        return {
            x: c.x + this.excenter * Math.sin(alpha),
            y: c.y + this.excenter * Math.cos(alpha)
        }
    }
}

class Spirograph {
    /**
     * Constructs a new Spirograph object
     * @param {GearWheel} stator Stator of the spirograph
     * @param {GearWheel} rotator Rotator of the spirograph 
     * @param {Number} offset Number of teeth the rotator is offseted 
     */
    constructor(stator, rotator, offset = 0) {
        this.stator = stator;
        this.rotator = rotator;
        this.offset = offset;
    }

    /* Returns the pen position of step */
    penPosition(step) {
        //return this.rotator.penPosition(step, this.stator.rotatorPosition(step), this.stator.angle(step));
        return this.rotator.excenterPos(this.stator.toothPose(step), step + this.offset);
    }

    /* Returns the center position of the rotator at step */
    rotatorPosition(step) {
        // return this.rotator.centerPosition(step, this.stator.rotatorPosition(step), this.stator.angle(step));
        return this.rotator.center(this.stator.toothPose(step), step + this.offset);
    }

    /* Returns all points of the spirograph */
    points() {
        const N = this.stepCount();
        let result = new Array(N);
        for (let i = 0; i < N; i++) result[i] = this.penPosition(i);
        return result;
    }

    /* Returns the count of points */
    stepCount() {
        const rt = this.rotator.teeth;
        const st = this.stator.teeth;
        return (rt == 0) ? st : kgv(Math.abs(rt), Math.abs(st));
    }

    /* Returns the SVG path of the spirograph */
    path() {
        let point = this.penPosition(0);
        let result = `M ${point.x} ${point.y}`;
        const N = this.stepCount();
        for(let i = 1; i < N; i++) {
            point = this.penPosition(i);
            result += ` L ${point.x} ${point.y}`;
        }
        result += " Z";
        return result;
    }

    updatePathOf(pathElement) {
        pathElement.setAttribute("d", this.path());
    }
}

class CircularGearWheel extends GearWheel {
    constructor(teeth, excenter = 0) {
        super(teeth, excenter);
    }

    radius() {
        return this.teeth * TEETH_LENGTH / (2 * Math.PI);
    }
    
    angle(step) {
        return (this.teeth == 0) ? 0 : step / this.teeth * 2 * Math.PI;
    }

    toothPose(n) {
        const r = this.radius();
        const a = this.angle(n);
        return { 
            x: r * Math.sin(a),
            y: r * Math.cos(a),
            alpha: a
        }
    }
}

function ggt(a, b) {
    if (b == 0) return 1; 
    if (a > b) return ggt(a - b, b);
    if (a < b) return ggt(a, b - a);
    return a;
}

function kgv(a, b) {
    return a * b / ggt(a, b);
}