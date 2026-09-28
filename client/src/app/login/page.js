import LoginCard from "../../components/login/login-card";

function Login() {
 return (
  <div className="min-h-screen relative">
   <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
     backgroundImage: "url('/login-background.png')",
    }}
   />

   <div
    className="absolute inset-0"
    style={{
     background: "linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4), rgba(0,0,0,0.8))",
    }}
   />

   <div className="absolute top-4 left-4 z-10">
    <img src="/canva.svg" alt="Canva" width="120" height="36" />
   </div>
   <div className="relative z-10 flex items-center justify-center min-h-screen">
    <LoginCard />
   </div>
  </div>
 );
}

export default Login;
