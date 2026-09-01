import { LightningElement, api, wire } from 'lwc';
import analyzeCaseSentiment from '@salesforce/apex/CaseSentimentController.analyzeCaseSentiment';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CaseSentimentAnalyzer extends LightningElement {
    @api recordId; // Arr, this be the Case ID from the record page
    
    sentimentData;
    isLoading = true;
    error;
    
    // Hoist the sails and fetch the sentiment when the component loads!
    connectedCallback() {
        this.loadSentiment();
    }
    
    loadSentiment() {
        this.isLoading = true;
        this.error = undefined;
        
        // Set sail for the Apex seas!
        analyzeCaseSentiment({ caseId: this.recordId })
            .then(result => {
                // Blimey! We got the treasure (sentiment data)
                this.sentimentData = result;
                this.isLoading = false;
            })
            .catch(error => {
                // Shiver me timbers! Something went wrong
                this.error = error.body?.message || 'Unable to analyze sentiment. Check yer AI configuration, matey!';
                this.isLoading = false;
                
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Sentiment Analysis Failed',
                        message: this.error,
                        variant: 'error'
                    })
                );
            });
    }
    
    // Here be the computed properties for displaying sentiment like a proper pirate!
    get sentimentLabel() {
        if (!this.sentimentData) return '';
        const sentiment = this.sentimentData.sentiment.toLowerCase();
        
        if (sentiment === 'positive') return 'Positive';
        if (sentiment === 'negative') return 'Negative';
        return 'Neutral';
    }
    
    get sentimentEmoji() {
        if (!this.sentimentData) return '';
        const sentiment = this.sentimentData.sentiment.toLowerCase();
        
        // Arr, pick the right emoji for the mood!
        if (sentiment === 'positive') return '😊';
        if (sentiment === 'negative') return '😠';
        return '😐';
    }
    
    get sentimentClass() {
        if (!this.sentimentData) return 'sentiment-badge';
        const sentiment = this.sentimentData.sentiment.toLowerCase();
        return `sentiment-badge sentiment-${sentiment}`;
    }
    
    get sentimentScore() {
        // Convert confidence to a percentage for the progress bar
        return this.sentimentData?.confidence ? Math.round(this.sentimentData.confidence * 100) : 0;
    }
    
    get progressVariant() {
        if (!this.sentimentData) return 'base';
        const sentiment = this.sentimentData.sentiment.toLowerCase();
        
        // Blimey! Color the progress bar based on sentiment
        if (sentiment === 'positive') return 'success';
        if (sentiment === 'negative') return 'error';
        return 'warning';
    }
    
    get sentimentSummary() {
        return this.sentimentData?.summary || '';
    }
    
    get commentCount() {
        return this.sentimentData?.commentCount || 0;
    }
}