import {Component, Entity, LagomType, MathUtil, Scene, System} from "lagom-engine";
import {GAME_HEIGHT, GAME_WIDTH, EARTH_X, EARTH_Y} from "../LD50";
import {Asteroid} from "../Physics";

export class GameManager extends Entity {
    onAdded() {
        super.onAdded();

        this.addComponent(new GameData());
    }
}

const asteroidSpawnRate = 5000;

export class GameData extends Component {
    public elapsedTime = 0;
    public msUntilNextAsteroid = asteroidSpawnRate;
}

export class GameManagerSystem extends System<[GameData]> {
    types(): LagomType<Component>[] {
        return [GameData];
    }

    onAdded() {
        super.onAdded();
    }

    update(delta: number): void {

        this.runOnEntities((entity, gameData) => {

            gameData.elapsedTime += delta;

            gameData.msUntilNextAsteroid -= delta;
            if (gameData.msUntilNextAsteroid <= 0) {
                this.spawnAsteroid(this.getScene());
                gameData.msUntilNextAsteroid = asteroidSpawnRate;
            }
        });
    }

    private buffer = 0;

    private spawnAsteroid(scene: Scene) {
        const side = Math.floor(Math.random() * 4);
        let x: number;
        let y: number;

        if (side == 0) {
            x = Math.floor(Math.random() * GAME_WIDTH);
            y = -this.buffer;
        } else if (side == 1) {
            x = Math.floor(Math.random() * GAME_WIDTH);
            y = GAME_HEIGHT + this.buffer;
        } else if (side == 2) {
            x = -this.buffer;
            y = Math.floor(Math.random() * GAME_HEIGHT);
        } else {
            x = GAME_WIDTH + this.buffer;
            y = Math.floor(Math.random() * GAME_HEIGHT);
        }

        // 1 - 3
        const radius = 2 + Math.floor(Math.random() * 4);
        const linearDrag = Math.random() * 0.00001;
        // const speed = Math.random() * 0.01;
        const speed = 0.005;

        const variance = ((Math.random() * Math.PI/2) - Math.PI/4);
        const angleToEarth = MathUtil.pointDirection(x, y, EARTH_X, EARTH_Y) + variance;
        const dir = MathUtil.lengthDirXY(speed, -angleToEarth);
        const asteroid = new Asteroid(x, y, radius, dir, linearDrag);

        scene.addEntity(asteroid);
    }
}
