import { LightningElement, track } from 'lwc';

export default class GrandfatherClock extends LightningElement {
    @track currentTime = '';
    @track hourHandX = 100;
    @track hourHandY = 70;
    @track minuteHandX = 100;
    @track minuteHandY = 70;
    @track secondHandX = 100;
    @track secondHandY = 70;

    intervalId;

    connectedCallback() {
        // Arr, when this component hoists its sails, we start the time-keepin'!
        this.updateClock();
        // Blimey! Update every second, like the steady beat of waves against the hull
        this.intervalId = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    disconnectedCallback() {
        // Avast! When we abandon ship, clear the interval or we'll have a ghost timer hauntin' us
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    updateClock() {
        // Yo ho ho! Fetch the current time from Davy Jones' locker (or the system clock)
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Shiver me timbers! Format the time for display like coordinates on a treasure map
        this.currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Here be dragons — calculate the angles for each hand!
        // Each degree be like a point on the compass rose
        const secondAngle = (seconds * 6) - 90; // 6 degrees per second, adjusted for SVG coordinates
        const minuteAngle = (minutes * 6 + seconds * 0.1) - 90; // 6 degrees per minute, plus smooth sailin'
        const hourAngle = ((hours % 12) * 30 + minutes * 0.5) - 90; // 30 degrees per hour, steady as she goes

        // Arr, convert angles to coordinates like navigatin' by the stars!
        this.secondHandX = this.calculateHandX(secondAngle, 35); // Longest hand, reachin' for the horizon
        this.secondHandY = this.calculateHandY(secondAngle, 35);

        this.minuteHandX = this.calculateHandX(minuteAngle, 30); // Middle-sized, like a ship's yard
        this.minuteHandY = this.calculateHandY(minuteAngle, 30);

        this.hourHandX = this.calculateHandX(hourAngle, 20); // Shortest and stoutest, like a capstan
        this.hourHandY = this.calculateHandY(hourAngle, 20);
    }

    calculateHandX(angle, length) {
        // Blimey! Use the ancient art of trigonometry to plot our course
        // Center be at (100, 70) in our SVG coordinate system
        return 100 + length * Math.cos(angle * Math.PI / 180);
    }

    calculateHandY(angle, length) {
        // Avast! Calculate the Y coordinate, accountin' for the fact that SVG coordinates
        // be upside-down compared to proper Cartesian coordinates
        return 70 + length * Math.sin(angle * Math.PI / 180);
    }
}