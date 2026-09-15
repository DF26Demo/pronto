public with sharing class ContactBirthdayController {
    /**
     * Arr! This method fetches contacts with birthdays and calculates
     * how many days 'til their next birthday celebration!
     * @return List of ContactBirthday wrapper objects with countdown info
     */
    @AuraEnabled(cacheable=true)
    public static List<ContactBirthday> getContactBirthdays() {
        List<ContactBirthday> birthdayList = new List<ContactBirthday>();
        
        try {
            // Shiver me timbers! Fetch all contacts with birthdays
            List<Contact> contacts = [
                SELECT Id, Name, Email, Birthdate
                FROM Contact
                WHERE Birthdate != null
                ORDER BY Name
                LIMIT 500
            ];
            
            Date today = Date.today();
            
            // Calculate days until each matey's birthday!
            for (Contact contact : contacts) {
                ContactBirthday cb = new ContactBirthday();
                cb.contactId = contact.Id;
                cb.contactName = contact.Name;
                cb.email = contact.Email;
                cb.birthdate = contact.Birthdate;
                
                // Blimey! Calculate the next birthday occurrence
                Date nextBirthday = Date.newInstance(
                    today.year(),
                    contact.Birthdate.month(),
                    contact.Birthdate.day()
                );
                
                // If birthday already passed this year, set it to next year
                if (nextBirthday < today) {
                    nextBirthday = nextBirthday.addYears(1);
                }
                
                // Calculate days between today and next birthday
                cb.daysUntilBirthday = today.daysBetween(nextBirthday);
                cb.nextBirthday = nextBirthday;
                
                birthdayList.add(cb);
            }
            
            // Sort by nearest birthday first, like a proper captain
            birthdayList.sort();
            
            return birthdayList;
            
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch contact birthdays: ' + e.getMessage());
        }
    }
    
    /**
     * Arr! A wrapper class to hold contact birthday info
     * Implements Comparable so we can sort by days until birthday
     */
    public class ContactBirthday implements Comparable {
        @AuraEnabled public Id contactId;
        @AuraEnabled public String contactName;
        @AuraEnabled public String email;
        @AuraEnabled public Date birthdate;
        @AuraEnabled public Date nextBirthday;
        @AuraEnabled public Integer daysUntilBirthday;
        
        // Compare by days until birthday (ascending)
        public Integer compareTo(Object compareTo) {
            ContactBirthday other = (ContactBirthday)compareTo;
            if (daysUntilBirthday == other.daysUntilBirthday) return 0;
            return daysUntilBirthday > other.daysUntilBirthday ? 1 : -1;
        }
    }
}
