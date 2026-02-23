import PropTypes from 'prop-types';
import '../../design/scss/common.scss';

function ZoomControls({ zoomIn, zoomOut, resetZoom }) {
    return (
        <div className="zoom-controls">
            <button
                onClick={zoomOut}
                aria-label="Zoom out"
                type="button"
            >
                −
            </button>
            <button
                onClick={zoomIn}
                aria-label="Zoom in"
                type="button"
            >
                +
            </button>
            <button
                onClick={resetZoom}
                aria-label="Reset zoom"
                type="button"
            >
                Reset
            </button>
        </div>
    );
}

ZoomControls.propTypes = {
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    resetZoom: PropTypes.func.isRequired,
};

export default ZoomControls;

