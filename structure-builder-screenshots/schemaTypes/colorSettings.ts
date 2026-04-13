import {defineType, defineField} from 'sanity'
export const colorSettings = defineType({
  name: 'colorSettings',
  title: 'Color Settings',
  type: 'document',
  fields: [
    defineField({name: 'palette', title: 'Palette', type: 'string'}),
    defineField({name: 'primaryColor', title: 'Primary Color', type: 'string'}),
    defineField({name: 'secondaryColor', title: 'Secondary Color', type: 'string'}),
  ],
})