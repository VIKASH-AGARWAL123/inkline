import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import RichEditor from '../components/RichEditor'
import { TOPICS } from '../utils/topics'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('general')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/posts/${id}`).then((res) => {
      setTitle(res.data.title)
      setContent(res.data.content)
      setTopic(res.data.topic || 'general')
      if (res.data.image) setPreview(res.data.image)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      formData.append('topic', topic)
      if (image) formData.append('image', image)
      await api.put(`/posts/${id}`, formData)
      navigate(`/post/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update post.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-center text-muted py-16 font-serif">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6">Edit post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required
          className="w-full font-display text-xl font-bold border-b border-border px-1 py-2 bg-transparent focus:outline-none focus:border-accent" />

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-2">Topic</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.filter(t => t.value !== 'all').map((t) => (
              <button key={t.value} type="button" onClick={() => setTopic(t.value)}
                className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  topic === t.value ? 'bg-ink text-paper border-ink' : 'border-border hover:border-accent'
                }`}>
                <span>{t.emoji}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <RichEditor content={content} onChange={setContent} />

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-2">Cover image</label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview.startsWith('blob') ? preview : `http://localhost:5000${preview}`}
                alt="Cover" className="max-h-56 rounded-md border border-border" />
              <button type="button" onClick={() => { setImage(null); setPreview(null) }}
                className="absolute top-2 right-2 bg-ink/80 text-paper text-xs font-mono px-2 py-1 rounded-md">
                Remove
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)) } }}
              className="font-mono text-sm text-muted file:mr-3 file:font-mono file:text-sm file:bg-ink file:text-paper file:border-0 file:rounded-md file:px-3 file:py-1.5 file:cursor-pointer hover:file:bg-accent" />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="font-mono text-sm bg-ink text-paper px-5 py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => navigate(`/post/${id}`)}
            className="font-mono text-sm border border-border px-5 py-2.5 rounded-md hover:border-accent transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
