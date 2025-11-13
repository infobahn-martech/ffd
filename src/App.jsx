import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import KanbanBoard from "./components/pages/KanbanBoard";
import "../src/assets/styles/App.css";

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="content">
        <Sidebar />
        <main className="main">
          <KanbanBoard />
        </main>
      </div>
    </div>
  );
}
