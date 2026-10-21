import Card from '@mui/material/Card'
import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'

function App() {
  const [loaded] = useState(loadNovels)
  const [novels, setNovels] = useState<Novel[]>(loaded.novels)
  const [storageError, setStorageError] = useState(loaded.readError)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<ReadingStatus>('未読')
  const [episodeDrafts, setEpisodeDrafts] = useState<Record<number, string>>({})

  useEffect(() => {
    if (loaded.readError) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novels))
      setStorageError('')
    } catch {
      setStorageError(
        '保存できませんでした。再読み込みすると今回の変更が失われます。',
      )
    }
  }, [novels, loaded.readError])

  function addNovel() {
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()

    if (!trimmedTitle) return
    if (trimmedUrl && !isValidNovelUrl(trimmedUrl)) return

    setNovels((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((novel) => novel.id)) + 1,
        title: trimmedTitle,
        author: author.trim() || '作者未入力',
        readEpisode: 0,
        status,
        url: trimmedUrl,
      },
    ])

    setTitle('')
    setAuthor('')
    setUrl('')
    setStatus('未読')
  }

  function getEpisodeInput(novel: Novel) {
    return episodeDrafts[novel.id] ?? String(novel.readEpisode)
  }

  function isValidEpisode(value: string) {
    return /^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value))
  }

  function updateEpisode(id: number) {
    const novel = novels.find((novel) => novel.id === id)
    if (!novel) return

    const input = getEpisodeInput(novel)
    if (!isValidEpisode(input)) return

    const episode = Number(input)

    setNovels((current) =>
      current.map((novel) =>
        novel.id === id ? { ...novel, readEpisode: episode } : novel,
      ),
    )

    setEpisodeDrafts((current) => ({
      ...current,
      [id]: String(episode),
    }))
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
    <h1 className="mb-6 text-2xl font-bold">Web小説の読書管理</h1>

    {storageError && (
      <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
        {storageError}
      </p>
    )}

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

    <TextField
      id="novel-url"
      label="作品URL（任意）"
      fullWidth
      value={url}
      onChange={(event) => setUrl(event.target.value)}
      error={url.trim() !== '' && !isValidNovelUrl(url.trim())}
      helperText="https:// または http:// で始まるURL"
      slotProps={{ htmlInput: { inputMode: 'url' } }}
    />

    <FormControl fullWidth>
      <InputLabel id="novel-status-label">読書状態</InputLabel>
      <Select<ReadingStatus>
        labelId="novel-status-label"
        id="novel-status"
        value={status}
        label="読書状態"
        onChange={(event) =>
          setStatus(event.target.value as ReadingStatus)
        }
      >
        <MenuItem value="未読">未読</MenuItem>
        <MenuItem value="読書中">読書中</MenuItem>
        <MenuItem value="読了">読了</MenuItem>
      </Select>
    </FormControl>

    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={
        !title.trim() ||
        (url.trim() !== '' && !isValidNovelUrl(url.trim()))
      }
    >
      登録する
    </Button>
  </form>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {novels.map((novel) => (
        <Card key={novel.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <h2 className="mb-2 text-lg font-bold">{novel.title}</h2>
          <p className="text-sm text-slate-600">{novel.author}</p>
          {novel.url && (
            <Link
              href={novel.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${novel.title}を読む（新しいタブで開く）`}
              sx={{ display: 'block', mt: 1 }}
            >
              作品を読む ↗
            </Link>
          )}
          <Chip
            label={novel.status}
            size="small"
            color={
              novel.status === '読了'
                ? 'success'
                : novel.status === '読書中'
                  ? 'primary'
                  : 'error'
            }
            sx={{ mt: 2 }}
          />
          <p className="mt-4">{novel.readEpisode}話まで読了</p>
          <div className="mt-3 flex items-start gap-2">
          <TextField
            id={`episode-${novel.id}`}
            label="読んだ話数"
            size="small"
            fullWidth
            value={getEpisodeInput(novel)}
            onChange={(event) =>
              setEpisodeDrafts((current) => ({
                ...current,
                [novel.id]: event.target.value,
              }))
            }
            error={!isValidEpisode(getEpisodeInput(novel))}
            helperText="0以上の整数を入力"
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          />

          <Button
            type="button"
            variant="outlined"
            disabled={!isValidEpisode(getEpisodeInput(novel))}
            onClick={() => updateEpisode(novel.id)}
            sx={{ minHeight: 40 }}
          >
            更新
          </Button>
        </div>
        </Card>
      ))}
    </div>
  </div>
  )
}

type ReadingStatus = '未読' | '読書中' | '読了'

type Novel = {
  id: number
  title: string
  author: string
  readEpisode: number
  status: ReadingStatus
  url: string
}

const initialNovels: Novel[] = [
  {
    id: 1,
    title: '星降る街の魔法使い',
    author: '作者A',
    readEpisode: 12,
    status: '読書中',
    url: '',
  },
  {
    id: 2,
    title: '異世界の小さな喫茶店',
    author: '作者B',
    readEpisode: 5,
    status: '読書中',
    url: '',
  },
  {
    id: 3,
    title: '最後の竜と旅する日々',
    author: '作者C',
    readEpisode: 28,
    status: '読書中',
    url: '', 
  },
]

function isValidNovelUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

const STORAGE_KEY = 'mui-practice:novels'

function loadNovels(): { novels: Novel[]; readError: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved === null) {
      return { novels: initialNovels, readError: '' }
    }

    const data: unknown = JSON.parse(saved)

    if (
      !Array.isArray(data) ||
      !data.every(
        (item) =>
          item !== null &&
          typeof item === 'object' &&
          Number.isSafeInteger(item.id) &&
          typeof item.title === 'string' &&
          typeof item.author === 'string' &&
          (
            item.url === undefined ||
            (
              typeof item.url === 'string' &&
              (item.url === '' || isValidNovelUrl(item.url))
            )
          ) &&
          Number.isSafeInteger(item.readEpisode) &&
          item.readEpisode >= 0 &&
          (
            item.status === undefined ||
            item.status === '未読' ||
            item.status === '読書中' ||
            item.status === '読了'
          ),
      )
    ) {
      throw new Error('Invalid saved data')
    }

    const restoredNovels: Novel[] = data.map((item) => ({
      ...item,
      url: item.url ?? '',
      status:
        item.status ??
        (item.readEpisode > 0 ? '読書中' : '未読'),
    }))

    return { novels: restoredNovels, readError: '' }
  } catch {
    return {
      novels: initialNovels,
      readError:
        '保存データを読み込めませんでした。上書きを防ぐため、自動保存を停止しています。',
    }
  }
}

export default App