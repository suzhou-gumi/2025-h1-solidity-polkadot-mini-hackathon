import React, { useEffect, useState } from 'react';
import { BALLOON_MAX_SIZE, INFLATION_STEP } from './types';
import { useGameContext } from './GameContext';

interface BalloonProps {
    size: number;
    onInflate: () => void;
    onSubmit: () => void;
    timeLeft: number;
    canInteract: boolean;
    isLoser?: boolean;
    containerSize?: number;
}

export const Balloon: React.FC<BalloonProps> = ({
    size,
    onInflate,
    onSubmit,
    timeLeft,
    canInteract,
    isLoser = false,
    containerSize = 580
}) => {
    const { gameRoom } = useGameContext();

    // 气球在容器内缩放
    const balloonSize = Math.min(size * 50, containerSize * 0.95); // 最大尺寸不超过容器
    const isExploded = size > BALLOON_MAX_SIZE;
    // 结算时败方气球爆炸
    const shouldExplode = isExploded || isLoser;

    // 气球大小与虚线框的像素映射
    // 设定：气球数值1~10，映射到容器10%~100%直径（1=10%，10=100%）
    const minValue = 1;
    const maxValue = 10;
    const minPixel = containerSize * 0.1; // 1对应10%
    const maxPixel = containerSize * 1.0; // 10对应100%
    // 线性插值函数
    function valueToPixel(val: number) {
        if (val <= minValue) return minPixel;
        if (val >= maxValue) return maxPixel;
        return minPixel + (maxPixel - minPixel) * (val - minValue) / (maxValue - minValue);
    }
    // 气球实际像素大小
    const balloonPixel = valueToPixel(size);

    // 虚线框范围（如果有目标区间）
    const rangeMin = gameRoom?.targetRangeMin ?? 6;
    const rangeMax = gameRoom?.targetRangeMax ?? 10;
    const rangeMinPixel = valueToPixel(rangeMin);
    const rangeMaxPixel = valueToPixel(rangeMax);

    // 游戏开始时显示虚线范围框，1秒后消失；结算时始终显示
    const [showRangeBox, setShowRangeBox] = useState(false);
    useEffect(() => {
        if (gameRoom?.status === 'waitingForSubmissions') {
            setShowRangeBox(true);
            const t = setTimeout(() => setShowRangeBox(false), 1000);
            return () => clearTimeout(t);
        } else if (gameRoom?.status === 'finished') {
            setShowRangeBox(true); // 结算时始终显示
        } else {
            setShowRangeBox(false);
        }
    }, [gameRoom?.status]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* 固定尺寸容器，超出裁剪，气球居中 */}
            <div
                className="relative flex items-center justify-center"
                style={{ width: containerSize, height: containerSize, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}
            >
                {/* 虚线范围框 */}
                {showRangeBox && (
                    <>
                        {/* 外层虚线框：最大目标区间 */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: `${rangeMaxPixel}px`,
                            height: `${rangeMaxPixel}px`,
                            transform: 'translate(-50%, -50%)',
                            border: '3px dashed #aaa',
                            borderRadius: '50%',
                            zIndex: 4 // 优化：虚线框始终在气球本体之上
                        }} />
                        {/* 内层虚线框：最小目标区间 */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: `${rangeMinPixel}px`,
                            height: `${rangeMinPixel}px`,
                            transform: 'translate(-50%, -50%)',
                            border: '2px dashed #bbb',
                            borderRadius: '50%',
                            zIndex: 4 // 优化：虚线框始终在气球本体之上
                        }} />
                    </>
                )}
                {/* 气球本体 */}
                {!shouldExplode ? (
                    <div
                        className="bg-red-500 rounded-full transition-all duration-200"
                        style={{
                            width: `${balloonPixel}px`,
                            height: `${balloonPixel}px`,
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 5 // 气球本体始终在虚线框之上
                        }}
                    />
                ) : (
                    <div className="text-8xl animate-pulse select-none" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 5 }}>💥</div>
                )}
            </div>

            <div className="space-y-2">
                {/* 底部按钮区不再显示倒计时 */}
                {canInteract && !isExploded && !isLoser && (
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={onInflate}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            充气 (+{INFLATION_STEP})
                        </button>
                        <button
                            onClick={onSubmit}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            提交
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
