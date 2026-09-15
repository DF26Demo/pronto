import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! Here be the fields we be plunderin' from the Contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // The contact's ID, passed by the Lightning page like a message in a bottle

    // Wire up the contact data from the briny deep of Salesforce
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    // Blimey! Calculate how many days 'til this scallywag's birthday
    get daysUntilBirthday() {
        if (!this.contact.data) {
            return null; // No data? Abandon ship early, matey!
        }

        const birthdate = getFieldValue(this.contact.data, BIRTHDATE_FIELD);
        
        if (!birthdate) {
            return null; // No birthdate found in these waters
        }

        // Hoist the anchor and calculate the days!
        const today = new Date();
        const birth = new Date(birthdate);
        
        // Set this year's birthday, ye scurvy dog
        const nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );

        // If we sailed past the birthday this year, chart course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days like countin' gold doubloons
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Here be the message we display to the crew
    get birthdayMessage() {
        const days = this.daysUntilBirthday;
        
        if (days === null) {
            return 'No birthday on the horizon, captain!';
        }
        
        if (days === 0) {
            return '🎉 Shiver me timbers! Today be the day!';
        }
        
        if (days === 1) {
            return '🎂 Batten down the hatches! Birthday be tomorrow!';
        }
        
        return `⚓ ${days} days until this sailor's birthday!`;
    }

    // Check if we have a birthdate to show, lest we display naught but empty seas
    get hasBirthdate() {
        return this.daysUntilBirthday !== null;
    }
}