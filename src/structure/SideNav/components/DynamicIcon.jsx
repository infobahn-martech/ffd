import PropTypes from 'prop-types';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';

/** Used when `iconKey` is missing or does not resolve to a component. */
export const FALLBACK_ICON_KEY = 'FiLayers';

export function resolveIconComponent(iconKey) {
    if (!iconKey || typeof iconKey !== 'string') {
        return FiIcons[FALLBACK_ICON_KEY];
    }
    const trimmed = iconKey.trim();
    const Icon = FiIcons[trimmed] || LuIcons[trimmed];
    return Icon || FiIcons[FALLBACK_ICON_KEY];
}

/**
 * Renders a react-icons glyph from a saved export name (e.g. `FiBug`, `LuShip`).
 */
const DynamicIcon = ({ iconKey, size = 16, color = 'currentColor', className, ...rest }) => {
    const Icon = resolveIconComponent(iconKey);
    return <Icon size={size} color={color} className={className} {...rest} />;
};

DynamicIcon.propTypes = {
    iconKey: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    color: PropTypes.string,
    className: PropTypes.string,
};

export default DynamicIcon;
