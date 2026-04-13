import {defineType, defineField} from 'sanity'
export const navigationSettings = defineType({
  name: 'navigationSettings',
  title: 'Navigation Settings',
  type: 'document',
  fields: [
    defineField({name: 'mainNav', title: 'Main Navigation', type: 'array', of: [{type: 'reference', to: [{type: 'page'}]}]}),
    defineField({name: 'footerNav', title: 'Footer Navigation', type: 'array', of: [{type: 'reference', to: [{type: 'page'}]}]}),
  ],
})