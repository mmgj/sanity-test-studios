import {defineType, defineField} from 'sanity'
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}}),
    defineField({name: 'content', title: 'Content', type: 'array', of: [{type: 'block'}]}),
  ],
})