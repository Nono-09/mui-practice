import Card from '@mui/material/Card'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

function App() {
  const [novels, setNovels] = useState<Novel[]>(initialNovels)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  function addNovel() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    setNovels((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((novel) => novel.id)) + 1,
        title: trimmedTitle,
        author: author.trim() || '作者未入力',
        readEpisode: 0,
      },
    ])

    setTitle('')
    setAuthor('')
  }
  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
    <h1 className="mb-6 text-2xl font-bold">Web小説の読書管理</h1>

    <form
    className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-4"
    onSubmit={(event) => {
      event.preventDefault()
      addNovel()
    }}
  >
    <TextField
      id="novel-title"
      label="作品名"
      required
      fullWidth
      value={title}
      onChange={(event) => setTitle(event.target.value)}
    />

    <TextField
      id="novel-author"
      label="作者（任意）"
      fullWidth
      value={author}
      onChange={(event) => setAuthor(event.target.value)}
    />

    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={!title.trim()}
    >
      登録する
    </Button>
  </form>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {novels.map((novel) => (
        <Card key={novel.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <h2 className="mb-2 text-lg font-bold">{novel.title}</h2>
          <p className="text-sm text-slate-600">{novel.author}</p>
          <p className="mt-4">{novel.readEpisode}話まで読了</p>
        </Card>
      ))}
    </div>
  </div>
  )
}

type Novel = {
  id: number
  title: string
  author: string
  readEpisode: number
}

const initialNovels: Novel[] = [
  { id: 1, title: '星降る街の魔法使い', author: '作者A', readEpisode: 12 },
  { id: 2, title: '異世界の小さな喫茶店', author: '作者B', readEpisode: 5 },
  { id: 3, title: '最後の竜と旅する日々', author: '作者C', readEpisode: 28 },
]

export default App