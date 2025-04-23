import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import GuestsPage from "./pages/GuestsPage";
import RoomsPage from "./pages/RoomsPage";
import BookingsPage from "./pages/BookingsPage";

export default function App() {
    return (
        <Router>
            <div style={{
                minHeight: '100vh',
                backgroundColor: 'white',
                color: 'black',
                margin: 0,
                padding: 0,
            }}>
                {/* Fixed Header */}
                <header style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    padding: '1rem 0',
                    borderBottom: '1px solid #eee',
                }}>
                    <nav style={{ 
                        display: 'flex', 
                        gap: '1.5rem',
                        justifyContent: 'center',
                        alignItems: 'center',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 1rem',
                    }}>
                        <Link to="/" style={{ 
                            textDecoration: 'none', 
                            color: 'black',
                            fontWeight: '500',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                        }}>Гости</Link>
                        <Link to="/rooms" style={{ 
                            textDecoration: 'none', 
                            color: 'black',
                            fontWeight: '500',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                        }}>Номера</Link>
                        <Link to="/bookings" style={{ 
                            textDecoration: 'none', 
                            color: 'black',
                            fontWeight: '500',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                        }}>Заселить/Бронировать</Link>
                    </nav>
                </header>

                {/* Main Content */}
                <main style={{
                    paddingTop: '80px',  // Отступ под фиксированный header
                    minHeight: 'calc(100vh - 80px)',
                    padding: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    backgroundColor: 'white',  // Убедимся, что фон белый
                }}>
                    <Routes>
                        <Route path="/" element={<GuestsPage />} />
                        <Route path="/rooms" element={<RoomsPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}