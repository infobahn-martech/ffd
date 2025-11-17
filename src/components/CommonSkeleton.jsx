import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton from 'react-loading-skeleton';

function CommonSkeleton({ height = 30, width, borderRadius }) {
  return <Skeleton height={height} width={width} borderRadius={borderRadius} />;
}

export default CommonSkeleton;
