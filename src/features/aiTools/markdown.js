import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import "./markdown.scss";
import CopyBtn from '@/components/copy-btn'
// import SVGBtn from '@/app/components/base/svg'
// import Flowchart from '@/app/components/base/mermaid'

const capitalizationLanguageNameMap = {
  sql: 'SQL',
  javascript: 'JavaScript',
  java: 'Java',
  typescript: 'TypeScript',
  vbscript: 'VBScript',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  php: 'PHP',
  python: 'Python',
  yaml: 'Yaml',
  mermaid: 'Mermaid',
  markdown: 'MarkDown',
  makefile: 'MakeFile',
}

const getCorrectCapitalizationLanguageName = (language) => {
  if (!language) return 'Plain'
  if (language in capitalizationLanguageNameMap) return capitalizationLanguageNameMap[language]
  return language.charAt(0).toUpperCase() + language.substring(1)
}

const preprocessLaTeX = (content) => {
  if (typeof content !== 'string') return content
  return content.replace(/\\\[(.*?)\\\]/gs, (_, equation) => `$$${equation}$$`)
    .replace(/\\\((.*?)\\\)/gs, (_, equation) => `$$${equation}$$`)
    .replace(/(^|[^\\])\$(.+?)\$/gs, (_, prefix, equation) => `${prefix}$${equation}$`)
}

export function PreCode(props) {
  const ref = useRef(null)

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText
            // copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  )
}

const useLazyLoad = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true)
        observer.disconnect()
      }
    })

    if (ref.current) observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}

const CodeBlock = memo(({ inline, className, children, ...props }) => {
  const [isSVG, setIsSVG] = useState(true)
  const match = /language-(\w+)/.exec(className || '')
  const language = match?.[1]
  const languageShowName = getCorrectCapitalizationLanguageName(language || '')

  return useMemo(() => {
    return !inline && match ? (
      <div>
        <div
          className="flex justify-between h-8 items-center p-1 pl-3 border-b"
          style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
        >
          <div className="text-[13px] text-gray-500 font-normal">
            {languageShowName}
          </div>
          <div style={{ display: "flex" }}>
            {/* {language === 'mermaid' && (
                <SVGBtn isSVG={isSVG} setIsSVG={setIsSVG} />
              )} */}
            <CopyBtn
              className="mr-1"
              position={"top"}
              value={String(children).replace(/\n$/, "")}
              isPlain
            />
          </div>
        </div>
        <SyntaxHighlighter
          {...props}
          style={atelierHeathLight}
          customStyle={{ paddingLeft: 12, backgroundColor: "#fff" }}
          language={match[1]}
          showLineNumbers
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code {...props} className={className}>
        {children}
      </code>
    );
  }, [children, className, inline, isSVG, language, languageShowName, match, props])
})

CodeBlock.displayName = 'CodeBlock'

export function Markdown(props) {
  const latexContent = preprocessLaTeX(props.content)
  return (
    <div className={`markdown-body ${props.className}`}>
      <ReactMarkdown
        remarkPlugins={[[RemarkMath, { singleDollarTextMath: false }], RemarkGfm, RemarkBreaks]}
        rehypePlugins={[RehypeKatex]}
        components={{
          code: CodeBlock,
          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
                width={250}
                height={250}
                className="max-w-full h-auto align-middle border-none rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mt-2 mb-2"
                {...props}
              />
            )
          },
          p: (paragraph) => {
            const { node } = paragraph
            if (node.children[0].tagName === 'img') {
              const image = node.children[0]
              return (
                <>
                  <img
                    src={image.properties.src}
                    width={250}
                    height={250}
                    className="max-w-full h-auto align-middle border-none rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mt-2 mb-2"
                    alt={image.properties.alt}
                  />
                  <p>{paragraph.children.slice(1)}</p>
                </>
              )
            }
            return <p>{paragraph.children}</p>
          },
        }}
        linkTarget='_blank'
      >
        {latexContent}
      </ReactMarkdown>
    </div>
  )
}
