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
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import './App.css';

const LeixoesLogo = ({ size = 50 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="none" stroke="#c41e3a" strokeWidth="8"/>
    <text x="50" y="60" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#c41e3a" fontFamily="Arial">LSC</text>
  </svg>
);

const positions = {
  'GR': 'Guarda-Redes',
  'DD': 'Defesa Direito',
  'DCD': 'Defesa Centro Direito',
  'DCE': 'Defesa Centro Esquerdo',
  'DE': 'Defesa Esquerdo',
  'MD': 'Médio Defensivo',
  'MC': 'Médio Centro',
  'MO': 'Médio Ofensivo',
  'ED': 'Extremo Direito',
  'EE': 'Extremo Esquerdo',
  'PL': 'Ponta de Lança'
};

const renewalStates = {
  'por-renovar': { label: 'Por Renovar', color: '#999999' },
  'aguardamos-renovacao': { label: 'Aguardamos Renovação', color: '#ff9800' },
  'renovou': { label: 'Renovou', color: '#1b5e20' },
  'dispensa': { label: 'Dispensa', color: '#c41e3a' },
  'rejeitou': { label: 'Rejeitou', color: '#c41e3a' }
};

const recruitmentStates = {
  'por-abordar-transferencia': { label: 'Por Abordar Transferência', color: '#999999' },
  'por-abordar-treinar': { label: 'Por Abordar Treinar', color: '#e0f2f1' },
  'chamado-treinar': { label: 'Chamado a Treinar', color: '#0097a7' },
  'abordado': { label: 'Abordado', color: '#fbc02d' },
  'reuniao-agendada': { label: 'Reunião Agendada', color: '#ff9800' },
  'aguardamos-resposta': { label: 'Aguardamos Resposta', color: '#81c784' },
  'aceitou': { label: 'Aceitou', color: '#2e7d32' },
  'rejeitou': { label: 'Rejeitou', color: '#c41e3a' }
};

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [activeTab, setActiveTab] = useState('equipas');
  const [teams, setTeams] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [shadowTeams, setShadowTeams] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [currentShadowTeamId, setCurrentShadowTeamId] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [recruitmentFilter, setRecruitmentFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingRecruit, setEditingRecruit] = useState(null);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [newShadowTeamName, setNewShadowTeamName] = useState('');
  const [showAddShadowModal, setShowAddShadowModal] = useState(false);

  const initShadowTeams = () => {
    const defaultShadowTeams = [
      { id: 'shadow_1', name: 'Sub 19 - 26/27', players: [] },
      { id: 'shadow_2', name: 'Sub 17 - 26/27', players: [] },
      { id: 'shadow_3', name: 'Sub 16.1 - 26/27', players: [] },
      { id: 'shadow_4', name: 'Sub 16.2 - 26/27', players: [] },
      { id: 'shadow_5', name: 'Sub 15.1 - 26/27', players: [] },
      { id: 'shadow_6', name: 'Sub 15.2 - 26/27', players: [] },
      { id: 'shadow_7', name: 'Sub 14.1 - 26/27', players: [] },
      { id: 'shadow_8', name: 'Sub 14.2 - 26/27', players: [] },
      { id: 'shadow_9', name: 'Sub 13.1 - 26/27', players: [] },
      { id: 'shadow_10', name: 'Sub 13.2 - 26/27', players: [] },
      { id: 'shadow_11', name: 'Sub 12.1 - 26/27', players: [] }
    ];
    setShadowTeams(defaultShadowTeams);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadTeams(currentUser.uid);
        loadRecruits(currentUser.uid);
        loadMeetings(currentUser.uid);
        initShadowTeams();
      }
    });
    return unsubscribe;
  }, []);

  const loadTeams = (userId) => {
    const q = query(collection(db, 'teams'), where('userId', '==', userId));
    onSnapshot(q, (snapshot) => {
      setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const loadRecruits = (userId) => {
    const q = query(collection(db, 'recruits'), where('userId', '==', userId));
    onSnapshot(q, (snapshot) => {
      setRecruits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const loadMeetings = (userId) => {
    const q = query(collection(db, 'meetings'), where('userId', '==', userId));
    onSnapshot(q, (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setTeams([]);
    setRecruits([]);
    setMeetings([]);
    setShadowTeams([]);
    setCurrentTeamId(null);
  };

  const addTeam = async (e) => {
    e.preventDefault();
    const name = e.target.teamName?.value;
    const category = e.target.teamCategory?.value;
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
      alert('Erro: ' + error.message);
    }
  };

  const addPlayerToTeam = async (e, teamId) => {
    e.preventDefault();
    const name = e.target.playerName?.value;
    const position = e.target.playerPosition?.value;
    const status = e.target.playerStatus?.value;
    try {
      const team = teams.find(t => t.id === teamId);
      const newPlayer = {
        id: `player_${Date.now()}`,
        name,
        position,
        status,
        contact: '',
        alternativePosition: '',
        birthYear: '',
        dominantFoot: '',
        shadowTeam: ''
      };
      await updateDoc(doc(db, 'teams', teamId), {
        players: [...(team.players || []), newPlayer]
      });
      e.target.reset();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const updatePlayer = async (teamId, playerId, updatedData) => {
    try {
      const team = teams.find(t => t.id === teamId);
      const updatedPlayers = team.players.map(p => 
        p.id === playerId ? { ...p, ...updatedData } : p
      );
      await updateDoc(doc(db, 'teams', teamId), { players: updatedPlayers });
      setShowEditModal(false);
      setEditingPlayer(null);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const deleteTeam = async (teamId) => {
    if (confirm('Eliminar esta equipa?')) {
      try {
        await deleteDoc(doc(db, 'teams', teamId));
        setCurrentTeamId(null);
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  };

  const deletePlayer = async (teamId, playerId) => {
    try {
      const team = teams.find(t => t.id === teamId);
      const updatedPlayers = team.players.filter(p => p.id !== playerId);
      await updateDoc(doc(db, 'teams', teamId), { players: updatedPlayers });
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const addRecruit = async (e) => {
    e.preventDefault();
    const name = e.target.recruitName?.value;
    const birthYear = e.target.recruitYear?.value;
    const status = e.target.recruitStatus?.value;
    const club = e.target.recruitClub?.value;
    const position = e.target.recruitPosition?.value;
    try {
      await addDoc(collection(db, 'recruits'), {
        userId: user.uid,
        name,
        birthYear: parseInt(birthYear),
        status,
        club,
        position: position || '',
        contact: '',
        alternativePosition: '',
        dominantFoot: '',
        shadowTeam: '',
        createdAt: new Date()
      });
      e.target.reset();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const updateRecruit = async (recruitId, updatedData) => {
    try {
      await updateDoc(doc(db, 'recruits', recruitId), updatedData);
      setShowRecruitModal(false);
      setEditingRecruit(null);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const addMeeting = async (e) => {
    e.preventDefault();
    const playerName = e.target.meetingPlayer?.value;
    const birthYear = e.target.meetingYear?.value;
    const position = e.target.meetingPosition?.value;
    const date = e.target.meetingDate?.value;
    const time = e.target.meetingTime?.value;
    const location = e.target.meetingLocation?.value;
    try {
      await addDoc(collection(db, 'meetings'), {
        userId: user.uid,
        playerName,
        birthYear,
        position,
        date,
        time,
        location,
        status: 'agendada',
        createdAt: new Date()
      });
      e.target.reset();
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const updateMeeting = async (meetingId, updatedData) => {
    try {
      await updateDoc(doc(db, 'meetings', meetingId), updatedData);
      setShowMeetingModal(false);
      setEditingMeeting(null);
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const addShadowTeam = async (e) => {
    e.preventDefault();
    if (!newShadowTeamName) return;
    const newTeam = {
      id: `shadow_${Date.now()}`,
      name: newShadowTeamName,
      players: []
    };
    setShadowTeams([...shadowTeams, newTeam]);
    setNewShadowTeamName('');
    setShowAddShadowModal(false);
  };

  const removeShadowTeam = (teamId) => {
    if (confirm('Eliminar esta equipa sombra?')) {
      setShadowTeams(shadowTeams.filter(t => t.id !== teamId));
    }
  };

  const addPlayerToShadowTeam = async (e, shadowTeamId) => {
    e.preventDefault();
    const name = e.target.shadowPlayerName?.value;
    const position = e.target.shadowPlayerPosition?.value;
    const status = e.target.shadowPlayerStatus?.value;
    const newPlayer = {
      id: `shadow_player_${Date.now()}`,
      name,
      position,
      status,
      contact: '',
      alternativePosition: '',
      birthYear: '',
      dominantFoot: ''
    };
    setShadowTeams(shadowTeams.map(team => 
      team.id === shadowTeamId 
        ? { ...team, players: [...(team.players || []), newPlayer] }
        : team
    ));
    e.target.reset();
  };

  const countRenovados = (players) => {
    return (players || []).filter(p => p.status === 'renovou').length;
  };

  const renderFormation = (players) => {
    const active = players.filter(p => !['dispensa', 'rejeitou'].includes(p.status));
    const playersByPosition = {};
    Object.keys(positions).forEach(pos => {
      playersByPosition[pos] = active.filter(p => p.position === pos);
    });

    const FormationBox = ({ pos, players: posPlayers }) => (
      <div className="formation-box">
        <div className="position-label">{pos}</div>
        <div className="position-players">
          {posPlayers && posPlayers.length > 0 ? (
            posPlayers.map((player, idx) => (
              <div key={`${player.id}_${idx}`} className="player-formation">
                <strong>{player.name}</strong>
                <span className="state-label" style={{color: renewalStates[player.status]?.color || recruitmentStates[player.status]?.color}}>
                  {renewalStates[player.status]?.label || recruitmentStates[player.status]?.label}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-slot">-</div>
          )}
        </div>
      </div>
    );

    return (
      <div className="formation-container">
        <div className="formation-title">Formação 4-3-3</div>
        <div className="formation-field">
          <div className="formation-line gr-line">
            <FormationBox pos="GR" players={playersByPosition['GR']} />
          </div>
          <div className="formation-line defesa-line">
            <FormationBox pos="DD" players={playersByPosition['DD']} />
            <FormationBox pos="DCD" players={playersByPosition['DCD']} />
            <FormationBox pos="DCE" players={playersByPosition['DCE']} />
            <FormationBox pos="DE" players={playersByPosition['DE']} />
          </div>
          <div className="formation-line md-line">
            <FormationBox pos="MD" players={playersByPosition['MD']} />
          </div>
          <div className="formation-line meios-line">
            <FormationBox pos="MC" players={playersByPosition['MC']} />
            <FormationBox pos="MO" players={playersByPosition['MO']} />
          </div>
          <div className="formation-line extremos-line">
            <FormationBox pos="ED" players={playersByPosition['ED']} />
            <FormationBox pos="EE" players={playersByPosition['EE']} />
          </div>
          <div className="formation-line pl-line">
            <FormationBox pos="PL" players={playersByPosition['PL']} />
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <LeixoesLogo size={80} />
            <h1>LEIXÕES SC</h1>
            <p className="auth-subtitle">Gestão de Equipas</p>
          </div>
          <h2>{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}</button>
          </form>
          <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Criar nova conta' : 'Já tem conta?'}
          </button>
          <div className="slogan">Tradição. Orgulho. Sentimento.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <LeixoesLogo size={50} />
          <h1>LEIXÕES SC - GESTÃO DE EQUIPAS 2026/2027</h1>
        </div>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'equipas' ? 'active' : ''}`} onClick={() => { setActiveTab('equipas'); setCurrentTeamId(null); }}>📋 Equipas LSC</button>
        <button className={`tab-btn ${activeTab === 'recrutamento' ? 'active' : ''}`} onClick={() => { setActiveTab('recrutamento'); setCurrentYear(null); setRecruitmentFilter(null); }}>🎯 Recrutamento</button>
        <button className={`tab-btn ${activeTab === 'sombra' ? 'active' : ''}`} onClick={() => { setActiveTab('sombra'); setCurrentShadowTeamId(null); }}>👥 Equipas Sombra</button>
        <button className={`tab-btn ${activeTab === 'reunioes' ? 'active' : ''}`} onClick={() => setActiveTab('reunioes')}>📅 Reuniões</button>
      </div>

      <div className="content">
        {activeTab === 'equipas' && !currentTeamId && (
          <div>
            <h2>Equipas LSC 2025/2026</h2>
            <form onSubmit={addTeam} className="form-add">
              <input name="teamName" placeholder="Nome da Equipa" required />
              <input name="teamCategory" placeholder="Categoria" required />
              <button type="submit">+ Adicionar Equipa</button>
            </form>
            <div className="teams-grid">
              {teams.map(team => {
                const renovados = countRenovados(team.players);
                return (
                  <div key={team.id} className="team-card">
                    <h3>{team.name}</h3>
                    <p>{team.category}</p>
                    <div className="team-stats-box">
                      <div className="stat-item">
                        <span className="stat-label">Jogadores:</span>
                        <span className="stat-value">{team.players?.length || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Renovados:</span>
                        <span className="stat-value">{renovados}</span>
                      </div>
                    </div>
                    <div className="team-actions">
                      <button className="btn-open" onClick={() => setCurrentTeamId(team.id)}>Abrir</button>
                      <button className="btn-delete" onClick={() => deleteTeam(team.id)}>Eliminar</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {activeTab === 'equipas' && currentTeamId && (
          <div>
            <button className="back-btn" onClick={() => setCurrentTeamId(null)}>← Voltar</button>
            {teams.find(t => t.id === currentTeamId) && (
              <>
                <h2>{teams.find(t => t.id === currentTeamId).name}</h2>
                <form onSubmit={(e) => addPlayerToTeam(e, currentTeamId)} className="form-add">
                  <input name="playerName" placeholder="Nome do Jogador" required />
                  <select name="playerPosition" required>
                    <option value="">Selecione Posição</option>
                    {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                  </select>
                  <select name="playerStatus" required>
                    <option value="">Selecione Estado</option>
                    {Object.entries(renewalStates).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                  </select>
                  <button type="submit">+ Adicionar Jogador</button>
                </form>

                {renderFormation(teams.find(t => t.id === currentTeamId).players || [])}

                <div className="players-list">
                  <h3>Lista de Jogadores</h3>
                  {(teams.find(t => t.id === currentTeamId).players || []).map(player => (
                    <div key={player.id} className="player-item" onClick={() => { setEditingPlayer({...player, teamId: currentTeamId}); setShowEditModal(true); }}>
                      <div style={{cursor: 'pointer', flex: 1}}>
                        <strong>{player.name}</strong>
                        <p>{positions[player.position]}</p>
                        <span className="status-badge" style={{background: renewalStates[player.status]?.color}}>{renewalStates[player.status]?.label}</span>
                      </div>
                      <button className="btn-delete-small" onClick={(e) => { e.stopPropagation(); deletePlayer(currentTeamId, player.id); }}>eliminar</button>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {showEditModal && editingPlayer && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Editar Jogador</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                updatePlayer(editingPlayer.teamId, editingPlayer.id, editingPlayer);
              }}>
                <input value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} placeholder="Nome" />
                <input value={editingPlayer.contact || ''} onChange={(e) => setEditingPlayer({...editingPlayer, contact: e.target.value})} placeholder="Contacto" />
                <select value={editingPlayer.position || ''} onChange={(e) => setEditingPlayer({...editingPlayer, position: e.target.value})}>
                  <option value="">Selecione Posição</option>
                  {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                </select>
                <select value={editingPlayer.alternativePosition || ''} onChange={(e) => setEditingPlayer({...editingPlayer, alternativePosition: e.target.value})}>
                  <option value="">Posição Alternativa</option>
                  {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                </select>
                <input type="number" value={editingPlayer.birthYear || ''} onChange={(e) => setEditingPlayer({...editingPlayer, birthYear: e.target.value})} placeholder="Ano de Nascimento" />
                <select value={editingPlayer.dominantFoot || ''} onChange={(e) => setEditingPlayer({...editingPlayer, dominantFoot: e.target.value})}>
                  <option value="">Pé Dominante</option>
                  <option value="direito">Direito</option>
                  <option value="esquerdo">Esquerdo</option>
                  <option value="ambidestro">Ambidestro</option>
                </select>
                <select value={editingPlayer.shadowTeam || ''} onChange={(e) => setEditingPlayer({...editingPlayer, shadowTeam: e.target.value})}>
                  <option value="">Adicionar a Equipa Sombra</option>
                  {shadowTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                </select>
                <button type="submit">Guardar</button>
              </form>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>Fechar</button>
            </div>
          </div>
        )}

        {activeTab === 'recrutamento' && !currentYear && !recruitmentFilter && (
          <div>
            <h2>Recrutamento</h2>
            
            <div className="filter-section">
              <h3>Filtrar por Estado</h3>
              <div className="filter-buttons">
                {Object.entries(recruitmentStates).map(([key, val]) => (
                  <button key={key} className="filter-btn" onClick={() => setRecruitmentFilter(key)}>
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            <h3 style={{marginTop: '30px'}}>Adicionar Recruta</h3>
            <form onSubmit={addRecruit} className="form-add">
              <input name="recruitName" placeholder="Nome do Jogador" required />
              <input name="recruitYear" type="number" placeholder="Ano de Nascimento" min="2008" max="2014" required />
              <select name="recruitPosition" required>
                <option value="">Selecione Posição</option>
                {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
              </select>
              <select name="recruitStatus" required>
                <option value="">Selecione Estado</option>
                {Object.entries(recruitmentStates).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
              </select>
              <input name="recruitClub" placeholder="Clube/Origem" />
              <button type="submit">+ Adicionar Recruta</button>
            </form>

            <h3 style={{marginTop: '30px'}}>Selecione uma Geração</h3>
            <div className="subtabs">
              {[2008, 2009, 2010, 2011, 2012, 2013, 2014].map(year => (
                <button key={year} className="subtab-btn" onClick={() => setCurrentYear(year)}>
                  {year}
                </button>
              ))}
            </div>

            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {activeTab === 'recrutamento' && recruitmentFilter && !currentYear && (
          <div>
            <button className="back-btn" onClick={() => setRecruitmentFilter(null)}>← Voltar</button>
            <h2>Recrutamento - {recruitmentStates[recruitmentFilter].label}</h2>
            
            <div className="recruits-list">
              {recruits.filter(r => r.status === recruitmentFilter).map(recruit => (
                <div key={recruit.id} className="recruit-card" onClick={() => { setEditingRecruit(recruit); setShowRecruitModal(true); }} style={{cursor: 'pointer'}}>
                  <div>
                    <h4>{recruit.name}</h4>
                    <p>{recruit.birthYear} • {recruit.club} • {positions[recruit.position] || '-'}</p>
                    <span className="status-badge" style={{background: recruitmentStates[recruit.status]?.color}}>{recruitmentStates[recruit.status]?.label}</span>
                  </div>
                  <button className="btn-delete-small" onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'recruits', recruit.id)); }}>eliminar</button>
                </div>
              ))}
            </div>
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {activeTab === 'recrutamento' && currentYear && (
          <div>
            <button className="back-btn" onClick={() => setCurrentYear(null)}>← Voltar</button>
            <h2>Recrutamento {currentYear}</h2>
            
            {renderFormation(recruits.filter(r => r.birthYear === currentYear))}

            <h3 style={{marginTop: '30px'}}>Lista de Recrutas {currentYear}</h3>
            <div className="recruits-list">
              {recruits.filter(r => r.birthYear === currentYear).map(recruit => (
                <div key={recruit.id} className="recruit-card" onClick={() => { setEditingRecruit(recruit); setShowRecruitModal(true); }} style={{cursor: 'pointer'}}>
                  <div>
                    <h4>{recruit.name}</h4>
                    <p>{recruit.birthYear} • {recruit.club} • {positions[recruit.position] || '-'}</p>
                    <span className="status-badge" style={{background: recruitmentStates[recruit.status]?.color}}>{recruitmentStates[recruit.status]?.label}</span>
                  </div>
                  <button className="btn-delete-small" onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'recruits', recruit.id)); }}>eliminar</button>
                </div>
              ))}
            </div>
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {showRecruitModal && editingRecruit && (
          <div className="modal-overlay" onClick={() => setShowRecruitModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Editar Recruta</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateRecruit(editingRecruit.id, editingRecruit);
              }}>
                <input value={editingRecruit.name} onChange={(e) => setEditingRecruit({...editingRecruit, name: e.target.value})} placeholder="Nome" />
                <input type="number" value={editingRecruit.birthYear || ''} onChange={(e) => setEditingRecruit({...editingRecruit, birthYear: parseInt(e.target.value)})} placeholder="Ano de Nascimento" />
                <input value={editingRecruit.contact || ''} onChange={(e) => setEditingRecruit({...editingRecruit, contact: e.target.value})} placeholder="Contacto" />
                <select value={editingRecruit.position || ''} onChange={(e) => setEditingRecruit({...editingRecruit, position: e.target.value})}>
                  <option value="">Selecione Posição</option>
                  {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                </select>
                <select value={editingRecruit.alternativePosition || ''} onChange={(e) => setEditingRecruit({...editingRecruit, alternativePosition: e.target.value})}>
                  <option value="">Posição Alternativa</option>
                  {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                </select>
                <select value={editingRecruit.dominantFoot || ''} onChange={(e) => setEditingRecruit({...editingRecruit, dominantFoot: e.target.value})}>
                  <option value="">Pé Dominante</option>
                  <option value="direito">Direito</option>
                  <option value="esquerdo">Esquerdo</option>
                  <option value="ambidestro">Ambidestro</option>
                </select>
                <select value={editingRecruit.shadowTeam || ''} onChange={(e) => setEditingRecruit({...editingRecruit, shadowTeam: e.target.value})}>
                  <option value="">Adicionar a Equipa Sombra</option>
                  {shadowTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                </select>
                <button type="submit">Guardar</button>
              </form>
              <button className="modal-close" onClick={() => setShowRecruitModal(false)}>Fechar</button>
            </div>
          </div>
        )}

        {activeTab === 'sombra' && !currentShadowTeamId && (
          <div>
            <h2>Equipas Sombra 2026/2027</h2>
            <button className="btn-add-shadow" onClick={() => setShowAddShadowModal(true)}>+ Adicionar Equipa Sombra</button>
            
            {showAddShadowModal && (
              <div className="modal-overlay" onClick={() => setShowAddShadowModal(false)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                  <h3>Adicionar Equipa Sombra</h3>
                  <form onSubmit={addShadowTeam}>
                    <input value={newShadowTeamName} onChange={(e) => setNewShadowTeamName(e.target.value)} placeholder="Nome da Equipa" required />
                    <button type="submit">Adicionar</button>
                  </form>
                  <button className="modal-close" onClick={() => setShowAddShadowModal(false)}>Cancelar</button>
                </div>
              </div>
            )}

            <div className="teams-grid">
              {shadowTeams.map(team => (
                <div key={team.id} className="team-card">
                  <h3>{team.name}</h3>
                  <p className="team-stats">{team.players?.length || 0} Atletas</p>
                  <div className="team-actions">
                    <button className="btn-open" onClick={() => setCurrentShadowTeamId(team.id)}>Abrir</button>
                    <button className="btn-delete" onClick={() => removeShadowTeam(team.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {activeTab === 'sombra' && currentShadowTeamId && (
          <div>
            <button className="back-btn" onClick={() => setCurrentShadowTeamId(null)}>← Voltar</button>
            {shadowTeams.find(t => t.id === currentShadowTeamId) && (
              <>
                <h2>{shadowTeams.find(t => t.id === currentShadowTeamId).name}</h2>
                
                <form onSubmit={(e) => addPlayerToShadowTeam(e, currentShadowTeamId)} className="form-add">
                  <input name="shadowPlayerName" placeholder="Nome do Jogador" required />
                  <select name="shadowPlayerPosition" required>
                    <option value="">Selecione Posição</option>
                    {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                  </select>
                  <select name="shadowPlayerStatus" required>
                    <option value="">Selecione Estado</option>
                    {Object.entries(renewalStates).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}
                  </select>
                  <button type="submit">+ Adicionar Jogador</button>
                </form>

                {renderFormation(shadowTeams.find(t => t.id === currentShadowTeamId).players || [])}
              </>
            )}
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {activeTab === 'reunioes' && (
          <div>
            <h2>Reuniões</h2>
            
            <form onSubmit={addMeeting} className="form-add">
              <input name="meetingPlayer" placeholder="Nome do Atleta" required />
              <input name="meetingYear" type="number" placeholder="Ano de Nascimento" min="1990" max="2014" required />
              <select name="meetingPosition" required>
                <option value="">Selecione Posição</option>
                {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
              </select>
              <input name="meetingDate" type="date" required />
              <input name="meetingTime" type="time" required />
              <select name="meetingLocation" required>
                <option value="">Selecione Local</option>
                <option value="estadio-mar">Estádio do Mar</option>
                <option value="complexo-oscar">Complexo Óscar Marques</option>
              </select>
              <button type="submit">+ Agendar Reunião</button>
            </form>

            <div className="meetings-list">
              <h3>Reuniões Agendadas</h3>
              {meetings.filter(m => m.status === 'agendada').map(meeting => (
                <div key={meeting.id} className="meeting-card" onClick={() => { setEditingMeeting(meeting); setShowMeetingModal(true); }} style={{cursor: 'pointer'}}>
                  <div>
                    <strong>{new Date(meeting.date).toLocaleDateString('pt-PT')} às {meeting.time}</strong>
                    <p>👤 {meeting.playerName} ({meeting.birthYear}) - {positions[meeting.position]}</p>
                    <p>📍 {meeting.location === 'estadio-mar' ? 'Estádio do Mar' : 'Complexo Óscar Marques'}</p>
                  </div>
                  <button className="btn-delete-small" onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'meetings', meeting.id)); }}>eliminar</button>
                </div>
              ))}
            </div>

            <div className="meetings-list">
              <h3>Reuniões Realizadas</h3>
              {meetings.filter(m => m.status === 'feita').map(meeting => (
                <div key={meeting.id} className="meeting-card">
                  <div>
                    <strong>{new Date(meeting.date).toLocaleDateString('pt-PT')}</strong>
                    <p>👤 {meeting.playerName}</p>
                  </div>
                  <button className="btn-delete-small" onClick={() => deleteDoc(doc(db, 'meetings', meeting.id))}>eliminar</button>
                </div>
              ))}
            </div>
            <div className="slogan">Tradição. Orgulho. Sentimento.</div>
          </div>
        )}

        {showMeetingModal && editingMeeting && (
          <div className="modal-overlay" onClick={() => setShowMeetingModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>Editar Reunião</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateMeeting(editingMeeting.id, editingMeeting);
              }}>
                <input value={editingMeeting.playerName} onChange={(e) => setEditingMeeting({...editingMeeting, playerName: e.target.value})} placeholder="Nome do Atleta" />
                <input type="number" value={editingMeeting.birthYear || ''} onChange={(e) => setEditingMeeting({...editingMeeting, birthYear: e.target.value})} placeholder="Ano de Nascimento" />
                <select value={editingMeeting.position || ''} onChange={(e) => setEditingMeeting({...editingMeeting, position: e.target.value})}>
                  <option value="">Selecione Posição</option>
                  {Object.entries(positions).map(([key, val]) => (<option key={key} value={key}>{val}</option>))}
                </select>
                <input type="date" value={editingMeeting.date || ''} onChange={(e) => setEditingMeeting({...editingMeeting, date: e.target.value})} />
                <input type="time" value={editingMeeting.time || ''} onChange={(e) => setEditingMeeting({...editingMeeting, time: e.target.value})} />
                <select value={editingMeeting.location || ''} onChange={(e) => setEditingMeeting({...editingMeeting, location: e.target.value})}>
                  <option value="">Selecione Local</option>
                  <option value="estadio-mar">Estádio do Mar</option>
                  <option value="complexo-oscar">Complexo Óscar Marques</option>
                </select>
                <button type="submit">Guardar</button>
              </form>
              <button className="modal-close" onClick={() => setShowMeetingModal(false)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
