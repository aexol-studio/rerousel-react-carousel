import React, { useEffect, useState, useRef, Children } from 'react';
import './pkg.css';

interface RerouselProps {
    itemWidth: number;
    interval?: number;
}

export const Rerousel: React.FC<RerouselProps> = ({ children, itemWidth, interval = 3000 }) => {
    const [, setScrollInterval] = useState<NodeJS.Timeout>();
    const [currentScrollLeft, setCurrentScrollLeft] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const cc = Children.count(children);

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
        wrapperRef.current?.scrollTo({
            left: itemWidth * currentScrollLeft,
            behavior: 'smooth',
        });
    }, [currentScrollLeft]);

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
