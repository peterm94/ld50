import {ApplyForce, PhysicsEngine} from "./Systems/Physics";
import {
    CollisionMatrix,
    ContinuousCollisionSystem,
    DebugCollisionSystem,
    Game,
    Log,
    LogLevel,
    Scene,
    SimplePhysics,
    SpriteSheet
} from "lagom-engine";
import {RocketSelection, TypingSystem} from "./Game/RocketSelection";
import {GameManager, GameManagerSystem} from "./Global/GameManager";
import {OffScreenDestroyer} from "./Systems/OffScreenDestroyer";
import {SiloAimer} from "./Game/SiloAimer";
import earthSpr from "./Art/earth.png";
import asteroidsSpr from "./Art/asteroids.png";
import launchpadSpr from "./Art/launchpad.png";
import rocketsSpr from "./Art/rockets.png";
import {SiloShooter} from "./Game/SiloShooter";
import {OffScreenPassenger, ScoreDisplay} from "./Global/Score";
import {DestroySystem} from "./Systems/DestroyMeNextFrame";
import {RocketLoaderSystem} from "./Game/RocketLoader";
import {Earth} from "./Game/Earth";

export enum Layers
{
    Asteroid,
    Earth,
    Ship,
    Explosion,
    GUI
}

export const CANVAS_WIDTH = 426;
export const GAME_WIDTH = 426;
export const GAME_HEIGHT = 240;
export const EARTH_X = GAME_WIDTH / 2;
export const EARTH_Y = GAME_HEIGHT / 2;

// Don't reorder these :)
export enum RocketType { STARSHIP, PASSENGER, ICBM, MISSILE, NONE}


const matrix = new CollisionMatrix();
matrix.addCollision(Layers.Asteroid, Layers.Asteroid);
matrix.addCollision(Layers.Asteroid, Layers.Earth);
matrix.addCollision(Layers.Asteroid, Layers.Ship);
matrix.addCollision(Layers.Ship, Layers.Earth);
matrix.addCollision(Layers.Ship, Layers.Ship);
matrix.addCollision(Layers.Explosion, Layers.Ship);
matrix.addCollision(Layers.Explosion, Layers.Asteroid);


class MainScene extends Scene
{
    onAdded()
    {
        super.onAdded();

        // Systems first
        this.addSystem(new PhysicsEngine());
        this.addSystem(new SimplePhysics());
        this.addSystem(new GameManagerSystem());
        this.addSystem(new ApplyForce());
        this.addSystem(new OffScreenDestroyer());
        this.addSystem(new DestroySystem());
        this.addSystem(new RocketLoaderSystem());
        this.addSystem(new OffScreenPassenger());
        const collSystem = this.addGlobalSystem(new ContinuousCollisionSystem(matrix));

        this.addSystem(new SiloAimer());
        this.addSystem(new SiloShooter());

        if (LD50.debug)
        {
            this.addGlobalSystem(new DebugCollisionSystem(collSystem));
        }

        this.addGlobalSystem(new TypingSystem());

        this.addEntity(new Earth("earth", 213, 120));
        this.addEntity(new GameManager("Game Manager"));
        this.addEntity(new ScoreDisplay("Score Display", 0, 0, Layers.GUI));

        this.addGUIEntity(new RocketSelection(0, this.camera.height - 60, Layers.GUI));
    }
}

export class LD50 extends Game
{
    static debug = true;

    constructor()
    {
        super({width: CANVAS_WIDTH, height: GAME_HEIGHT, resolution: 3, backgroundColor: 0x130026});

        // TODO enable this before deploy
        // Log.logLevel = LogLevel.ERROR;
        Log.logLevel = LogLevel.ALL;

        this.addResource("earth", new SpriteSheet(earthSpr, 64, 64));
        this.addResource("asteroids", new SpriteSheet(asteroidsSpr, 16, 16));
        this.addResource("launchpad", new SpriteSheet(launchpadSpr, 18, 23));
        this.addResource("rockets", new SpriteSheet(rocketsSpr, 32, 32));

        this.setScene(new MainScene(this));

    }
}

