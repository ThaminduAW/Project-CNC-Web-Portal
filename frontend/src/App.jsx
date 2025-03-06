import { useEffect, useState } from "react";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/")
            .then((res) => res.text())
            .then((data) => setMessage(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div>
            <h1>Frontend Connected to Backend</h1>
            <p>{message}</p>
        </div>
    );
}

export default App;
