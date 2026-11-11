import { useEffect,useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Exhibit from './components/Exhibit'
import Visit from './components/Visit'
import Mission from './components/Mission'
import SiteFooter from './components/SiteFooter'
import SiteNavigation from './components/SiteNavigation'
import CategoryPage from './components/CategoryPage'
import AuthPage from './components/AuthPage'
import AdminPage from './components/AdminPage'
import './index.css'
type Mode='dark'|'light'
function App() {
 const [path,setPath]=useState(window.location.pathname)
 const [mode,setMode]=useState<Mode>(()=>localStorage.getItem('glacier-mode')==='light'?'light':'dark')
 useEffect(()=>{const onPop=()=>setPath(window.location.pathname);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[])
 useEffect(()=>{document.documentElement.dataset.mode=mode;localStorage.setItem('glacier-mode',mode)},[mode])
 const navigate=(next:string)=>{if(next===path)return;window.history.pushState({},'',next);setPath(next);window.scrollTo({top:0,behavior:'smooth'})}
 if(['/movies','/series','/login','/register','/admin'].includes(path)) return <div className="app-shell min-h-screen"><SiteNavigation path={path} onNavigate={navigate} mode={mode} onToggleMode={()=>setMode(mode==='dark'?'light':'dark')}/>{path==='/movies'&&<CategoryPage kind="movie"/>}{path==='/series'&&<CategoryPage kind="series"/>}{(path==='/login'||path==='/register')&&<AuthPage key={path} initialMode={path==='/register'?'register':'login'} onNavigate={navigate}/ >}{path==='/admin'&&<AdminPage/>}<SiteFooter/></div>
 return <div className="w-full min-h-screen"><Navbar/><main><Hero/><Exhibit/><Visit/><Mission/></main><SiteFooter/></div>
}
export default App
