import { useState, useEffect } from 'react'

interface DirectoryStateCache {
  categoryMode: 'subject' | 'page'
  pageFilter: string
  selectedSubject: string
}

interface PageControllerProps {
  language: 'zh' | 'en'
  directoryStateCache: DirectoryStateCache
  getCurrentDirectoryData?: () => Record<string, any> | undefined
}

interface PageControllerReturn {
  currentTopic: string
  currentTopicWithPage: string
  isDirectory: boolean
  history: string[]
  currentIndex: number
  handleSearch: (topic: string, page?: Array<string>,category?: string) => void
  handleBack: () => void
  handleForward: () => void
  handleRandom: () => void
  handleWordClick: (word: string, page?: string) => void
}

export const usePageController = ({ 
  language, 
  directoryStateCache,
  getCurrentDirectoryData 
}: PageControllerProps): PageControllerReturn => {
  // 状态管理
  const [currentTopic, setCurrentTopic] = useState<string>('目录')
  const [currentTopicWithPage, setCurrentTopicWithPage] = useState<string>('目录')
  const [isDirectory, setIsDirectory] = useState<boolean>(true)
  const [history, setHistory] = useState<string[]>(['目录'])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 初始化历史记录
  useEffect(() => {
    if (history.length === 0) {
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      handleSearch(defaultTopic)
    } else {
      // 检查URL参数，尝试从URL恢复状态
      const urlParams = new URLSearchParams(window.location.search)
      const topicFromUrl = urlParams.get('topic')
      const pageFromUrl = urlParams.get('page')

      if (topicFromUrl) {
        const decodedTopic = decodeURIComponent(topicFromUrl)
        setCurrentTopic(decodedTopic)
        setCurrentTopicWithPage(decodedTopic)
        setCurrentIndex(0)
        setHistory([decodedTopic])

        // 如果URL中包含页码信息，解析并应用
        if (pageFromUrl) {
          const pageArray = pageFromUrl.split(',')
          const page_txt = ` 第${pageArray.join('、')}页`
          const topicWithPage = `<span style="color: rgb(155, 89, 182);">${decodedTopic}</span>${page_txt}`
          setCurrentTopicWithPage(topicWithPage)
        }

        if (decodedTopic === '目录' || decodedTopic === 'Directory') {
          setIsDirectory(true)
        }
      } else if (window.history.state === null) {
        // 既没有URL参数也没有history状态，设置默认状态
        window.history.replaceState(
          { historyIndex: currentIndex, topic: currentTopic },
          '',
          `?topic=${encodeURIComponent(currentTopic)}`
        )
      }
    }
  }, [language, history.length])

  // 监听浏览器的 popstate 事件
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 从事件状态中获取保存的历史索引
      const state = event.state
      if (state && state.historyIndex !== undefined) {
        const newIndex = state.historyIndex

        // 增强的范围检查和回退策略
        if (newIndex >= 0 && newIndex < history.length) {
          // 正常情况：索引在有效范围内
          const newTopic = history[newIndex]
          setCurrentIndex(newIndex)
          setCurrentTopic(newTopic)

          // 设置isDirectory状态
          if (
            newTopic === '目录' ||
            newTopic === 'Directory' ||
            state.topic === '目录' ||
            state.topic === 'Directory'
          ) {
            const topic = state.topic
            setCurrentTopic(topic)
            setCurrentTopicWithPage(topic)
            setCurrentIndex(0)
            setHistory([topic])
            setIsDirectory(true)
            return
          } else {
            setIsDirectory(false)
          }

          // 如果状态中包含页码信息，设置currentTopicWithPage
          if (state.page && state.page.length > 0) {
            const page_txt = ` 第${state.page.join('、')}页`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${newTopic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(newTopic)
          }
        } else if (state.topic) {
          // 降级方案1：索引无效但有topic，直接跳转到该主题
          setCurrentTopic(state.topic)
          setCurrentIndex(0)
          setHistory([state.topic])

          // 设置isDirectory状态
          if (state.topic === '目录' || state.topic === 'Directory') {
            setIsDirectory(true)
            // 强制更新，确保状态变化被正确捕获
            setTimeout(() => {
              setIsDirectory(true)
              document.dispatchEvent(
                new CustomEvent('restoreDirectoryState', {
                  detail: directoryStateCache
                })
              )
            }, 10)
          } else {
            setIsDirectory(false)
          }

          // 如果状态中包含页码信息，设置currentTopicWithPage
          if (state.page && state.page.length > 0) {
            const page_txt = ` 第${state.page.join('、')}页`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${state.topic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(state.topic)
          }
        } else {
          // 降级方案2：完全无法恢复时，重置到目录页
          const defaultTopic = language === 'zh' ? '目录' : 'Directory'
          setCurrentTopic(defaultTopic)
          setCurrentIndex(0)
          setHistory([defaultTopic])
          setCurrentTopicWithPage(defaultTopic)
          setIsDirectory(true)

          // 强制更新，确保状态变化被正确捕获
          setTimeout(() => {
            setIsDirectory(true)
            document.dispatchEvent(
              new CustomEvent('restoreDirectoryState', {
                detail: directoryStateCache
              })
            )
          }, 10)
        }
      } else {
        // 从URL参数中尝试恢复状态
        const urlParams = new URLSearchParams(window.location.search)
        const topicFromUrl = urlParams.get('topic')
        const pageFromUrl = urlParams.get('page')

        if (topicFromUrl) {
          const decodedTopic = decodeURIComponent(topicFromUrl)
          setCurrentTopic(decodedTopic)
          setCurrentIndex(0)
          setHistory([decodedTopic])

          // 设置isDirectory状态
          if (decodedTopic === '目录' || decodedTopic === 'Directory') {
            setIsDirectory(true)
            // 强制更新，确保状态变化被正确捕获
            setTimeout(() => {
              setIsDirectory(true)
              document.dispatchEvent(
                new CustomEvent('restoreDirectoryState', {
                  detail: directoryStateCache
                })
              )
            }, 10)
          } else {
            setIsDirectory(false)
          }

          // 如果URL中包含页码信息，解析并应用
          if (pageFromUrl) {
            const pageArray = pageFromUrl.split(',')
            const page_txt = ` 第${pageArray.join('、')}页`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${decodedTopic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(decodedTopic)
          }
        } else {
          // 如果URL中也没有主题，默认跳转到目录页
          const defaultTopic = language === 'zh' ? '目录' : 'Directory'
          setCurrentTopic(defaultTopic)
          setCurrentIndex(0)
          setHistory([defaultTopic])
          setCurrentTopicWithPage(defaultTopic)
          setIsDirectory(true)

          // 强制更新，确保状态变化被正确捕获
          setTimeout(() => {
            setIsDirectory(true)
            document.dispatchEvent(
              new CustomEvent('restoreDirectoryState', {
                detail: directoryStateCache
              })
            )
          }, 10)
        }
      }
    }

    // 监听 popstate 事件
    window.addEventListener('popstate', handlePopState)

    // 清理函数
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [history, directoryStateCache])

  // 导航函数
  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setCurrentTopic(history[currentIndex + 1])
    }
  }

  const handleWordClick = (word: string, page?: string) => {
    // 如果有页码信息，组合词条和页码
    const topicWithPage = page ? `${word} ${page}` : word
    handleSearch(topicWithPage)
  }


  const handleSearch = (topic: string, page?: Array<string>, category?: string) => {
    const newTopic = topic.trim()
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      const page_txt = page?.length ? ` 第${page.join('、')}页` : ''
      const topicWithPage = page
        ? `<span style="color: rgb(155, 89, 182);">${topic}</span>${page_txt}`
        : topic
      setCurrentTopic(topic)
      setCurrentTopicWithPage(topicWithPage)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(newTopic)
      setHistory(newHistory)
      const newIndex = newHistory.length - 1
      setCurrentIndex(newIndex)

      // 在URL中包含页码和分类信息
      const urlParams = new URLSearchParams()
      urlParams.append('topic', encodeURIComponent(newTopic))
      if (page && page.length > 0) {
        urlParams.append('page', page.join(','))
      }
      if (category) {
        urlParams.append('category', encodeURIComponent(category))
      }

      // 在pushState中包含完整的topic、page和category信息
      window.history.pushState(
        { historyIndex: newIndex, topic: newTopic, page: page, category: category },
        '',
        `?${urlParams.toString()}`
      )
    }
  }

  const handleRandom = () => {
    setIsLoading(true)
    const allTerms: string[] = []
    if (getCurrentDirectoryData) {
      const currentData = getCurrentDirectoryData()
      if (currentData) {
        ;(Object.values(currentData) as any[]).forEach(
          categoryItems => {
            categoryItems.forEach((item: any) => {
              if (item.term) {
                allTerms.push(item.term)
              }
            })
          }
        )
      }
    }

    if (allTerms.length > 0) {
      const randomIndex = Math.floor(Math.random() * allTerms.length)
      let randomTerm = allTerms[randomIndex]

      if (randomTerm.toLowerCase() === currentTopic.toLowerCase()) {
        randomTerm = allTerms[(randomIndex + 1) % allTerms.length]
      }

      setCurrentTopic(randomTerm)
      const newHistory = history.slice(0, currentIndex + 1)
      newHistory.push(randomTerm)
      setHistory(newHistory)
      setCurrentIndex(newHistory.length - 1)
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      const prevTopic = history[prevIndex]
      setCurrentIndex(prevIndex)
      setCurrentTopic(prevTopic)

      // 确保设置isDirectory状态
      if (prevTopic === '目录' || prevTopic === 'Directory') {
        setIsDirectory(true)
        // 强制更新，确保状态变化被正确捕获
        setTimeout(() => {
          setIsDirectory(true)
          // 当返回目录页时，发送目录状态缓存
          document.dispatchEvent(
            new CustomEvent('restoreDirectoryState', {
              detail: directoryStateCache
            })
          )
        }, 10)
      } else {
        setIsDirectory(false)
      }
    } else if (currentTopic !== '目录' && currentTopic !== 'Directory') {
      // 如果已经在历史记录的最开始，但不是目录页，直接跳转到目录页
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      setCurrentTopic(defaultTopic)
      setCurrentIndex(0)
      setHistory([defaultTopic])
      setIsDirectory(true)

      // 更新浏览器历史记录
      window.history.replaceState(
        { historyIndex: 0, topic: defaultTopic },
        '',
        `?topic=${encodeURIComponent(defaultTopic)}`
      )
    }
  }

  return {
    currentTopic,
    currentTopicWithPage,
    isDirectory,
    history,
    currentIndex,
    handleSearch,
    handleBack,
    handleForward,
    handleRandom,
    handleWordClick,
  }
}