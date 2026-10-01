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
      // Adds the "Workflows" tab next to document editors.
      defaultDocumentNode: workflowDefaultDocumentNode(),
    }),
    workflowStudioPlugin({
      tag: 'nodocs', // must match the deploy tag in sanity.workflow.ts
      mappings: [
        // Start the approval workflow as soon as a new article is created, so
        // Publish is locked from the first edit until someone approves it.
        {
          docType: 'article',
          definition: 'nodocs-article-approval',
          label: 'Article approval',
          autoStart: true,
        },
      ],
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
