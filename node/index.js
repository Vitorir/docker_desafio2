const express = require('express')
const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

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
    app.get('/', (req, res) => {
        const insertVisitor = `INSERT INTO people(name) VALUES('Full Cycle Visitor')`
        connection.query(insertVisitor, (error) => {
            if (error) {
                console.error('Erro ao inserir visitante:', error);
                res.status(500).send('Erro ao registrar visita');
                return;
            }

            const query = `
                SELECT 
                    COUNT(*) as total, 
                    DATE_FORMAT(visited_at, '%Y-%m-%d') as date 
                FROM people 
                GROUP BY date 
                ORDER BY date DESC
            `;

            connection.query(query, (error, results) => {
                if (error) {
                    console.error('Erro na consulta:', error);
                    res.status(500).send('Erro ao buscar estatísticas');
                    return;
                }

                const totalVisitors = results.reduce((acc, curr) => acc + curr.total, 0)
                
                const html = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Full Cycle Rocks!</title>
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

                        @media (max-width: 768px) {
                            .container {
                                padding: 20px;
                            }

                            h1 {
                                font-size: 2.5em;
                            }

                            .stat-number {
                                font-size: 2em;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Full Cycle Rocks!</h1>
                            <div class="subtitle">Desafio Docker - Node.js com Nginx</div>
                        </div>

                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-number">${totalVisitors}</div>
                                <div class="stat-label">Visitantes Totais</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${results.length}</div>
                                <div class="stat-label">Dias Ativos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${results[0]?.total || 0}</div>
                                <div class="stat-label">Visitas Hoje</div>
                            </div>
                        </div>

                        <div class="history-container">
                            <h2 class="history-title">Histórico de Visitas</h2>
                            ${results.map(row => `
                                <div class="history-item">
                                    <span class="history-date">${row.date}</span>
                                    <span class="history-visits">${row.total} visitantes</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="footer">
                            <div class="tech-stack">
                                <span class="tech-item">Docker</span>
                                <span class="tech-item">Node.js</span>
                                <span class="tech-item">Nginx</span>
                                <span class="tech-item">MySQL</span>
                            </div>
                            <p style="margin-top: 20px">Desenvolvido para o Desafio Full Cycle</p>
                        </div>
                    </div>
                </body>
                </html>
                `
                res.send(html)
            });
        });
    });

    app.listen(port, '0.0.0.0', () => {
        console.log('Rodando na porta ' + port)
    });
}).catch(error => {
    console.error('Erro na inicialização:', error);
});