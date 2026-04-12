// ========================================
// SPRITE LOADER - Load and cache character sprite sheets
// ========================================

const SpriteLoader = {
    cache: new Map(),
    loadingPromises: new Map(),

    /**
     * Load a sprite sheet image and cache it
     * @param {string} src - Path to the sprite sheet
     * @returns {Promise<HTMLImageElement>}
     */
    async load(src) {
        if (this.cache.has(src)) {
            return this.cache.get(src);
        }

        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(src, img);
                this.loadingPromises.delete(src);
                resolve(img);
            };
            img.onerror = (err) => {
                this.loadingPromises.delete(src);
                reject(err);
            };
            img.src = src;
        });

        this.loadingPromises.set(src, promise);
        return promise;
    },

    /**
     * Draw a frame from a sprite sheet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLImageElement} spriteSheet - The sprite sheet image
     * @param {number} frameIndex - Which frame to draw (0-based)
     * @param {number} frameWidth - Width of each frame
     * @param {number} frameHeight - Height of each frame
     * @param {number} x - X position to draw
     * @param {number} y - Y position to draw
     * @param {number} scale - Scale factor (default 1)
     */
    drawFrame(ctx, spriteSheet, frameIndex, frameWidth, frameHeight, x, y, scale = 1) {
        if (!spriteSheet) return;

        const cols = Math.floor(spriteSheet.width / frameWidth);
        const row = Math.floor(frameIndex / cols);
        const col = frameIndex % cols;

        const sx = col * frameWidth;
        const sy = row * frameHeight;

        ctx.drawImage(
            spriteSheet,
            sx, sy, frameWidth, frameHeight,
            x - (frameWidth * scale) / 2,
            y - (frameHeight * scale) / 2,
            frameWidth * scale,
            frameHeight * scale
        );
    }
};

// ========================================
// SPRITE ANIMATION - Manage sprite sheet animations
// ========================================

class SpriteAnimation {
    /**
     * @param {HTMLImageElement} spriteSheet - The sprite sheet image
     * @param {number} frameWidth - Width of each frame
     * @param {number} frameHeight - Height of each frame
     * @param {number} frameCount - Total number of frames
     * @param {number} frameRate - Frames per second
     * @param {boolean} isHorizontalStrip - If true, frames are in a single row
     */
    constructor(spriteSheet, frameWidth, frameHeight, frameCount, frameRate = 10, isHorizontalStrip = false) {
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.frameRate = frameRate;
        this.currentFrame = 0;
        this.elapsed = 0;
        this.loop = true;
        this.finished = false;
        this.isHorizontalStrip = isHorizontalStrip;
    }

    update(deltaTime) {
        if (this.finished && !this.loop) return;

        this.elapsed += deltaTime;
        const frameDuration = 1 / this.frameRate;

        while (this.elapsed >= frameDuration) {
            this.elapsed -= frameDuration;
            this.currentFrame++;

            if (this.currentFrame >= this.frameCount) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frameCount - 1;
                    this.finished = true;
                }
            }
        }
    }

    draw(ctx, x, y, scale = 1) {
        if (!this.spriteSheet) return;

        let sx, sy;
        
        if (this.isHorizontalStrip) {
            // Horizontal strip: frames arranged left to right in a single row
            sx = this.currentFrame * this.frameWidth;
            sy = 0;
        } else {
            // Grid layout: calculate row and column
            const cols = Math.floor(this.spriteSheet.width / this.frameWidth);
            const row = Math.floor(this.currentFrame / cols);
            const col = this.currentFrame % cols;
            sx = col * this.frameWidth;
            sy = row * this.frameHeight;
        }

        ctx.drawImage(
            this.spriteSheet,
            sx, sy, this.frameWidth, this.frameHeight,
            x - (this.frameWidth * scale) / 2,
            y - (this.frameHeight * scale) / 2,
            this.frameWidth * scale,
            this.frameHeight * scale
        );
    }

    reset() {
        this.currentFrame = 0;
        this.elapsed = 0;
        this.finished = false;
    }
}

// ========================================
// CHARACTER SPRITE MANAGER - Load and manage character sprites
// ========================================

