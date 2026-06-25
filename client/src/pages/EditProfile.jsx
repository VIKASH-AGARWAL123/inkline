import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getAvatarUrl } from '../utils/getImageUrl'

// DiceBear styles to pick from
const AVATAR_STYLES = [
  { style: 'thumbs',        label: 'Thumbs'     },
  { style: 'adventurer',    label: 'Adventurer' },
  { style: 'avataaars',     label: 'Avataaars'  },
  { style: 'big-smile',     label: 'Big Smile'  },
  { style: 'bottts',        label: 'Bots'       },
  { style: 'croodles',      label: 'Doodle'     },
  { style: 'fun-emoji',     label: 'Emoji'      },
  { style: 'pixel-art',     label: 'Pixel'      },
]

function randomSeed() {
  return Math.random().toString(36).slice(2, 10)
}

function dicebearUrl(style, seed) {
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

export default function EditProfile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [name, setName]         = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio]           = useState(user?.bio || '')
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  // Avatar state
  const [uploadedFile, setUploadedFile]   = useState(null)        // File object for upload
  const [uploadedPreview, setUploadedPreview] = useState(null)    // blob URL
  const [avatarStyle, setAvatarStyle]     = useState(AVATAR_STYLES[0].style)
  const [seed, setSeed]                   = useState(randomSeed)
  const [useGenerated, setUseGenerated]   = useState(!user?.avatar) // true = use DiceBear

  // Generated preview URL
  const generatedUrl = dicebearUrl(avatarStyle, seed)

  // Current displayed avatar
  const currentAvatar = useGenerated
    ? generatedUrl
    : (uploadedPreview || getAvatarUrl(user?.avatar, user?.name))

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    setUploadedPreview(URL.createObjectURL(file))
    setUseGenerated(false)
  }

  function handleRandomize() {
    setSeed(randomSeed())
    setUseGenerated(true)
    setUploadedFile(null)
    setUploadedPreview(null)
  }

  function handleStyleChange(style) {
    setAvatarStyle(style)
    // setSeed(randomSeed())
    setUseGenerated(true)
    setUploadedFile(null)
    setUploadedPreview(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('username', username)
      formData.append('bio', bio)

      if (useGenerated) {
        // Fetch the SVG from DiceBear and upload it as a file
        const svgRes = await fetch(generatedUrl)
        const blob   = await svgRes.blob()
        const file   = new File([blob], `avatar-${seed}.svg`, { type: 'image/svg+xml' })
        formData.append('avatar', file)
      } else if (uploadedFile) {
        formData.append('avatar', uploadedFile)
      }

      const res = await api.put('/users/me/profile', formData)
      setUser(res.data)          // update auth context immediately
      navigate(`/profile/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Edit profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Avatar section ── */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-3">
            Profile picture
          </label>

          {/* Big preview */}
          <div className="flex items-center gap-5 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border shrink-0">
              <img src={currentAvatar} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="font-mono text-sm border border-border px-4 py-2 rounded-md hover:border-accent hover:text-accent transition-colors">
                Upload photo
              </button>
              <button type="button" onClick={handleRandomize}
                className="font-mono text-sm border border-border px-4 py-2 rounded-md hover:border-accent hover:text-accent transition-colors flex items-center gap-2">
                🎲 Randomize
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Style picker — only shown when using generated avatar */}
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Avatar style</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_STYLES.map((s) => (
                <button
                  key={s.style}
                  type="button"
                  onClick={() => handleStyleChange(s.style)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    avatarStyle === s.style && useGenerated
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <img
                    src={dicebearUrl(s.style, seed)}
                    alt={s.label}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-mono text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fields ── */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-1">Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent font-serif" />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-1">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">@</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full border border-border rounded-md pl-7 pr-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm" />
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={280}
            placeholder="Tell people a bit about yourself…"
            className="w-full border border-border rounded-md px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-accent font-serif resize-none" />
          <p className="font-mono text-xs text-muted text-right mt-1">{bio.length}/280</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="font-mono text-sm bg-ink text-paper px-5 py-2.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => navigate(`/profile/${user._id}`)}
            className="font-mono text-sm border border-border px-5 py-2.5 rounded-md hover:border-accent transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
