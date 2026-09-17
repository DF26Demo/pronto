import { LightningElement, track } from 'lwc';

export default class GrandFatherClock extends LightningElement {
    @track currentTime = '';
    @track hourHandStyle = '';
    @track minuteHandStyle = '';
    @track secondHandStyle = '';
    @track pendulumStyle = '';
    intervalId;
    pendulumDirection = 1;

    connectedCallback() {
        // Arr, when this component boards the ship, start the clock!
        this.updateClock();
        this.intervalId = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    disconnectedCallback() {
        // Blimey! When we abandon ship, clear the interval so it don't haunt us
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    updateClock() {
        // Shiver me timbers! Calculate the current time and hand positions
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Avast! Format the time like a proper ship's log
        this.currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Here be the mathematics for rotating each hand across the clock face
        // Like charting a course by the stars, each hand follows its own bearing!
        const secondDegrees = (seconds / 60) * 360;
        const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
        const hourDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

        // Set the rotation for each hand - they sail around the clock face!
        this.hourHandStyle = `transform: rotate(${hourDegrees}deg)`;
        this.minuteHandStyle = `transform: rotate(${minuteDegrees}deg)`;
        this.secondHandStyle = `transform: rotate(${secondDegrees}deg)`;

        // Yo ho ho! Make the pendulum swing back and forth like the roll of the sea
        const pendulumAngle = Math.sin(Date.now() / 500) * 15;
        this.pendulumStyle = `transform: rotate(${pendulumAngle}deg)`;
    }
}