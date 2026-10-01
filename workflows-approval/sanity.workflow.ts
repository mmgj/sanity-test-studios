import {defineWorkflowConfig} from '@sanity/workflow-engine/define'

import {articleApproval} from './workflows/article-approval'

export default defineWorkflowConfig({
  deployments: [
    {
      name: 'production',
      tag: 'production', // must match workflowStudioPlugin({tag}) in sanity.config.ts
      expectedMinReaderModel: 10, // required subject ⇒ reader model 10
      workflowResource: {type: 'dataset', id: 'hz65aqww.production'},
      definitions: [articleApproval],
    },
  ],
})
