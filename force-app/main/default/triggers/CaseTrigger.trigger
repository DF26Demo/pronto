/**
 * Arr! This trigger keeps a weather eye on Cases and updates the Account's open case count
 * Fires when cases be created, updated, deleted, or brought back from Davy Jones' locker
 */
trigger CaseTrigger on Case (after insert, after update, after delete, after undelete) {
    // Ahoy! Gather all affected Account IDs from the seven seas of DML operations
    Set<Id> accountIds = new Set<Id>();
    
    // When cases be added or resurrected from the depths
    if (Trigger.isInsert || Trigger.isUndelete) {
        for (Case c : Trigger.new) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }
    }
    
    // When cases be modified - check if status changed or Account changed
    if (Trigger.isUpdate) {
        for (Case c : Trigger.new) {
            Case oldCase = Trigger.oldMap.get(c.Id);
            // Blimey! Status changed or the case sailed to a different Account
            if (c.Status != oldCase.Status || c.AccountId != oldCase.AccountId) {
                if (c.AccountId != null) {
                    accountIds.add(c.AccountId);
                }
                if (oldCase.AccountId != null) {
                    accountIds.add(oldCase.AccountId);
                }
            }
        }
    }
    
    // When cases walk the plank (deleted)
    if (Trigger.isDelete) {
        for (Case c : Trigger.old) {
            if (c.AccountId != null) {
                accountIds.add(c.AccountId);
            }
        }
    }
    
    // Avast! If we found any Accounts that need updatin', call the helper
    if (!accountIds.isEmpty()) {
        CaseTriggerHelper.updateAccountOpenCaseCount(accountIds);
    }
}