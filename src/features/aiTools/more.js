import { memo } from 'react'

const More = ({ more }) => {

  return (
    <div className='flex items-center mt-1 h-[18px] text-xs text-gray-400 opacity-0 group-hover:opacity-100'>
      {
        more && (
          <>
            <div
              className='mr-2 shrink-0 truncate max-w-[33.3%]'
              title={`${'appLog.detail.timeConsuming'} ${more.latency}${'appLog.detail.second'}`}
            >
              {`${'appLog.detail.timeConsuming'} ${more.latency}${'appLog.detail.second'}`}
            </div>
            <div
              className='shrink-0 truncate max-w-[33.3%]'
            //   title={`${'appLog.detail.tokenCost'} ${formatNumber(more.tokens)}`}
            >
              {/* {`${'appLog.detail.tokenCost'} ${formatNumber(more.tokens)}`} */}
            </div>
            <div className='shrink-0 mx-2'>·</div>
            <div
              className='shrink-0 truncate max-w-[33.3%]'
              title={more.time}
            >
              {more.time}
            </div>
          </>
        )
      }
    </div>
  )
}

export default memo(More)
