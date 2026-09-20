import Sidebar from "../../Components/Dashboard/Sidebar";
import Customers from "../../Components/Dashboard/Customers";

function DashboardCustomers() {
    return (
        <div>
            <Sidebar activeItem="Customers" />
            <Customers />
        </div>
    );
}

export default DashboardCustomers;