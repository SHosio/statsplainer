import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import Router from './Router';

function App() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let user_id = params.get("user_id");
    
    // If user_id is not present in URL, generate a random one
    if (!user_id) {
      const randomId = Math.random().toString(36).substring(2, 12); // 10 random characters
      user_id = `rand-${randomId}`;
    }
    
    document.cookie = `user_id=${user_id}; path=/`; 

    fetch('http://localhost:5000/user_id', {
      method: 'POST',
      credentials: 'include',
    })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error)); 


  }, []);

  return (
    <>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </>
  )
}

export default App