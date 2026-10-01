import {defineWorkflow} from '@sanity/workflow-engine/define'

// While the article is in Drafting or Review, this guard denies publishing the
// subject document. It is registered on stage entry and retracted on stage exit,
// so publishing opens up only once the workflow reaches the terminal Approved stage.
const blockPublishUntilApproved = (stage: string) => ({
  name: `block-publish-${stage}`,
  title: 'Publishing requires approval',
  description: 'The article can be published once an editor approves it.',
  match: {
    idRefs: [{type: 'fieldRead' as const, field: 'subject'}],
    actions: ['publish' as const],
  },
  // No predicate = every matching mutation is denied.
})

export const articleApproval = defineWorkflow({
  name: 'nodocs-article-approval',
  title: 'Article approval',
  description: 'An article must be approved before it can be published.',
  initialStage: 'drafting',
  fields: [
    {type: 'subject', name: 'subject', title: 'Article', initialValue: {type: 'input'}},
  ],
  stages: [
    {
      name: 'drafting',
      title: 'Drafting',
      guards: [blockPublishUntilApproved('drafting')],
      activities: [
        {
          name: 'write',
          title: 'Write the article',
          actions: [{name: 'submit', title: 'Submit for approval', status: 'done'}],
        },
      ],
      transitions: [{name: 'to-review', title: 'Send to review', to: 'review'}],
    },
    {
      name: 'review',
      title: 'Awaiting approval',
      guards: [blockPublishUntilApproved('review')],
      activities: [
        {
          name: 'review',
          title: 'Approve the article',
          actions: [{name: 'approve', title: 'Approve', status: 'done'}],
        },
      ],
      transitions: [{name: 'to-approved', title: 'Approve', to: 'approved'}],
    },
    // Terminal: entering it completes the instance and retracts the guards.
    {name: 'approved', title: 'Approved', activities: []},
  ],
})
