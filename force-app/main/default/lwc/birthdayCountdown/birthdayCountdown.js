import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr, these be the fields we need to plunder from the Contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class BirthdayCountdown extends LightningElement {
    @api recordId;

    // Hoist the contact data aboard when it arrives from the wire service
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    contact;

    // Blimey! Calculate if this scallywag has a birthdate on record
    get hasBirthdate() {
        return this.birthdate !== null && this.birthdate !== undefined;
    }

    // Retrieve the birthdate from the treasure chest of contact data
    get birthdate() {
        return getFieldValue(this.contact.data, BIRTHDATE_FIELD);
    }

    // Shiver me timbers! Calculate the days until their special day
    get daysUntilBirthday() {
        if (!this.hasBirthdate) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight to avoid time zone shenanigans

        const birthdate = new Date(this.birthdate);
        const currentYear = today.getFullYear();
        
        // Calculate the next birthday by settin' the birth year to this year
        let nextBirthday = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
        nextBirthday.setHours(0, 0, 0, 0);

        // If the birthday already sailed past this year, chart course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1);
        }

        // Calculate the difference in days like countin' doubloons
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    // Proper grammar be important, even for pirates - singular or plural days
    get daysLabel() {
        return this.daysUntilBirthday === 1 ? 'day until birthday' : 'days until birthday';
    }

    // Arr, check if today be the day of celebration!
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Format the next birthday date so landlubbers can read it
    get nextBirthdayDate() {
        if (!this.hasBirthdate) {
            return null;
        }

        const birthdate = new Date(this.birthdate);
        const today = new Date();
        const currentYear = today.getFullYear();
        let nextBirthday = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
        
        if (nextBirthday < today) {
            nextBirthday.setFullYear(currentYear + 1);
        }
        return nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
}