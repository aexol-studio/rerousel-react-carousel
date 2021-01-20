import { useState, useEffect } from 'react';

const isWindowDefined = typeof window !== 'undefined';

const checkCurrentWindowSize = () => {
    if (isWindowDefined) {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    return {
        width: 1200,
        height: 800,
    };
};

export const useWindowSize = () => {
    const [state, setState] = useState(checkCurrentWindowSize());
    const updateWindowSize = () => {
        setState(checkCurrentWindowSize());
    };
    useEffect(() => {
        if (isWindowDefined) {
            updateWindowSize();
            window.addEventListener('resize', updateWindowSize);
            return () => {
                window.removeEventListener('resize', updateWindowSize);
            };
        }
    }, []);
    return {
        ...state,
    };
};
