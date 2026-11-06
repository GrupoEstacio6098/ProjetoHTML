require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

app.post('/api/produtos', async (req, res) => {
  const { nome, preco, qtd } = req.body;

  if (!nome || isNaN(preco) || isNaN(qtd)) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, preco, qtd) VALUES (?, ?, ?)',
      [nome, preco, qtd]
    );
    res.status(201).json({ id: result.insertId, nome, preco, qtd, desconto: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao adicionar produto' });
  }
});

app.patch('/api/produtos/:id/estoque', async (req, res) => {
  const valor = Number(req.body.valor);

  try {
    await pool.query(
      'UPDATE produtos SET qtd = GREATEST(0, qtd + ?) WHERE id = ?',
      [valor, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao alterar estoque' });
  }
});

app.patch('/api/produtos/:id/promocao', async (req, res) => {
  const desconto = Number(req.body.desconto);

  if (isNaN(desconto) || desconto < 0 || desconto > 90) {
    return res.status(400).json({ erro: 'Desconto deve estar entre 0 e 90' });
  }

  try {
    await pool.query('UPDATE produtos SET desconto = ? WHERE id = ?', [desconto, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao aplicar promoção' });
  }
});

app.delete('/api/produtos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover produto' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));