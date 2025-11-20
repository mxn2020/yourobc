// convex/lib/yourobc/customers/contacts/index.ts

// Export mutations
export {
  logContact,
  updateContactOutcome,
  scheduleFollowUp,
  completeFollowUp,
  bulkCompleteFollowUps,
  deleteContactLog,
  addContactTags,
  removeContactTags,
} from './mutations'

// Export queries
export {
  getContactLog,
  getPendingFollowUps,
  getInactiveCustomers,
  getContactStatistics,
  getContactsByCategory,
  getContactById,
  getAllContactTags,
  getContactTimeline,
} from './queries'
