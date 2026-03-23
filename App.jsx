import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [teams, setTeams] = useState([]);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [activeTab, setActiveTab] = useState('equipas');
  const [recruits, setRecruits] = useState([]);
  const [shadowTeams, setShadowTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Monitor autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadTeams(currentUser.uid);
        loadRecruits(currentUser.uid);
        loadShadowTeams(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  // Carregar equipas em tempo real
  const loadTeams = (userId) => {
    const q = query(collection(db, 'teams'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);
    });
    return unsubscribe;
  };

  // Carregar recrutas em tempo real
  const loadRecruits = (userId) => {
    const q = query(collection(db, 'recruits'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recruitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecruits(recruitsData);
    });
    return unsubscribe;
  };

  // Carregar equipas sombra em tempo real
  const loadShadowTeams = (userId) => {
    const q = query(collection(db, 'shadowTeams'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shadowTeamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShadowTeams(shadowTeamsData);
    });
    return unsubscribe;
  };

  // Login/Signup
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Inicializar coleção para novo utilizador
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date()
        });
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setTeams([]);
    setRecruits([]);
    setShadowTeams([]);
    setCurrentTeamId(null);
  };

  // Adicionar equipa
  const addTeam = async (e) => {
    e.preventDefault();
    const name = e.target.teamName.value;
    const category = e.target.teamCategory.value;
    
    try {
      await addDoc(collection(db, 'teams'), {
        userId: user.uid,
        name,
        category,
        players: [],
        createdAt: new Date()
      });
      e.target.reset();
    } catch (error) {
      alert('Erro ao adicionar equipa: ' + error.message);
    }
  };

  // Adicionar recruta
  const addRecruit = async (e) => {
    e.preventDefault();
    const name = e.target.recruitName.value;
    const birthYear = e.target.recruitYear.value;
    const status = e.target.recruitStatus.value;
    const club = e.target.recruitClub.value;

    try {
      await addDoc(collection(db, 'recruits'), {
        userId: user.uid,
        name,
        birthYear: parseInt(birthYear),
        status,
        club,
        createdAt: new Date()
      });
      e.target.reset();
    } catch (error) {
      alert('Erro ao adicionar recruta: ' + error.message);
    }
  };

  // Eliminar equipa
  const deleteTeam = async (teamId) => {
    if (confirm('Eliminar esta equipa?')) {
      try {
        await deleteDoc(doc(db, 'teams', teamId));
        setCurrentTeamId(null);
      } catch (error) {
        alert('Erro ao eliminar: ' + error.message);
      }
    }
  };

  // Eliminar recruta
  const deleteRecruit = async (recruitId) => {
    if (confirm('Eliminar este recruta?')) {
      try {
        await deleteDoc(doc(db, 'recruits', recruitId));
      } catch (error) {
        alert('Erro ao eliminar: ' + error.message);
      }
    }
  };

  // Render
  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>⚽ Leixões Gestor</h1>
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
          <form onSubmit={handleAuth}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>
          <button 
            className="toggle-btn"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Criar nova conta' : 'Já tem conta?'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>⚽ Leixões Gestor de Equipas</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'equipas' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipas')}
        >
          📋 Equipas LSC
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recrutamento' ? 'active' : ''}`}
          onClick={() => setActiveTab('recrutamento')}
        >
          🎯 Recrutamento
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sombra' ? 'active' : ''}`}
          onClick={() => setActiveTab('sombra')}
        >
          👥 Equipas Sombra
        </button>
      </div>

      <div className="content">
        {/* TAB: EQUIPAS */}
        {activeTab === 'equipas' && (
          <div>
            <h2>Equipas LSC 2025/2026</h2>
            
            <form onSubmit={addTeam} className="form-add">
              <input name="teamName" placeholder="Nome da Equipa" required />
              <input name="teamCategory" placeholder="Categoria" required />
              <button type="submit">+ Adicionar Equipa</button>
            </form>

            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.category}</p>
                  <p className="team-stats">{team.players?.length || 0} Jogadores</p>
                  <div className="team-actions">
                    <button 
                      className="btn-open"
                      onClick={() => setCurrentTeamId(team.id)}
                    >
                      Abrir
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => deleteTeam(team.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {currentTeamId && (
              <div className="detail-modal">
                <div className="modal-content">
                  <button 
                    className="close-btn"
                    onClick={() => setCurrentTeamId(null)}
                  >
                    ✕
                  </button>
                  <h3>{teams.find(t => t.id === currentTeamId)?.name}</h3>
                  <p>Detalhes da equipa...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: RECRUTAMENTO */}
        {activeTab === 'recrutamento' && (
          <div>
            <h2>Recrutamento</h2>
            
            <form onSubmit={addRecruit} className="form-add">
              <input name="recruitName" placeholder="Nome do Jogador" required />
              <input name="recruitYear" type="number" placeholder="Ano de Nascimento" min="2008" max="2014" required />
              <select name="recruitStatus" required>
                <option value="">Selecione Estado</option>
                <option value="por-abordar-transferencia">Por Abordar Transferência</option>
                <option value="abordado">Abordado</option>
                <option value="reuniao-agendada">Reunião Agendada</option>
                <option value="aguardamos-resposta">Aguardamos Resposta</option>
                <option value="aceitou">Aceitou</option>
                <option value="rejeitou">Rejeitou</option>
              </select>
              <input name="recruitClub" placeholder="Clube/Origem" />
              <button type="submit">+ Adicionar Recruta</button>
            </form>

            <div className="recruits-list">
              {recruits.map(recruit => (
                <div key={recruit.id} className="recruit-card">
                  <div>
                    <h4>{recruit.name}</h4>
                    <p>{recruit.birthYear} • {recruit.club} • {recruit.status}</p>
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => deleteRecruit(recruit.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EQUIPAS SOMBRA */}
        {activeTab === 'sombra' && (
          <div>
            <h2>Equipas Sombra 2026/2027</h2>
            <p>Sub 19, Sub 17, Sub 16... (em desenvolvimento)</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
