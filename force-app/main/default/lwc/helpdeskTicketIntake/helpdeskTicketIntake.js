import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HelpdeskTicketIntake extends LightningElement {
    @track subject = '';
    @track description = '';
    @track showSuccess = false;

    handleSubjectChange(event) {
        // Arr, capture the subject of this landlubber's complaint
        this.subject = event.target.value;
    }

    handleDescriptionChange(event) {
        // Here be the details of what be troubling this sailor
        this.description = event.target.value;
    }

    moveButton(event) {
        // Avast! When a cursor approaches, this button sails to new coordinates!
        // Like a ship dodging cannonfire, it moves to a random position
        const button = event.target;
        
        // Calculate random position within the container, ye scurvy algorithm
        const maxX = 300; // Max horizontal movement in pixels
        const maxY = 200; // Max vertical movement in pixels
        
        // Throw the dice for new coordinates, as random as the seven seas
        const randomX = Math.floor(Math.random() * maxX) - (maxX / 2);
        const randomY = Math.floor(Math.random() * maxY) - (maxY / 2);
        
        // Transform the button's position - it be teleporting like a ghost ship!
        button.style.transform = `translate(${randomX}px, ${randomY}px)`;
        button.style.transition = 'transform 0.3s ease';
    }

    handleSubmit() {
        // Blimey! If they managed to click it, they've earned their ticket submission
        
        // Check if all required fields be filled, lest we sail with empty cargo holds
        if (!this.subject || !this.description) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Arrr!',
                    message: 'Fill in all fields before submittin\', ye landlubber!',
                    variant: 'error'
                })
            );
            return;
        }

        // Here be where ye'd normally create a Case record in Salesforce
        // For now, we just show success - a proper API call would go here
        console.log('Ticket submitted:', {
            subject: this.subject,
            description: this.description
        });

        // Hoist the success flag!
        this.showSuccess = true;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                message: 'Yer ticket has been submitted to the crew!',
                variant: 'success'
            })
        );

        // Reset the form after a few seconds, ready for the next voyage
        setTimeout(() => {
            this.subject = '';
            this.description = '';
            this.showSuccess = false;
            
            // Reset button position back to port
            const button = this.template.querySelector('.evasive-button');
            if (button) {
                button.style.transform = 'translate(0, 0)';
            }
        }, 3000);
    }
}