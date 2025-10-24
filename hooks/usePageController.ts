// @ts-ignore
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
 
  const [currentTopic, setCurrentTopic] = useState<string>('目录')
  const [currentTopicWithPage, setCurrentTopicWithPage] = useState<string>('目录')
  const [isDirectory, setIsDirectory] = useState<boolean>(true)
  const [history, setHistory] = useState<string[]>(['目录'])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

 
  // 修改 useEffect 中的相关代码，传递 language 参数
  useEffect(() => {
    if (history.length === 0) {
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      handleSearch(defaultTopic)
    } else {
     
      const urlParams = new URLSearchParams(window.location.search)
      const topicFromUrl = urlParams.get('topic')
      const pageFromUrl = urlParams.get('page')

      if (topicFromUrl) {
        const decodedTopic = decodeURIComponent(topicFromUrl)
        setCurrentTopic(decodedTopic)
        setCurrentTopicWithPage(decodedTopic)
        setCurrentIndex(0)
        setHistory([decodedTopic])

       
        if (pageFromUrl) {
          const page_txt = get_page_chapter_txt(pageFromUrl, language)
          const topicWithPage = `<span style="color: rgb(155, 89, 182);">${decodedTopic}</span>${page_txt}`
          setCurrentTopicWithPage(topicWithPage)
        }

        if (decodedTopic === '目录' || decodedTopic === 'Directory') {
          setIsDirectory(true)
        }
      } else if (window.history.state === null) {
       
        window.history.replaceState(
          { historyIndex: currentIndex, topic: currentTopic },
          '',
          `?topic=${encodeURIComponent(currentTopic)}`
        )
      }
    }
  }, [language, history.length])

 
  useEffect(() => {
    // 修改 handlePopState 中的相关代码，传递 language 参数
    const handlePopState = (event: PopStateEvent) => {
     
      const state = event.state
      if (state && state.historyIndex !== undefined) {
        const newIndex = state.historyIndex

       
        if (newIndex >= 0 && newIndex < history.length) {
         
          const newTopic = history[newIndex]
          setCurrentIndex(newIndex)
          setCurrentTopic(newTopic)

         
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

         
          if (state.page && state.page.length > 0) {
            const page_txt = ` 第${state.page.join('、')}页`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${newTopic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(newTopic)
          }
        } else if (state.topic) {
         
          setCurrentTopic(state.topic)
          setCurrentIndex(0)
          setHistory([state.topic])

         
          if (state.topic === '目录' || state.topic === 'Directory') {
            setIsDirectory(true)
           
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

          if (state.page && state.page.length > 0) {
            const page_txt = ` 第${state.page.join('、')}页`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${state.topic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(state.topic)
          }
        } else {
          const defaultTopic = language === 'zh' ? '目录' : 'Directory'
          setCurrentTopic(defaultTopic)
          setCurrentIndex(0)
          setHistory([defaultTopic])
          setCurrentTopicWithPage(defaultTopic)
          setIsDirectory(true)

         
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
       
        const urlParams = new URLSearchParams(window.location.search)
        const topicFromUrl = urlParams.get('topic')
        const pageFromUrl = urlParams.get('page')

        if (topicFromUrl) {
          const decodedTopic = decodeURIComponent(topicFromUrl)
          setCurrentTopic(decodedTopic)
          setCurrentIndex(0)
          setHistory([decodedTopic])

         
          if (decodedTopic === '目录' || decodedTopic === 'Directory') {
            setIsDirectory(true)
           
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

         
          if (pageFromUrl) {
            const pageArray = pageFromUrl.split(',')
            const page_txt = ` ${pageArray.join(language === 'zh' ? '、' : ', ')}`
            const topicWithPage = `<span style="color: rgb(155, 89, 182);">${decodedTopic}</span>${page_txt}`
            setCurrentTopicWithPage(topicWithPage)
          } else {
            setCurrentTopicWithPage(decodedTopic)
          }
        } else {
         
          const defaultTopic = language === 'zh' ? '目录' : 'Directory'
          setCurrentTopic(defaultTopic)
          setCurrentIndex(0)
          setHistory([defaultTopic])
          setCurrentTopicWithPage(defaultTopic)
          setIsDirectory(true)

         
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

   
    window.addEventListener('popstate', handlePopState)

   
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [history, directoryStateCache])

 
  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setCurrentTopic(history[currentIndex + 1])
    }
  }

  const handleWordClick = (word: string, page?: string) => {
   
    const topicWithPage = page ? `${word} ${page}` : word
    handleSearch(topicWithPage)
  }


  const handleSearch = (topic: string, page?: Array<string>, category?: string, context?: string) => {
    const newTopic = topic.trim()
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      const page_txt = page?.length ? `${page.map(p => get_page_chapter_txt(p, language)).join(language === 'zh' ? '、' : ', ')}` : ''
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

     
      const urlParams = new URLSearchParams()
      urlParams.append('topic', encodeURIComponent(newTopic))
      if (page && page.length > 0) {
        urlParams.append('page', page.join(','))
      }
      if (category) {
        urlParams.append('category', encodeURIComponent(category))
      }
      if (context) {
        urlParams.append('context', encodeURIComponent(context))
      }

     
      window.history.pushState(
        { historyIndex: newIndex, topic: newTopic, page: page, category: category, context: context },
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

     
      if (prevTopic === '目录' || prevTopic === 'Directory') {
        setIsDirectory(true)
       
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
    } else if (currentTopic !== '目录' && currentTopic !== 'Directory') {
     
      const defaultTopic = language === 'zh' ? '目录' : 'Directory'
      setCurrentTopic(defaultTopic)
      setCurrentIndex(0)
      setHistory([defaultTopic])
      setIsDirectory(true)

     
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

// 修改 get_page_chapter_txt 函数，添加 language 参数
function get_page_chapter_txt(pageFromUrl: string, language: 'zh' | 'en') {
  const pageArray = pageFromUrl.split(',').map(d => {
    if (d.slice(1) == '0') {
      return language === 'zh' ? '序' : 'Prologue'
    } else if (d[0] == 'p') {
      return language === 'zh' ? `${d.slice(1)}页` : `Page ${d.slice(1)}`
    } else {
      return language === 'zh' ? `${d.slice(1)}章` : `Chapter ${d.slice(1)}`
    }
  })
  const separator = language === 'zh' ? '、' : ', '
  const prefix = language === 'zh' ? ' ' : ' '
  const page_txt = prefix + pageArray.join(separator)
  return page_txt
}
