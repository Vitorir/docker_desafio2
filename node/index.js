const express = require('express')
const app = express()
const port = 3000

// Adicionar para processar POST requests
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

const appName = process.env.APP_NAME || 'Unknown App';
console.log(`Iniciando ${appName}...`);

const setupDatabase = async () => {
    return new Promise((resolve, reject) => {
        connection.query('DROP TABLE IF EXISTS people', (error) => {
            if (error) {
                console.error('Erro ao dropar tabela:', error);
                reject(error);
                return;
            }

            const createTable = `
                CREATE TABLE people (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    comment TEXT,
                    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            connection.query(createTable, (error) => {
                if (error) {
                    console.error('Erro ao criar tabela:', error);
                    reject(error);
                    return;
                }
                console.log('Tabela criada com sucesso!');
                resolve();
            });
        });
    });
}

setupDatabase().then(() => {
    // Rota para processar o formulário
    app.post('/register', (req, res) => {
        const { name, comment } = req.body;
        const insertVisitor = `INSERT INTO people(name, comment) VALUES(?, ?)`
        
        connection.query(insertVisitor, [
            `${name || 'Anônimo'} (via ${appName})`, 
            comment || 'Sem comentário'
        ], (error) => {
            if (error) {
                console.error('Erro ao inserir visitante:', error);
                res.status(500).json({ error: 'Erro ao registrar visita' });
                return;
            }
            res.redirect('/');
        });
    });

    app.get('/', (req, res) => {
        const query = `
            SELECT 
                id,
                name,
                comment,
                DATE_FORMAT(visited_at, '%d/%m/%Y') as date,
                DATE_FORMAT(visited_at, '%H:%i:%s') as time
            FROM people 
            ORDER BY visited_at DESC
            LIMIT 100
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Erro na consulta:', error);
                res.status(500).send('Erro ao buscar estatísticas');
                return;
            }

            const totalVisitors = results.length;
            const uniqueDays = new Set(results.map(r => r.date)).size;
            
            const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Seja Bem-Vindo!</title>
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            font-family: 'Poppins', sans-serif;
                            background: linear-gradient(135deg, #0a192f 0%, #112240 100%);
                            color: #e6f1ff;
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;
                        }

                        .container {
                            max-width: 1000px;
                            width: 100%;
                            background: rgba(17, 34, 64, 0.95);
                            border-radius: 24px;
                            padding: 40px;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                        }

                        h1 {
                            font-size: 3.5em;
                            color: #64ffda;
                            margin-bottom: 10px;
                            letter-spacing: -1px;
                        }

                        .subtitle {
                            color: #8892b0;
                            font-size: 1.2em;
                        }

                        .stats-container {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 20px;
                            margin: 40px 0;
                        }

                        .stat-card {
                            background: rgba(100, 255, 218, 0.1);
                            padding: 24px;
                            border-radius: 16px;
                            text-align: center;
                            transition: transform 0.3s ease;
                        }

                        .stat-card:hover {
                            transform: translateY(-5px);
                        }

                        .stat-number {
                            font-size: 2.5em;
                            font-weight: 600;
                            color: #64ffda;
                            margin-bottom: 8px;
                        }

                        .stat-label {
                            color: #8892b0;
                            font-size: 1.1em;
                        }

                        .history-container {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 16px;
                            padding: 24px;
                            margin-top: 40px;
                        }

                        .history-title {
                            color: #64ffda;
                            margin-bottom: 20px;
                            font-size: 1.5em;
                        }

                        .history-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 12px 0;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        }

                        .history-item:last-child {
                            border-bottom: none;
                        }

                        .history-date {
                            color: #8892b0;
                        }

                        .history-visits {
                            color: #64ffda;
                            font-weight: 600;
                        }

                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            color: #8892b0;
                            font-size: 0.9em;
                        }

                        .tech-stack {
                            display: flex;
                            justify-content: center;
                            gap: 20px;
                            margin-top: 20px;
                        }

                        .tech-item {
                            padding: 8px 16px;
                            background: rgba(100, 255, 218, 0.1);
                            border-radius: 20px;
                            color: #64ffda;
                        }

                        .form-container {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 16px;
                            padding: 24px;
                            margin: 40px 0;
                        }

                        .form-title {
                            color: #64ffda;
                            margin-bottom: 20px;
                            font-size: 1.5em;
                        }

                        .form-group {
                            margin-bottom: 16px;
                        }

                        .form-label {
                            display: block;
                            margin-bottom: 8px;
                            color: #8892b0;
                        }

                        .form-input, .form-textarea {
                            width: 100%;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 8px;
                            color: #e6f1ff;
                            font-family: 'Poppins', sans-serif;
                        }

                        .form-textarea {
                            height: 100px;
                            resize: vertical;
                        }

                        .form-button {
                            background: #64ffda;
                            color: #0a192f;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }

                        .form-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(100, 255, 218, 0.2);
                        }

                        .comments-container {
                            margin-top: 40px;
                        }

                        .comment-card {
                            background: rgba(255, 255, 255, 0.05);
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 16px;
                            transition: transform 0.3s ease;
                        }

                        .comment-card:hover {
                            transform: translateX(5px);
                        }

                        .comment-header {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 12px;
                            color: #64ffda;
                        }

                        .comment-name {
                            font-weight: 600;
                        }

                        .comment-time {
                            color: #8892b0;
                            font-size: 0.9em;
                        }

                        .comment-text {
                            color: #e6f1ff;
                            line-height: 1.5;
                        }

                        .loading {
                            display: none;
                            text-align: center;
                            padding: 20px;
                            color: #64ffda;
                        }

                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }

                        .fade-in {
                            animation: fadeIn 0.5s ease forwards;
                        }

                        .server-info {
                            margin-top: 10px;
                            padding: 5px 10px;
                            background: rgba(100, 255, 218, 0.1);
                            border-radius: 4px;
                            display: inline-block;
                            font-size: 0.9em;
                            color: #64ffda;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Seja Bem-Vindo!</h1>
                            <div class="subtitle">Confira os comentários dos visitantes!</div>
                            <div class="server-info">Servidor: ${appName}</div>
                        </div>

                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-number">${totalVisitors}</div>
                                <div class="stat-label">Visitantes Totais</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${uniqueDays}</div>
                                <div class="stat-label">Dias Ativos</div>
                            </div>
                        </div>

                        <div class="comments-container">
                            <h2 class="form-title">Comentários Recentes</h2>
                            ${results.map(row => `
                                <div class="comment-card fade-in">
                                    <div class="comment-header">
                                        <span class="comment-name">${row.name}</span>
                                        <span class="comment-time">${row.date} às ${row.time}</span>
                                    </div>
                                    <div class="comment-text">${row.comment}</div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="form-container fade-in">
                            <h2 class="form-title">Deixe seu comentário também!</h2>
                            <form action="/register" method="POST" id="visitorForm">
                                <div class="form-group">
                                    <label class="form-label" for="name">Seu Nome</label>
                                    <input type="text" id="name" name="name" class="form-input" placeholder="Digite seu nome" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label" for="comment">Comentário</label>
                                    <textarea id="comment" name="comment" class="form-textarea" placeholder="Deixe seu comentário" required></textarea>
                                </div>
                                <button type="submit" class="form-button">Enviar Comentário</button>
                            </form>
                        </div>

                        <div class="footer">
                            <div class="tech-stack">
                                <span class="tech-item">Docker</span>
                                <span class="tech-item">Node.js</span>
                                <span class="tech-item">Nginx</span>
                                <span class="tech-item">MySQL</span>
                            </div>
                        </div>
                    </div>

                    <script>
                        // Adiciona classe fade-in aos elementos quando eles aparecem na tela
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('fade-in');
                                }
                            });
                        });

                        document.querySelectorAll('.comment-card').forEach((card) => {
                            observer.observe(card);
                        });
                    </script>
                </body>
                </html>
            `;
            res.send(html);
        });
    });

    app.listen(port, '0.0.0.0', () => {
        console.log('Rodando na porta ' + port)
    });
}).catch(error => {
    console.error('Erro na inicialização:', error);
});