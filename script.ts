/**
 * @class MatrixRain
 * @description Manages the creation and animation of a "Matrix"-style digital rain effect on an HTML canvas.
 * This class handles setup, drawing, and responsiveness.
 */
class MatrixRain {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private characters: string;
    private fontSize: number;
    private columns: number;
    private drops: number[];
    private animationFrameId: number;

    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - The canvas element to draw the effect on.
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.fontSize = 16;
        this.columns = 0;
        this.drops = [];
        this.animationFrameId = 0;

        // Bind the draw method to `this` instance to maintain context in requestAnimationFrame
        this.draw = this.draw.bind(this);
    }

    /**
     * @private
     * @description Sets up the canvas dimensions and initializes the drops array for the columns.
     * This should be called on initialization and on window resize.
     */
    private setup(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = 1;
        }
    }

    /**
     * @private
     * @description The main animation loop. It draws each frame of the digital rain effect.
     */
    private draw(): void {
        if (!this.ctx) return;

        // Draw a semi-transparent black rectangle over the canvas to create the fading trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set the color and font for the falling characters
        this.ctx.fillStyle = '#39FF14'; // Matrix green
        this.ctx.font = `${this.fontSize}px ${getComputedStyle(document.body).fontFamily}`;

        // Loop through each column (represented by the 'drops' array)
        for (let i = 0; i < this.drops.length; i++) {
            // Pick a random character from the character set
            const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
            
            // Draw the character at its current position in the column
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            // Reset the drop to the top of the screen if it has gone off-screen
            // A random factor is added to make the reset staggered and less uniform
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }

            // Increment the drop's y-position for the next frame
            this.drops[i]++;
        }
        
        // Request the next animation frame to continue the loop
        this.animationFrameId = window.requestAnimationFrame(this.draw);
    }

    /**
     * @public
     * @description Initializes the effect by setting up the canvas and starting the animation loop.
     */
    public start(): void {
        this.stop(); // Ensure any previous animation is stopped before starting a new one
        this.setup();
        this.draw();
    }

    /**
     * @public
     * @description Stops the animation loop.
     */
    public stop(): void {
        if (this.animationFrameId) {
            window.cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// --- Main Execution ---

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix-canvas');
    
    // Type guard to ensure the element is an HTMLCanvasElement before proceeding
    if (canvas instanceof HTMLCanvasElement) {
        const matrixEffect = new MatrixRain(canvas);
        
        // Start the digital rain effect
        matrixEffect.start();

        // Add a resize event listener to re-initialize the effect, making it responsive
        window.addEventListener('resize', () => matrixEffect.start());
    } else {
        console.error('Fatal Error: Canvas element with id "matrix-canvas" not found.');
    }
});
