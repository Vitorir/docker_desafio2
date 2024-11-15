const express = require('express')
const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database:'nodedb'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

const sql = `INSERT INTO people(name) values('Vitor')`
connection.query(sql)


app.get('/', (req,res) => {
    const name = 'Full Cycle Rocks!';
    const insertSql = `INSERT INTO people(name) values(?)`;
    
    connection.query(insertSql, [name], (error) => {
        if (error) {
            console.error('Erro ao inserir:', error);
            return res.status(500).send('Erro ao inserir registro');
        }
        
        // Após inserir, busca todos os registros
        const selectSql = 'SELECT * FROM people';
        connection.query(selectSql, (error, results) => {
            if (error) {
                console.error('Erro ao consultar:', error);
                return res.status(500).send('Erro ao buscar registros');
            }
            
            let html = '<h1>Full Cycle</h1>';
            html += '<ul>';
            results.forEach(person => {
                html += `<li>${person.name}</li>`;
            });
            html += '</ul>';
            
            res.send(html);
        });
    });
});

app.listen(port, ()=> {
    console.log('Rodando na porta ' + port)
})