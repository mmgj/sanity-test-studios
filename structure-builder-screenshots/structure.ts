import type {StructureResolver} from 'sanity/structure'
import {JsonPreview} from './components/JsonPreview'

export const structure: StructureResolver = (S, context) => {
  // Get the current user for role-based structure (screenshot #9)
  const {currentUser} = context

  return S.list()
    // Screenshot #12: Custom list title — override "Content" to "Base"
    .title('Base')
    .items([

      // ============================================================
      // Screenshot #1: Default document type list
      // Shows the standard auto-generated list for posts
      // ============================================================
      S.documentTypeListItem('post').title('Posts'),

      // ============================================================
      // Screenshot #3: Single document type list
      // Standard list for authors
      // ============================================================
      S.documentTypeListItem('author').title('Authors'),

      // ============================================================
      // Screenshot #5: Multiple filtered lists
      // Map over genres to create filtered book lists
      // ============================================================
      S.listItem()
        .title('Books by Genre')
        .child(
          S.list()
            .title('Books by Genre')
            .items([
              ...['fiction', 'non-fiction', 'sci-fi', 'biography'].map((genre) =>
                S.listItem()
                  .title(genre.charAt(0).toUpperCase() + genre.slice(1))
                  .child(
                    S.documentList()
                      .title(`${genre.charAt(0).toUpperCase() + genre.slice(1)} Books`)
                      .filter('_type == "book" && genre == $genre')
                      .params({genre})
                  )
              ),
            ])
        ),

      // ============================================================
      // Screenshot #4: Filtered document list
      // Posts filtered by a condition (has published date)
      // ============================================================
      S.listItem()
        .title('Published Posts')
        .child(
          S.documentList()
            .title('Published Posts')
            .filter('_type == "post" && defined(publishedAt)')
        ),

      // ============================================================
      // Screenshot #6: Category-based dynamic lists
      // Use category documents to create filtered post lists
      // ============================================================
      S.listItem()
        .title('Posts by Category')
        .child(
          S.documentTypeList('category')
            .title('Posts by Category')
            .child((categoryId) =>
              S.documentList()
                .title('Posts')
                .filter('_type == "post" && category._ref == $categoryId')
                .params({categoryId})
            )
        ),

      S.documentTypeListItem('book').title('All Books'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('page').title('Pages'),

      // ============================================================
      // Screenshot #2: Filtered type list with divider
      // Divider separating content types from settings
      // ============================================================
      S.divider(),

      // ============================================================
      // Screenshot #7: Nested/grouped lists
      // Group settings documents under a "Settings" parent
      // ============================================================
      S.listItem()
        .title('Settings')
        .child(
          S.list()
            .title('Settings')
            .items([
              // Screenshot #8: Singleton document view
              // siteSettings as a singleton (direct document, not list)
              S.listItem()
                .title('Site Settings')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.listItem()
                .title('Color Settings')
                .child(
                  S.document()
                    .schemaType('colorSettings')
                    .documentId('colorSettings')
                ),
              S.listItem()
                .title('Navigation')
                .child(
                  S.document()
                    .schemaType('navigationSettings')
                    .documentId('navigationSettings')
                ),
            ])
        ),

      // ============================================================
      // Screenshot #9: Role-based structure
      // Show "Admin Settings" only for users with admin role
      // ============================================================
      ...(currentUser?.roles?.find((r) => r.name === 'administrator')
        ? [
            S.divider(),
            S.listItem()
              .title('Admin Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ]
        : []),

      // ============================================================
      // Screenshots #10, #11: Custom document views / Multi-view pane
      // Post with form + JSON preview split views
      // ============================================================
      S.listItem()
        .title('Posts (with JSON preview)')
        .child(
          S.documentTypeList('post')
            .title('Posts')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(),
                  S.view.component(JsonPreview).title('JSON'),
                ])
            )
        ),
    ])
}