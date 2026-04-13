# Structure Builder Screenshots

Test Studio for DOC-1637 — capturing fresh screenshots for the Structure Builder article series.

## Project

- **Sanity project:** `ysict0n7`
- **Dataset:** `production`

## Setup

```sh
cd structure-builder-screenshots
cp .env.local.example .env
npm install
npx sanity dev --port 3333
```

## Screenshot scenarios

The `structure.ts` file demonstrates all Structure Builder patterns from the docs. Each section is commented with the screenshot it reproduces:

1. **Default document type list** — standard auto-generated post list
2. **Filtered type list with divider** — content types above, settings below divider
3. **Single document type list** — authors list
4. **Filtered document list** — "Published Posts" (posts with publishedAt)
5. **Multiple filtered lists** — "Books by Genre" with sub-lists per genre
6. **Category-based dynamic lists** — "Posts by Category" using category docs
7. **Nested/grouped lists** — "Settings" parent with siteSettings, colorSettings, navigationSettings
8. **Singleton document view** — siteSettings as direct document (not list)
9. **Role-based structure** — "Admin Settings" visible only to administrators
10. **Custom document views** — "Posts (with JSON preview)" with JSON tab
11. **Multi-view document pane** — form + JSON preview split views
12. **Custom list title** — root list titled "Base" instead of "Content"

## Document types

- `post` — title, slug, author (ref), category (ref), body, publishedAt
- `author` — name, bio, image
- `book` — title, author (ref), genre (fiction/non-fiction/sci-fi/biography)
- `category` — title, description
- `siteSettings` — title, description, keywords (singleton)
- `colorSettings` — palette, primaryColor, secondaryColor (singleton)
- `navigationSettings` — mainNav, footerNav (singleton)
- `page` — title, slug, content

## Sample content

23 documents pre-loaded: 3 authors, 4 categories, 4 posts (1 without publishedAt for filter demo), 6 books across 4 genres, 3 singletons, 3 pages.

## Custom component

`components/JsonPreview.tsx` — renders document as formatted JSON. Used in the "Create custom document views" article screenshots.
