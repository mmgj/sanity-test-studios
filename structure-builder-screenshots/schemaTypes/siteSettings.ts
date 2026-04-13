import {defineType, defineField} from 'sanity'
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Site Title', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'keywords', title: 'Keywords', type: 'array', of: [{type: 'string'}]}),
  ],
})