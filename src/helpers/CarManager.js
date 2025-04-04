import * as THREE from 'three';

class CarManager {
    constructor(pathPoints, tileWidth, tileHeight, tileType, maxCarCount) {
        this.pathPoints = pathPoints;
        this.cars = [];
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.carLength = 0.1;
        this.safeDistance = this.carLength * 2;
        this.tileWeights = this.initializeTileWeights();
        this.fadeTime = 400;
        this.fadingCars = new Set();
        this.tileType = tileType;
        this.lastUpdateTime = Date.now();
        this.isPaused = false;
        this.maxCarCount = maxCarCount;
        this.spawnQueue = [];
        this.spawnInterval = 10000; // Time between spawns
        this.lastSpawnTime = 0;
        this.carLifespan = 12000;
    }

    setIsPaused(isPaused) {
        this.isPaused = isPaused;
    }

    getVehicleTypesForTile() {
        switch (this.tileType) {
            case 'singleFamilyHomes':
                return ['sedan', 'sedan2', 'sedan3', 'sedan4', 'sedan5', 'van', 'van2', 'van3'];
            case 'factory':
            case 'warehouse':
                return ['truck', 'truck2', 'truck3'];
            case 'apartmentComplex':
                return ['sedan', 'sedan2', 'sedan3', 'sedan4', 'sedan5', 'van', 'van2', 'van3', 'truck', 'truck2', 'truck3'];
            case 'hotels':
                return ['sedan', 'sedan2', 'van', 'truck'];
            default:
                return ['sedan', 'sedan2', 'sedan3', 'sedan4', 'sedan5', 'van', 'van2', 'van3', 'truck', 'truck2', 'truck3'];
        }
    }

    initializeTileWeights() {
        return this.pathPoints.map(() => Math.random());
    }

    addToSpawnQueue() {
        const types = this.getVehicleTypesForTile();
        const type = types[Math.floor(Math.random() * types.length)];
        this.spawnQueue.push(type);
    }

    spawnFromQueue() {
        if (this.spawnQueue.length > 0 && this.cars.length < this.maxCarCount) {
            const type = this.spawnQueue.shift();
            this.addCar(type);
        }
    }

    updateSpawnQueue(currentTime) {
        // Adjust spawn interval based on maxCarCount
        const adjustedSpawnInterval = this.spawnInterval * (1 / Math.sqrt(this.maxCarCount));

        if (currentTime - this.lastSpawnTime >= adjustedSpawnInterval) {
            // Only spawn if random check passes
            if (Math.random() < this.maxCarCount / 20) { // Adjust this ratio as needed
                this.spawnFromQueue();
                this.lastSpawnTime = currentTime;
            }
        }

        // Add to queue if needed
        if (this.spawnQueue.length + this.cars.length < this.maxCarCount) {
            this.addToSpawnQueue();
        }
    }


    addCar(type) {
        const segmentIndex = this.getWeightedRandomTileIndex();
        const nextSegmentIndex = (segmentIndex + 1) % this.pathPoints.length;
        const initialDirection = this.getDirection(segmentIndex, nextSegmentIndex);

        const newCar = {
            segmentIndex: segmentIndex,
            progress: Math.random(),
            direction: initialDirection,
            speed: 0.12,
            maxSpeed: 0.22,
            type: type,
            opacity: 0,
            fading: 'in',
            creationTime: Date.now()
        };

        this.cars.push(newCar);
        this.fadingCars.add(newCar);
    }

    removeCar(car) {
        car.fading = 'out';
        this.fadingCars.add(car);
    }

