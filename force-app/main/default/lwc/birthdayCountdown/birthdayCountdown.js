import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! These be the fields we need from the contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class BirthdayCountdown extends LightningElement {
    @api recordId;

    // Hoist the sails and fetch the contact's birthdate from the seven seas of Salesforce
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    get hasBirthdate() {
        // Blimey! Check if this scallywag has a birthdate on record
        return this.contact.data && getFieldValue(this.contact.data, BIRTHDATE_FIELD);
    }

    get birthdate() {
        // Pull the birthdate from the treasure chest of contact data
        if (!this.contact.data) return null;
        return getFieldValue(this.contact.data, BIRTHDATE_FIELD);
    }

    get daysUntilBirthday() {
        // Arr, here be the treasure map calculations!
        if (!this.birthdate) return null;

        const today = new Date();
        const birth = new Date(this.birthdate);
        
        // Navigate to the next birthday on the calendar seas
        const nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );

        // If we've already sailed past this year's birthday, chart course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the distance in days between ports
        const timeDiff = nextBirthday - today;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return days;
    }

    get countdownMessage() {
        // Shiver me timbers! Craft a proper message for the crew
        const days = this.daysUntilBirthday;
        if (days === 0) {
            return "🎉 Today be the day! Happy Birthday, matey!";
        } else if (days === 1) {
            return "day until birthday";
        } else {
            return "days until birthday";
        }
    }

    get formattedBirthdate() {
        // Present the date in a format worthy of the Captain's log
        if (!this.birthdate) return '';
        const birth = new Date(this.birthdate);
        return birth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
}