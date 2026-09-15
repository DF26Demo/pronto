import { LightningElement, api, wire } from 'lwc';
import getContactBirthday from '@salesforce/apex/ContactBirthdayController.getContactBirthday';

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // Automatically set to the Contact ID when on a record page
    
    contactName;
    birthdate;
    daysUntilBirthday;
    error;

    // Wire the Apex method to fetch contact birthday when component loads
    @wire(getContactBirthday, { contactId: '$recordId' })
    wiredContact({ error, data }) {
        if (data) {
            // Ahoy! We've found the treasure (contact data)
            this.contactName = data.Name;
            this.birthdate = data.Birthdate;
            this.calculateDaysUntilBirthday();
            this.error = undefined;
        } else if (error) {
            // Shiver me timbers! We've encountered an error on the high seas
            this.error = error;
            this.daysUntilBirthday = null;
        }
    }

    // Arr! Calculate how many days until this matey's next birthday
    calculateDaysUntilBirthday() {
        if (!this.birthdate) {
            this.daysUntilBirthday = null;
            return;
        }

        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday - if it's a leap year baby, handle Feb 29
        let nextBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If the birthday has already passed this year, set it to next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the difference in days, like countin' gold doubloons
        const timeDiff = nextBirthday.getTime() - today.getTime();
        this.daysUntilBirthday = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    get hasBirthdate() {
        return this.birthdate != null;
    }

    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    get birthdayMessage() {
        if (this.isBirthdayToday) {
            // Hoist the colors! It be their birthday today!
            return '🎉 Ahoy! Today be the day! 🎉';
        } else if (this.daysUntilBirthday === 1) {
            return 'Tomorrow! Prepare the celebration!';
        } else {
            return `${this.daysUntilBirthday} days until the celebration`;
        }
    }
}