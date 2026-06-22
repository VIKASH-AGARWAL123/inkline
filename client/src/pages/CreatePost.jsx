import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImage(null)
    setPreview(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      if (image) formData.append('image', image)

      const res = await api.post('/posts', formData)
      navigate(`/post/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Write a new post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full font-display text-xl font-bold border-b border-border px-1 py-2 bg-transparent focus:outline-none focus:border-accent"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell your story…"
          required
          rows={14}
          className="w-full font-serif text-lg leading-relaxed border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-2">
            Cover image (optional)
          </label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Selected cover" className="max-h-56 rounded-md border border-border" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-ink/80 text-paper text-xs font-mono px-2 py-1 rounded-md hover:bg-ink"
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="font-mono text-sm text-muted file:mr-3 file:font-mono file:text-sm file:bg-ink file:text-paper file:border-0 file:rounded-md file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-accent"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="font-mono text-sm bg-ink text-paper px-5 py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
        >
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
