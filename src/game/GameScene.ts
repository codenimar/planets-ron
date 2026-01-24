import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private planets: Phaser.GameObjects.Image[] = [];
  private stars: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000428');

    // Create starfield
    this.stars = this.add.graphics();
    this.createStarfield();

    // Create planets with different colors and orbits
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Sun (center)
    const sun = this.add.circle(centerX, centerY, 40, 0xffaa00);
    sun.setStrokeStyle(2, 0xff6600);

    // Create orbiting planets
    this.createPlanet(centerX, centerY, 80, 15, 0x4a90e2, 2);
    this.createPlanet(centerX, centerY, 130, 12, 0xe74c3c, 3);
    this.createPlanet(centerX, centerY, 180, 20, 0x2ecc71, 4);
    this.createPlanet(centerX, centerY, 240, 18, 0xf39c12, 5);

    // Add text
    const titleText = this.add.text(
      centerX,
      30,
      'Planets Ron - Solar System',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    );
    titleText.setOrigin(0.5);

    // Add instruction text
    const instructionText = this.add.text(
      centerX,
      this.cameras.main.height - 30,
      'Connect your wallet to interact',
      {
        fontSize: '16px',
        color: '#cccccc',
      }
    );
    instructionText.setOrigin(0.5);
  }

  createStarfield() {
    if (!this.stars) return;

    this.stars.clear();
    this.stars.fillStyle(0xffffff, 1);

    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const size = Phaser.Math.Between(1, 2);
      this.stars.fillCircle(x, y, size);
    }
  }

  createPlanet(
    centerX: number,
    centerY: number,
    orbitRadius: number,
    planetSize: number,
    color: number,
    speed: number
  ) {
    const angle = Phaser.Math.Between(0, 360);
    const radians = Phaser.Math.DegToRad(angle);
    const x = centerX + Math.cos(radians) * orbitRadius;
    const y = centerY + Math.sin(radians) * orbitRadius;

    const planet = this.add.circle(x, y, planetSize, color);
    planet.setStrokeStyle(1, 0xffffff, 0.5);
    this.planets.push(planet as any);

    // Create orbit circle
    const orbit = this.add.circle(centerX, centerY, orbitRadius);
    orbit.setStrokeStyle(1, 0xffffff, 0.2);
    orbit.setFillStyle(0x000000, 0);

    // Animate planet orbit
    this.tweens.add({
      targets: planet,
      angle: 360,
      duration: speed * 1000,
      repeat: -1,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentAngle = progress * Math.PI * 2;
        planet.x = centerX + Math.cos(currentAngle + radians) * orbitRadius;
        planet.y = centerY + Math.sin(currentAngle + radians) * orbitRadius;
      },
    });
  }

  update() {
    // Animation handled by tweens
  }
}
