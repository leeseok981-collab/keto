import * as THREE from 'three';

export class DayNightCycle {
    public worldTime: number; // 0 ~ 24000
    private sunLight: THREE.DirectionalLight;
    private ambientLight: THREE.AmbientLight;
    private sunMesh: THREE.Mesh;
    private moonMesh: THREE.Mesh;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene, initialTime: number = 6000) {
        this.scene = scene;
        this.worldTime = initialTime;

        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        // Sunlight
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 150;
        const d = 32;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.scene.add(this.sunLight);

        // Sun Visual Mesh (Yellow Box)
        const sunGeo = new THREE.BoxGeometry(8, 8, 8);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff382 });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sunMesh);

        // Moon Visual Mesh (White/Pale Blue Box)
        const moonGeo = new THREE.BoxGeometry(6, 6, 6);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xddeeff });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.scene.add(this.moonMesh);
    }

    public update(delta: number, playerPos: THREE.Vector3): void {
        // 20 minutes for a full day (24000 ticks)
        const ticksPerSecond = 20;
        this.worldTime = (this.worldTime + delta * ticksPerSecond) % 24000;

        // Angle in radians: 0 at sunrise, Math.PI / 2 at noon, Math.PI at sunset, 3 * Math.PI / 2 at midnight
        const angle = (this.worldTime / 24000) * Math.PI * 2 - Math.PI / 2;

        const distance = 80;
        const sunX = playerPos.x + Math.cos(angle) * distance;
        const sunY = playerPos.y + Math.sin(angle) * distance;
        const sunZ = playerPos.z + 10;

        this.sunMesh.position.set(sunX, sunY, sunZ);
        this.sunMesh.lookAt(playerPos);

        const moonX = playerPos.x - Math.cos(angle) * distance;
        const moonY = playerPos.y - Math.sin(angle) * distance;
        const moonZ = playerPos.z + 10;

        this.moonMesh.position.set(moonX, moonY, moonZ);
        this.moonMesh.lookAt(playerPos);

        // Calculate daylight factor (0 = night, 1 = midday)
        const sinFactor = Math.sin(angle);
        const daylight = Math.max(0, Math.min(1, (sinFactor + 0.2) / 1.2));

        // Adjust Sunlight Position & Intensity
        if (sinFactor > 0) {
            this.sunLight.position.set(sunX, sunY, sunZ);
            this.sunLight.target.position.copy(playerPos);
            this.sunLight.intensity = daylight * 1.3;
            // Warm sunrise/sunset vs bright white noon
            if (sinFactor < 0.3) {
                this.sunLight.color.setHex(0xffaa55); // Sunrise/Sunset orange
            } else {
                this.sunLight.color.setHex(0xffffff);
            }
        } else {
            // Moonlight
            this.sunLight.position.set(moonX, moonY, moonZ);
            this.sunLight.target.position.copy(playerPos);
            this.sunLight.intensity = 0.2;
            this.sunLight.color.setHex(0x5588cc);
        }

        // Ambient lighting
        this.ambientLight.intensity = 0.25 + daylight * 0.55;

        // Sky and Fog Color Transition
        const daySky = new THREE.Color(0x78a7ff);
        const sunsetSky = new THREE.Color(0xf57c42);
        const nightSky = new THREE.Color(0x0c1427);

        const currentSky = new THREE.Color();
        if (sinFactor > 0.2) {
            currentSky.copy(daySky);
        } else if (sinFactor > -0.1) {
            const t = (sinFactor + 0.1) / 0.3;
            currentSky.copy(nightSky).lerp(sunsetSky, t);
        } else {
            currentSky.copy(nightSky);
        }

        this.scene.background = currentSky;
        if (this.scene.fog) {
            this.scene.fog.color.copy(currentSky);
        }
    }

    public getTimeString(): string {
        // Convert worldTime (0..24000) to 24-hour clock (06:00 is 0 ticks)
        const totalMinutes = Math.floor((this.worldTime / 1000) * 60) + (6 * 60);
        const hours = Math.floor((totalMinutes / 60) % 24);
        const minutes = Math.floor(totalMinutes % 60);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    public isNight(): boolean {
        return this.worldTime > 13000 && this.worldTime < 23000;
    }

    public isNightTime(): boolean {
        return this.isNight();
    }

    public dispose(): void {
        this.scene.remove(this.sunLight);
        this.scene.remove(this.ambientLight);
        this.scene.remove(this.sunMesh);
        this.scene.remove(this.moonMesh);
        this.sunMesh.geometry.dispose();
        this.moonMesh.geometry.dispose();
    }
}
