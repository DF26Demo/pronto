import { LightningElement, api, wire } from 'lwc';
import getBirthdate from '@salesforce/apex/BirthdayCountdownController.getBirthdate';

export default class BirthdayCountdown extends LightningElement {
    @api recordId;
    daysUntilBirthday;
    birthdate;
    error;
    isLoading = true;

    @wire(getBirthdate, { contactId: '$recordId' })
    wiredBirthdate({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.birthdate = data;
            // Arr, calculate the days 'til we celebrate!
            this.daysUntilBirthday = this.calculateDaysUntilBirthday(data);
            this.error = undefined;
        } else if (error) {
            // Blimey! Something went wrong on the high seas
            this.error = error;
            this.birthdate = undefined;
            this.daysUntilBirthday = undefined;
        }
    }

    calculateDaysUntilBirthday(birthdate) {
        if (!birthdate) {
            return null;
        }

        const today = new Date();
        const birth = new Date(birthdate);
        
        // Hoist the birthday to this year's calendar, matey!
        let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
        
        // If the birthday already sailed past this year, chart course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate the treasure: days between now and the next birthday
        const timeDiff = nextBirthday.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff;
    }

    get hasBirthdate() {
        return this.birthdate != null;
    }

    get birthdayMessage() {
        if (this.daysUntilBirthday === 0) {
            return "🎂 Avast! Today be the day! Happy Birthday, ye scallywag!";
        } else if (this.daysUntilBirthday === 1) {
            return "🎉 Prepare the rum! Birthday be tomorrow!";
        } else {
            return `⚓ ${this.daysUntilBirthday} days until we celebrate this matey's birthday!`;
        }
    }
}