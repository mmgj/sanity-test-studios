import {post} from './post'
import {author} from './author'
import {book} from './book'
import {category} from './category'
import {siteSettings} from './siteSettings'
import {colorSettings} from './colorSettings'
import {navigationSettings} from './navigationSettings'
import {page} from './page'

export const schemaTypes = [
  post, author, book, category,
  siteSettings, colorSettings, navigationSettings, page,
]