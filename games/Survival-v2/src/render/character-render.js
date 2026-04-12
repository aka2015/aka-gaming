// ========================================
// CHARACTER RENDERING - Sprite-based + Canvas fallback
// ========================================

// Character animation state storage
const characterAnimations = new Map();

// Arrow sprite for Ranger projectiles
let arrowSprite = null;
let arrowSpriteLoaded = false;

/**
 * Load arrow sprite for Ranger
 */
async function loadArrowSprite() {
    if (arrowSpriteLoaded) return;
    
    try {
        const arrowData = CharacterSpriteManager.characters['ranger_arrow'];
        if (arrowData && arrowData.animations.idle) {
            arrowSprite = arrowData.animations.idle.spriteSheet;
            arrowSpriteLoaded = true;
            console.log('Arrow sprite loaded for Ranger');
        }
    } catch (err) {
        console.warn('Failed to load arrow sprite:', err);
    }
}

/**
 * Draw arrow projectile for Ranger
 */
function drawArrowProjectile(ctx, x, y, angle, size = 1.0) {
    if (!arrowSpriteLoaded || !arrowSprite) {
        // Fallback to default projectile
        return false;
    }
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Draw arrow sprite (horizontal strip with 1 frame)
    const frameWidth = 192;
    const frameHeight = 192;
    const scale = size * 0.4; // Smaller scale for projectiles
    
    ctx.drawImage(
        arrowSprite,
        0, 0, frameWidth, frameHeight,
        -(frameWidth * scale) / 2,
        -(frameHeight * scale) / 2,
        frameWidth * scale,
        frameHeight * scale
    );
    
    ctx.restore();
    return true;
}

/**
 * Get or create animation state for a character
 */
function getOrCreateAnimationState(playerId, characterId, animationName) {
    const key = `${playerId}_${characterId}`;
    
    if (!characterAnimations.has(key)) {
        characterAnimations.set(key, {
            current: 'idle',
            animations: {},
            isAnimating: false,
            animationTimer: 0
        });
    }
    
    return characterAnimations.get(key);
}

/**
 * Draw a character using sprite sheets if available, fallback to canvas drawing
 * @param {number} customScale - Optional custom scale for rendering (default: uses CharacterSpriteManager.defaultScale)
 */
function drawCharacter(ctx, x, y, characterId, colors, time, facingDirection = { x: 0, y: 1 }, playerId = 'player', customScale = null) {
    // Map character IDs to sprite sets (TinySword assets)
    let spriteCharId = null;
    
    // Warrior → Blue Warrior
    if (characterId === 'warrior') {
        spriteCharId = 'warrior';
    } 
    // Orc → Red Pawn
    else if (characterId === 'orc') {
        spriteCharId = 'orc';
    }
    // Ranger → Blue Archer
    else if (characterId === 'ranger') {
        spriteCharId = 'ranger';
    }
    // Mage → Blue Monk
    else if (characterId === 'mage') {
        spriteCharId = 'mage';
    }
    
    // Try sprite rendering first if available
    if (spriteCharId && CharacterSpriteManager.isLoaded(spriteCharId)) {
        drawCharacterSprite(ctx, x, y, spriteCharId, colors, time, facingDirection, playerId, customScale);
        return;
    }
    
    // Fallback to canvas drawing
    drawCharacterCanvas(ctx, x, y, characterId, colors, time, facingDirection);
}

/**
 * Draw character using sprite sheets with animations
 */
