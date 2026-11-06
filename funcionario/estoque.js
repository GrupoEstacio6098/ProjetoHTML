const API = "http://localhost:3000/api/produtos";
let produtos = [];

async function carregar() {
  const res = await fetch(API);
  produtos = await res.json();
  renderizar();
}

async function adicionarProduto() {
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  const qtd = Number(document.getElementById("qtd").value);

  if (!nome || isNaN(preco) || preco < 0 || !Number.isInteger(qtd) || qtd < 0) {
    alert("Preencha todos os campos com valores válidos.");
    return;
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, preco, qtd }),
  });

  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("qtd").value = "";

  carregar();
}

async function alterarEstoque(id, valor) {
  await fetch(`${API}/${id}/estoque`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor }),
  });
  carregar();
}

async function aplicarPromocao(id, desconto) {
  await fetch(`${API}/${id}/promocao`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ desconto: Number(desconto) || 0 }),
  });
  carregar();
}

async function removerProduto(id) {
  if (!confirm("Remover este produto?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  carregar();
}

function precoFinal(p) {
  return p.preco * (1 - p.desconto / 100);
}

function renderizar() {
  const corpo = document.querySelector("#tabela-estoque tbody");
  corpo.innerHTML = "";

  produtos.forEach((p) => {
    const estoqueHtml = Number(p.qtd) === 0
      ? `<span class="fora-de-estoque">Fora de estoque</span>`
      : `<span class="em-estoque">${p.qtd}</span>`;

    corpo.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>
          R$ ${precoFinal(p).toFixed(2)}
          ${p.desconto ? `<small>(-${p.desconto}%)</small>` : ""}
        </td>
        <td>${estoqueHtml}</td>
        <td>
          <input type="number" min="0" max="90" placeholder="%"
                 value="${p.desconto || ""}"
                 onchange="aplicarPromocao(${p.id}, this.value)">
        </td>
        <td>
          <button onclick="alterarEstoque(${p.id}, 1)">+</button>
          <button onclick="alterarEstoque(${p.id}, -1)">-</button>
          <button onclick="removerProduto(${p.id})">Remover</button>
        </td>
      </tr>`;
  });
}

carregar();