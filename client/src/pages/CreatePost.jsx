import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RichEditor from "../components/RichEditor";
import { TOPICS } from "../utils/topics";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("general");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required.");
    if (!content || content === "<p></p>")
      return setError("Content is required.");
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("topic", topic);
      if (image) formData.append("image", image);
      const res = await api.post("/posts", formData);
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish your post.");
    } finally {
      setSubmitting(false);
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

        {/* Topic picker */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-2">
            Topic
          </label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.filter((t) => t.value !== "all").map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value)}
                className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  topic === t.value
                    ? "bg-ink text-paper border-ink"
                    : "border-border hover:border-accent"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <RichEditor content={content} onChange={setContent} />

        {/* Cover image */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-muted mb-2">
            Cover image (optional)
          </label>
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Cover"
                className="max-h-56 rounded-md border border-border"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
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
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>
    </div>
  );
}
