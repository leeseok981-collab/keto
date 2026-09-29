export interface MoveVector {
    forward: number; // -1 (back) to +1 (forward)
    right: number;   // -1 (left) to +1 (right)
    up: number;      // -1 (down) to +1 (up) - for flight
}

export interface LookDelta {
    dx: number;
    dy: number;
}

export class InputManager {
    // Keyboard key states
    private keys: Map<string, boolean> = new Map();

    // Look delta accumulated between frames
    private lookDeltaX = 0;
    private lookDeltaY = 0;

    // Mouse buttons state
    private isAttackHeld = false;
    private attackJustPressed = false;
    private isInteractHeld = false;
    private interactJustPressed = false;

    // Mobile Virtual Joystick / Touch Inputs
    private touchMoveForward = 0;
    private touchMoveRight = 0;
    private touchMoveUp = 0;
    private touchJump = false;
    private touchBreakHeld = false;
    private touchBreakJustPressed = false;
    private touchPlaceJustPressed = false;

    // Actions triggered
    private jumpPressed = false;
    private flyToggleRequested = false;

    // Hotbar selection requested (1-9 or wheel)
    private hotbarSlotRequested: number | null = null;
    private wheelDelta = 0;

    // Pointer Lock
    private isLocked = false;
    private targetElement: HTMLElement | null = null;
    public onPointerLockExit?: () => void;

    // Double-tap Space detection for flight toggle
    private lastSpacePressTime = 0;

    constructor() {
        this.bindEvents();
    }

    public attach(element: HTMLElement): void {
        this.targetElement = element;
    }

