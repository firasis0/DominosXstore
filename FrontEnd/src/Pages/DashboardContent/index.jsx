import Sidebar from "../../Components/Dashboard/Sidebar";
import Content from "../../Components/Dashboard/Content";

export default function DashboardContent() {
    return (
        <div>
            <Sidebar activeItem="Content" />

            <main
                style={{
                    marginLeft: "250px",
                    minHeight: "100vh",
                    padding: "30px",
                    background: "#f5f5f5",
                }}
            >
                <Content />
            </main>
        </div>
    );
}