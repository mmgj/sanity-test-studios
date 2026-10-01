import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {workflowDefaultDocumentNode, workflowStudioPlugin} from '@sanity/workflow-studio-plugin'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'workflow-tests',

  projectId: 'hz65aqww',
  dataset: 'production',

  plugins: [
    structureTool({
      defaultDocumentNode: workflowDefaultDocumentNode(),
    }),
    visionTool(),
    workflowStudioPlugin({
      tag: 'production', // must match the deploy tag in sanity.workflow.ts
      mappings: [
        {
          docType: 'article',
          definition: 'article-approval',
          label: 'Approval before publish',
          autoStart: true, // every new article starts under the publish hold
        },
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
