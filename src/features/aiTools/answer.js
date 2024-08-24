import { memo, useEffect, useRef, useState } from 'react'
// import More from './more'
// import { AnswerTriangle } from '@/app/components/base/icons/src/vender/solid/general'
import { Markdown } from './markdown'

const BasicContent = ({ item }) => {
  const {
    answer:content,
  } = item

  return <Markdown content={content} className={`${item.isError && '!text-[#F04438]'}`} />
}


const Answer = ({
  item,
  answerIcon,
  chatAnswerContainerInner,
}) => {
  const {
    answer:content,
    more,
  } = item

  const containerRef = useRef(null)
  const contentRef = useRef(null)

  return (
    <div className='flex mb-2 last:mb-0'>
      <div className='shrink-0 relative w-10 h-10'>
        {
          answerIcon || (
            <div className='flex items-center justify-center w-full h-full rounded-full bg-[#d5f5f6] border-[0.5px] border-black/5 text-xl'>
              🤖
            </div>
          )
        }
      </div>
      <div className='chat-answer-container group grow w-0 ml-4' ref={containerRef}>
        <div className={`group relative pr-10 ${chatAnswerContainerInner}`}>
          {/* <AnswerTriangle className='absolute -left-2 top-0 w-2 h-3 text-gray-100' /> */}
          <div
            ref={contentRef}
            className={`
              relative inline-block px-4 py-3 max-w-full bg-gray-100 rounded-b-2xl rounded-tr-2xl text-sm text-gray-900
            `}
          >
                 <div
        className={
          'absolute flex justify-end gap-1'
        }
        // style={(!hasWorkflowProcess && positionRight) ? { left: contentWidth + 8 } : {}}
      >
          {/* <CopyBtn
            value={content}
            className='hidden group-hover:block'
          /> */}
          copy
        </div>
            {
              content && (
                <BasicContent item={item} />
              )
            }
          </div>
        </div>
        {/* <More more={more} /> */}
      </div>
    </div>
  )
}

export default memo(Answer)
