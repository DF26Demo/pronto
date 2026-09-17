import { LightningElement, track } from 'lwc';

export default class HelpdeskTicket extends LightningElement {
    @track subject = '';
    @track description = '';
    @track priority = '';
    @track category = '';
    @track isSubmitting = false;
    @track showSuccess = false;

    // Arr, these be the options for priority, sorted by how loud the user be yellin'
    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' }
    ];

    // Categories for what manner of trouble befalls the user
    categoryOptions = [
        { label: 'Software', value: 'Software' },
        { label: 'Hardware', value: 'Hardware' },
        { label: 'Network', value: 'Network' },
        { label: 'Access', value: 'Access' },
        { label: 'Other', value: 'Other' }
    ];

    get buttonLabel() {
        // Blimey! Change the label when we be submittin'
        return this.isSubmitting ? 'Submitting...' : 'Submit Ticket';
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handlePriorityChange(event) {
        this.priority = event.detail.value;
    }

    handleCategoryChange(event) {
        this.category = event.detail.value;
    }

    handleButtonHover(event) {
        // Here be the mischief! When ye hover, the button sails to a new position!
        const button = event.target;
        const container = button.parentElement;
        
        // Calculate random coordinates within the container, like a ship dodgin' cannonballs
        const containerRect = container.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        // Leave some space from the edges so the button doesn't sail off the map
        const maxX = containerRect.width - buttonRect.width - 20;
        const maxY = 200; // Keep it within reasonable vertical bounds, savvy?
        
        // Roll the dice for new coordinates!
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        // Set the new position - the button escapes like a scurvy dog!
        button.style.left = randomX + 'px';
        button.style.top = randomY + 'px';
    }

    handleSubmit() {
        // Validate that all required fields be filled, or walk the plank!
        if (!this.subject || !this.description) {
            // Show an error toast would go here in a real implementation
            alert('Avast! Fill in all required fields before submittin\', ye scallywag!');
            return;
        }

        this.isSubmitting = true;

        // Simulate ticket creation - in a real app, this would call an Apex method
        // For now, we just pretend we sent it to Davy Jones' locker
        setTimeout(() => {
            this.isSubmitting = false;
            this.showSuccess = true;
            
            // Reset the form after a few seconds, ready for the next landlubber
            setTimeout(() => {
                this.subject = '';
                this.description = '';
                this.priority = '';
                this.category = '';
                this.showSuccess = false;
            }, 3000);
        }, 1500);
    }
}