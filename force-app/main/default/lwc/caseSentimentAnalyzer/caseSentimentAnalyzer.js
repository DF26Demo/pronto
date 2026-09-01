// Arr! This component be analyzin' the mood of yer customers from their case comments
import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import analyzeSentiment from '@salesforce/apex/CaseSentimentController.analyzeSentiment';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class CaseSentimentAnalyzer extends LightningElement {
    @api recordId;
    sentiment = null;
    sentimentScore = 0;
    loading = true;
    error = null;
    subscription = {};
    channelName = '/data/CaseCommentChangeEvent';

    connectedCallback() {
        // Hoist the sails and load sentiment on component mount
        this.loadSentiment();
        this.registerErrorListener();
        // Blimey! Subscribe to case comment changes so we update in real-time
        this.handleSubscribe();
    }

    disconnectedCallback() {
        // Abandon ship — clean up subscriptions when we leave
        this.handleUnsubscribe();
    }

    loadSentiment() {
        this.loading = true;
        this.error = null;
        // Here be the call to our Apex crew to analyze the comments
        analyzeSentiment({ caseId: this.recordId })
            .then(result => {
                this.sentiment = result.sentiment;
                this.sentimentScore = result.score;
                this.loading = false;
            })
            .catch(error => {
                this.error = error.body?.message || 'Shiver me timbers! Failed to load sentiment';
                this.loading = false;
                this.showToast('Error', this.error, 'error');
            });
    }

    // Subscribe to case comment changes — when comments be added, we refresh!
    handleSubscribe() {
        const messageCallback = (response) => {
            // If this be our case, reload the sentiment
            if (response?.data?.payload?.ParentId === this.recordId) {
                this.loadSentiment();
            }
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            this.subscription = response;
        });
    }

    handleUnsubscribe() {
        unsubscribe(this.subscription, response => {
            console.log('Unsubscribed from channel');
        });
    }

    registerErrorListener() {
        onError(error => {
            console.error('EMP API error:', error);
        });
    }

    showToast(title, message, variant) {
        // Signal the crew with a toast message
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    // Arr! These be the visual treasures for displayin' sentiment
    get sentimentEmoji() {
        if (!this.sentiment) return '❓';
        const emojiMap = {
            'Positive': '😊',
            'Neutral': '😐',
            'Negative': '😞'
        };
        return emojiMap[this.sentiment] || '❓';
    }

    get sentimentColor() {
        if (!this.sentiment) return 'slds-text-color_default';
        const colorMap = {
            'Positive': 'slds-text-color_success',
            'Neutral': 'slds-text-color_default',
            'Negative': 'slds-text-color_error'
        };
        return colorMap[this.sentiment] || 'slds-text-color_default';
    }

    get sentimentLabel() {
        return this.sentiment || 'Unknown';
    }

    get sentimentDescription() {
        // Yarr! Here be descriptions for each sentiment type
        const descriptions = {
            'Positive': 'This customer be sailin' smooth seas — happy as a clam!',
            'Neutral': 'Calm waters here — customer be neutral, neither pleased nor displeased',
            'Negative': 'Storm clouds gatherin' — this customer be frustrated or upset'
        };
        return descriptions[this.sentiment] || 'No comments to analyze yet, matey';
    }

    get hasData() {
        return !this.loading && this.sentiment !== null;
    }

    get scorePercentage() {
        // Convert score to percentage for display
        return Math.round(this.sentimentScore * 100);
    }
}