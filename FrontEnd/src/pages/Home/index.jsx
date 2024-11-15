import { useEffect, useState, useRef } from 'react';
import './style.css';
import Trash from '../../assets/trash.svg';
import api from '../../services/api';

function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputName = useRef();
  const inputAge = useRef();
  const inputEmail = useRef();

  // Função para buscar os usuários (GET)
  async function getUsers() {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsers(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao carregar usuários. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Função para criar um novo usuário (POST)
  async function createUsers() {
    try {
      const response = await api.post('/usuarios', {
        name: inputName.current.value,
        age: parseInt(inputAge.current.value),
        email: inputEmail.current.value,
      });

      console.log("Usuário criado com sucesso:", response.data);
      alert("Usuário cadastrado com sucesso!");

      // Adiciona o novo usuário diretamente à lista sem precisar de uma nova requisição
      setUsers((prevUsers) => [...prevUsers, response.data]);

      // Limpa os campos após criar o usuário
      inputName.current.value = '';
      inputAge.current.value = '';
      inputEmail.current.value = '';
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      console.error("Resposta do servidor:", error.response?.data);
      alert("Erro ao criar usuário");
    }
  }

  // Função para deletar um usuário (DELETE)
  async function deleteUsers(id) {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirmDelete) {
      return; //  Se o usuário cancelar, não executa a exclusão
    }
    try {
      setLoading(true);
      await api.delete(`/usuarios/${id}`);
      
      // Atualiza a lista local removendo o usuário deletado
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Erro desconhecido ao deletar usuário.");
      } else {
        setError("Erro ao deletar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Carrega os usuários ao montar o componente
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className='container'>
      <form>
        <h1>Cadastro de Usuários</h1>
        <input placeholder="Nome" name='nome' type='text' ref={inputName} />
        <input placeholder="Idade" name='idade' type='number' ref={inputAge} />
        <input placeholder="E-mail" name='email' type='email' ref={inputEmail} />
        <button type="button" onClick={createUsers} disabled={loading}>Cadastrar</button>
      </form>

      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}

      {users.length === 0 && !loading && <p>Nenhum usuário cadastrado.</p>}

      {users.map((user) => (
        <div key={user.id} className='card'>
          <div>
            <p>Nome: <span>{user.name}</span></p>
            <p>Idade: <span>{user.age}</span></p>
            <p>Email: <span>{user.email}</span></p>
          </div>
          <button onClick={() => deleteUsers(user.id)}>
            <img src={Trash} alt="Deletar" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Home;
