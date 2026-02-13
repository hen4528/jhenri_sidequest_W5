class WorldLevel {
  constructor(json) {
    this.schemaVersion = json.schemaVersion ?? 1;

    this.w = json.world?.w ?? 2400;
    this.h = json.world?.h ?? 1600;
    this.bg = json.world?.bg ?? [235, 235, 235];
    this.gridStep = json.world?.gridStep ?? 160;

    this.obstacles = json.obstacles ?? [];

    // NEW: camera tuning knob from JSON (data-driven)
    this.camLerp = json.camera?.lerp ?? 0.12;
    // Big square and camera zoom state
    this.bigSquare = json.bigSquare ?? { x: 800, y: 600, size: 400 };
    this.cameraZoom = 1;
    // Edge-film (out-of-bounds) defaults
    this.edgeFadeDistance = json.camera?.edgeFadeDistance ?? 160; // px from edge where film starts
    this.edgeFadeMaxAlpha = json.camera?.edgeFadeMaxAlpha ?? 160; // max alpha (0-255)
    this.edgeLerp = json.camera?.edgeLerp ?? 0.08; // smoothing for fade
    this.edgeFilmAlpha = 0; // current alpha state (0-255)
  }

  drawBackground() {
    background(220);
  }

  drawWorld() {
    noStroke();
    fill(this.bg[0], this.bg[1], this.bg[2]);
    rect(0, 0, this.w, this.h);

    stroke(245);
    for (let x = 0; x <= this.w; x += this.gridStep) line(x, 0, x, this.h);
    for (let y = 0; y <= this.h; y += this.gridStep) line(0, y, this.w, y);

    noStroke();
    fill(170, 190, 210);
    for (const o of this.obstacles) rect(o.x, o.y, o.w, o.h, o.r ?? 0);

    // Draw big square for visualization (semi-transparent)
    noStroke();
    fill(255, 0, 0, 80);
    rect(
      this.bigSquare.x,
      this.bigSquare.y,
      this.bigSquare.size,
      this.bigSquare.size,
    );
  }

  isPlayerInBigSquare(player) {
    return (
      player.x > this.bigSquare.x &&
      player.x < this.bigSquare.x + this.bigSquare.size &&
      player.y > this.bigSquare.y &&
      player.y < this.bigSquare.y + this.bigSquare.size
    );
  }

  // Compute target alpha (0..edgeFadeMaxAlpha) based on distance to closest world edge
  computeEdgeTargetAlpha(player) {
    const dl = player.x; // distance to left edge
    const dr = this.w - player.x; // right
    const dt = player.y; // top
    const db = this.h - player.y; // bottom
    const minD = min(dl, dr, dt, db);
    if (minD >= this.edgeFadeDistance) return 0;
    const t = constrain(1 - minD / this.edgeFadeDistance, 0, 1);
    return t * this.edgeFadeMaxAlpha;
  }

  // Smoothly update internal film alpha (call each frame)
  updateEdgeFilm(player) {
    const target = this.computeEdgeTargetAlpha(player);
    this.edgeFilmAlpha = lerp(this.edgeFilmAlpha ?? 0, target, this.edgeLerp);
  }

  drawHUD(player, camX, camY) {
    noStroke();
    fill(20);
    text("Example 4 — JSON world + smooth camera (lerp).", 12, 20);
    text(
      "camLerp(JSON): " +
        this.camLerp +
        "  Player: " +
        (player.x | 0) +
        "," +
        (player.y | 0) +
        "  Cam: " +
        (camX | 0) +
        "," +
        (camY | 0),
      12,
      40,
    );
  }
}
