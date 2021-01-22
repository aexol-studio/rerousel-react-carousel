import React, { useEffect, useCallback, useState, useRef, Children, RefObject } from 'react';
import './Rerousel.css';

interface RerouselProps {
    itemWidth?: number;
    itemRef: RefObject<HTMLElement>;
    interval?: number;
}

export const Rerousel: React.FC<RerouselProps> = ({ children, itemRef, interval = 3000 }) => {
    const [itemWidth] = useWidth(itemRef);
    const [, setScrollInterval] = useState<NodeJS.Timeout>();
    const [currentScrollLeft, setCurrentScrollLeft] = useState<number>(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cc = Children.count(children);

    function useWidth(elementRef: RefObject<HTMLElement>) {
        const [width, setWidth] = useState<number>(0);

        const updateWidth = useCallback(() => {
            if (elementRef && elementRef.current) {
                const { width } = elementRef.current.getBoundingClientRect();
                console.log(width);

                setWidth(width);
            }
        }, [elementRef]);

        useEffect(() => {
            updateWidth();
            window.addEventListener('resize', updateWidth);
            return () => {
                window.removeEventListener('resize', updateWidth);
            };
        }, [updateWidth]);

        return [width];
    }

    useEffect(() => {
        if (currentScrollLeft === 0) {
            wrapperRef.current?.scrollTo({ left: 0 });
            setCurrentScrollLeft(1);
            return;
        }
        if (currentScrollLeft > cc) {
            setCurrentScrollLeft(0);
            return;
        }

        if (itemWidth != undefined) {
            wrapperRef.current?.scrollTo({
                left: itemWidth * currentScrollLeft,
                behavior: 'smooth',
            });
        }
    }, [currentScrollLeft, itemWidth]);

    useEffect(() => {
        const i = setInterval(() => {
            setCurrentScrollLeft((csl) => csl + 1);
        }, interval);
        setScrollInterval(i);
        return () => {
            setScrollInterval((i) => {
                if (i) {
                    clearInterval(i);
                }
                return undefined;
            });
        };
    }, [itemWidth]);
    return (
        <div className="Wrapper" ref={wrapperRef}>
            {children}
            {children}
        </div>
    );
};
