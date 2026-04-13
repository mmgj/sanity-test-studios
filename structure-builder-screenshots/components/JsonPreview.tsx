import {useFormValue} from 'sanity'

export function JsonPreview() {
  const document = useFormValue([])
  return (
    <pre style={{padding: '1rem', fontSize: '0.85rem', overflow: 'auto'}}>
      {JSON.stringify(document, null, 2)}
    </pre>
  )
}