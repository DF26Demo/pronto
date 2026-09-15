import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! The fields we need to plunder from the Contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // Automatically set to the Contact ID when on a record page
    
    contact;
    error;

    // Wire up the Contact record to fetch the birthdate, matey!
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        if (data) {
            this.contact = data;
            this.error = undefined;
        } else if (error) {
            // Blimey! Something went wrong on the high seas
            this.error = error;
            this.contact = undefined;
        }
    }

    get birthdate() {
        // Retrieve the birthdate from our treasure map
        return getFieldValue(this.contact, BIRTHDATE_FIELD);
    }

    get hasBirthdate() {
        // Check if we found the treasure (birthdate)
        return this.birthdate != null;
    }

    get daysUntilBirthday() {
        if (!this.birthdate) {
            // No birthdate? Abandon ship!
            return null;
        }

        // Arr! Time to calculate the days until the celebration
        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday
        const thisYearBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If birthday already passed this year, calculate for next year
        let nextBirthday = thisYearBirthday;
        if (thisYearBirthday < today) {
            // Set sail for next year's birthday!
            nextBirthday = new Date(
                today.getFullYear() + 1,
                birthDate.getMonth(),
                birthDate.getDate()
            );
        }

        // Calculate the difference in milliseconds, then convert to days
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    get birthdayMessage() {
        const days = this.daysUntilBirthday;
        
        if (days === null) {
            return 'No birthdate on record';
        }
        
        // Shiver me timbers! It's their birthday today!
        if (days === 0) {
            return '🎉 Birthday is TODAY! 🎉';
        }
        
        // Hoist the colors! Birthday be tomorrow!
        if (days === 1) {
            return '🎂 Birthday is TOMORROW!';
        }
        
        // Steady as she goes - birthday ahead on the horizon
        return `${days} days until birthday`;
    }

    get cardVariant() {
        const days = this.daysUntilBirthday;
        
        // Special styling when birthday be close!
        if (days === 0) {
            return 'base';
        }
        
        return 'base';
    }

    get showCelebration() {
        // Show celebration icons when birthday be today or tomorrow
        const days = this.daysUntilBirthday;
        return days === 0 || days === 1;
    }
}
