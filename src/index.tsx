import React, { useEffect, useState, useRef, RefObject, Children, useCallback } from 'react';
import { style } from 'typestyle';

interface RerouselProps {
    itemRef: RefObject<HTMLElement>;
    interval?: number;
    stop?: boolean;
    children: React.ReactNode;
}

const wrapper = style({
    display: 'flex',
    alignItems: 'center',
    overflowX: 'hidden',
    height: '100%',
    scrollSnapType: 'x mandatory',
    flexFlow: 'row nowrap',
    position: 'relative',
});

const useWidth = (elementRef: RefObject<HTMLElement>) => {
    const [width, setWidth] = useState<number>(0);

    const updateWidth = useCallback(() => {
        if (elementRef.current) {
            const { width } = elementRef.current.getBoundingClientRect();
            setWidth(width);
        }
    }, [elementRef]);

    useEffect(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [updateWidth]);

    return width;
};

export const Rerousel: React.FC<RerouselProps> = ({ children, itemRef, interval = 3000, stop = false }) => {
    const itemWidth = useWidth(itemRef);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [currentScrollLeft, setCurrentScrollLeft] = useState<number>(0);
    const itemCount = Children.count(children);

    useEffect(() => {
        if (!stop && itemWidth) {
            const intervalId = setInterval(() => {
                setCurrentScrollLeft((prev) => prev + 1);
            }, interval);
            return () => clearInterval(intervalId);
        }
    }, [interval, stop, itemWidth]);

    useEffect(() => {
        if (!wrapperRef.current || itemWidth === 0) return;

        wrapperRef.current.scrollTo({
            left: itemWidth * currentScrollLeft,
            behavior: 'smooth',
        });

        if (currentScrollLeft >= itemCount) {
            setTimeout(() => {
                wrapperRef.current?.scrollTo({ left: 0, behavior: 'auto' });
                setCurrentScrollLeft(0);
            }, 300);
        }
    }, [currentScrollLeft, itemWidth, itemCount]);

    return (
        <div className={wrapper} ref={wrapperRef}>
            {children}
            {children}
        </div>
    );
};
