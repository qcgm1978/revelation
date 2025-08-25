// 定义目录项的类型
interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
}

export interface DirectoryData {
  [category: string]: DirectoryItem[]
}