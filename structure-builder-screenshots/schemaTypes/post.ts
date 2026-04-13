import {defineType, defineField} from 'sanity'
export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}}),
    defineField({name: 'author', title: 'Author', type: 'reference', to: [{type: 'author'}]}),
    defineField({name: 'category', title: 'Category', type: 'reference', to: [{type: 'category'}]}),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime'}),
  ],
})