const CharacterSpriteManager = {
    // Base paths for character assets
    basePath: 'src/assets/Characters(100x100)/',
    tinySwordPath: 'src/assets/TinySword/',

    // Loaded character data
    characters: {},

    // Frame dimensions (all sprites are 100x100 per the folder name)
    frameWidth: 100,
    frameHeight: 100,

    // Default scale for rendering (increased for better visibility)
    defaultScale: 1.2,

    /**
     * Initialize and load all character sprites
     */
    async initialize() {
        console.log('🎮 Initializing Character Sprites...');
        
        const characterConfigs = {
            // TinySword Assets (larger, better quality)
            // Warrior menggunakan Blue Warrior
            warrior: {
                folder: 'Units/Blue Units/Warrior',
                isTinySword: true,
                animations: {
                    idle: { file: 'Warrior_Idle.png', frames: 8, rate: 8 },
                    walk: { file: 'Warrior_Run.png', frames: 6, rate: 10 },
                    attack1: { file: 'Warrior_Attack1.png', frames: 8, rate: 12, loop: false },
                    attack2: { file: 'Warrior_Attack2.png', frames: 8, rate: 12, loop: false },
                    hurt: { file: 'Warrior_Guard.png', frames: 3, rate: 10, loop: false }
                }
            },
            // Orc menggunakan Red Pawn
            orc: {
                folder: 'Units/Red Units/Pawn',
                isTinySword: true,
                animations: {
                    idle: { file: 'Pawn_Idle.png', frames: 8, rate: 8 },
                    walk: { file: 'Pawn_Run.png', frames: 6, rate: 10 },
                    attack1: { file: 'Pawn_Interact Axe.png', frames: 8, rate: 12, loop: false },
                    attack2: { file: 'Pawn_Interact Hammer.png', frames: 8, rate: 12, loop: false },
                    hurt: { file: 'Pawn_Idle.png', frames: 8, rate: 8 }
                }
            },
            // Ranger menggunakan Blue Archer + Arrow effect
            ranger: {
                folder: 'Units/Blue Units/Archer',
                isTinySword: true,
                animations: {
                    idle: { file: 'Archer_Idle.png', frames: 6, rate: 8 },
                    walk: { file: 'Archer_Run.png', frames: 6, rate: 10 },
                    attack1: { file: 'Archer_Shoot.png', frames: 6, rate: 12, loop: false },
                    attack2: { file: 'Archer_Shoot.png', frames: 6, rate: 12, loop: false },
                    hurt: { file: 'Archer_Idle.png', frames: 6, rate: 8 }
                }
            },
            // Mage menggunakan Blue Monk
            mage: {
                folder: 'Units/Blue Units/Monk',
                isTinySword: true,
                animations: {
                    idle: { file: 'Idle.png', frames: 6, rate: 8 },
                    walk: { file: 'Run.png', frames: 6, rate: 10 },
                    attack1: { file: 'Heal.png', frames: 6, rate: 10, loop: false },
                    attack2: { file: 'Heal.png', frames: 6, rate: 10, loop: false },
                    hurt: { file: 'Idle.png', frames: 6, rate: 8 }
                }
            },
            // Archer Arrow Effect (untuk Ranger)
            ranger_arrow: {
                folder: 'Units/Blue Units/Archer',
                isTinySword: true,
                animations: {
                    idle: { file: 'Arrow.png', frames: 1, rate: 1 }
                }
            },
            // Blue Monk Heal Effect (untuk HP Regen)
            monk_heal: {
                folder: 'Units/Blue Units/Monk',
                isTinySword: true,
                animations: {
                    idle: { file: 'Heal_Effect.png', frames: 6, rate: 8 }
                }
            },
            // Old Assets (smaller, 100x100)
            soldier_old: {
                folder: 'Soldier/Soldier',
                animations: {
                    idle: { file: 'Soldier-Idle.png', frames: 6, rate: 8 },
                    walk: { file: 'Soldier-Walk.png', frames: 8, rate: 10 },
                    attack01: { file: 'Soldier-Attack01.png', frames: 6, rate: 12, loop: false },
                    attack02: { file: 'Soldier-Attack02.png', frames: 6, rate: 12, loop: false },
                    attack03: { file: 'Soldier-Attack03.png', frames: 6, rate: 12, loop: false },
                    hurt: { file: 'Soldier-Hurt.png', frames: 4, rate: 10, loop: false },
                    death: { file: 'Soldier-Death.png', frames: 6, rate: 8, loop: false }
                }
            },
            orc_old: {
                folder: 'Orc/Orc',
                animations: {
                    idle: { file: 'Orc-Idle.png', frames: 6, rate: 8 },
                    walk: { file: 'Orc-Walk.png', frames: 8, rate: 10 },
                    attack01: { file: 'Orc-Attack01.png', frames: 6, rate: 12, loop: false },
                    attack02: { file: 'Orc-Attack02.png', frames: 6, rate: 12, loop: false },
                    hurt: { file: 'Orc-Hurt.png', frames: 4, rate: 10, loop: false },
                    death: { file: 'Orc-Death.png', frames: 6, rate: 8, loop: false }
                }
            }
        };

        for (const [charName, config] of Object.entries(characterConfigs)) {
            await this.loadCharacter(charName, config);
        }

        // Log loaded characters
        console.log('Character sprites loaded:');
        for (const [charName, charData] of Object.entries(this.characters)) {
            const animCount = Object.keys(charData.animations).length;
            console.log(`  ${charName}: ${animCount} animations, scale: ${charData.scale}`);
        }
    },

    /**
     * Load a single character's sprite sheets
     */
    async loadCharacter(charName, config) {
        this.characters[charName] = {
            animations: {},
            scale: config.isTinySword ? 1.5 : this.defaultScale
        };

        // TinySword assets: horizontal strips with 192x192 frames
        const frameWidth = config.isTinySword ? 192 : this.frameWidth;
        const frameHeight = config.isTinySword ? 192 : this.frameHeight;
        
        // Use correct base path
        const baseFolder = config.isTinySword ? this.tinySwordPath : this.basePath;

        console.log(`📦 Loading ${charName} from: ${baseFolder}${config.folder}`);

        for (const [animName, animConfig] of Object.entries(config.animations)) {
            const spritePath = `${baseFolder}${config.folder}/${animConfig.file}`;
            console.log(`  ⏳ Loading ${animName}: ${spritePath}`);
            
            try {
                const spriteSheet = await SpriteLoader.load(spritePath);
                
                // Calculate actual frame count from image width for TinySword assets
                let actualFrameCount = animConfig.frames;
                if (config.isTinySword && spriteSheet.width > 0) {
                    actualFrameCount = Math.floor(spriteSheet.width / frameWidth);
                }
                
                this.characters[charName].animations[animName] = {
                    spriteSheet,
                    frameWidth,
                    frameHeight,
                    frameCount: actualFrameCount,
                    frameRate: animConfig.rate,
                    loop: animConfig.loop !== false,
                    isHorizontalStrip: config.isTinySword
                };
                
                console.log(`  ✅ ${animName} loaded: ${actualFrameCount} frames, ${spriteSheet.width}x${spriteSheet.height}`);
            } catch (err) {
                console.error(`❌ Failed to load ${animName} sprite for ${charName}:`, err);
                console.error(`   Path: ${spritePath}`);
            }
        }
        
        console.log(`✅ ${charName} loaded with ${Object.keys(this.characters[charName].animations).length} animations`);
    },

    /**
     * Create an animation instance for a character
     */
    createAnimation(charName, animationName) {
        const charData = this.characters[charName];
        if (!charData) {
            console.warn(`Character ${charName} not found`);
            return null;
        }

        const animData = charData.animations[animationName];
        if (!animData) {
            console.warn(`Animation ${animationName} not found for ${charName}`);
            return null;
        }

        const anim = new SpriteAnimation(
            animData.spriteSheet,
            animData.frameWidth,
            animData.frameHeight,
            animData.frameCount,
            animData.frameRate,
            animData.isHorizontalStrip
        );
        anim.loop = animData.loop;
        anim.scale = charData.scale;
        return anim;
    },

    /**
     * Check if a character's sprites are loaded
     */
    isLoaded(charName) {
        return !!this.characters[charName];
    }
};
