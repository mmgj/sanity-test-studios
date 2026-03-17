import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {resolve} from './src/presentation/resolve'

export default defineConfig({
  name: 'default',
  title: 'Blog Studio',
  projectId: 'ysict0n7',
  dataset: 'production',
  plugins: [
    structureTool(),
    presentationTool({
      resolve,
      previewUrl: {
        origin: 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})