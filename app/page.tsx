import Dashboard from "./dashboard";
import { getChatGPTUser } from "./chatgpt-auth";

function LoginScreen() {
  return <main className="login-page"><section className="login-panel"><div className="login-brand"><span className="brand-mark"><i/><i/><i/></span><strong>Evidaris</strong></div><div className="login-copy"><span>INTELIGÊNCIA PATRIMONIAL</span><h1>Seu patrimônio,<br/>com evidências.</h1><p>Consolide posições, acompanhe concentrações e gere relatórios verificáveis em um ambiente protegido.</p><ul><li><b>01</b> Dados isolados por workspace</li><li><b>02</b> Importações com auditoria</li><li><b>03</b> Exportação e controle do titular</li></ul></div><small>Clareza que você pode conferir.</small></section><section className="login-form"><div><h2>Bem-vindo à Evidaris</h2><p>Entre com sua identidade verificada para acessar sua carteira.</p><a className="login-button" href="/signin-with-chatgpt?return_to=/">Entrar com segurança</a><span>O provedor autentica sua identidade. A Evidaris não recebe nem armazena sua senha.</span><div className="privacy-note"><b>Privacidade desde o início</b><p>Seu acesso, consentimentos e ações relevantes são registrados conforme finalidade e política de retenção.</p></div></div></section></main>;
}

export default async function Home() {
  const user = await getChatGPTUser();
  if (!user && process.env.NODE_ENV === "production") return <LoginScreen />;
  return <Dashboard />;
}