    private bindEvents(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', (e) => {
            const key = e.code;
            this.keys.set(key, true);

            // Number keys 1..9 for hotbar selection
            if (key >= 'Digit1' && key <= 'Digit9') {
                this.hotbarSlotRequested = parseInt(key.replace('Digit', '')) - 1;
            }

            // Jump & Creative Fly toggle (Double Space)
            if (key === 'Space') {
                this.jumpPressed = true;
                const now = Date.now();
                if (now - this.lastSpacePressTime < 300) {
                    this.flyToggleRequested = true;
                    this.lastSpacePressTime = 0;
                } else {
                    this.lastSpacePressTime = now;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            if (e.code === 'Space') {
                this.jumpPressed = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isLocked) {
                this.lookDeltaX += e.movementX;
                this.lookDeltaY += e.movementY;
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (!this.isLocked) return;
            if (e.button === 0) {
                // Left click: Attack / Mine holding
                this.isAttackHeld = true;
                this.attackJustPressed = true;
            } else if (e.button === 2) {
                // Right click: Place / Interact
                this.isInteractHeld = true;
                this.interactJustPressed = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isAttackHeld = false;
            } else if (e.button === 2) {
                this.isInteractHeld = false;
            }
        });

        window.addEventListener('wheel', (e) => {
            if (this.isLocked) {
                this.wheelDelta += Math.sign(e.deltaY);
            }
        }, { passive: true });

        // Prevent browser/desktop context menu on right click inside 3D viewport
        window.addEventListener('contextmenu', (e) => {
            if (this.isLocked || (this.targetElement && (e.target === this.targetElement || this.targetElement.contains(e.target as Node)))) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        window.addEventListener('blur', () => {
            this.resetInputs();
        });

        document.addEventListener('pointerlockchange', () => {
            const wasLocked = this.isLocked;
            this.isLocked = document.pointerLockElement === this.targetElement;
            if (wasLocked && !this.isLocked) {
                this.resetInputs();
                if (this.onPointerLockExit) {
                    this.onPointerLockExit();
                }
            }
        });

        document.addEventListener('pointerlockerror', () => {
            // Silently suppress browser pointer lock error events
        });
    }

    private resetInputs(): void {
        this.isAttackHeld = false;
        this.attackJustPressed = false;
        this.isInteractHeld = false;
        this.interactJustPressed = false;
        this.keys.clear();
        this.jumpPressed = false;
    }

    public requestPointerLock(): void {
        if (!this.targetElement || this.isLocked) return;
        try {
            const res = (this.targetElement as any).requestPointerLock();
            if (res && typeof res.catch === 'function') {
                res.catch(() => {
                    // Suppress cooldown rejection gracefully
                });
            }
        } catch {
            // Gracefully catch sync DOMException
        }
    }

    public exitPointerLock(): void {
        if (document.pointerLockElement) {
            try {
                document.exitPointerLock();
            } catch {}
        }
        this.isLocked = false;
        this.resetInputs();
    }

    public isPointerLocked(): boolean {
        return this.isLocked;
    }

    // Unified Movement Vector (-1 to +1)
    public getMoveVector(): MoveVector {
        let forward = 0;
        let right = 0;
        let up = 0;

        // PC WASD / Arrow Keys
        if (this.keys.get('KeyW') || this.keys.get('ArrowUp')) forward += 1;
        if (this.keys.get('KeyS') || this.keys.get('ArrowDown')) forward -= 1;
        if (this.keys.get('KeyD') || this.keys.get('ArrowRight')) right += 1;
        if (this.keys.get('KeyA') || this.keys.get('ArrowLeft')) right -= 1;

        // Vertical movement in flight (Space = Up, Shift = Down)
        if (this.keys.get('Space')) up += 1;
        if (this.keys.get('ShiftLeft') || this.keys.get('ShiftRight')) up -= 1;

        // Blend with mobile touch inputs
        if (Math.abs(this.touchMoveForward) > 0.05) forward = this.touchMoveForward;
        if (Math.abs(this.touchMoveRight) > 0.05) right = this.touchMoveRight;
        if (Math.abs(this.touchMoveUp) > 0.05) up = this.touchMoveUp;

        return { forward, right, up };
    }

    public isSprinting(): boolean {
        return !!(this.keys.get('ControlLeft') || this.keys.get('ControlRight'));
    }

    public isJumpPressed(): boolean {
        return this.jumpPressed || this.touchJump;
    }

    public pollFlyToggle(): boolean {
        const req = this.flyToggleRequested;
        this.flyToggleRequested = false;
        return req;
    }

    /**
     * Checks if attack/mining is currently being held down
     */
    public isHoldingAttack(): boolean {
        return this.isAttackHeld || this.touchBreakHeld;
    }

    /**
     * Consumes one-shot attack trigger
     */
    public wasAttackJustPressed(): boolean {
        const pressed = this.attackJustPressed || this.touchBreakJustPressed;
        this.attackJustPressed = false;
        this.touchBreakJustPressed = false;
        return pressed;
    }

    /**
     * Checks and consumes single interact click
     */
    public pollInteract(): boolean {
        const interact = this.interactJustPressed || this.touchPlaceJustPressed;
        this.interactJustPressed = false;
        this.touchPlaceJustPressed = false;
        return interact;
    }

    public isHoldingInteract(): boolean {
        return this.isInteractHeld;
    }

    public getLookDelta(): LookDelta {
        const dx = this.lookDeltaX;
        const dy = this.lookDeltaY;
        this.lookDeltaX = 0;
        this.lookDeltaY = 0;
        return { dx, dy };
    }

    public pollWheelDelta(): number {
        const delta = this.wheelDelta;
        this.wheelDelta = 0;
        return delta;
    }

    public pollSelectedSlot(): number | null {
        const slot = this.hotbarSlotRequested;
        this.hotbarSlotRequested = null;
        return slot;
    }

    // Mobile Virtual Touch Controls API
    public setTouchMovement(forward: number, right: number): void {
        this.touchMoveForward = Math.max(-1, Math.min(1, forward));
        this.touchMoveRight = Math.max(-1, Math.min(1, right));
    }

    public setTouchLookDelta(dx: number, dy: number): void {
        this.lookDeltaX += dx;
        this.lookDeltaY += dy;
    }

    public setTouchJump(pressed: boolean): void {
        this.touchJump = pressed;
    }

    public setTouchBreakHolding(holding: boolean): void {
        this.touchBreakHeld = holding;
        if (holding) {
            this.touchBreakJustPressed = true;
        }
    }

    public triggerTouchBreak(): void {
        this.touchBreakJustPressed = true;
    }

    public triggerTouchPlace(): void {
        this.touchPlaceJustPressed = true;
    }

    public setTouchFlyUp(up: number): void {
        this.touchMoveUp = up;
    }
}
