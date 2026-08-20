export type WeatherState = 'storm' | 'rain' | 'clear';

export class RealisticRainEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  
  private drops: RainDrop[] = [];
  private splashes: SplashParticle[] = [];
  private impactRings: ImpactRing[] = [];
  
  private waterBeads: WaterBead[] = [];
  
  // Interactive variables
  public weather: WeatherState = 'storm';
  public targetWindX: number = 0;
  private currentWindX: number = 0;
  private lightningIntensity: number = 0;
  
  private animationFrameId: number = 0;
  private isRunning: boolean = false;  
  public theme: 'light' | 'dark' = 'dark';

  // Roof polygon for accurate collisions (hydrophobic surface)
  private roofPolygon: Point[] = [];
  
  // Shield definitions (Dome shape in center)
  private shieldCenter = { x: 0, y: 0 };
  private shieldRadius = 250;
  private shieldHeightRatio = 0.55; // Ellipse squish factor
  
  private activationProgress = 0.0; // Grows from 0 to 1 on load
  
  // Visuals
  private shieldOpacity = 0.6; // Base opacity for the dome

  // Story state
  public currentPhase: number = 5; // Default to final state
  private rainIntensityMultiplier: number = 1.0;

  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    
    if (canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement);
    }
    
    this.initDrops(200);
  }
  
  private resize() {
    // Get actual pixel dimensions of the parent container
    const parent = this.canvas.parentElement;
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;
    } else {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    
    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    // Exact alignment with the SVG 3D block
    const isMobile = this.width < 768;
    const svgScale = isMobile ? (450 / 600) : 1; // Assuming desktop is 600px width for 500 viewBox
    
    // The SVG is perfectly centered in the container via flex, with a -translate-y-12
    const svgHeight = 400 * svgScale;
    const svgTop = (this.height - svgHeight) / 2 - 48; // -48px is -translate-y-12
    
    // Map the 4 points of the isometric roof top face into canvas coordinates
    const originX = this.width / 2;
    const originY = svgTop + 80 * svgScale;

    this.roofPolygon = [
      { x: originX, y: originY - 20 * svgScale },                   // Top point
      { x: originX + 180 * svgScale, y: originY + 50 * svgScale },  // Right point
      { x: originX, y: originY + 120 * svgScale },                  // Bottom point
      { x: originX - 180 * svgScale, y: originY + 50 * svgScale }   // Left point
    ];
    
    // Dome center
    this.shieldCenter = { 
      x: this.width / 2, 
      y: svgTop + 110 * svgScale 
    };
    this.shieldRadius = 215 * svgScale;
  }
  
  private initDrops(count: number) {
    this.drops = [];
    for (let i = 0; i < count; i++) {
      this.drops.push(this.createDrop(true));
    }
  }
  
  private createDrop(randomY = false): RainDrop {
    const depth = Math.random(); // 0 to 1
    // Parallax effect: drops closer to viewer (depth closer to 1) fall faster and are thicker/more opaque
    const speed = 10 + depth * 15; 
    return {
      x: Math.random() * (this.width + 1000) - 500, // Spawn wider to account for wind
      y: randomY ? Math.random() * this.height : -Math.random() * 200,
      z: depth,
      speed: speed,
      length: speed * 1.5,
      opacity: 0.1 + depth * 0.4
    };
  }

  private createSplashes(x: number, y: number, depth: number, onShield: boolean) {
    const numSplashes = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numSplashes; i++) {
      this.splashes.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4 + (this.currentWindX * 0.5), // inherit some wind
        vy: -Math.random() * 3 - 2,
        life: 1.0,
        size: (Math.random() * 1.5 + 0.5) * (depth + 0.5)
      });
    }
    
    if (onShield) {
      // Create impact ring on the shield
      this.impactRings.push({
        x: x,
        y: y,
        life: 1.0,
        radius: 0,
        maxRadius: 10 + Math.random() * 15
      });
    }
  }
  
  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }
  
  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize.bind(this));
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  
  private checkShieldCollision(drop: RainDrop): boolean {
    if (this.currentPhase !== 5) return false;
    
    const activeRadius = this.shieldRadius * this.activationProgress;
    const dx = drop.x - this.shieldCenter.x;
    const dy = (drop.y - this.shieldCenter.y) / this.shieldHeightRatio;
    
    if (drop.y < this.shieldCenter.y + 20) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < activeRadius) {
        return true; // Hit the dome!
      }
    }
    return false;
  }
  
  private checkRoofCollision(x: number, y: number): boolean {
    // Point in polygon (Ray casting algorithm)
    let isInside = false;
    for (let i = 0, j = this.roofPolygon.length - 1; i < this.roofPolygon.length; j = i++) {
      const xi = this.roofPolygon[i].x, yi = this.roofPolygon[i].y;
      const xj = this.roofPolygon[j].x, yj = this.roofPolygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  }

  private createWaterBead(x: number, y: number) {
    this.waterBeads.push({
      x: x,
      y: y,
      vx: this.currentWindX * 0.1 + (Math.random() - 0.5) * 0.5,
      vy: 1.5 + Math.random(), // Flows down the slope
      life: 1.0,
      size: Math.random() * 2 + 1
    });
    // Make the roof flash slightly to show the hydrophobic coating working
    this.shieldOpacity = Math.min(this.shieldOpacity + 0.1, 1.0);
  }
  
  private loop() {
    if (!this.isRunning) return;
    
    // Manage state transitions
    if (this.currentPhase === 5) {
      this.activationProgress += 0.015;
      if (this.activationProgress > 1.0) this.activationProgress = 1.0;
    } else {
      this.activationProgress -= 0.03;
      if (this.activationProgress < 0.0) this.activationProgress = 0.0;
    }

    // Dynamic rain intensity based on weather state
    let targetIntensity = 1.0;
    if (this.weather === 'clear') targetIntensity = 0.0;
    else if (this.weather === 'rain') targetIntensity = 0.4;
    else if (this.weather === 'storm') targetIntensity = 1.0;
    
    this.rainIntensityMultiplier += (targetIntensity - this.rainIntensityMultiplier) * 0.05;

    // Pulse opacity during activation
    if (this.currentPhase === 5) {
      this.shieldOpacity = 0.6 + Math.sin(this.activationProgress * Math.PI * 4) * 0.3;
    }
    
    // Lerp wind for smooth transitions
    this.currentWindX += (this.targetWindX - this.currentWindX) * 0.05;
    
    // Random Lightning logic (less during phase 3/4)
    if (Math.random() < (targetIntensity * 0.003)) {
      this.lightningIntensity = 1.0;
    }
    this.lightningIntensity *= 0.92; // Fade out quickly
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw lightning flash background overlay if active
    if (this.lightningIntensity > 0.05) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningIntensity * 0.15})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
    
    this.ctx.save();
      
      // === DOME RENDERING (Only visible when progress > 0) ===
      if (this.activationProgress > 0.01) {
        const activeRadius = this.shieldRadius * this.activationProgress;
        const activeOpacity = this.shieldOpacity * this.activationProgress;
        const lightningGlow = this.lightningIntensity * 20;

        // 1. Subtle 3D Fill (Emerald to Blue)
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius, activeRadius * this.shieldHeightRatio, 0, Math.PI, 0, false);
        this.ctx.lineTo(this.shieldCenter.x - activeRadius, this.shieldCenter.y);
        
        const gradient = this.ctx.createRadialGradient(
          this.shieldCenter.x, this.shieldCenter.y - (activeRadius * 0.1), 0,
          this.shieldCenter.x, this.shieldCenter.y, activeRadius
        );
        // Mix of Emerald Green (16, 185, 129) and Blue (40, 90, 138)
        gradient.addColorStop(0, `rgba(16, 185, 129, ${0.05 * activeOpacity})`); 
        gradient.addColorStop(0.6, `rgba(40, 90, 138, ${0.15 * activeOpacity})`);
        gradient.addColorStop(0.9, `rgba(16, 185, 129, ${0.35 * activeOpacity})`); 
        gradient.addColorStop(1, `rgba(40, 90, 138, ${0.6 * activeOpacity})`); 
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // 1.5 Sci-Fi Glass Geometry (Meridian Lines)
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = `rgba(16, 185, 129, ${0.2 * activeOpacity})`; 
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius * 0.3, activeRadius * this.shieldHeightRatio, 0, Math.PI, 0, false);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius * 0.7, activeRadius * this.shieldHeightRatio, 0, Math.PI, 0, false);
        this.ctx.stroke();

        // 1.6 Glass Specular Highlight (Subtle)
        this.ctx.shadowBlur = 5 + lightningGlow;
        this.ctx.shadowColor = `rgba(255, 255, 255, ${0.5 * activeOpacity + this.lightningIntensity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x - 10, this.shieldCenter.y - 10, activeRadius * 0.85, activeRadius * this.shieldHeightRatio * 0.85, -0.1, Math.PI * 1.1, Math.PI * 1.4, false);
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        
        const highlightGrad = this.ctx.createLinearGradient(this.shieldCenter.x - activeRadius, this.shieldCenter.y - activeRadius, this.shieldCenter.x, this.shieldCenter.y);
        highlightGrad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * activeOpacity})`); 
        highlightGrad.addColorStop(1, `rgba(255, 255, 255, 0.0)`); 
        
        this.ctx.strokeStyle = highlightGrad;
        this.ctx.stroke();

        // 1.7 Fresnel Inner Edge
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius * 0.95, activeRadius * this.shieldHeightRatio * 0.95, 0, Math.PI, 0, false);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = `rgba(16, 185, 129, ${0.2 * activeOpacity})`; 
        this.ctx.stroke();

        // 2. Glowing arch (blur effect) - Reacts to lightning
        this.ctx.shadowBlur = 10 + lightningGlow;
        this.ctx.shadowColor = `rgba(40, 90, 138, ${activeOpacity + this.lightningIntensity})`;

        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius, activeRadius * this.shieldHeightRatio, 0, Math.PI, 0, false);
        this.ctx.lineWidth = 4; 
        this.ctx.strokeStyle = `rgba(16, 185, 129, ${activeOpacity})`;
        this.ctx.stroke();

        // 3. 3D Base Ring
        this.ctx.shadowBlur = 0; 
        this.ctx.beginPath();
        this.ctx.ellipse(this.shieldCenter.x, this.shieldCenter.y, activeRadius, activeRadius * this.shieldHeightRatio, 0, 0, Math.PI * 2, false);
        this.ctx.lineWidth = 1; 
        this.ctx.strokeStyle = `rgba(40, 90, 138, ${0.4 * activeOpacity})`; 
        this.ctx.stroke();
      }
      this.ctx.restore();
    
      // Update and Draw Drops
      const streakMultiplier = 2.0;
      
      // Determine how many drops to draw based on intensity
      const activeDropsCount = Math.floor(this.drops.length * this.rainIntensityMultiplier);
      
    for (let i = 0; i < activeDropsCount; i++) {
      let drop = this.drops[i];
      
      drop.x += this.currentWindX * (drop.z + 0.2); // parallax wind
      drop.y += drop.speed;
      
      let collided = false;
      let onShield = false;
      
      if (drop.z > 0.4) {
        if (this.currentPhase === 5) {
          if (this.checkShieldCollision(drop)) {
            collided = true;
            onShield = true;
            this.createSplashes(drop.x, drop.y, drop.z, true);
            if (Math.random() < 0.3) {
              this.createWaterBead(drop.x, drop.y + 40); 
            }
            this.shieldOpacity = Math.min(this.shieldOpacity + 0.05, 1.0);
          }
        } else {
          // If no shield, rain hits the roof polygon directly
          if (drop.y > this.shieldCenter.y - 150 && drop.y < this.shieldCenter.y + 150) {
            if (this.checkRoofCollision(drop.x, drop.y)) {
              collided = true;
              this.createSplashes(drop.x, drop.y, drop.z, false);
            }
          }
        }
      }
      
      // Reset drop if it hits shield or goes off screen
      if (collided || drop.y > this.height + 100 || drop.x < -500 || drop.x > this.width + 500) {
        Object.assign(drop, this.createDrop());
        if (this.currentWindX > 0) {
          drop.x = Math.random() * (this.width + 500) - 500;
        } else {
          drop.x = Math.random() * (this.width + 500);
        }
      }
      
      // Draw drop (angle depends on wind)
      this.ctx.beginPath();
      this.ctx.moveTo(drop.x, drop.y);
      const windDisplacement = (this.currentWindX * (drop.z + 0.2)) * (drop.length * streakMultiplier / drop.speed);
      this.ctx.lineTo(drop.x - windDisplacement, drop.y - drop.length * streakMultiplier);
      
      const baseAlpha = drop.opacity + this.lightningIntensity * 0.5;
      this.ctx.strokeStyle = this.theme === 'light' 
        ? `rgba(100, 140, 180, ${baseAlpha * 1.5})` 
        : `rgba(150, 220, 255, ${baseAlpha})`;
      this.ctx.lineWidth = 1.5 + drop.z * 2.5;
      this.ctx.stroke();
    }
    
    // Update and Draw Splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      let s = this.splashes[i];
      
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3; // gravity
      s.life -= 0.05;
      
      if (s.life <= 0) {
        this.splashes.splice(i, 1);
        continue;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.theme === 'light'
        ? `rgba(120, 160, 200, ${s.life * 0.8 + this.lightningIntensity * 0.5})`
        : `rgba(200, 230, 255, ${s.life * 0.8 + this.lightningIntensity * 0.5})`;
      this.ctx.fill();
    }
    
    // Update and Draw Impact Rings (only when shield is active)
    for (let i = this.impactRings.length - 1; i >= 0; i--) {
      let r = this.impactRings[i];
      
      r.radius += (r.maxRadius - r.radius) * 0.15;
      r.life -= 0.03;
      
      if (r.life <= 0) {
        this.impactRings.splice(i, 1);
        continue;
      }
      
      this.ctx.beginPath();
      this.ctx.ellipse(r.x, r.y, r.radius, r.radius * this.shieldHeightRatio, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(223, 61, 82, ${r.life * 0.6})`;
      this.ctx.lineWidth = 1 + r.life;
      this.ctx.stroke();
    }
    
    // Update and Draw Hydrophobic Water Beads
    for (let i = this.waterBeads.length - 1; i >= 0; i--) {
      let b = this.waterBeads[i];
      
      b.x += b.vx;
      b.y += b.vy;
      b.vx += this.currentWindX * 0.02; 
      
      if (!this.checkRoofCollision(b.x, b.y)) {
        b.vy += 0.5; 
        b.life -= 0.05; 
      }
      
      if (b.life <= 0 || b.y > this.height) {
        this.waterBeads.splice(i, 1);
        continue;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.theme === 'light'
        ? `rgba(100, 140, 180, ${b.life * 0.8})`
        : `rgba(180, 220, 255, ${b.life * 0.8})`;
      this.ctx.shadowBlur = 2;
      this.ctx.shadowColor = this.theme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
    
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }
}

interface RainDrop {
  x: number;
  y: number;
  z: number; // depth
  speed: number;
  length: number;
  opacity: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface ImpactRing {
  x: number;
  y: number;
  life: number;
  radius: number;
  maxRadius: number;
}

interface Point {
  x: number;
  y: number;
}

interface WaterBead {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}
