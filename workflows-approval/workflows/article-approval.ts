import {
  defineAction,
  defineActivity,
  defineField,
  defineGuard,
  defineStage,
  defineTransition,
  defineWorkflow,
} from '@sanity/workflow-engine/define'

// Blocks publishing the subject document while the instance sits in a stage.
// Declared on every stage before approval so the lock holds from start until sign-off.
// Guard names must be unique per definition, so each stage gets its own.
const holdPublish = (stage: string) =>
  defineGuard({
    name: `hold-publish-${stage}`,
    title: 'Publishing waits for approval',
    match: {idRefs: [{type: 'fieldRead', field: 'subject'}], actions: ['publish']},
    // no predicate ⇒ unconditional deny while the stage holds
  })

export const articleApproval = defineWorkflow({
  name: 'article-approval',
  title: 'Article approval',
  description: 'An editor submits an article; an approver must approve it before it can be published.',
  initialStage: 'drafting',
  fields: [
    defineField({
      type: 'subject',
      name: 'subject',
      title: 'Article',
      types: ['article'],
      required: true,
      initialValue: {type: 'input'},
    }),
    defineField({type: 'actor', name: 'approvedBy', title: 'Approved by'}),
    defineField({type: 'string', name: 'changesRequested', title: 'Requested changes'}),
  ],
  stages: [
    defineStage({
      name: 'drafting',
      title: 'Drafting',
      description: 'The editor works on the article. Publishing is held.',
      guards: [holdPublish('drafting')],
      activities: [
        defineActivity({
          name: 'write',
          title: 'Write the article',
          actions: [
            defineAction({name: 'submit', title: 'Submit for approval', status: 'done'}),
          ],
        }),
      ],
      transitions: [defineTransition({name: 'to-review', title: 'Send for approval', to: 'in-review'})],
    }),
    defineStage({
      name: 'in-review',
      title: 'Awaiting approval',
      description: 'An approver reviews the article. Publishing is held.',
      guards: [holdPublish('in-review')],
      activities: [
        defineActivity({
          name: 'review',
          title: 'Approve or request changes',
          actions: [
            defineAction({
              name: 'clear-changes',
              title: 'Clear the previous change request',
              when: 'true', // engine-fired on entry so a resubmission does not bounce straight back
              ops: [{type: 'field.unset', target: {field: 'changesRequested'}}],
            }),
            defineAction({
              name: 'approve',
              title: 'Approve',
              status: 'done',
              ops: [{type: 'field.set', target: {field: 'approvedBy'}, value: {type: 'actor'}}],
            }),
            defineAction({
              name: 'request-changes',
              title: 'Request changes',
              status: 'done',
              params: [{type: 'string', name: 'reason', title: 'What needs to change?', required: true}],
              ops: [
                {type: 'field.set', target: {field: 'changesRequested'}, value: {type: 'param', param: 'reason'}},
              ],
            }),
          ],
        }),
      ],
      transitions: [
        defineTransition({name: 'to-approved', title: 'Approved', to: 'approved', when: 'defined($fields.approvedBy)'}),
        defineTransition({
          name: 'back-to-drafting',
          title: 'Changes requested',
          to: 'drafting',
          when: 'defined($fields.changesRequested)',
        }),
      ],
    }),
    defineStage({
      name: 'approved',
      title: 'Approved',
      description: 'Approved. The publish hold is lifted and the article can be published.',
    }),
  ],
})
