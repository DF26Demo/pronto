import { LightningElement, wire } from 'lwc';
import getContactsWithBirthdays from '@salesforce/apex/ContactBirthdayController.getContactsWithBirthdays';

export default class ContactBirthdayCountdown extends LightningElement {
    contacts = [];
    error;

    // Arr, fetch the contacts with birthdays from the seven seas of Salesforce!
    @wire(getContactsWithBirthdays)
    wiredContacts({ error, data }) {
        if (data) {
            // Blimey! Calculate days until each matey's birthday
            this.contacts = data.map(contact => {
                const daysUntil = this.calculateDaysUntilBirthday(contact.Birthdate);
                return {
                    ...contact,
                    daysUntil: daysUntil,
                    displayDays: daysUntil === 0 ? 'Today! 🎉' : `${daysUntil} days`,
                    isToday: daysUntil === 0
                };
            });
            
            // Sort by closest birthday, like arranging treasure by value
            this.contacts.sort((a, b) => a.daysUntil - b.daysUntil);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = [];
        }
    }

    // Here be the calculation magic - works out days until next birthday
    calculateDaysUntilBirthday(birthdate) {
        if (!birthdate) return 999; // No birthdate? Walk the plank to the end of the list!
        
        const today = new Date();
        const birth = new Date(birthdate);
        
        // Set this year's birthday, ye scallywag
        let nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );
        
        // Shiver me timbers! If birthday already passed this year, set sail for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate the days between now and the birthday treasure
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    get hasContacts() {
        return this.contacts && this.contacts.length > 0;
    }
}