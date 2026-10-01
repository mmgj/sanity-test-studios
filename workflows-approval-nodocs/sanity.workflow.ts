import type {WorkflowDeploymentInput} from '@sanity/workflow-engine'
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'

import {articleApproval} from './workflows/article-approval'

export const nodocs = {
  expectedMinReaderModel: 4,
  name: 'nodocs',
  tag: 'nodocs',
  workflowResource: {type: 'dataset', id: 'hz65aqww.production'},
  definitions: [articleApproval],
} satisfies WorkflowDeploymentInput

export default defineWorkflowConfig({deployments: [nodocs]})
