/* global SpriteSheet */
/* global ParticleSystem */
/* global Util */
/** Renders a Grid to a canvas element */
class GridRenderer { // eslint-disable-line no-unused-vars
  /**
   * @param {number} gridWidth - The width of the grid, in tiles
   * @param {number} gridHeight - The height of the grid, in tiles
   * @param {Canvas} canvas - The canvas DOM element to render to
   */
  constructor(gridWidth, gridHeight, canvas) {
    Util.assert(arguments.length === 3);
    this.spriteSheet = new SpriteSheet(gridWidth, gridHeight, canvas.width, canvas.height);
    this.particleSystem = new ParticleSystem(canvas.width, canvas.height);
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lastPlayheadX = -1;
  }

  /**
   * Update, then draw the current state of the app to the canvas element.
   * @param {Grid} grid - The grid to be rendered
   * @param {number} mouseX - The x position of the mouse on the canvas
   * @param {number} mouseY - The y position of the mouse on the canvas
   */
  update(grid, mouseX, mouseY) {
    Util.assert(arguments.length === 3);
    this.particleSystem.update();
    this.draw(grid, mouseX, mouseY);
  }

  /**
   * Draw the current state of the app to the canvas element.
   * @private
   * @param {Grid} grid - The grid to be rendered
   * @param {number} mouseX - The x position of the mouse on the canvas
   * @param {number} mouseY - The y position of the mouse on the canvas
   */
  draw(grid, mouseX, mouseY) {
    Util.assert(arguments.length === 3);

    const playheadX = grid.instruments[grid.currentInstrument].getPlayheadX();
    const dpr = Util.getDevicePixelRatio();

    // Defaults
    this.ctx.globalAlpha = 1;
    this.ctx.filter = 'none';

    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();

    // Get particle heatmap

    const heatmap = this.getParticleHeatMap();

    const mousedOverTile = Util.pixelCoordsToTileCoords(mouseX, mouseY,
      this.gridWidth, this.gridHeight, this.canvas.width, this.canvas.height);

    // Draw each tile
    for (let i = 0; i < grid.data.length; i += 1) {
      const dx = this.canvas.width / this.gridWidth;
      const dy = this.canvas.height / this.gridHeight;
      const { x: gridx, y: gridy } = Util.indexToCoord(i, this.gridHeight);
      const x = dx * gridx;
      const y = dy * gridy;

      const on = !grid.data[i].isEmpty();

      if (grid.data[i].hasNote(1)) {
        this.ctx.filter = 'brightness(50%) sepia(100) saturate(100) hue-rotate(25deg)';
      } else {
        this.ctx.filter = 'none';
      }
      if (on) {
        if (gridx === playheadX) {
          this.ctx.globalAlpha = 1;
          this.spriteSheet.drawSprite(2, this.ctx, x, y);
          // this.spriteSheet.drawSprite(2, this.ctx, x, y);
          if (playheadX !== this.lastPlayheadX) {
            // Create particles
            this.particleSystem.createParticleBurst(
              dx * (gridx + 0.5),
              dy * (gridy + 0.5),
              8 * dpr,
              120,
            );
          }
        } else {
          this.ctx.globalAlpha = 0.85;
          this.spriteSheet.drawSprite(1, this.ctx, x, y);
        }
      } else {
        if (gridx === mousedOverTile.x && gridy === mousedOverTile.y) {
          // Highlight moused over tile
          this.ctx.globalAlpha = 0.3;
        } else {
          const BRIGHTNESS = 0.05; // max particle brightness between 0 and 1
          this.ctx.globalAlpha = ((heatmap[i] * BRIGHTNESS * (204 / 255))
              / this.particleSystem.PARTICLE_LIFETIME) + 51 / 255;
        }
        this.spriteSheet.drawSprite(0, this.ctx, x, y);
      }
    }

    // Draw particles

    if (Util.DEBUG) {
      const ps = this.particleSystem;
      for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i += 1) {
        const p = ps.particles[i];
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(p.x, p.y, 2, 2);
        // this.ctx.fillRect(p.x, p.y, 2, 2);
      }
    }

    this.lastPlayheadX = playheadX;
  }

  /**
  * Gets the "heat" of every tile by calculating how many particles are on top of the tile
  * @returns {number[]} An array of numbers from 0 to 1, representing the "heat" of each tile
  */
  getParticleHeatMap() {
    Util.assert(arguments.length === 0);
    const heatmap = Array(this.gridWidth * this.gridHeight).fill(0);
    const ps = this.particleSystem;
    for (let i = 0; i < ps.PARTICLE_POOL_SIZE; i += 1) {
      const p = ps.particles[i];
      if (p.life > 0) {
        const tile = Util.pixelCoordsToTileCoords(p.x, p.y, this.gridWidth, this.gridHeight,
          this.canvas.width, this.canvas.height);
        if (tile) heatmap[Util.coordToIndex(tile.x, tile.y, this.gridHeight)] += p.life;
      }
    }
    return heatmap;
  }
}
