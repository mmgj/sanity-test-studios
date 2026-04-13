import {defineType, defineField} from 'sanity'
export const book = defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({name: 'author', title: 'Author', type: 'reference', to: [{type: 'author'}]}),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'string',
      options: {
        list: [
          {title: 'Fiction', value: 'fiction'},
          {title: 'Non-Fiction', value: 'non-fiction'},
          {title: 'Sci-Fi', value: 'sci-fi'},
          {title: 'Biography', value: 'biography'},
        ],
      },
    }),
  ],
})