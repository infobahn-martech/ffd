function NoTableData({ columns, colSpan }) {
  const span = colSpan ?? (columns?.length || 6);
  return (
    <tbody>
      <tr>
        <td colSpan={span}>
          <div className="no-data">
            <div className="no-data-content">
              <div className="no-data-img">
                {/* <img src={noImgpic} alt="no- data" /> */}
              </div>
              <div className="no-data-txt">NO DATA FOUND</div>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export default NoTableData;
