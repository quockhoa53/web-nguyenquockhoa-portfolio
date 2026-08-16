import { Editor } from '@tinymce/tinymce-react'

const editorContentStyle = `
  body { margin: 0; padding: 20px 22px 80px; color: #1e293b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 16px; line-height: 1.8; }
  h1, h2, h3, h4 { color: #0f172a; line-height: 1.3; margin: 1.5em 0 .6em; }
  h1 { font-size: 2.25rem; } h2 { font-size: 1.75rem; } h3 { font-size: 1.35rem; }
  p { margin: 0 0 1em; } img { max-width: 100%; height: auto; border-radius: 12px; }
  blockquote { margin: 1.5em 0; padding: 12px 20px; border-left: 4px solid #6366f1; background: #f8fafc; }
  pre { padding: 18px; overflow: auto; border-radius: 10px; background: #0f172a; color: #e2e8f0; }
  table { width: 100%; border-collapse: collapse; } th, td { padding: 10px; border: 1px solid #cbd5e1; }
  a { color: #4f46e5; }
`

async function uploadEditorImage(blobInfo) {
  const formData = new FormData()
  formData.append('file', blobInfo.blob(), blobInfo.filename())

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  const response = await fetch(import.meta.env.VITE_TINYMCE_UPLOAD_URL || '/upload-handler', {
    method: 'POST',
    credentials: 'include',
    headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : undefined,
    body: formData,
  })

  if (!response.ok) throw new Error(`Không thể tải ảnh lên (HTTP ${response.status})`)

  const data = await response.json().catch(() => null)
  if (!data || typeof data.location !== 'string') {
    throw new Error('Máy chủ tải ảnh không trả về thuộc tính location hợp lệ')
  }
  return data.location
}

export function RichEditor({ value, onChange, minHeight = 620 }) {
  return (
    <div className="rich-editor-shell">
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        value={value || ''}
        onEditorChange={onChange}
        init={{
          height: minHeight,
          min_height: 480,
          resize: 'both',
          menubar: 'file edit view insert format tools table help',
          plugins: 'advlist anchor autolink charmap code codesample emoticons fullscreen image link lists media preview searchreplace table visualblocks wordcount',
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table codesample | charmap emoticons | searchreplace visualblocks | removeformat preview code fullscreen',
          toolbar_mode: 'sliding',
          contextmenu: 'link image table',
          image_advtab: true,
          image_caption: true,
          automatic_uploads: true,
          images_upload_handler: uploadEditorImage,
          link_default_target: '_blank',
          link_assume_external_targets: 'https',
          browser_spellcheck: true,
          content_style: editorContentStyle,
          promotion: false,
          branding: false,
          statusbar: true,
        }}
      />
    </div>
  )
}
