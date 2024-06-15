import React, { useEffect, useState } from 'react';

const Nprogress = () => {
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 3; // 调整增加的随机进度值
                return Math.min(oldProgress + diff, 100);
            });
        }, 200); // 调整计时器的间隔

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '2px',
                backgroundColor: '#4caf4f6e', // 进度条底色
                position: 'fixed',
                top: 0,
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#4caf50', // 进度条颜色
                    transition: 'width 0.3s ease', // 过渡动画
                }}
            ></div>
        </div>
    );
};

export default Nprogress;
