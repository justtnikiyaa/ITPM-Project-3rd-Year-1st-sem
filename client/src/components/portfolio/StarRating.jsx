import { useState } from 'react';
import { Star } from 'lucide-react';

function StarRating({ rating, setRating, readOnly = false, size = 18 }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating-wrap" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    type="button"
                    key={star}
                    className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                    onClick={() => !readOnly && setRating && setRating(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    disabled={readOnly}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: readOnly ? 'default' : 'pointer',
                        padding: 0,
                        color: star <= (hover || rating) ? '#FFC107' : '#E0E0E0',
                        transition: 'color 0.2s ease',
                    }}
                    aria-label={`Rate ${star} stars`}
                >
                    <Star size={size} fill={star <= (hover || rating) ? '#FFC107' : 'none'} strokeWidth={1.5} />
                </button>
            ))}
        </div>
    );
}

export default StarRating;
