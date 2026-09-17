import { LightningElement, track } from 'lwc';

export default class GrandfatherClock extends LightningElement {
    @track hourHandX = 100;
    @track hourHandY = 105;
    @track minuteHandX = 100;
    @track minuteHandY = 95;
    @track secondHandX = 100;
    @track secondHandY = 90;
    @track currentTime = '';
    
    // Arrr, this be the interval that keeps our clock tickin' like a ship's chronometer
    clockInterval;
    
    connectedCallback() {
        // Hoist the colors! Start the clock when the component sets sail
        this.updateClock();
        // Keep the time updated every second, or ye'll be late for yer plunderin'
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    disconnectedCallback() {
        // Weigh anchor! Clear the interval when we abandon ship
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
    
    updateClock() {
        // By Neptune's beard! Get the current time from the JavaScript Date API
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Format the time for digital display, matey
        this.currentTime = now.toLocaleTimeString();
        
        // Calculate the angles for each hand - math as precise as navigatin' by the stars!
        // Each second be 6 degrees (360/60), arr!
        const secondAngle = (seconds * 6) * (Math.PI / 180);
        // Each minute be 6 degrees, plus we advance it smoothly with the seconds
        const minuteAngle = ((minutes + seconds/60) * 6) * (Math.PI / 180);
        // Each hour be 30 degrees (360/12), and we advance it with minutes for smooth sailin'
        const hourAngle = ((hours % 12 + minutes/60) * 30) * (Math.PI / 180);
        
        // Convert angles to coordinates - trigonometry would make Pythagoras proud!
        // Center be at (100, 125), and we measure from 12 o'clock (top)
        // Subtract 90 degrees because SVG angles start from 3 o'clock, those scurvy dogs
        
        // Hour hand length be 20 pixels, short and stout like a bosun
        this.hourHandX = 100 + 20 * Math.sin(hourAngle);
        this.hourHandY = 125 - 20 * Math.cos(hourAngle);
        
        // Minute hand length be 30 pixels, longer than the hour hand like a ship's mast
        this.minuteHandX = 100 + 30 * Math.sin(minuteAngle);
        this.minuteHandY = 125 - 30 * Math.cos(minuteAngle);
        
        // Second hand length be 35 pixels, swift and sharp as a rapier!
        this.secondHandX = 100 + 35 * Math.sin(secondAngle);
        this.secondHandY = 125 - 35 * Math.cos(secondAngle);
    }
}