function drawCharacterSprite(ctx, x, y, characterId, colors, time, facingDirection, playerId, customScale = null) {
    const animState = getOrCreateAnimationState(playerId, characterId, 'idle');

    // Determine which animation to play
    let targetAnim = 'idle';

    // If player is moving and not attacking, use walk animation
    if (!player.isAttacking && (keys['w'] || keys['s'] || keys['a'] || keys['d'] ||
        keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'])) {
        if (animState.animations && animState.animations.walk) {
            targetAnim = 'walk';
        }
    }

    // If attacking and not already in an attack animation, switch to attack
    if (player.isAttacking) {
        // Check if we're already in an attack animation - if so, let it finish
        const isCurrentlyAttacking = animState.current && (animState.current.startsWith('attack'));
        
        if (!isCurrentlyAttacking || animState.current === 'idle' || animState.current === 'walk') {
            // Switch to attack animation - use attack1 and attack2 (matching sprite-loader)
            const attackAnims = ['attack1', 'attack2'];
            
            if (player.attackIndex === undefined) {
                player.attackIndex = 0;
            }
            
            const attackName = attackAnims[player.attackIndex % attackAnims.length];
            if (animState.animations && animState.animations[attackName]) {
                targetAnim = attackName;
            } else {
                console.warn(`⚠️ Animation ${attackName} not found for ${characterId}. Available:`, Object.keys(animState.animations));
            }
        } else {
            // Already in attack animation, keep playing it
            targetAnim = animState.current;
        }
    }

    // Create animation if it doesn't exist
    if (!animState.animations[targetAnim]) {
        animState.animations[targetAnim] = CharacterSpriteManager.createAnimation(characterId, targetAnim);
    }

    // Switch animations if needed
    if (animState.current !== targetAnim) {
        const oldAnim = animState.current;
        animState.current = targetAnim;
        
        if (animState.animations[targetAnim]) {
            animState.animations[targetAnim].reset();
            
            // Increment attack index ONLY when switching TO an attack animation
            if (targetAnim.startsWith('attack') && (!oldAnim || !oldAnim.startsWith('attack'))) {
                player.attackIndex = (player.attackIndex || 0) + 1;
                console.log(`⚔️ ${characterId} STARTING: ${targetAnim} (attackIndex: ${player.attackIndex})`);
            }
        }
        
        // Log animation switch
        if (oldAnim && oldAnim !== targetAnim) {
            console.log(`✨ ${characterId}: ${oldAnim} → ${targetAnim}`);
        }
    }

    // Update and draw the current animation
    const deltaTime = 1/60;
    if (animState.animations[targetAnim]) {
        animState.animations[targetAnim].update(deltaTime);

        const scale = customScale || animState.animations[targetAnim].scale || CharacterSpriteManager.defaultScale;

        ctx.save();
        ctx.translate(x, y);

        if (facingDirection.x < 0) {
            ctx.scale(-1, 1);
        }

        animState.animations[targetAnim].draw(ctx, 0, 0, scale);
        ctx.restore();
    }
}

/**
 * Draw character using canvas (fallback for characters without sprites)
 */
function drawCharacterCanvas(ctx, x, y, characterId, colors, time, facingDirection) {
    switch(characterId) {
        case 'warrior':
            drawWarrior(ctx, x, y, colors, time, facingDirection);
            break;
        case 'mage':
            drawMage(ctx, x, y, colors, time, facingDirection);
            break;
        case 'ranger':
            drawRanger(ctx, x, y, colors, time, facingDirection);
            break;
        default:
            // Generic fallback
            drawGenericCharacter(ctx, x, y, colors, time);
    }
}

// ========================================
// CANVAS DRAWING FUNCTIONS (for characters without sprites)
// ========================================

function drawWarrior(ctx, x, y, colors, time, facingDirection = { x: 0, y: 1 }) {
    ctx.save();
    ctx.translate(x, y);

    // Determine facing angle for rotation
    const facingAngle = Math.atan2(facingDirection.y, facingDirection.x);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (armor)
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();

    // Gold trim
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Helmet
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes - positioned based on facing direction
    const eyeOffsetX = Math.cos(facingAngle) * 3;
    const eyeOffsetY = Math.sin(facingAngle) * 3;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5 + eyeOffsetX, -20 + eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.arc(5 + eyeOffsetX, -20 + eyeOffsetY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0 + eyeOffsetX, -17 + eyeOffsetY, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Sword - positioned based on facing direction
    const swordBaseX = 15 + eyeOffsetX * 2;
    const swordBaseY = 5 + eyeOffsetY * 2;
    const swordTipX = 25 + eyeOffsetX * 3;
    const swordTipY = 20 + eyeOffsetY * 3;

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(swordBaseX, swordBaseY);
    ctx.lineTo(swordTipX, swordTipY);
    ctx.stroke();

    // Shield - opposite side of sword
    const shieldX = -20 - eyeOffsetX * 2;
    const shieldY = 5 - eyeOffsetY * 2;

    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(shieldX, shieldY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function drawMage(ctx, x, y, colors, time, facingDirection = { x: 0, y: 1 }) {
    ctx.save();
    ctx.translate(x, y);

    // Determine facing angle
    const facingAngle = Math.atan2(facingDirection.y, facingDirection.x);
    const eyeOffsetX = Math.cos(facingAngle) * 3;
    const eyeOffsetY = Math.sin(facingAngle) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robe
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wizard hat
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(-18, -25);
    ctx.lineTo(0, -50);
    ctx.lineTo(18, -25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hat brim
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing eyes - positioned based on facing direction
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5 + eyeOffsetX, -20 + eyeOffsetY, 2.5, 0, Math.PI * 2);
    ctx.arc(5 + eyeOffsetX, -20 + eyeOffsetY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Staff - positioned based on facing direction
    const staffX = 20 + eyeOffsetX * 2;
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(staffX, -30);
    ctx.lineTo(staffX, 30);
    ctx.stroke();

    // Glowing orb on staff
    const glowIntensity = Math.sin(time * 0.003) * 0.3 + 0.7;
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.beginPath();
    ctx.arc(staffX, -35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Magic particles
    for (let i = 0; i < 5; i++) {
        const angle = (time * 0.002) + (i * Math.PI * 2 / 5);
        const radius = 25 + Math.sin(time * 0.005 + i) * 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius - 10;

        ctx.fillStyle = colors.secondary;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawRanger(ctx, x, y, colors, time, facingDirection = { x: 0, y: 1 }) {
    ctx.save();
    ctx.translate(x, y);

    // Determine facing angle
    const facingAngle = Math.atan2(facingDirection.y, facingDirection.x);
    const eyeOffsetX = Math.cos(facingAngle) * 3;
    const eyeOffsetY = Math.sin(facingAngle) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();

    // Belt
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-15, 10, 30, 5);

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hood
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.lineTo(16, -15);
    ctx.lineTo(-16, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Focused eyes - positioned based on facing direction
    ctx.fillStyle = '#16A34A';
    ctx.shadowColor = '#16A34A';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5 + eyeOffsetX, -20 + eyeOffsetY, 2.5, 0, Math.PI * 2);
    ctx.arc(5 + eyeOffsetX, -20 + eyeOffsetY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bow - positioned based on facing direction
    const bowX = 22 + eyeOffsetX * 2;
    const bowY = eyeOffsetY * 2;
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bowX, bowY, 18, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Quiver - opposite side
    const quiverX = -25 - eyeOffsetX * 2;
    ctx.fillStyle = '#78350F';
    ctx.fillRect(quiverX, -15, 8, 25);
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(quiverX, -15, 8, 25);

    ctx.restore();
}

/**
 * Generic character drawing fallback
 */
function drawGenericCharacter(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -20, 2, 0, Math.PI * 2);
    ctx.arc(5, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.lineTo(x + width, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
