import { LightningElement, track } from 'lwc';

export default class GrandfatherClock extends LightningElement {
    @track currentTime = '';
    @track hourHandStyle = '';
    @track minuteHandStyle = '';
    @track secondHandStyle = '';
    
    intervalId;

    connectedCallback() {
        // Arr! When this component drops anchor, start the clock tickin'
        this.updateClock();
        // Set an interval to update every second, like clockwork, matey!
        this.intervalId = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    disconnectedCallback() {
        // Avast! Clear the interval when we abandon ship
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    updateClock() {
        // Blimey! Get the current time from the seven seas
        const now = new Date();
        
        // Extract hours, minutes, and seconds like treasure from a chest
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Calculate the degrees for each hand - 360 degrees round the compass
        // Hour hand: 30 degrees per hour (360/12) plus adjustment for minutes
        const hourDegrees = ((hours % 12) * 30) + (minutes * 0.5);
        // Minute hand: 6 degrees per minute (360/60) plus adjustment for seconds
        const minuteDegrees = (minutes * 6) + (seconds * 0.1);
        // Second hand: 6 degrees per second - swift as a cutlass strike!
        const secondDegrees = seconds * 6;
        
        // Set the rotation styles - spinnin' like a ship's wheel in a storm
        this.hourHandStyle = `transform: rotate(${hourDegrees}deg)`;
        this.minuteHandStyle = `transform: rotate(${minuteDegrees}deg)`;
        this.secondHandStyle = `transform: rotate(${secondDegrees}deg)`;
        
        // Format the digital time display for those who prefer numbers to dials
        this.currentTime = now.toLocaleTimeString();
    }
}