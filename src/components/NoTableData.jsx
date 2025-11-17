function NoTableData({ columns }) {
  return (
    <tbody>
      <tr>
        <td colSpan={columns?.length || 6}>
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
