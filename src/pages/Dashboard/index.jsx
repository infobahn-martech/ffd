import DashboardImage from '../../assets/images/dashboard-screenshot.png';

const Dashboard = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <img className="w-100" src={DashboardImage} alt="Dashboard" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
