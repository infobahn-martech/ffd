/* eslint-disable react/prop-types */
import CommonSkeleton from './CommonSkeleton';

export default function CustomLoader({ columns, limit = 10 }) {
  return (
    <tbody>
      {Array.from({ length: limit }).map((index, inx) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={`${index}${inx}`}>
          {columns?.map(({ colClassName = '', selector }) => (
            <td className={colClassName} key={`cell${selector}`}>
              <CommonSkeleton height={30} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
