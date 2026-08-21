import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! The fields we be plunderin' from the Contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // The Contact ID, set automatically when placed on a record page
    
    birthdate;
    error;

    // Wire up the Contact record to fetch the birthdate like a treasure map
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        if (data) {
            this.birthdate = getFieldValue(data, BIRTHDATE_FIELD);
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered rough seas
            this.error = error;
            this.birthdate = undefined;
        }
    }

    get hasBirthdate() {
        return this.birthdate != null;
    }

    get daysUntilBirthday() {
        if (!this.birthdate) {
            return null;
        }

        // Arr! Time to calculate when this scallywag celebrates another year
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const birthDate = new Date(this.birthdate);
        const thisYearBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If birthday already passed this year, set sail for next year
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the difference in milliseconds and convert to days
        const diffTime = thisYearBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    get birthdayMessage() {
        const days = this.daysUntilBirthday;
        
        if (days === null) {
            return 'No birthday on record, matey!';
        }
        
        if (days === 0) {
            // Shiver me timbers! It's their birthday today!
            return '🎉 Avast! Today be the day! Happy Birthday! 🎉';
        }
        
        if (days === 1) {
            return '🎂 Hoist the sails! Birthday be tomorrow!';
        }
        
        // Regular countdown for the crew
        return `${days} days until this matey's birthday`;
    }

    get cardVariant() {
        const days = this.daysUntilBirthday;
        // If birthday is today or within 7 days, make it stand out like a treasure chest
        return (days !== null && days <= 7) ? 'base' : 'base';
    }

    get showCelebration() {
        // Display special celebration styling when birthday is today
        return this.daysUntilBirthday === 0;
    }
}
