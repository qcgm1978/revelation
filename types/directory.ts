
export interface DirectoryItem {
  term: string
  pages: string[]
  note?: string
  preview_url?: string
  track?: {
    preview_url?: string
  }
}

export interface DirectoryData {
  [category: string]: DirectoryItem[]
}