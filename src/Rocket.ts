import {
    BodyType,
    CircleCollider,
    CollisionSystem,
    Component,
    Entity,
    Game,
    Log,
    MathUtil,
    RenderCircle,
    Rigidbody,
    SimplePhysicsBody,
    Sprite,
    Timer
} from "lagom-engine";
import {Force} from "./Physics";
import {EARTH_X, EARTH_Y, Layers, RocketType} from "./LD50";
import {OffScreenDestroyable} from "./Code/OffScreenDestroyer";

const SMALL_MISSILE_RADIUS = 30;
const BIG_MISSILE_RADIUS = 50;
const SMALL_PASSENGER_COUNT = 100;
const BIG_PASSENGER_COUNT = 400;

export class PassengerShip extends Component {

    constructor(public capacity: number) {
        super();
    }
}

export class Missile extends Component {

    constructor(public explosionRadius: number) {
        super();
    }
}

export class Rocket extends Entity {

    constructor(x: number, y: number, readonly speed: number, readonly rocketType: RocketType)
    {
        super("rocket", x, y);
    }

    onAdded()
    {
        super.onAdded();

        if (this.rocketType == RocketType.MISSILE) {
            this.addComponent(new Missile(SMALL_MISSILE_RADIUS));
            this.addComponent(new OffScreenDestroyable());
        } else if (this.rocketType == RocketType.ICBM) {
            this.addComponent(new Missile(BIG_MISSILE_RADIUS));
            this.addComponent(new OffScreenDestroyable());
        } else if (this.rocketType == RocketType.PASSENGER) {
            this.addComponent(new PassengerShip(SMALL_PASSENGER_COUNT));
        } else if (this.rocketType == RocketType.STARSHIP) {
            this.addComponent(new PassengerShip(BIG_PASSENGER_COUNT));
        }

        const mousePos = this.scene.camera.viewToWorld(Game.mouse.getPosX(), Game.mouse.getPosY());
        const direction = MathUtil.pointDirection(EARTH_X, EARTH_Y,
            mousePos.x, mousePos.y);
        const velocity = MathUtil.lengthDirXY(0.1, -direction);

        // this.addComponent(new RenderCircle(0, 0, 5, 0x0000AA, 0xAA00FF));
        this.addComponent(new Rigidbody(BodyType.Discrete));
        this.addComponent(new Force(velocity));
        this.addComponent(new SimplePhysicsBody({angDrag: 0, linDrag: 0}));
        // TODO change the 3 to the rocketType
        const texture = this.getScene().game.getResource("rockets").texture(3, 0);
        this.addComponent(new Sprite(texture, {xAnchor: 0.5, yAnchor: 0.5, rotation: -direction + MathUtil.degToRad(90)}));

        const coll = this.addComponent(new CircleCollider(this.getScene().getGlobalSystem(CollisionSystem) as CollisionSystem, {
            layer: Layers.Ship,
            radius: 5,
            xOff: 0,
            yOff: 0
        }));
    }
}