    getWeightedRandomTileIndex() {
        const totalWeight = this.tileWeights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < this.tileWeights.length; i++) {
            random -= this.tileWeights[i];
            if (random <= 0) {
                return i;
            }
        }
        return this.tileWeights.length - 1; // Fallback
    }


    updateCars(delta) {
        if (this.isPaused) return;

        const currentTime = Date.now();
        this.updateSpawnQueue(currentTime);

        const carsToRemove = [];

        for (const car of this.cars) {
            // Check if car has exceeded its lifespan
            if (currentTime - car.creationTime > this.carLifespan) {
                this.removeCar(car);
            }

            // Update car position
            const deltaSpeed = car.speed * delta;
            car.progress += deltaSpeed;

            if (car.progress >= 1) {
                car.progress -= 1;
                car.segmentIndex = (car.segmentIndex + 1) % this.pathPoints.length;
                car.direction = this.getDirection(car.segmentIndex, (car.segmentIndex + 1) % this.pathPoints.length);
            }

            // Adjust speed based on proximity to other cars
            car.speed = this.adjustSpeed(car);

            // Handle fading
            if (this.fadingCars.has(car)) {
                if (car.fading === 'in' && car.opacity < 1) {
                    car.opacity = Math.min(1, car.opacity + delta * 1000 / this.fadeTime);
                    if (car.opacity === 1) {
                        this.fadingCars.delete(car);
                    }
                } else if (car.fading === 'out') {
                    car.opacity = Math.max(0, car.opacity - delta * 1000 / this.fadeTime);
                    if (car.opacity === 0) {
                        this.fadingCars.delete(car);
                        carsToRemove.push(car);
                    }
                }
            }
        }

        // Remove cars that have fully faded out
        for (const car of carsToRemove) {
            const index = this.cars.indexOf(car);
            if (index !== -1) {
                this.cars.splice(index, 1);
            }
        }
    }

    selectCarForRemoval() {
        const candidateCars = this.cars.filter(car => !this.fadingCars.has(car));
        return candidateCars[Math.floor(Math.random() * candidateCars.length)];
    }

    adjustSpeed(car) {
        const carPosition = this.getCarPosition(car);
        let minDistance = Infinity;
        let carInFront = null;

        for (const otherCar of this.cars) {
            if (otherCar === car) continue;

            const otherCarPosition = this.getCarPosition(otherCar);
            const distance = carPosition.distanceTo(otherCarPosition);

            if (distance < minDistance && this.isCarInFront(car, otherCar)) {
                minDistance = distance;
                carInFront = otherCar;
            }
        }

        if (carInFront && minDistance < this.safeDistance) {
            const speedFactor = Math.min(minDistance / this.safeDistance, 1);
            return Math.min(carInFront.speed, car.maxSpeed * speedFactor);
        } else {
            return car.maxSpeed;
        }
    }

    getCarPosition(car) {
        const currentPoint = new THREE.Vector3(...this.pathPoints[car.segmentIndex]);
        const nextPoint = new THREE.Vector3(...this.pathPoints[(car.segmentIndex + 1) % this.pathPoints.length]);
        return currentPoint.lerp(nextPoint, car.progress);
    }

    isCarInFront(currentCar, otherCar) {
        const currentCarPosition = this.getCarPosition(currentCar);
        const otherCarPosition = this.getCarPosition(otherCar);

        switch (currentCar.direction) {
            case 'N':
                return otherCarPosition.z < currentCarPosition.z;
            case 'E':
                return otherCarPosition.x > currentCarPosition.x;
            case 'S':
                return otherCarPosition.z > currentCarPosition.z;
            case 'W':
                return otherCarPosition.x < currentCarPosition.x;
            default:
                return false;
        }
    }

    getDirection(currentIndex, nextIndex) {
        const current = new THREE.Vector3(...this.pathPoints[currentIndex]);
        const next = new THREE.Vector3(...this.pathPoints[nextIndex]);
        const diff = next.sub(current);

        if (diff.x > 0 && diff.z < 0) return 'N';
        if (diff.x > 0 && diff.z > 0) return 'E';
        if (diff.x < 0 && diff.z > 0) return 'S';
        if (diff.x < 0 && diff.z < 0) return 'W';

        return Math.abs(diff.x) > Math.abs(diff.z) ? (diff.x > 0 ? 'E' : 'W') : (diff.z > 0 ? 'S' : 'N');
    }

    getCars() {
        return this.cars;
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

export default CarManager;