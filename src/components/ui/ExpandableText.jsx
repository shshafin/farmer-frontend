import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function ExpandableText({ text, maxLines = 3, className = '', style = {} }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        if (textRef.current) {
            // Check if the content overflows the clamped area
            const element = textRef.current;
            // We need to check if it WOULD overflow if clamped.
            // If currently collapsed (default), scrollHeight > clientHeight means it's truncated.
            if (element.scrollHeight > element.clientHeight) {
                setShowButton(true);
            }
        }
    }, [text, maxLines]);

    if (!text) return null;

    return (
        <div className={`expandable-text-wrapper ${className}`} style={style}>
            <pre
                ref={textRef}
                style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'unset' : maxLines,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    // Ensure it takes up space
                }}
            >
                {text}
            </pre>
            {showButton && !isExpanded && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px 0',
                        fontSize: '0.9em',
                        fontWeight: 600,
                        marginTop: '4px'
                    }}
                >
                    ...আরো দেখুন
                </button>
            )}
        </div>
    );
}

ExpandableText.propTypes = {
    text: PropTypes.string,
    maxLines: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object
};
